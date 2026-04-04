# 🔪 Headhunt Manager — Refactor 3 Ngày (MVP Mindset)

> Dựa trên 4 audit: [architecture](file:///C:/Users/Admin/.gemini/antigravity/brain/50223018-cf44-4546-a4ea-97e5f1e13719/architecture_audit.md), [recruiter flow](file:///C:/Users/Admin/.gemini/antigravity/brain/50223018-cf44-4546-a4ea-97e5f1e13719/recruiter_journey_audit.md), [supporting flows](file:///C:/Users/Admin/.gemini/antigravity/brain/50223018-cf44-4546-a4ea-97e5f1e13719/recruiter_journey_audit_part2.md), [product strategy](file:///C:/Users/Admin/.gemini/antigravity/brain/50223018-cf44-4546-a4ea-97e5f1e13719/product_strategy_audit.md)

---

## Nguyên Tắc

```
3 ngày = 24 giờ coding thực tế
Mỗi thay đổi PHẢI pass câu hỏi: "Recruiter có dùng feature này MỖI NGÀY không?"
Nếu không → skip.
```

---

## KEEP ✅ (Không Đụng Vào)

| Layer | Files | Lý do |
|-------|-------|-------|
| **Auth** | `auth.ts`, `auth.config.ts`, `authz.ts`, `employer-auth.ts` | Hoạt động ổn, dual auth đúng thiết kế |
| **Schema** | `schema.prisma` (giữ structure, sửa nhỏ) | 12 models hợp lý cho hybrid model |
| **FDIWork toàn bộ** | 26 files (employer/public components + actions) | **Freeze** — đã đủ MVP, không đụng |
| **Storage** | `storage.ts` | Clean, hoạt động đúng |
| **UI components** | `candidate-table.tsx`, `candidate-info.tsx`, `candidate-notes.tsx`, `candidate-tags.tsx`, `cv-viewer.tsx` | UI OK, chỉ cần thêm data |
| **Moderation** | `moderation-actions.ts`, `moderation-actions-ui.tsx` | Hoạt động, fix nhỏ ở Day 3 |

**Tổng KEEP: ~70% codebase.** Giữ nguyên = giữ stability.

---

## DELETE 🗑️ (Xóa / Loại Bỏ)

| Target | Lý do | Thay bằng |
|--------|-------|-----------|
| `getCurrentUserId()` × 3 copies | Duplicate ở `actions.ts`, `job-actions.ts`, `candidate-detail-actions.ts` | 1 shared util |
| `enumVal()` × 3 copies | Duplicate, không type-safe | Zod schema |
| `strVal()` × 3 copies | Duplicate | Shared util |
| `rate-limit.ts` (in-memory) | **Vô dụng** trên serverless | Xóa hẳn — thêm lại sau bằng Upstash Redis khi deploy prod |
| Dashboard `candidate.count()` không filter `isDeleted` | Đếm sai | Fix inline |
| Hardcoded `LOCATIONS` / `INDUSTRIES` trong filters | Sẽ lệch với data thực | Query `DISTINCT` từ DB |

**Tổng DELETE: ~200 LOC duplicate + 1 file vô dụng.**

---

## REBUILD 🔨 (3 Ngày Chi Tiết)

### Day 1: Data Foundation (8 giờ)

> **Mục tiêu:** Skills tìm được, data nhất quán, validation an toàn.

#### 1.1 Normalize Skills + GIN Index (2h)

```sql
-- Migration: normalize existing data
UPDATE "Candidate" SET skills = array(
  SELECT DISTINCT lower(trim(s)) FROM unnest(skills) AS s
);

-- GIN index cho fast array search
CREATE INDEX idx_candidate_skills ON "Candidate" USING GIN (skills);

-- Tương tự cho JobOrder
CREATE INDEX idx_job_required_skills ON "JobOrder" USING GIN ("requiredSkills");
```

**Sửa** [candidates.ts](file:///d:/MH/Headhunt_pj/src/lib/candidates.ts) — skills filter dùng lowercase compare:
```typescript
// TRƯỚC: hasSome exact match
skills: { hasSome: filters.skills }

// SAU: normalize input + hasSome
skills: { hasSome: filters.skills.map(s => s.toLowerCase().trim()) }
```

#### 1.2 Migrate `JobPosting.skills` String → String[] (1h)

```sql
-- Migration
ALTER TABLE "JobPosting" ADD COLUMN "skillsArray" TEXT[];
UPDATE "JobPosting" SET "skillsArray" = string_to_array(skills, ',');
ALTER TABLE "JobPosting" DROP COLUMN "skills";
ALTER TABLE "JobPosting" RENAME COLUMN "skillsArray" TO "skills";
```

#### 1.3 Shared Utils (1h)

Tạo `src/lib/utils/auth-helpers.ts`:
```typescript
export async function requireUserId(): Promise<number> { ... }
export function strVal(v: FormDataEntryValue | null): string | undefined { ... }
export function intVal(v: FormDataEntryValue | null): number | null { ... }
export function dateVal(v: FormDataEntryValue | null): Date | null { ... }
```
→ Xóa duplicate ở 3 files.

#### 1.4 Job Form: Thêm Missing Fields (2h)

**Sửa** [job-form.tsx](file:///d:/MH/Headhunt_pj/src/components/jobs/job-form.tsx):
```diff
 // Thêm 4 fields:
+ <input name="requiredSkills" placeholder="Node.js, TypeScript, PostgreSQL" />
+ <select name="industry">{INDUSTRIES}</select>
+ <input name="location" placeholder="TP.HCM" />
+ <select name="assignedToId">{recruiters}</select>
```

**Sửa** [job-actions.ts](file:///d:/MH/Headhunt_pj/src/lib/job-actions.ts) `createJobAction` — parse + save 4 fields mới.

#### 1.5 Fix Tag Update Transaction (1h)

**Sửa** [candidates.ts](file:///d:/MH/Headhunt_pj/src/lib/candidates.ts) `updateCandidate`:
```typescript
// TRƯỚC: 3 operations riêng lẻ
// SAU: sequential batch transaction
const [candidate] = await prisma.$transaction([
  prisma.candidate.update({ where: { id }, data: { ... } }),
  prisma.candidateTag.deleteMany({ where: { candidateId: id } }),
  ...(tagIds.length ? [prisma.candidateTag.createMany({ data: tagEntries })] : []),
]);
```

#### 1.6 Dashboard Count Fix (15 phút)

```diff
- prisma.candidate.count()
+ prisma.candidate.count({ where: { isDeleted: false } })
```

---

### Day 2: CRM Unblock (8 giờ)

> **Mục tiêu:** Recruiter thấy UV đang ở job nào, assign nhanh, import nhanh.

#### 2.1 Candidate ↔ Job Cross-Reference (3h)

**Sửa** [candidates.ts](file:///d:/MH/Headhunt_pj/src/lib/candidates.ts) `getCandidateById` — include job links:
```typescript
include: {
  // ... existing includes
  jobLinks: {
    include: {
      jobOrder: { select: { id: true, title: true, status: true, client: { select: { companyName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  },
}
```

**Tạo** `src/components/candidates/candidate-pipelines.tsx`:
```
┌── Pipeline Hiện Tại ──────────────────────┐
│ Senior Backend (ABC Corp) → INTERVIEW      │
│ Frontend Lead (XYZ Ltd)   → SOURCED         │
│ DevOps (DEF Inc)          → PLACED ✓        │
└──────────────────────────────────────────────┘
```

**Thêm** vào [candidates/[id]/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/candidates/%5Bid%5D/page.tsx) — render dưới CandidateInfo.

#### 2.2 Smart Assign Modal (4h)

**Rebuild** [assign-candidate-modal.tsx](file:///d:/MH/Headhunt_pj/src/components/jobs/assign-candidate-modal.tsx):

```
┌──────────────────────────────────────────┐
│  Gán ứng viên vào: Senior Backend       │
│  Required: Node.js, TypeScript | SENIOR  │
│                                          │
│  [🔍 Tìm tên/email_____________]        │
│  [Level ▼] [Skills ___] [Salary ≤ ___]  │
│                                          │
│  ☑ Nguyễn A — Senior — Node.js, React   │
│    Backend Dev @ ABC  |  KV: 40tr        │
│  ☑ Trần B — Senior — Node.js, PostgreSQL │
│    Fullstack @ XYZ    |  KV: 35tr        │
│  ☐ Lê C — Mid — Node.js                 │
│    Backend @ DEF      |  KV: 25tr        │
│                                          │
│        [Gán 2 ứng viên đã chọn]         │
└──────────────────────────────────────────┘
```

Thay đổi:
- Thêm **filters**: level, skills (from job's requiredSkills), salary range
- Hiện **skills chips** + salary trong kết quả
- **Checkbox multi-select** + batch assign
- Auto-populate filters từ JobOrder data
- Tăng `take: 10` → `take: 20` + "Xem thêm"

**Sửa** [jobs.ts](file:///d:/MH/Headhunt_pj/src/lib/jobs.ts) `searchAvailableCandidates` — thêm filter params.

#### 2.3 Batch Import Fix (1h)

**Rebuild** [import-actions.ts](file:///d:/MH/Headhunt_pj/src/lib/import-actions.ts):

```typescript
// TRƯỚC: for..of sequential (1000 queries)
// SAU: batch dedup + createMany (2 queries)

const emails = candidates.filter(c => c.email).map(c => c.email);
const existing = await prisma.candidate.findMany({
  where: { email: { in: emails } },
  select: { email: true },
});
const existingSet = new Set(existing.map(e => e.email));

const newRecords = candidates
  .filter(c => c.fullName && (!c.email || !existingSet.has(c.email)));

await prisma.candidate.createMany({ data: newRecords });
```

→ **500 records: 100 giây → 0.2 giây.**

---

### Day 3: Bridge + Analytics Lite (8 giờ)

> **Mục tiêu:** FDIWork ↔ CRM tự động sync, dashboard có ý nghĩa.

#### 3.1 Auto-Import Application → Pipeline (3h)

**Sửa** [moderation-actions.ts](file:///d:/MH/Headhunt_pj/src/lib/moderation-actions.ts) `importApplicationToCRM`:

```typescript
// TRƯỚC: chỉ tạo Candidate
// SAU: tạo Candidate + auto-link vào JobOrder pipeline

const candidate = await createOrLinkCandidate(application);

// Nếu JobPosting có link tới JobOrder → auto-assign
if (application.jobPosting.jobOrderId) {
  await prisma.jobCandidate.create({
    data: {
      jobOrderId: application.jobPosting.jobOrderId,
      candidateId: candidate.id,
      stage: "SOURCED",
      result: "PENDING",
    },
  });
}
```

#### 3.2 Activity Log Model + Auto-Log (3h)

**Schema migration:**
```prisma
model ActivityLog {
  id          Int       @id @default(autoincrement())
  type        String    // NOTE | STATUS_CHANGE | STAGE_CHANGE | CV_UPLOAD | IMPORT
  entityType  String    // CANDIDATE | JOB_ORDER | CLIENT
  entityId    Int
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  metadata    Json?     // { from: "SOURCED", to: "INTERVIEW", jobTitle: "..." }
  createdAt   DateTime  @default(now())

  @@index([entityType, entityId])
  @@index([userId])
}
```

**Hook vào existing actions** (thêm 1 dòng sau mỗi mutation):
```typescript
// Ở updateCandidateStageAction:
await logActivity("STAGE_CHANGE", "CANDIDATE", candidateId, userId, { from, to, jobTitle });

// Ở updateCandidateStatusAction:
await logActivity("STATUS_CHANGE", "CANDIDATE", candidateId, userId, { from, to });

// Ở addCandidateNoteAction:
await logActivity("NOTE", "CANDIDATE", candidateId, userId, { preview: content.slice(0,100) });
```

#### 3.3 Dashboard Upgrade (2h)

**Sửa** [dashboard/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/dashboard/page.tsx):

```
TRƯỚC (4 cards):
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ UV: 42 │ │ KH: 15 │ │ Job: 8 │ │ App: 3 │
└────────┘ └────────┘ └────────┘ └────────┘

SAU (4 cards + pipeline summary + recent activity):
┌────────┐ ┌────────┐ ┌────────────────┐ ┌──────────┐
│ UV: 42 │ │ KH: 15 │ │ Job Active: 8  │ │ App: 3 ⚡│
└────────┘ └────────┘ │ Placed MTD: 2  │ └──────────┘
                      └────────────────┘
┌── Pipeline Overview (active jobs) ──────────────────┐
│ Senior Backend (ABC)  [■■□□□□] 2/6 Interview        │
│ Frontend Lead (XYZ)   [■□□□□□] 1/3 Sourced          │
│ DevOps (DEF)          [■■■■■□] 5/5 Placed ✓         │
└──────────────────────────────────────────────────────┘
┌── Recent Activity ──────────────────────────────────┐
│ 10:30  Admin chuyển Nguyễn A → INTERVIEW (Senior BE)│
│ 09:15  Hệ thống import đơn mới: Trần B → sourced   │
│ Hôm qua  Admin thêm note cho Lê C                  │
└──────────────────────────────────────────────────────┘
```

---

## Tổng Kết

```
           TRƯỚC REFACTOR                    SAU 3 NGÀY
    ┌──────────────────────────┐     ┌──────────────────────────┐
    │ Search: ILIKE, exact     │     │ Search: normalized, GIN  │
    │ Skills: inconsistent     │     │ Skills: String[], lower  │
    │ Assign: name-only, 1x1   │     │ Assign: smart, batch     │
    │ Import: 100s per 500     │     │ Import: 0.2s per 500     │
    │ UV→Job: invisible        │     │ UV→Job: pipeline panel   │
    │ Dashboard: 4 numbers     │     │ Dashboard: activity+pipe │
    │ Bridge: 3 manual links   │     │ Bridge: auto-import app  │
    │ Audit: zero logging      │     │ Audit: ActivityLog model │
    │ Validation: if/else      │     │ Validation: shared utils │
    │ Tags: non-transactional  │     │ Tags: $transaction batch │
    └──────────────────────────┘     └──────────────────────────┘

    FDIWork: UNTOUCHED (đã đủ MVP)
    LOC changed: ~800-1000 dòng sửa/thêm
    LOC deleted: ~200 dòng duplicate
    New files: 3 (shared utils, candidate-pipelines, ActivityLog migration)
    Modified files: 12
```

> [!CAUTION]
> **Không làm trong 3 ngày này:** Kanban view, email integration, full-text search, RBAC, mobile PWA, Zod validation toàn bộ, Redis rate-limit. Tất cả là Phase 2+. Giữ scope nhỏ, ship nhanh, validate với usage thực tế trước.
