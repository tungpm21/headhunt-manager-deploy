# PLAN: Candidate Page — Sort Controls + Skills Autocomplete

> Ngày tạo: 2026-04-03
> Người tạo: Đầu não (Antigravity Planner)
> Người thực thi: AI Agent coder
> Trạng thái: Sẵn sàng để code

---

## Bối cảnh & Vấn đề

### Vấn đề 1 — Thiếu Sort/View Controls
Trang `/candidates` hiện chỉ có bộ lọc. **Không có**:
- Dropdown chọn thứ tự sắp xếp (Mới nhất, Tên A-Z, Lương cao-thấp...)
- Toggle chuyển đổi view (Table / Card)

**Root cause:**
- `getCandidates()` trong `src/lib/candidates.ts` hardcode `orderBy: { createdAt: "desc" }` (dòng 154)
- `CandidateFilters` interface không có field `sortBy` / `sortOrder`
- `page.tsx` không đọc sort param từ URL
- `CandidateFiltersPanel` không render sort controls

### Vấn đề 2 — Skills Input Không Có Autocomplete
Ô "Kỹ năng" trong bộ lọc là `<input type="text">` đơn thuần. Khi click/gõ không có gợi ý options.

**Root cause:**
- `getCandidateFilterOptions()` trong `src/lib/candidates.ts` chỉ trả về `locations` và `industries` — **không có `skills`**
- `page.tsx` không truyền `skills` options xuống `CandidateFiltersPanel`
- `CandidateFiltersPanel` không nhận `skills` prop và không render datalist/dropdown
- Skills trong DB là `String[]` trên model `Candidate` — cần `UNNEST` hoặc loop để lấy DISTINCT values

---

## Phân tích Files Liên Quan

| File | Hiện trạng | Cần sửa? |
|---|---|---|
| `src/lib/candidates.ts` | `getCandidates()` hardcode sort; `getCandidateFilterOptions()` thiếu skills | ✅ Có |
| `src/types/candidate.ts` | `CandidateFilters` thiếu `sortBy`, `sortOrder` | ✅ Có |
| `src/app/(dashboard)/candidates/page.tsx` | Thiếu sort searchParams; không pass `skills` xuống filter | ✅ Có |
| `src/components/candidates/candidate-filters.tsx` | Thiếu sort UI; skills input là plain text | ✅ Có |

---

## Yêu Cầu Chi Tiết

---

### Fix 1: Sort Controls

#### 1A. `src/types/candidate.ts` — Thêm sort vào CandidateFilters

```typescript
export type CandidateSortBy =
  | "createdAt"
  | "fullName"
  | "expectedSalary"
  | "updatedAt";

export type SortOrder = "asc" | "desc";

export interface CandidateFilters {
  // ... các field hiện có giữ nguyên ...
  sortBy?: CandidateSortBy;
  sortOrder?: SortOrder;
}
```

#### 1B. `src/lib/candidates.ts` — Cho phép sort dynamic

Sửa hàm `getCandidates()`:

```typescript
export async function getCandidates(filters: CandidateFilters = {}): Promise<PaginatedCandidates> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = buildWhere(filters);

  // Sort logic
  const sortBy = filters.sortBy ?? "createdAt";
  const sortOrder = filters.sortOrder ?? "desc";
  const orderBy: Prisma.CandidateOrderByWithRelationInput =
    sortBy === "fullName" ? { fullName: sortOrder }
    : sortBy === "expectedSalary" ? { expectedSalary: sortOrder }
    : sortBy === "updatedAt" ? { updatedAt: sortOrder }
    : { createdAt: sortOrder };

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({ where, include: CANDIDATE_LIST_INCLUDE, orderBy, skip, take: pageSize }),
    prisma.candidate.count({ where }),
  ]);

  return { candidates, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
```

#### 1C. `src/app/(dashboard)/candidates/page.tsx` — Đọc sort params từ URL

Thêm vào `PageProps.searchParams`:
```typescript
sortBy?: string;
sortOrder?: string;
```

Truyền vào `getCandidates()`:
```typescript
sortBy: sp.sortBy as CandidateSortBy | undefined,
sortOrder: sp.sortOrder as "asc" | "desc" | undefined,
```

#### 1D. `src/components/candidates/candidate-filters.tsx` — Thêm Sort UI

Thêm `"sortBy"` và `"sortOrder"` vào `FILTER_PARAM_KEYS`.

Thêm sort dropdown **vào row phía trên**, bên phải nút "Bộ lọc":

```tsx
{/* Sort Dropdown */}
<select
  value={`${searchParams.get("sortBy") ?? "createdAt"}_${searchParams.get("sortOrder") ?? "desc"}`}
  onChange={(e) => {
    const [sortBy, sortOrder] = e.target.value.split("_");
    update({ sortBy, sortOrder });
  }}
  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
>
  <option value="createdAt_desc">Mới nhất</option>
  <option value="createdAt_asc">Cũ nhất</option>
  <option value="fullName_asc">Tên A → Z</option>
  <option value="fullName_desc">Tên Z → A</option>
  <option value="expectedSalary_desc">Lương cao nhất</option>
  <option value="expectedSalary_asc">Lương thấp nhất</option>
</select>
```

Đặt dropdown vào cùng `flex gap-2` với search bar và nút Bộ lọc, giữa search input và nút Bộ lọc.

---

### Fix 2: Skills Autocomplete

#### 2A. `src/lib/candidates.ts` — Thêm skills vào getCandidateFilterOptions

