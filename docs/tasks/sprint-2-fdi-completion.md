# Sprint 2 — FDI Credibility Kit: Hoàn thiện

**Assigned to:** Codex  
**Branch:** master  
**Last updated:** 2026-04-21  
**Status:** Ready to execute

---

## 1. Project Context (đọc trước khi làm)

### Sản phẩm là gì

FDIWork là job board niche cho thị trường FDI (Foreign Direct Investment) tại Việt Nam. Khác với VietnamWorks/TopCV ở chỗ có các trường tuyển dụng đặc thù FDI mà không board nào có: khu công nghiệp KCN-level, ngôn ngữ + trình độ, visa support, ca làm việc.

**Chiến lược launch:** Admin seed thủ công 10 FDI listings → dùng đó làm social proof → outreach employer. Sprint 2 Task 1 unblocks bước này vì admin hiện chưa có form để điền FDI fields.

### Tech stack

- Next.js 15 App Router, React 19, Tailwind CSS v4
- Prisma 7 + PostgreSQL (Neon serverless)
- Auth: custom session (không dùng NextAuth)
- Deploy: Vercel

**Lưu ý quan trọng:** `npx prisma migrate dev` bị lỗi (shadow DB issue với enum migration `20260406152933_align_submission_stages`). Dùng `npx prisma db push` cho mọi schema change.

### Cấu trúc app

```
src/app/
  (public)/viec-lam/          → job listing có FDI filters
  (public)/viec-lam/[slug]/   → job detail (chưa có FDI badges)
  (employer)/employer/(portal)/job-postings/new/  → employer form (ĐÃ có FDI)
  (dashboard)/moderation/new/                     → admin tạo tin (CHƯA có FDI)
  (dashboard)/moderation/[id]/edit/               → admin sửa tin (CHƯA có FDI)

src/lib/
  employer-actions.ts              → server actions employer portal (ĐÃ có FDI)
  admin-job-posting-actions.ts     → server actions admin (CHƯA có FDI) ← cần sửa
  employers.ts                     → DB functions (ĐÃ có FDI)
  public-actions.ts                → public data fetching (filter ĐÃ có, JobDetail CHƯA có)
  validation/forms.ts              → Zod schema employerJobPostingSchema (ĐÃ có FDI)
```

### Schema hiện tại — JobPosting model (đã migrate)

```prisma
model JobPosting {
  id            Int
  title         String
  slug          String    @unique
  description   String
  industry      String?
  position      String?
  location      String?
  workType      String?
  quantity      Int       @default(1)
  skills        String[]  @default([])
  // FDI-specific fields — ĐÃ có trong DB
  industrialZone      String?
  requiredLanguages   String[]  @default([])
  languageProficiency String?
  visaSupport         String?   // "YES" | "NO" | "NEGOTIABLE"
  shiftType           String?   // "DAY" | "NIGHT" | "ROTATING"
  status        JobPostingStatus @default(DRAFT)
  ...
}
```

### Pattern formData parsing (reference từ employer-actions.ts đã ship)

```ts
// Nullable string
formData.get("industrialZone")?.toString().trim() || null

// Array từ single select (dùng "none" cho "không yêu cầu")
const lang = formData.get("requiredLanguage")?.toString().trim();
requiredLanguages: lang && lang !== "none" ? [lang] : []

// Nullable optional
formData.get("languageProficiency")?.toString().trim() || null
formData.get("visaSupport")?.toString().trim() || null
formData.get("shiftType")?.toString().trim() || null
```

### File reference để copy FDI form UI

`src/app/(employer)/employer/(portal)/job-postings/new/page.tsx` — đây là employer form đã ship Sprint 1, có section FDI hoàn chỉnh. Copy constants `INDUSTRIAL_ZONES`, `LANGUAGES`, `PROFICIENCY_LEVELS` và block "Yêu cầu đặc thù FDI" từ file này khi làm admin forms.

---

## 2. Sprint 1 — Đã xong (commit 911eec3, 2026-04-21)

