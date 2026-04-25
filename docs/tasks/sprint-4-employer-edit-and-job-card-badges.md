# Sprint 4 — Employer Edit Page + Job Card Language Badges

**Assigned to:** Codex  
**Branch:** master  
**Last updated:** 2026-04-21  
**Status:** Ready to execute

---

## 1. Project Context

FDIWork là job board FDI niche Vietnam. Đã có: FDI fields trong schema, employer form tạo mới, admin forms, job detail badges, seed data. Sprint 4 hoàn thiện 2 gaps còn lại:

- **Task 1 (Job card badges):** `HomepageJob` type thiếu `requiredLanguages` → job card list không hiển thị badge ngôn ngữ. Quick win, dễ thấy ngay trên trang chính.
- **Task 2 (Employer edit page):** Employer chưa có trang edit job posting. Không thể cập nhật FDI fields sau khi tạo. Critical cho outreach — employer đăng ký xong cần chỉnh sửa được.

### Tech stack

Next.js 15 App Router, React 19, Tailwind CSS v4, Prisma 7 + Neon.

### Lưu ý

- `npx prisma migrate dev` bị lỗi → dùng `npx prisma db push` nếu cần schema change (Sprint 4 không cần).
- Server actions đã có đủ: `updateJobPostingAction(id, formData)` trong `src/lib/employer-actions.ts` đã parse đủ 5 FDI fields.
- `getJobPostingDetail(id)` trong `src/lib/employer-actions.ts` trả về full job object qua `include` (không có `select` giới hạn) → có sẵn tất cả FDI fields.

---

## 2. Task 1 — Language badge trên JobCard

### 2a. `src/lib/public-actions.ts` — Thêm `requiredLanguages` vào `HomepageJob`

Tìm `export type HomepageJob = {` (dòng ~8). Thêm sau field `publishedAt`:

```ts
requiredLanguages: string[];
```

Tìm `prisma.jobPosting.findMany` trong `getPublicJobs` (select block ~line 337). Thêm sau `isFeatured: true`:

```ts
requiredLanguages: true,
```

### 2b. `src/components/public/JobCard.tsx` — Render badge

Thêm constant ở đầu file (sau imports):

```ts
const LANGUAGE_LABELS: Record<string, string> = {
  Japanese: "Tiếng Nhật",
  Korean: "Tiếng Hàn",
  English: "Tiếng Anh",
  Chinese: "Tiếng Trung",
  German: "Tiếng Đức",
  French: "Tiếng Pháp",
};
```

Tìm `{/* Footer */}` block (dòng ~80). Thêm language badge ROW ngay trước footer, sau closing `</div>` của "Text content":

```tsx
{/* Language badges */}
{job.requiredLanguages.length > 0 && (
  <div className="flex flex-wrap gap-1.5 mt-2.5 pl-20">
    {job.requiredLanguages.map((lang) => (
      <span
        key={lang}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0077B6]/10 text-[#0077B6]"
      >
        🌐 {LANGUAGE_LABELS[lang] ?? lang}
      </span>
    ))}
  </div>
)}
```

**Kết quả mong đợi:** Job card của Samsung/Canon/Toyota hiển thị badge "🌐 Tiếng Hàn" / "🌐 Tiếng Nhật" ngay dưới meta row (salary/location).

---

## 3. Task 2 — Employer edit page

### Kiến trúc

Pattern: **server component page** (fetch data) → **client component form** (useState + action).

Cần tạo 2 file:
1. `src/app/(employer)/employer/(portal)/job-postings/[id]/edit/page.tsx` — server component
2. `src/app/(employer)/employer/(portal)/job-postings/[id]/edit/EditJobPostingForm.tsx` — client component

Và sửa 1 file:
3. `src/app/(employer)/employer/(portal)/job-postings/[id]/page.tsx` — thêm nút Edit

---

### 3a. File mới: `edit/page.tsx` (server component)

```tsx
import { notFound } from "next/navigation";
import { getJobPostingDetail } from "@/lib/employer-actions";
import { EditJobPostingForm } from "./EditJobPostingForm";

export default async function EditJobPostingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) notFound();

  const job = await getJobPostingDetail(jobId);
  if (!job) notFound();

  // Only allow editing non-APPROVED/non-EXPIRED jobs, or APPROVED (employer can edit anytime)
  // updateJobPostingAction handles status logic: REJECTED → PENDING on save
  return (
    <div className="max-w-3xl mx-auto">
      <EditJobPostingForm job={job} />
    </div>
  );
}
```

