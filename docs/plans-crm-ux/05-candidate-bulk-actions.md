# PLAN: Candidate Bulk Actions & Quick View

> Thêm thao tác hàng loạt và xem nhanh hồ sơ ứng viên cho team HR.

---

## Bối cảnh hiện tại

Trang Candidates (`/candidates`) có:
- `CandidateTable`: Danh sách UV dạng bảng, click vào tên → `/candidates/[id]`
- `CandidateFiltersPanel`: Bộ lọc mạnh (search, status, level, language, skills, location, salary, tags)
- `Pagination` component
- Chưa có: Checkbox chọn nhiều, bulk actions, quick view, export

---

## Phase 1: Checkbox Selection System (2h)

### Mục tiêu
Thêm checkbox selection vào bảng `CandidateTable` để chọn nhiều UV cùng lúc.

### UI Changes

#### [MODIFY] [components/candidates/candidate-table.tsx](file:///d:/MH/Headhunt_pj/src/components/candidates/candidate-table.tsx)
Hiện tại là server component. Cần chuyển sang **client component** (hoặc tách phần selection ra client wrapper).

**Approach: Client wrapper pattern**
```tsx
// candidate-table-wrapper.tsx (NEW - client component)
"use client";
import { useState } from "react";

function CandidateTableWrapper({ candidates, allTags }) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleOne = (id: number) => { /* toggle single */ };
  const toggleAll = () => { /* select/deselect all on current page */ };

  return (
    <>
      {selectedIds.size > 0 && <BulkActionBar selectedIds={selectedIds} />}
      <CandidateTable
        candidates={candidates}
        selectedIds={selectedIds}
        onToggle={toggleOne}
        onToggleAll={toggleAll}
      />
    </>
  );
}
```

**Table header thêm checkbox:**
```tsx
<th className="w-10 py-3 px-2">
  <input
    type="checkbox"
    checked={allSelected}
    onChange={toggleAll}
    className="rounded border-border"
  />
</th>
```

**Mỗi row thêm checkbox:**
```tsx
<td className="py-3 px-2">
  <input
    type="checkbox"
    checked={selectedIds.has(candidate.id)}
    onChange={() => onToggle(candidate.id)}
  />
</td>
```

---

## Phase 2: Bulk Action Bar (2-3h)

### Mục tiêu
Khi đã chọn ≥ 1 UV, hiện floating action bar phía trên bảng.

### UI Component

#### [NEW] [components/candidates/bulk-action-bar.tsx](file:///d:/MH/Headhunt_pj/src/components/candidates/bulk-action-bar.tsx)
```
┌─────────────────────────────────────────────────┐
│ ✅ Đã chọn 5 ứng viên                          │
│                                                  │
│ [📋 Gán vào Job] [📤 Export] [🏷️ Gắn Tag] [❌] │
└─────────────────────────────────────────────────┘
```

Sticky top, backdrop blur, slide-in animation.

### Actions

**A. Gán vào Job Order (bulk assign):**

#### [NEW] [components/candidates/bulk-assign-modal.tsx](file:///d:/MH/Headhunt_pj/src/components/candidates/bulk-assign-modal.tsx)
```
┌─ Gán 5 ứng viên vào Job Order ──────┐
│                                       │
│ 🔍 Tìm job...                        │
│ ┌───────────────────────────────────┐ │
│ │ ⚪ Sr. Developer — Samsung (OPEN)│ │
│ │ ⚪ Plant Manager — LG (OPEN)     │ │
│ │ ⚪ QC Lead — Foxconn (OPEN)      │ │
│ └───────────────────────────────────┘ │
│                                       │
│ [Gán ứng viên]          [Hủy]        │
└───────────────────────────────────────┘
```

#### [NEW] [lib/candidate-actions.ts — bulkAssignToJob()](file:///d:/MH/Headhunt_pj/src/lib/candidate-actions.ts)
```typescript
export async function bulkAssignToJob(candidateIds: number[], jobOrderId: number) {
  const userId = await getCurrentUserId();
  // Filter out candidates already assigned to this job
  const existing = await prisma.jobCandidate.findMany({
    where: { jobOrderId, candidateId: { in: candidateIds } },
    select: { candidateId: true },
  });
  const existingIds = new Set(existing.map(e => e.candidateId));
  const newIds = candidateIds.filter(id => !existingIds.has(id));

  if (newIds.length === 0) return { success: false, message: "Tất cả UV đã có trong job này." };

  await prisma.jobCandidate.createMany({
    data: newIds.map(candidateId => ({
      jobOrderId,
      candidateId,
      stage: 'SOURCED',
    })),
  });

  revalidatePath(`/jobs/${jobOrderId}`);
  revalidatePath('/candidates');
  return { success: true, message: `Đã gán ${newIds.length} ứng viên.`, skipped: existingIds.size };
}
```

**B. Export to Excel:**

#### [NEW] [lib/candidate-export.ts](file:///d:/MH/Headhunt_pj/src/lib/candidate-export.ts)
```typescript
// Client-side export using native Blob API (no xlsx dependency needed)
export function exportCandidatesToCSV(candidates: CandidateRow[]) {
  const headers = ['Họ tên', 'Email', 'SĐT', 'Vị trí hiện tại', 'Công ty', 'Level', 'Skills'];
  const rows = candidates.map(c => [
    c.fullName, c.email, c.phone, c.currentPosition, c.currentCompany,
    c.level, c.skills?.join(', ')
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `candidates-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