✅ `prisma/schema.prisma` — 5 FDI fields  
✅ `src/lib/validation/forms.ts` — `employerJobPostingSchema` có đủ 5 FDI fields  
✅ `src/lib/employer-actions.ts` — `buildEmployerJobPostingInput` parse FDI + create/update pass FDI  
✅ `src/lib/employers.ts` — type signatures updated  
✅ `src/app/(employer)/employer/(portal)/job-postings/new/page.tsx` — FDI form UI  
✅ `src/lib/public-actions.ts` — `JobFilters` type + filter logic + filter options cho language/industrialZone  
✅ `src/components/public/JobFilters.tsx` — 4 FDI filter groups trong sidebar  
✅ `src/app/(public)/viec-lam/page.tsx` — pass FDI params  

---

## 3. Sprint 2 — Cần làm (thứ tự: Task 1 trước Task 2)

### Task 1 — Admin FDI fields (CRITICAL: unblocks seed strategy)

#### File: `src/lib/admin-job-posting-actions.ts`

**Đọc file này trước.** Có hàm `buildJobPostingInput` (line ~39) dùng chung cho cả `createAdminJobPosting` và `updateAdminJobPosting`.

**Sửa `buildJobPostingInput`:** Thêm 5 FDI fields vào return object, ngay sau dòng `skills: parseJobPostingSkills(...)`:

```ts
industrialZone: formData.get("industrialZone")?.toString().trim() || null,
requiredLanguages: (() => {
  const lang = formData.get("requiredLanguage")?.toString().trim();
  return lang && lang !== "none" ? [lang] : [];
})(),
languageProficiency: formData.get("languageProficiency")?.toString().trim() || null,
visaSupport: formData.get("visaSupport")?.toString().trim() || null,
shiftType: formData.get("shiftType")?.toString().trim() || null,
```

**Sửa `createAdminJobPosting`:** Trong `prisma.jobPosting.create({ data: { ... } })` (line ~418), thêm sau `skills: parsedInput.data.skills`:

```ts
industrialZone: parsedInput.data.industrialZone || null,
requiredLanguages: parsedInput.data.requiredLanguages,
languageProficiency: parsedInput.data.languageProficiency || null,
visaSupport: parsedInput.data.visaSupport || null,
shiftType: parsedInput.data.shiftType || null,
```

**Sửa `updateAdminJobPosting`:** Tìm hàm này (dùng grep), thêm 5 fields tương tự vào prisma.update data.

**Sửa `getAdminJobPostingById` select** (line ~84): Thêm vào `select {}`:

```ts
industrialZone: true,
requiredLanguages: true,
languageProficiency: true,
visaSupport: true,
shiftType: true,
```

---

#### File: `src/app/(dashboard)/moderation/new/new-job-posting-form.tsx`

Đọc file này và `src/app/(employer)/employer/(portal)/job-postings/new/page.tsx` để hiểu pattern.

Thêm vào form (trước submit button):
1. Copy constants `INDUSTRIAL_ZONES`, `LANGUAGES`, `PROFICIENCY_LEVELS` từ employer form lên đầu file
2. Thêm section "Yêu cầu đặc thù FDI" với 3 nhóm field:
   - KCN dropdown (`name="industrialZone"`) + Shift type select (`name="shiftType"`)
   - Language select (`name="requiredLanguage"`) + Proficiency select (`name="languageProficiency"`)
   - Visa support select (`name="visaSupport"`)

Style: dùng `inputClassName` đã có trong file, thêm border accent `border-[#0077B6]/20` cho section card.

---

#### File: `src/app/(dashboard)/moderation/[id]/edit/job-posting-edit-form.tsx`

Đọc file để biết prop `job` được type như thế nào. Sau khi `getAdminJobPostingById` đã select FDI fields (bước trên), prop `job` sẽ có đủ fields.

Thêm section FDI giống `new-job-posting-form.tsx`, nhưng mỗi select cần defaultValue:

