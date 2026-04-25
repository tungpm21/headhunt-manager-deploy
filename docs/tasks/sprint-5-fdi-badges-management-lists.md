# Sprint 5 — FDI Mini-Badges trên Management Lists

**Assigned to:** Codex  
**Branch:** master  
**Last updated:** 2026-04-21  
**Status:** Ready to execute

---

## 1. Context

FDIWork đã có FDI fields đầy đủ. Sprint 5 làm cho FDI visible trong 2 management views:
- **Admin moderation list** `/moderation` — admin duyệt tin cần thấy FDI attributes ngay trên list, không cần click vào từng job
- **Employer job list** `/employer/job-postings` — employer thấy FDI summary của từng job mình đã đăng

**Data đã có sẵn** — cả `getPendingJobPostingsData` (dùng `include`) và `getMyJobPostings` đều trả về full job object bao gồm FDI fields. Chỉ cần render thêm badges, không cần sửa server actions hay DB queries.

---

## 2. Task 1 — Admin Moderation List

### File: `src/app/(dashboard)/moderation/page.tsx`

**Đọc file này trước.** Tìm chỗ render mỗi job row (có title, employer name, status badge, apply count...). Thêm FDI badge row ngay dưới title + employer name, TRƯỚC các meta info như views/apply count.

**Thêm FDI badge row vào mỗi job row:**

```tsx
{/* FDI mini-badges */}
{(job.requiredLanguages.length > 0 || job.industrialZone || job.visaSupport === "YES" || job.shiftType) && (
  <div className="flex flex-wrap gap-1.5 mt-1">
    {job.requiredLanguages.map((lang: string) => (
      <span key={lang} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
        🌐 {LANGUAGE_LABELS[lang] ?? lang}
      </span>
    ))}
    {job.industrialZone && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
        🏭 {job.industrialZone}
      </span>
    )}
    {job.visaSupport === "YES" && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
        ✅ Visa
      </span>
    )}
    {job.shiftType && job.shiftType !== "DAY" && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700">
        🕐 {SHIFT_LABELS[job.shiftType] ?? job.shiftType}
      </span>
    )}
  </div>
)}
```

**Thêm 2 constants ở đầu file (sau imports):**

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
  NIGHT: "Ca đêm",
  ROTATING: "Xoay ca",
};
```

*Lưu ý: `shiftType === "DAY"` không cần badge vì là mặc định — chỉ badge NIGHT và ROTATING.*

---

## 3. Task 2 — Employer Job List

### File: `src/app/(employer)/employer/(portal)/job-postings/page.tsx`

**Đọc file này trước.** Tìm chỗ render mỗi job row (có title, status badge, views, applies, expiry...). Thêm FDI badge row tương tự Task 1, ngay dưới title.

**Thêm 2 constants và FDI badge row theo ĐÚNG pattern tương tự Task 1.**

**Khác biệt duy nhất so với Task 1:** dùng màu `teal` thay vì `blue` để match design system employer portal (teal là accent color của employer portal):

```tsx
{/* FDI mini-badges */}
{(job.requiredLanguages.length > 0 || job.industrialZone || job.visaSupport === "YES" || job.shiftType) && (
  <div className="flex flex-wrap gap-1.5 mt-1">
    {job.requiredLanguages.map((lang: string) => (
      <span key={lang} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700">
        🌐 {LANGUAGE_LABELS[lang] ?? lang}
      </span>
    ))}
    {job.industrialZone && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
        🏭 {job.industrialZone}
      </span>
    )}
    {job.visaSupport === "YES" && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
        ✅ Visa
      </span>
    )}
    {job.shiftType && job.shiftType !== "DAY" && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700">
        🕐 {SHIFT_LABELS[job.shiftType] ?? job.shiftType}
      </span>
    )}
  </div>
)}
```

**Kiểm tra `getMyJobPostings` select:** Nếu `getMyJobPostings` trong `employer-actions.ts` dùng `select` (không phải `include`) và không chọn FDI fields, cần thêm:
```ts
industrialZone: true,
requiredLanguages: true,
visaSupport: true,
shiftType: true,
```
vào select block đó. Nếu dùng `include` thì skip bước này.

---

## 4. Verification

```bash
npx tsc --noEmit   # phải pass
npm run build      # phải pass
```

### Manual check

1. Admin login → `/moderation` → job rows có FDI badges hiển thị (Samsung jobs có "🌐 Tiếng Hàn", "🏭 KCN Yên Phong")
2. Employer login (`hr@samsung-vn.com` / `employer123`) → `/employer/job-postings` → job rows có FDI badges tương tự
3. Jobs không có FDI fields (language = `[]`, industrialZone = null) → không hiển thị badge row (không có div thừa)

---

## 5. Commit

```bash
git add "src/app/(dashboard)/moderation/page.tsx" \
  "src/app/(employer)/employer/(portal)/job-postings/page.tsx"

git commit -m "feat: add FDI mini-badges to admin moderation + employer job lists (Sprint 5)"
```

---

## 6. Files KHÔNG được sửa

| File | Lý do |
|------|-------|
| `src/lib/moderation.ts` | `getPendingJobPostingsData` dùng `include` — đã có FDI data |
| `src/lib/moderation-actions.ts` | Không cần thay đổi |
| `src/lib/employer-actions.ts` | Chỉ sửa nếu `getMyJobPostings` dùng select thiếu FDI fields |
| Tất cả file khác | Sprint 5 chỉ là 2 file UI |