> CSV thay vì xlsx vì project đã remove xlsx dependency (security advisory).

**C. Bulk Tag:**

#### [NEW] [components/candidates/bulk-tag-modal.tsx](file:///d:/MH/Headhunt_pj/src/components/candidates/bulk-tag-modal.tsx)
```typescript
// Hiện danh sách tags từ getAllTags(), user chọn 1 tag → gán cho tất cả selected candidates
export async function bulkAddTag(candidateIds: number[], tagId: number) {
  await prisma.candidateTag.createMany({
    data: candidateIds.map(candidateId => ({ candidateId, tagId })),
    skipDuplicates: true,
  });
  revalidatePath('/candidates');
  return { success: true };
}
```

---

## Phase 3: Quick View Panel (2-3h)

### Mục tiêu
Click expand row hoặc hover → hiện panel thông tin UV nhanh ngay tại bảng (không navigate đi).

### UI Component

#### [NEW] [components/candidates/candidate-quick-view.tsx](file:///d:/MH/Headhunt_pj/src/components/candidates/candidate-quick-view.tsx)
Pattern: expandable row (giống ApplicationTable đã có).

```
┌────────────────────────────────────────────────────┐
│ ☐ Nguyễn Văn Hùng  | Sr. Dev  | Samsung | ACTIVE  │ ← click to expand
├────────────────────────────────────────────────────┤
│ ┌─ Thông tin ──────┐ ┌─ Kỹ năng ────┐ ┌─ CV ────┐ │
│ │ 📧 hung@mail.com │ │ Java ⭐⭐⭐  │ │ 📄 CV1  │ │
│ │ 📱 0912 345 678  │ │ React ⭐⭐   │ │ 📄 CV2  │ │
│ │ 📍 Hà Nội        │ │ SQL ⭐⭐⭐   │ │         │ │
│ │ 💰 $2,000-$3,000 │ │ English B2   │ │ [Tải]   │ │
│ │ 🏢 Samsung → LG  │ │              │ │         │ │
│ └──────────────────┘ └──────────────┘ └─────────┘ │
│ [📋 Gán Job] [📧 Email] [Xem chi tiết →]         │
├────────────────────────────────────────────────────┤
│ ☐ Trần Thị Lan     | QC Lead  | LG     | ACTIVE  │
└────────────────────────────────────────────────────┘
```

### Data Layer

#### [MODIFY] [lib/candidates.ts — getCandidates()](file:///d:/MH/Headhunt_pj/src/lib/candidates.ts)
Thêm include cho quick view data:
```typescript
// Thêm vào select/include:
cvs: { select: { fileName: true, fileUrl: true }, take: 3 },
languages: { select: { language: true, level: true } },
skills: true,
```

---

## Phase 4: Duplicate Detection (1-2h)

### Mục tiêu
Cảnh báo khi tạo UV mới trùng email hoặc phone.

### Logic

#### [MODIFY] [lib/candidates.ts — createCandidate()](file:///d:/MH/Headhunt_pj/src/lib/candidates.ts)
Trước khi insert, check:
```typescript
export async function checkDuplicate(email?: string, phone?: string) {
  if (!email && !phone) return null;
  const existing = await prisma.candidate.findFirst({
    where: {
      isDeleted: false,
      OR: [
        ...(email ? [{ email: { equals: email, mode: 'insensitive' as const } }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    },
    select: { id: true, fullName: true, email: true, phone: true },
  });
  return existing;
}
```

### UI

#### [MODIFY] [components/candidates/candidate-form.tsx](file:///d:/MH/Headhunt_pj/src/components/candidates/candidate-form.tsx)
Khi user blur khỏi email/phone field → gọi `checkDuplicate`:
```tsx
{duplicateWarning && (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
    ⚠️ Có UV trùng thông tin: <Link href={`/candidates/${dup.id}`}>{dup.fullName}</Link>
    ({dup.email || dup.phone})
  </div>
)}
```

---

## Effort

| Phase | Nội dung | Thời gian |
|-------|----------|-----------|
| 1 | Checkbox selection system | 2h |
| 2 | Bulk actions (assign + export + tag) | 2-3h |
| 3 | Quick view panel | 2-3h |
| 4 | Duplicate detection | 1-2h |
| **Tổng** | | **7-10h** |

## Schema Changes
**KHÔNG CẦN** — tất cả sử dụng existing relations.

## Verification
- [ ] Checkbox select all / deselect all hoạt động
- [ ] Bulk action bar hiện khi ≥ 1 selected, ẩn khi deselect all
- [ ] Bulk assign: skip duplicates, revalidate job page
- [ ] Export CSV: file UTF-8 BOM, mở được trên Excel VN
- [ ] Quick view: expand row → hiện 3 cột (info, skills, CV)
- [ ] Duplicate detection: cảnh báo khi tạo UV trùng email
- [ ] `npm run build` pass