```tsx
<select name="industrialZone" defaultValue={job.industrialZone ?? ""}>
<select name="requiredLanguage" defaultValue={job.requiredLanguages?.[0] ?? "none"}>
<select name="languageProficiency" defaultValue={job.languageProficiency ?? ""}>
<select name="visaSupport" defaultValue={job.visaSupport ?? ""}>
<select name="shiftType" defaultValue={job.shiftType ?? ""}>
```

---

### Task 2 — Job detail FDI badges

#### File: `src/lib/public-actions.ts`

**`JobDetail` type** (line ~378): Thêm sau `skills: string[]`:

```ts
industrialZone: string | null;
requiredLanguages: string[];
languageProficiency: string | null;
visaSupport: string | null;
shiftType: string | null;
```

**`getPublicJobBySlug` select** (line ~417): Thêm sau `skills: true`:

```ts
industrialZone: true,
requiredLanguages: true,
languageProficiency: true,
visaSupport: true,
shiftType: true,
```

---

#### File: `src/app/(public)/viec-lam/[slug]/page.tsx`

**Bước 1:** Thêm 2 constants ở đầu file (sau imports):

```ts
const LANGUAGE_LABELS: Record<string, string> = {
  Japanese: "Tiếng Nhật",
  Korean: "Tiếng Hàn",
  English: "Tiếng Anh",
  Chinese: "Tiếng Trung",
  German: "Tiếng Đức",
  French: "Tiếng Pháp",
};

const SHIFT_LABELS: Record<string, string> = {
  DAY: "Ca ngày",
  NIGHT: "Ca đêm",
  ROTATING: "Xoay ca",
};
```

**Bước 2:** Tìm `{/* Info Grid */}` block trong JSX (grid 2-3 cột hiển thị location, workType, salary...). Thêm FDI badge row ngay SAU closing tag của grid đó:

```tsx
{/* FDI Badges */}
{(job.requiredLanguages.length > 0 || job.industrialZone || job.visaSupport || job.shiftType) && (
  <div className="flex flex-wrap gap-2 mb-6">
    {job.requiredLanguages.map((lang) => (
      <span key={lang} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0077B6]/10 text-[#0077B6]">
        🌐 {LANGUAGE_LABELS[lang] ?? lang}
        {job.languageProficiency && ` · ${job.languageProficiency}`}
      </span>
    ))}
    {job.industrialZone && (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        🏭 {job.industrialZone}
      </span>
    )}
    {job.visaSupport === "YES" && (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        ✅ Hỗ trợ visa
      </span>
    )}
    {job.shiftType && (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
        🕐 {SHIFT_LABELS[job.shiftType] ?? job.shiftType}
      </span>
    )}
  </div>
)}
```

---

## 4. Verification

```bash
cd d:/MH/Headhunt_pj
npx tsc --noEmit     # phải pass không lỗi
npm run build        # phải pass không lỗi
```

Nếu pass:

```bash
git add src/lib/admin-job-posting-actions.ts \
  "src/app/(dashboard)/moderation/new/new-job-posting-form.tsx" \
  "src/app/(dashboard)/moderation/[id]/edit/job-posting-edit-form.tsx" \
  src/lib/public-actions.ts \
  "src/app/(public)/viec-lam/[slug]/page.tsx"

git commit -m "feat: add FDI fields to admin forms + job detail badges (Sprint 2)"
```

---

## 5. Files KHÔNG được sửa

| File | Lý do |
|------|-------|
| `prisma/schema.prisma` | Schema đã done |
| `src/lib/validation/forms.ts` | Zod schema đã có FDI fields |
| `src/lib/employers.ts` | Type signatures đã done |
| `src/lib/employer-actions.ts` | Done — dùng làm reference pattern |
| `src/components/public/JobFilters.tsx` | Done |
| `src/app/(public)/viec-lam/page.tsx` | Done |
| `src/app/(employer)/employer/(portal)/job-postings/new/page.tsx` | Done — đây là **file reference** để copy pattern, không sửa |
