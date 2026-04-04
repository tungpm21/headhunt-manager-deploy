# Prompt Tự Động Implement Audit

> Copy toàn bộ prompt bên dưới → paste vào chat mới với AI Agent.
> Prompt được thiết kế để agent tự chạy từ đầu đến cuối, không cần user input giữa chừng.

---

## Prompt (Copy từ đây)

```
Bạn là senior backend engineer được giao nhiệm vụ implement tất cả audit fixes cho dự án Headhunt Manager.

## Bước 0: Đọc hiểu context

1. Đọc file `docs/audit/README.md` để hiểu cấu trúc audit
2. Đọc file `docs/audit/05-backend-code-audit.md` để hiểu các vấn đề kỹ thuật
3. Đọc file `docs/audit/06-refactor-3day-plan.md` để hiểu kế hoạch fix cụ thể
4. Đọc file `ARCHITECTURE.md` và `CODEBASE.md` để hiểu codebase hiện tại
5. Đọc file `prisma/schema.prisma` để hiểu database schema

## Bước 1: Implement Tier 1 — Quick Fixes (làm HẾT trước khi sang Tier 2)

Thực hiện TUẦN TỰ từng issue, mỗi issue xong thì chạy `npm run build` kiểm tra:

### 1.1 Fix B3 — Connection Pool Config
- Sửa `src/lib/prisma.ts`
- Thêm pool config: `max: 5`, `idleTimeoutMillis: 10000`, `connectionTimeoutMillis: 5000`
- Chi tiết: `docs/audit/05-backend-code-audit.md` section B3

### 1.2 Fix S4 — CV Delete-Before-Upload Race Condition
- Sửa `src/app/api/candidates/[id]/cv/route.ts`
- Đảo thứ tự: upload file mới → update DB → xóa file cũ (thay vì xóa cũ → upload mới)
- Chi tiết: `docs/audit/05-backend-code-audit.md` section S4

### 1.3 Fix B4a — Dashboard isDeleted Count
- Sửa `src/app/(dashboard)/dashboard/page.tsx`
- Thêm `{ where: { isDeleted: false } }` vào `prisma.candidate.count()`
- Bỏ `requireAdmin()` thừa trong `getNewApplicationsCount()` và `getRecentApplications()` bằng cách inline queries
- Chi tiết: `docs/audit/05-backend-code-audit.md` section B4

### 1.4 Fix FIX-4 — Tag Update Transaction
- Sửa `src/lib/candidates.ts` → function `updateCandidate`
- Wrap 3 operations (update candidate, deleteMany tags, createMany tags) trong `prisma.$transaction([...])`
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day1 §1.5

**Checkpoint:** Chạy `npm run build`. Nếu có lỗi, fix trước khi tiếp tục.

## Bước 2: Implement Tier 2 — Core Fixes

### 2.1 Fix FIX-3 — Extract Shared Utils
- Tạo file `src/lib/utils/auth-helpers.ts`: chứa `requireUserId()`
- Tạo file `src/lib/utils/form-helpers.ts`: chứa `strVal()`, `intVal()`, `dateVal()`, `enumVal()`
- Xóa duplicate từ `src/lib/actions.ts`, `src/lib/job-actions.ts`, `src/lib/candidate-detail-actions.ts`
- Import lại từ shared utils
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day1 §1.3

### 2.2 Fix FIX-1 — Skills Normalize + GIN Index
- Tạo Prisma migration:
  - SQL normalize existing data: `UPDATE "Candidate" SET skills = array(SELECT DISTINCT lower(trim(s)) FROM unnest(skills) AS s)`
  - Tạo GIN index: `CREATE INDEX idx_candidate_skills ON "Candidate" USING GIN (skills)`
  - Tạo GIN index: `CREATE INDEX idx_job_required_skills ON "JobOrder" USING GIN ("requiredSkills")`
- Sửa `src/lib/candidates.ts`: skills filter input cũng `.map(s => s.toLowerCase().trim())`
- Chạy: `npx prisma migrate dev --name normalize_skills_gin_index`
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day1 §1.1

### 2.3 Fix JOB-FORM — Job Form Missing Fields
- Sửa `src/components/jobs/job-form.tsx`: thêm 4 fields:
  - `requiredSkills` (text input, comma-separated, placeholder "Node.js, TypeScript...")
  - `industry` (select dropdown, dùng INDUSTRIES constant)
  - `location` (text input)
  - `assignedToId` (select dropdown, load users list)
- Sửa `src/lib/job-actions.ts`:
  - `createJobAction`: parse 4 fields mới từ FormData, skills split by comma → String[]
  - `updateJobAction`: tương tự
- Sửa `src/app/(dashboard)/jobs/new/page.tsx`: pass users list vào JobForm
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day1 §1.4, `docs/audit/02-recruiter-journey-core.md` Phase 1

### 2.4 Fix B2 — Batch Import
- Sửa `src/lib/import-actions.ts`:
  - Thay `for...of` loop bằng batch approach:
    1. Collect emails → `findMany({ where: { email: { in: emails } } })`
    2. Filter new records
    3. `createMany({ data: newRecords, skipDuplicates: true })`
  - Thêm dedup theo phone (ngoài email)
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day2 §2.3

**Checkpoint:** Chạy `npm run build`. Fix mọi lỗi trước khi tiếp tục.

## Bước 3: Implement Tier 3 — CRM Unblock

### 3.1 Fix CROSS-REF — Candidate ↔ Job Cross-Reference
- Sửa `src/lib/candidates.ts` → `getCandidateById`:
  - Thêm include `jobLinks` với nested `jobOrder` (id, title, status, client.companyName)
- Tạo `src/components/candidates/candidate-pipelines.tsx`:
  - Nhận `jobLinks` prop, render danh sách jobs + stage + status badge
  - Link tới `/jobs/{id}`
- Sửa `src/app/(dashboard)/candidates/[id]/page.tsx`:
  - Thêm `<CandidatePipelines>` component dưới `<CandidateInfo>`
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day2 §2.1

### 3.2 Fix ASSIGN — Smart Assign Modal
- Sửa `src/lib/jobs.ts` → `searchAvailableCandidates`:
  - Thêm params: `level?`, `skills?`, `maxSalary?`
  - Áp dụng filters vào where clause
  - Tăng `take: 10` → `take: 20`
  - Select thêm: `skills`, `level`, `expectedSalary`
- Sửa `src/lib/job-actions.ts`:
  - `searchAvailableCandidatesAction`: pass filter params
  - Tạo `assignMultipleCandidatesAction(jobId, candidateIds[])`: batch assign
- Rebuild `src/components/jobs/assign-candidate-modal.tsx`:
  - Thêm filter bar: level select, skills input, salary max
  - Hiện skills chips + salary trong kết quả search
  - Checkbox multi-select
  - Button "Gán X ứng viên đã chọn" gọi batch action
  - Auto-populate filters từ JobOrder.requiredSkills + level nếu có
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day2 §2.2

### 3.3 Fix BRIDGE — Auto-Import Application → Pipeline
- Sửa `src/lib/moderation-actions.ts` → `importApplicationToCRM`:
  - Sau khi tạo/link Candidate, check `application.jobPosting.jobOrderId`
  - Nếu có → auto-create `JobCandidate` với stage "SOURCED", result "PENDING"
  - Include jobPosting.jobOrderId trong query
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day3 §3.1

### 3.4 Fix AUDIT-LOG — Activity Log Model
- Thêm vào `prisma/schema.prisma`:
  ```
  model ActivityLog {
    id         Int      @id @default(autoincrement())
    type       String
    entityType String
    entityId   Int
    userId     Int
    user       User     @relation(fields: [userId], references: [id])
    metadata   Json?
    createdAt  DateTime @default(now())
    @@index([entityType, entityId])
    @@index([userId])
  }
  ```
- Chạy: `npx prisma migrate dev --name add_activity_log`
- Tạo `src/lib/activity-log.ts`: helper function `logActivity(type, entityType, entityId, userId, metadata)`
- Hook vào existing actions (thêm 1 dòng gọi logActivity sau mỗi mutation):
  - `updateCandidateStageAction` → log STAGE_CHANGE
  - `updateCandidateStatusAction` → log STATUS_CHANGE
  - `addCandidateNoteAction` → log NOTE
  - `importApplicationToCRM` → log IMPORT
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day3 §3.2

### 3.5 Fix DASHBOARD — Pipeline Overview + Recent Activity
- Sửa `src/app/(dashboard)/dashboard/page.tsx`:
  - Thêm query: active jobs với pipeline stage counts
  - Thêm query: recent ActivityLog entries (top 10)
  - Render "Pipeline Overview" section: mỗi job hiện progress bar theo stage
  - Render "Recent Activity" section: timeline activity mới nhất
- Chi tiết: `docs/audit/06-refactor-3day-plan.md` Day3 §3.3

## Bước 4: Verify

1. Chạy `npm run build` — phải pass không lỗi
2. Chạy `npx prisma validate` — schema phải valid
3. Update `docs/audit/README.md` → đánh dấu [x] tất cả issues trong Progress Tracking

## Rules BẮT BUỘC

- KHÔNG sửa files trong `src/app/(public)/`, `src/app/(employer)/`, `src/components/public/`, `src/components/employer/` trừ khi fix bridge
- KHÔNG thêm dependencies mới trừ khi thực sự cần
- Error messages phải bằng tiếng Việt
- Follow existing patterns trong codebase (xem ARCHITECTURE.md)
- Mỗi bước xong chạy `npm run build` kiểm tra
- Nếu gặp lỗi không giải quyết được ở 1 issue → skip, đánh dấu, tiếp tục issue tiếp theo
- **SAU MỖI ISSUE:** Cập nhật `docs/PROJECT-TRACKER.md`:
  - Đánh dấu [x] task đã xong trong bảng tương ứng, ghi ngày
  - Thêm 1 dòng vào section "NHAT KY THAY DOI"
  - Nếu gặp blocker → ghi vào section "VAN DE / BLOCKERS"
```

---

## Tips Sử Dụng

1. **Prompt dài → tốt hơn.** AI Agent cần context đầy đủ để chạy autonomously
2. **Nếu agent hỏi** → trả lời "Tiếp tục theo plan, không cần hỏi"
3. **Nếu agent bị stuck** → paste lại section cụ thể (VD: "Chỉ làm Bước 2.2")
4. **Kiểm tra sau mỗi tier** → chạy app kiểm tra UI trước khi cho agent tiếp tục tier sau