---

### 3b. File mới: `edit/EditJobPostingForm.tsx` (client component)

Đây là form chỉnh sửa. Copy structure từ `src/app/(employer)/employer/(portal)/job-postings/new/page.tsx` với các thay đổi:

1. `"use client"` ở đầu
2. Import `updateJobPostingAction` thay vì `createJobPostingAction`
3. Nhận prop `job` (type = return type của `getJobPostingDetail` — dùng `NonNullable<Awaited<ReturnType<typeof getJobPostingDetail>>>`)
4. Tất cả `<input>` và `<select>` thêm `defaultValue`
5. Submit gọi `updateJobPostingAction(job.id, formData)`
6. Nếu job.status === "REJECTED" → hiển thị banner warning "Tin này đã bị từ chối. Chỉnh sửa và lưu sẽ gửi lại cho admin duyệt."
7. Sau submit thành công → `router.push(\`/employer/job-postings/${job.id}\`)`

**Skeleton đầy đủ:**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateJobPostingAction, getJobPostingDetail } from "@/lib/employer-actions";
import { ArrowLeft, Save, AlertCircle, AlertTriangle } from "lucide-react";

// Copy các constants này từ new/page.tsx (KHÔNG thay đổi giá trị):
const INDUSTRIAL_ZONES = [ /* copy từ new/page.tsx */ ];
const LANGUAGES = [ /* copy từ new/page.tsx */ ];
const PROFICIENCY_LEVELS = [ /* copy từ new/page.tsx */ ];

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";
const selectClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";

type Job = NonNullable<Awaited<ReturnType<typeof getJobPostingDetail>>>;