Skills là `String[]` trên Prisma model. Để lấy DISTINCT values, dùng raw query với `UNNEST`:

```typescript
export async function getCandidateFilterOptions() {
  const [locations, industries, skillRows] = await Promise.all([
    // ... locations query giữ nguyên ...
    // ... industries query giữ nguyên ...
    prisma.$queryRaw<{ skill: string }[]>`
      SELECT DISTINCT LOWER(TRIM(unnested_skill)) AS skill
      FROM "Candidate",
           UNNEST(skills) AS unnested_skill
      WHERE "isDeleted" = false
        AND unnested_skill IS NOT NULL
        AND TRIM(unnested_skill) <> ''
      ORDER BY skill ASC
    `,
  ]);

  return {
    locations: normalizeDistinctValues(locations.map((l) => l.location)),
    industries: normalizeDistinctValues(industries.map((i) => i.industry)),
    skills: skillRows.map((row) => row.skill),
  };
}
```

> ⚠️ Lưu ý: Prisma `$queryRaw` trả về untyped — cần cast `<{ skill: string }[]>`.
> Nếu DB nhỏ (<500 candidates), có thể dùng JS-side dedup thay vì raw SQL:
> ```typescript
> const allSkills = await prisma.candidate.findMany({ where: { isDeleted: false }, select: { skills: true } });
> const skills = Array.from(new Set(allSkills.flatMap(c => c.skills.map(s => s.toLowerCase().trim())))).filter(Boolean).sort();
> ```
> **Khuyến nghị dùng cách JS-side** để tránh phụ thuộc raw SQL PostgreSQL syntax.

#### 2B. `src/app/(dashboard)/candidates/page.tsx` — Truyền skills xuống

```typescript
// Destructure từ filterOptions
const { locations, industries, skills } = filterOptions;

// Truyền vào CandidateFiltersPanel
<CandidateFiltersPanel
  allTags={allTags}
  locations={locations}
  industries={industries}
  skills={skills}          // ← thêm prop mới
/>
```

#### 2C. `src/components/candidates/candidate-filters.tsx` — Thêm skills prop + datalist

**Cập nhật interface:**
```typescript
interface CandidateFiltersProps {
  allTags: Tag[];
  locations: string[];
  industries: string[];
  skills: string[];          // ← thêm prop mới
}
```

**Cập nhật destructure trong function signature:**
```typescript
export function CandidateFiltersPanel({ allTags, locations, industries, skills }: CandidateFiltersProps)
```

**Thay thế skills input** (hiện tại dòng 216-227) bằng input + datalist:

```tsx
<div>
  <label className="mb-1 block text-xs font-medium text-muted">Kỹ năng</label>
  <input
    type="text"
    list="skills-options"
    placeholder="VD: React, Java..."
    defaultValue={searchParams.get("skills") ?? ""}
    onChange={(event) => {
      const value = event.target.value;
      setTimeout(() => update({ skills: value || null }), 400);
    }}
    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
  />
  <datalist id="skills-options">
    {skills.map((skill) => (
      <option key={skill} value={skill} />
    ))}
  </datalist>
</div>
```

> **Tại sao dùng `<datalist>`?** Đây là HTML native, không cần thêm npm package, hoạt động trên mọi trình duyệt, và khi user gõ sẽ tự filter suggestions theo từ khóa đã nhập.

---

## Thứ Tự Thực Hiện

```
1. src/types/candidate.ts         → Thêm CandidateSortBy, SortOrder, update CandidateFilters
2. src/lib/candidates.ts          → getCandidates() dynamic sort + getCandidateFilterOptions() + skills
3. src/app/(dashboard)/candidates/page.tsx → Truyền sort params + skills prop
4. src/components/candidates/candidate-filters.tsx → Sort dropdown + skills datalist
```

---

## Verification

### Build Check
```bash
npm run build
```
Phải pass 0 TypeScript errors.

### Manual Test — Sort
1. Mở `/candidates`
2. Kiểm sinh dropdown sort xuất hiện ở header row (cạnh ô search)
3. Chọn "Tên A → Z" → danh sách reload theo thứ tự tên
4. Chọn "Lương cao nhất" → reload theo expectedSalary giảm dần
5. Đổi sort, URL param `sortBy=fullName&sortOrder=asc` phải xuất hiện trong address bar
6. Reload trang → sort vẫn giữ nguyên (vì đọc từ URL)

### Manual Test — Skills Autocomplete
1. Mở `/candidates` → click "Bộ lọc"
2. Click vào ô "Kỹ năng"
3. **Phải xuất hiện dropdown gợi ý** chứa các skills đang có trong DB
4. Gõ 2-3 ký tự → dropdown tự filter theo từ khóa
5. Chọn một skill → danh sách candidates lọc theo skill đó
6. Kiểm `npm run build` pass để chắc không lỗi TypeScript

---

## Ràng Buộc & Lưu Ý

- **KHÔNG** thêm npm package mới (không dùng react-select, downshift, etc.)
- Skills filter trong `candidates.ts` dùng `hasSome` — nghĩa là user nhập 1 skill vẫn hoạt động đúng
- Sort dropdown phải **không** nằm trong panel "Bộ lọc" ẩn/hiện — phải luôn visible
- View toggle (Table/Card) **KHÔNG** trong scope của task này — để Sprint 5 backlog
- Giữ nguyên tất cả styling class hiện có, chỉ thêm element mới