export function EditJobPostingForm({ job }: { job: Job }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await updateJobPostingAction(job.id, formData);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    } else {
      router.push(`/employer/job-postings/${job.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/employer/job-postings/${job.id}`}
          className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa tin tuyển dụng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cập nhật thông tin tin đăng</p>
        </div>
      </div>

      {/* Rejected warning */}
      {job.status === "REJECTED" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Tin đã bị từ chối</p>
            {job.rejectReason && (
              <p className="text-sm text-amber-700 mt-1">Lý do: {job.rejectReason}</p>
            )}
            <p className="text-sm text-amber-700 mt-1">Chỉnh sửa và lưu sẽ gửi lại để admin duyệt.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* === SECTION: Thông tin cơ bản === */}
      {/* Copy y chang section "Thông tin cơ bản" từ new/page.tsx */}
      {/* Thêm defaultValue vào mỗi input/select: */}
      {/*   title: defaultValue={job.title} */}
      {/*   industry: defaultValue={job.industry ?? ""} */}
      {/*   position: defaultValue={job.position ?? ""} */}
      {/*   location: defaultValue={job.location ?? ""} */}
      {/*   workType: defaultValue={job.workType ?? ""} */}
      {/*   quantity: defaultValue={job.quantity} */}

      {/* === SECTION: Mô tả công việc === */}
      {/* Copy từ new/page.tsx */}
      {/* Thêm defaultValue: */}
      {/*   description: defaultValue={job.description} */}
      {/*   requirements: defaultValue={job.requirements ?? ""} */}
      {/*   benefits: defaultValue={job.benefits ?? ""} */}

      {/* === SECTION: Mức lương === */}
      {/* Copy từ new/page.tsx */}
      {/* Thêm defaultValue: */}
      {/*   salaryMin: defaultValue={job.salaryMin ?? ""} */}
      {/*   salaryMax: defaultValue={job.salaryMax ?? ""} */}
      {/*   salaryDisplay: defaultValue={job.salaryDisplay ?? ""} */}

      {/* === SECTION: Kỹ năng === */}
      {/* Copy từ new/page.tsx */}
      {/* Thêm defaultValue: */}
      {/*   skills: defaultValue={job.skills.join(", ")} */}

      {/* === SECTION: Yêu cầu đặc thù FDI === */}
      {/* Copy từ new/page.tsx — QUAN TRỌNG: thêm defaultValue cho FDI fields: */}
      {/*   industrialZone: defaultValue={job.industrialZone ?? ""} */}
      {/*   shiftType: defaultValue={job.shiftType ?? ""} */}
      {/*   requiredLanguage: defaultValue={job.requiredLanguages?.[0] ?? "none"} */}
      {/*   languageProficiency: defaultValue={job.languageProficiency ?? ""} */}
      {/*   visaSupport: defaultValue={job.visaSupport ?? ""} */}

      {/* Submit button */}
      <div className="flex justify-end gap-3">
        <Link
          href={`/employer/job-postings/${job.id}`}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
```

**Hướng dẫn implement form body:**

Copy toàn bộ phần JSX của form từ `new/page.tsx` (từ sau submit handler đến trước nút submit), bỏ nút submit cũ, thêm `defaultValue` theo bảng sau:

| Field (name=) | defaultValue |
|---|---|
| `title` | `job.title` |
| `industry` | `job.industry ?? ""` |
| `position` | `job.position ?? ""` |
| `location` | `job.location ?? ""` |
| `workType` | `job.workType ?? ""` |
| `quantity` | `job.quantity` |
| `description` | `job.description` |
| `requirements` | `job.requirements ?? ""` |
| `benefits` | `job.benefits ?? ""` |
| `salaryMin` | `job.salaryMin ?? ""` |
| `salaryMax` | `job.salaryMax ?? ""` |
| `salaryDisplay` | `job.salaryDisplay ?? ""` |
| `skills` | `job.skills.join(", ")` |
| `industrialZone` | `job.industrialZone ?? ""` |
| `shiftType` | `job.shiftType ?? ""` |
| `requiredLanguage` | `job.requiredLanguages?.[0] ?? "none"` |
| `languageProficiency` | `job.languageProficiency ?? ""` |
| `visaSupport` | `job.visaSupport ?? ""` |

---

### 3c. Sửa file: `src/app/(employer)/employer/(portal)/job-postings/[id]/page.tsx`

Thêm nút Edit vào header, bên cạnh `<JobActionButtons>`. Chỉ hiển thị nếu status là DRAFT, PENDING, REJECTED, APPROVED, PAUSED (tức là luôn hiển thị):

Tìm block:
```tsx
<JobActionButtons jobId={job.id} status={job.status} />
```

Thay bằng:
```tsx
<div className="flex items-center gap-2">
  <Link
    href={`/employer/job-postings/${job.id}/edit`}
    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
  >
    <Pencil className="h-4 w-4" />
    Chỉnh sửa
  </Link>
  <JobActionButtons jobId={job.id} status={job.status} />
</div>
```

Thêm `Pencil` vào import lucide-react ở đầu file.  
Thêm `Link` vào import next/link (đã có sẵn, không cần thêm).

---

## 4. Verification

```bash
npx tsc --noEmit   # phải pass
npm run build      # phải pass
```

### Manual check

1. Mở `/viec-lam` → job cards của Samsung/Canon/Toyota phải hiển thị badge "🌐 Tiếng Hàn" / "🌐 Tiếng Nhật" / "🌐 Tiếng Anh"
2. Login employer (`hr@samsung-vn.com` / `employer123`) → vào `/employer/job-postings` → click vào một job → thấy nút "Chỉnh sửa"
3. Click "Chỉnh sửa" → tới trang `/employer/job-postings/[id]/edit` → form hiển thị với dữ liệu hiện tại pre-filled
4. FDI section hiển thị đúng KCN, ngôn ngữ, proficiency, visa support, shift type từ job gốc
5. Chỉnh sửa một field → Save → redirect về trang detail → thay đổi được lưu

---

## 5. Commit

```bash
git add src/lib/public-actions.ts \
  src/components/public/JobCard.tsx \
  "src/app/(employer)/employer/(portal)/job-postings/[id]/edit/page.tsx" \
  "src/app/(employer)/employer/(portal)/job-postings/[id]/edit/EditJobPostingForm.tsx" \
  "src/app/(employer)/employer/(portal)/job-postings/[id]/page.tsx"

git commit -m "feat: add language badges to job cards + employer edit page with FDI fields (Sprint 4)"
```

---

## 6. Files KHÔNG được sửa

| File | Lý do |
|------|-------|
| `src/lib/employer-actions.ts` | `updateJobPostingAction` đã có đủ FDI fields |
| `src/lib/employers.ts` | `getEmployerOwnedJobPosting` dùng `include` — trả về tất cả fields |
| `src/lib/validation/forms.ts` | Zod schema đã có FDI |
| `src/app/(employer)/employer/(portal)/job-postings/new/page.tsx` | Reference để copy — không sửa |
| `prisma/schema.prisma` | Done Sprint 1 |
