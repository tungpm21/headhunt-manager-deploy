# Headhunt Manager - Project Tracker

> Nguồn sự thật duy nhất về tiến độ dự án.
> AI Agent bắt buộc cập nhật file này sau mỗi thay đổi.
> PM đọc file này để ra chỉ thị tiếp theo.

---

## QUY TẮC CẬP NHẬT

```text
SAU MỖI ISSUE/TASK HOÀN THÀNH:
1. Cập nhật trạng thái: [ ] -> [x] (done) hoặc [!] (blocked) hoặc [~] (partial)
2. Ghi ngày hoàn thành vào cột "Ngày"
3. Ghi tóm tắt thay đổi vào section "Nhật Ký Thay Đổi" phía dưới
4. Nếu gặp vấn đề -> ghi vào section "Vấn Đề / Blockers"
5. Không xóa lịch sử thay đổi đã ghi

KHI BẮT ĐẦU SESSION MỚI:
1. Đọc file này trước tiên
2. Tìm task chưa làm ([ ]) hoặc đang làm ([~])
3. Tiếp tục từ đúng chỗ đó
```

---

## TỔNG QUAN TIẾN ĐỘ

| Sprint                               | Trạng thái         | Tiến độ | Ghi chú                                                          |
| ------------------------------------ | ------------------ | ------- | ---------------------------------------------------------------- |
| Sprint 1: Audit Fixes (Tier 1-3)     | Done               | 14/14   |                                                                  |
| Sprint 2: UX Recruiter               | Done               | 5/5     |                                                                  |
| Bonus: Agent Features                | Done               | 6/6     | BONUS 1-5 đã review trong S3-10; BONUS-6 admin employer — Done   |
| Sprint 3: Production Deploy          | Done               | 10/10   | S3-9 duoc PM chap nhan chot bang verify E2E voi template mau va script import |
| Sprint 4: Real Users                 | Chưa bắt đầu      | 0/5     |                                                                  |
| Sprint 5: Scale + Backlog            | Done              | 14/14   | Da xong toan bo S5-1..S5-14, gom ownership scope va schema-first validation |
| Sprint 6: Growth                     | Chưa bắt đầu      | 0/5     |                                                                  |

---

## SPRINT 1: AUDIT + REFACTOR — Done

### Tier 1 - Quick Fixes

| #     | Task                              | Trạng thái | Ngày       | Nguồn audit                                              |
| ----- | --------------------------------- | ---------- | ---------- | -------------------------------------------------------- |
| B3    | Pool config (`prisma.ts`)         | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §B3       |
| S4    | CV delete order (`cv/route.ts`)   | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §S4       |
| B4a   | Dashboard isDeleted count         | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §B4       |
| FIX-4 | Tag transaction                   | [x]        | 2026-04-03 | [01-architecture](./audit/01-architecture-audit.md) §2.3 |

### Tier 2 - Core Fixes

| #        | Task                                 | Trạng thái | Ngày       | Nguồn audit                                               |
| -------- | ------------------------------------ | ---------- | ---------- | --------------------------------------------------------- |
| FIX-1    | Skills normalize + GIN index         | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day1 §1.1 |
| FIX-5    | JobPosting.skills String -> String[] | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day1 §1.2 |
| FIX-3    | Shared utils extract                 | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day1 §1.3 |
| JOB-FORM | Job form 4 fields mới                | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day1 §1.4 |
| B2       | Import batch                         | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §B2        |

### Tier 3 - CRM Unblock

| #         | Task                    | Trạng thái | Ngày       | Nguồn audit                                               |
| --------- | ----------------------- | ---------- | ---------- | --------------------------------------------------------- |
| CROSS-REF | Candidate <-> Job panel | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day2 §2.1 |
| ASSIGN    | Smart assign modal      | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day2 §2.2 |
| BRIDGE    | Auto-import application | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day3 §3.1 |
| AUDIT-LOG | Activity log model      | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day3 §3.2 |
| DASHBOARD | Pipeline + activity     | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day3 §3.3 |

---

## SPRINT 2: UX RECRUITER — Done

| #    | Task                                | Trạng thái | Ngày       | Nguồn audit                                                  |
| ---- | ----------------------------------- | ---------- | ---------- | ------------------------------------------------------------ |
| S2-1 | FIX-5: JobPosting.skills migration  | [x]        | 2026-04-03 | [06-refactor](./audit/06-refactor-3day-plan.md) Day1 §1.2    |
| S2-2 | Dynamic filter options (DISTINCT)   | [x]        | 2026-04-03 | [02-recruiter](./audit/02-recruiter-journey-core.md) Phase 2 |
| S2-3 | Kanban pipeline view                | [x]        | 2026-04-03 | [04-product](./audit/04-product-strategy.md) §5              |
| S2-4 | Revenue/commission tracking         | [x]        | 2026-04-03 | [04-product](./audit/04-product-strategy.md) §4 #4           |
| S2-5 | Reminder/follow-up system           | [x]        | 2026-04-03 | [04-product](./audit/04-product-strategy.md) §4 #3           |

> S2-2 đã clean trong Sprint 3 preflight: bỏ hardcoded fallback, chỉ dùng DISTINCT options từ DB.

---

## BONUS: AGENT TỰ IMPLEMENT — Done

> BONUS 1-5: agent tự implement ngoài scope Sprint 2. Đã review và cleanup trong S3-10 trước khi deploy.
> BONUS-6: Admin Employer Management — đã review và ship đầy đủ 4 phases.

| #       | Feature                                                                                       | Phases | Commits              | Trạng thái      | Ghi chú                              |
| ------- | --------------------------------------------------------------------------------------------- | ------ | -------------------- | --------------- | ------------------------------------ |
| BONUS-1 | Smart Dashboard (pipeline summary, deadline alerts, activity feed, KPIs, layout)              | 5      | `41c2223..46f9ac9`   | [x] Reviewed    | `src/components/dashboard/`          |
| BONUS-2 | Pipeline Upgrade (surface tokens, kanban, quick actions, email templates, job info redesign)  | 5      | `7adf28b..74b72de`   | [x] Reviewed    | `src/components/jobs/`               |
| BONUS-3 | Global Search + Notification (command palette, bell, badges, header trigger)                  | 4      | `a5a1969..670d8e7`   | [x] Reviewed    | `src/components/global-search*.tsx`  |
| BONUS-4 | Candidate Bulk Actions (checkboxes, toolbar, quick view, duplicate detect)                    | 4      | `dfac7e6..496f310`   | [x] Reviewed    | `src/components/candidates/`         |
| BONUS-5 | Dark Mode + Responsive (surface tokens, mobile sidebar, tables, forms, spacing)               | 5      | `b15cb2b..8d9995b`   | [x] Reviewed    | Across multiple files                |
| BONUS-6 | Admin Employer Management (FDIWork links, detail page, company editor, UX polish)             | 4      | `46772a1..Phase4`    | [x] Done        | `src/app/(dashboard)/employers/`     |

---

## SPRINT 3: PRODUCTION DEPLOY

> Mục tiêu: App chạy ổn định, an toàn trên production.

### Security Fixes (từ audit)

| #    | Task                                              | Trạng thái | Ngày       | Nguồn audit                                                     |
| ---- | ------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------- |
| S3-1 | Redis rate limiting (Upstash)                     | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §B5 + rate-limit |
| S3-2 | File upload magic bytes validation                | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §S1              |
| S3-3 | Employer JWT hardening (7d -> 1d + status check)  | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §S3              |
| S3-4 | Avatar upload IDOR fix (ownership check)          | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §S2              |
| S3-5 | Unsafe enumVal -> validated enum cast             | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §S5              |

### Hạ tầng

| #     | Task                                    | Trạng thái | Ngày       | Nguồn                                              |
| ----- | --------------------------------------- | ---------- | ---------- | -------------------------------------------------- |
| S3-6  | Connection pool - Neon pooled URL       | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §B3 |
| S3-7  | Error tracking (Sentry)                 | [x]        | 2026-04-03 | [05-backend](./audit/05-backend-code-audit.md) §P3 |
| S3-8  | Deploy Vercel + Neon + domain           | [x]        | 2026-04-03 | Live trên `headhunt-manager-deploy.vercel.app`     |
| S3-9  | Seed/import dữ liệu thật từ Excel/CSV  | [x]        | 2026-04-04 | PM chap nhan dong task bang verify E2E voi template mau trong `docs/templates` |
| S3-10 | Review + cleanup BONUS features (1-5)   | [x]        | 2026-04-03 | Review xong, build + deploy production đã pass     |

---

## SPRINT 4: REAL USERS

> Mục tiêu: Validate với người dùng thật, thu feedback.

| #    | Task                                   | Trạng thái | Ngày | Ghi chú |
| ---- | -------------------------------------- | ---------- | ---- | ------- |
| S4-1 | Onboard 1-2 recruiter nội bộ           | [ ]        |      |         |
| S4-2 | Thu thập feedback (ghi lại friction)   | [ ]        |      |         |
| S4-3 | Bug fixes + UX tweaks từ feedback      | [ ]        |      |         |
| S4-4 | Onboard 2-3 employer (FDI client)      | [ ]        |      |         |
| S4-5 | Đo lường: time-to-fill, adoption rate  | [ ]        |      |         |

---

## SPRINT 5: SCALE + BACKLOG AUDIT

> Mục tiêu: Mở rộng khi có traction + dọn dẹp tồn đọng từ audit.

### Scale Features

| #    | Task                                             | Trạng thái | Nguồn audit                                                                |
| ---- | ------------------------------------------------ | ---------- | -------------------------------------------------------------------------- |
| S5-1 | Full-text search (pg_trgm cho name/email/phone)  | [x]        | [05-backend](./audit/05-backend-code-audit.md) §B1                         |
| S5-2 | Team RBAC (ownership, visibility)                | [x]        | [04-product](./audit/04-product-strategy.md) §6 Phase 3                    |
| S5-3 | Zod validation toàn bộ                           | [x]        | [05-backend](./audit/05-backend-code-audit.md) §S5                         |
| S5-4 | FDIWork <-> CRM auto-sync đầy đủ                | [x]        | [03-recruiter-pt2](./audit/03-recruiter-journey-supporting.md) §Cross-Flow |

### Backlog Từ Audit — UX Issues

| #     | Task                                                      | Trạng thái | Nguồn audit                                                        |
| ----- | --------------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| S5-5  | CV viewer: Google Docs fallback cho .doc/.docx            | [x]        | [03-recruiter-pt2](./audit/03-recruiter-journey-supporting.md) §A2 |
| S5-6  | Status change confirm guard (tránh nhầm BLACKLIST)        | [x]        | [03-recruiter-pt2](./audit/03-recruiter-journey-supporting.md) §A3 |
| S5-7  | Trash/archive view cho deleted candidates (restore UI)    | [x]        | [03-recruiter-pt2](./audit/03-recruiter-journey-supporting.md) §A4 |
| S5-8  | Import error report chi tiết (row + reason)               | [x]        | [03-recruiter-pt2](./audit/03-recruiter-journey-supporting.md) §B6 |
| S5-9  | Import preview > 5 dòng + validate toàn bộ               | [x]        | [03-recruiter-pt2](./audit/03-recruiter-journey-supporting.md) §B5 |
| S5-10 | Client detail hiển thị danh sách JobOrders (không chỉ count) | [x]    | [03-recruiter-pt2](./audit/03-recruiter-journey-supporting.md) §D1 |

### Backlog Từ Audit — Backend/Infra

| #     | Task                                              | Trạng thái | Nguồn audit                                                        |
| ----- | ------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| S5-11 | View counter batch (giảm write amplification)     | [x]        | [05-backend](./audit/05-backend-code-audit.md) §B5                 |
| S5-12 | getAllClients pagination (khi >200 clients)        | [x]        | [05-backend](./audit/05-backend-code-audit.md) §B6                 |
| S5-13 | Prisma direct in actions -> route qua data layer  | [x]        | [05-backend](./audit/05-backend-code-audit.md) §P2                 |
| S5-14 | Subscription auto-expire check                    | [x]        | [03-recruiter-pt2](./audit/03-recruiter-journey-supporting.md) §C3 |

---

## SPRINT 6: GROWTH

> Mục tiêu: Competitive edge khi có revenue.

| #    | Task                                 | Trạng thái | Nguồn                                                   |
| ---- | ------------------------------------ | ---------- | ------------------------------------------------------- |
| S6-1 | Email integration (tracked emails)   | [ ]        | [04-product](./audit/04-product-strategy.md) §4 #2      |
| S6-2 | LinkedIn profile import              | [ ]        | [04-product](./audit/04-product-strategy.md) §6 Phase 3 |
| S6-3 | Mobile PWA optimization              | [ ]        | [04-product](./audit/04-product-strategy.md) §4 #5      |
| S6-4 | Client portal (xem pipeline status)  | [ ]        | [04-product](./audit/04-product-strategy.md) §6 Phase 3 |
| S6-5 | AI matching (GPT skill scoring)      | [ ]        | [04-product](./audit/04-product-strategy.md) §4 #1      |

---

## NHẬT KÝ THAY ĐỔI

> AI Agent ghi log mọi thay đổi ở đây. Format: `[NGÀY] [SPRINT-TASK] Mô tả ngắn`

```text
[2026-04-03] Sprint 1 hoàn thành (14/14 issues).
[2026-04-03 10:11] [S2-1..S2-4] Hoàn tất FIX-5, dynamic filters, kanban, revenue.
[2026-04-03 10:40] [S2-5] Thêm reminder/follow-up system.
[2026-04-03 10:40] [VERIFY] npm run build, prisma validate, prisma migrate status — all pass.
[2026-04-03 10:40] [BONUS] Agent tự implement: smart dashboard, pipeline upgrade, global search, bulk actions, dark mode (23 commits).
[2026-04-03 11:46] [PM] Update tracker: thêm 16 missing audit issues, 5 bonus feature groups, nguồn audit references.
[2026-04-03 11:51] [S3-PRE1] Cleanup `candidate-filters.tsx`: xóa hardcoded `LOCATIONS` và `INDUSTRIES`, chỉ dùng filter options từ DB qua props.
[2026-04-03 11:51] [VERIFY] npm run build pass sau task cleanup preflight đầu tiên.
[2026-04-03 12:08] [S3-PRE2] Review bonus features: dashboard, global search, pipeline view switcher, bulk actions. Đã fix React cleanup issues trong `candidate-form`, `edit-candidate-form`, `candidate-info`, `candidate-notes`, `candidate-reminders`, `candidate-table-wrapper`, `global-search`.
[2026-04-03 12:08] [S3-PRE2] Dashboard components và `pipeline-view-switcher.tsx` đã review, không thấy issue cần sửa thêm.
[2026-04-03 12:08] [VERIFY] Targeted eslint clean, `npm run build` pass, `npx prisma validate` pass, và không còn `console.log` trong `src/`.
[2026-04-03 12:13] [S2-2] Hoàn tất cleanup dynamic filters: bỏ hardcoded fallback trong `candidate-filters.tsx`, chỉ dùng DISTINCT options từ DB qua props.
[2026-04-03 12:13] [S3-1] Chuyển rate limiting sang Upstash Redis trong `src/lib/rate-limit-redis.ts`, cập nhật API/server actions và giữ fallback bỏ qua limit khi thiếu env cho môi trường dev.
[2026-04-03 12:13] [VERIFY] `npm run build` pass sau S3-1.
[2026-04-03 12:29] [S3-2] Thêm util `src/lib/file-signatures.ts` để kiểm tra magic bytes cho PDF, DOC, DOCX, JPG, PNG, WebP và áp dụng cho 3 upload endpoints: public apply CV, candidate CV, avatar.
[2026-04-03 12:29] [S3-2] Chuẩn hóa route upload nội bộ sang thông báo lỗi tiếng Việt ASCII và sinh extension an toàn theo MIME type cho candidate CV/avatar.
[2026-04-03 12:29] [VERIFY] `npm run build` pass sau S3-2.
[2026-04-03 12:37] [S3-3] Harden employer JWT trong `src/lib/employer-auth.ts`: giảm TTL cookie/token xuống 1 ngày, thêm helper redirect có xóa cookie, và bắt buộc check employer.status = ACTIVE từ DB trong `requireEmployerSession()`.
[2026-04-03 12:37] [VERIFY] `npm run build` pass sau S3-3.
[2026-04-03 12:42] [S3-6] Cập nhật `src/lib/prisma.ts` để ưu tiên `DATABASE_POOLER_URL` trước `DATABASE_URL`, giữ pool config hiện có và fallback an toàn cho local/dev.
[2026-04-03 12:42] [S3-6] Bổ sung `DATABASE_POOLER_URL` vào `.env.example` để team có mẫu cấu hình pooled Postgres URL cho Neon.
[2026-04-03 12:42] [VERIFY] `npm run build` pass sau S3-6.
[2026-04-03 12:56] [S3-7] Cài `@sentry/nextjs`, thêm `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts` và wrap `next.config.ts` bằng `withSentryConfig`.
[2026-04-03 12:56] [S3-7] Cấu hình Sentry theo chế độ optional: nếu không có `SENTRY_DSN` thì runtime không init và `next.config.ts` fallback về config Next mặc định.
[2026-04-03 12:56] [S3-7] Bổ sung `SENTRY_DSN` vào `.env.example` và expose `NEXT_PUBLIC_SENTRY_DSN` qua `next.config.ts` cho client init an toàn.
[2026-04-03 12:56] [VERIFY] `npm run build` pass sau S3-7.
[2026-04-03 12:59] [VERIFY] `npx prisma validate` pass; còn warning deprecation cho preview feature `driverAdapters` trong Prisma config hiện tại.
[2026-04-03 13:12] [S3-4] Hardening `api/candidates/avatar`: thêm `candidateId` cho upload đã gắn ứng viên, verify candidate tồn tại và user có quyền (ADMIN hoặc owner), đồng thời chặn member upload avatar draft không gắn candidate.
[2026-04-03 13:12] [S3-4] Cập nhật `AvatarUpload` và `CandidateForm` để gửi `candidateId` khi edit, hiện avatar hiện tại đúng cách và gắn tên file upload theo draft/candidate scope.
[2026-04-03 13:12] [S3-5] Xóa helper `enumVal` unsafe còn sót trong `src/lib/client-actions.ts`, chuyển sang `utils/form-helpers.ts` với `validValues` từ enum Prisma và dùng `requireUserId` từ shared auth helper.
[2026-04-03 13:12] [VERIFY] `npm run build` pass sau S3-4 và S3-5.
[2026-04-03 15:37] [DOCS] Đồng bộ tên nhà cung cấp từ Supabase sang Neon trong tracker, prompt Sprint 3, `.env.example` và comment `src/lib/prisma.ts`.
[2026-04-03 15:37] [VERIFY] `npm run build` pass sau khi đồng bộ Neon naming; build đầu tiên lộ ra lỗi type ở `instrumentation-client.ts` và đã được sửa để giữ checkpoint xanh.
[2026-04-02 23:55] [BONUS-6] Admin Employer Management hoàn thành 4 phases: FDIWork quick links, employer detail page /employers/[id] (3 tabs), company editor /employers/[id]/edit, UX polish (Link Client vào Info tab). Build 32/32 pages, 0 TypeScript errors.
[2026-04-03 16:01] [REVIEW] Chạy /review workflow. Tạo báo cáo PROJECT_REVIEW_20260403.md. Tổng quan: Sprint 1+2+BONUS-6 done. Sprint 3 còn 3 tasks: S3-8 (deploy Vercel+Neon), S3-9 (import dữ liệu thật), S3-10 (review BONUS 1-5). BONUS 1-5 chưa PM verify.
[2026-04-03 16:09] [DOCS] Sửa toàn bộ tiếng Việt có dấu trong PROJECT-TRACKER.md.
[2026-04-03 22:41] [S3-10] Chốt review + cleanup BONUS 1-5: dashboard, pipeline, global search, bulk actions, dark mode. Các issue cleanup và production-only type errors đã được fix trước deploy.
[2026-04-03 22:41] [S3-8] Link repo với Vercel project `headhunt-manager-deploy`, cấu hình Neon direct URL + pooled URL, update secrets production, canonical `NEXTAUTH_URL`, và deploy live lên `https://headhunt-manager-deploy.vercel.app`.
[2026-04-03 22:41] [S3-8] Thêm `postinstall: prisma generate` để build sạch trên Vercel luôn generate Prisma Client đúng với schema hiện tại.
[2026-04-03 22:41] [S3-9] Blocked: chưa có file Excel/CSV dữ liệu nghiệp vụ thật trong repo hoặc từ PM/client. Chỉ tìm thấy file test/tooling như `.tmp/verification-artifacts/verify-candidates.csv` và data CSV của tooling.
[2026-04-03 22:41] [VERIFY] `npm run build` pass local, `npx prisma validate` pass, production deploy READY trên Vercel, và fetch `/` + `/login` trả HTTP 200.
[2026-04-03 22:59] [S5-1] Thêm migration `20260403224500_add_candidate_search_trgm`: bật `pg_trgm` và tạo 3 GIN trigram indexes cho `Candidate.fullName`, `Candidate.email`, `Candidate.phone` để tăng tốc search hiện tại.
[2026-04-03 22:59] [VERIFY] `npx prisma migrate deploy` apply thành công migration S5-1 và `npm run build` pass.
[2026-04-03 23:08] [S5-10] Mở rộng `getClientById()` để include danh sách `jobOrders` với title/status/priority/deadline/fee và candidate count.
[2026-04-03 23:08] [S5-10] Thêm section Job Orders trên trang client detail, có badge trạng thái/ưu tiên, deadline, phí và link sang `/jobs/{id}`.
[2026-04-03 23:08] [VERIFY] `npm run build` pass sau S5-10.
[2026-04-03 23:11] [S5-6] Thêm confirm guard khi đổi trạng thái ứng viên sang `BLACKLIST` trong `candidate-header-actions.tsx`, tránh thao tác nhầm trên candidate detail.
[2026-04-03 23:11] [VERIFY] `npm run build` pass sau S5-6.
[2026-04-03 23:17] [S5-5] Cập nhật `CvViewer` để nhận diện `.doc/.docx` theo file name/url và render qua Google Docs Viewer thay vì iframe PDF thường.
[2026-04-03 23:17] [S5-5] Trang candidate detail giờ truyền thêm `previewCvFileName` vào viewer để fallback Word hoạt động cả với CV primary lẫn CV legacy.
[2026-04-03 23:17] [VERIFY] `npm run build` pass sau S5-5.
[2026-04-03 23:24] [S5-7] Thêm data layer `getDeletedCandidates()` và `restoreCandidate()`, cùng server action `restoreCandidateAction()` để khôi phục soft-deleted candidates.
[2026-04-03 23:24] [S5-7] Tạo trang `/candidates/trash` có search, pagination, restore button và thêm link điều hướng từ trang danh sách ứng viên.
[2026-04-03 23:24] [VERIFY] `npm run build` pass sau S5-7.
[2026-04-03 23:34] [S5-8] Rebuild `importCandidatesAction()` theo batch import co validation day du, dedup email/SDT trong file va tra ve error report chi tiet theo tung dong.
[2026-04-03 23:34] [S5-8] Ket qua import gio co `successCount`, `errorCount`, danh sach `errors` sap xep theo row va thong diep tong hop de recruiter xu ly lai nhanh hon.
[2026-04-03 23:34] [S5-9] Nang cap `SpreadsheetImporter`: preview 10 dong, toggle xem toan bo file, validate toan bo cac dong truoc khi import va hien thi ly do loi ngay trong bang preview.
[2026-04-03 23:34] [S5-9] Sua parser `.xlsx` de doc du lieu an toan hon va giu row number nhat quan cho error report giua client va server.
[2026-04-03 23:34] [VERIFY] `npm run build` pass sau S5-8 va S5-9.
[2026-04-03 23:47] [S5-14] Them helper `expireSubscriptionsIfNeeded()` de tu dong chuyen subscription qua han tu `ACTIVE` sang `EXPIRED` theo chu ky ngan.
[2026-04-03 23:47] [S5-14] Moc helper vao employer auth, dashboard, revenue, public company/job queries va admin moderation/packages de trang thai subscription khong con bi troi sai theo thoi gian.
[2026-04-03 23:47] [VERIFY] `npm run build` pass sau S5-14.
[2026-04-04 00:03] [S5-12] Refactor `getAllClients()` thanh query phan trang co search + includeIds, tranh load toan bo client list vao job form khi data lon.
[2026-04-04 00:03] [S5-12] Them API `/api/clients/options` va `ClientSelect` searchable picker de tao/sua job van chon client duoc theo ten cong ty, co nut xem them ket qua.
[2026-04-04 00:03] [VERIFY] `npm run build` pass sau S5-12.
[2026-04-04 00:09] [S5-11] Them helper `job-posting-view-counter.ts` de dem view theo buffer trong memory va flush theo lo, thay cho 1 DB write moi request xem job.
[2026-04-04 00:09] [S5-11] `getPublicJobBySlug()` da chuyen sang goi `incrementJobPostingView()` va bo pattern `catch(() => {})` nuot loi hoan toan.
[2026-04-04 00:09] [VERIFY] `npm run build` pass sau S5-11.
[2026-04-04 02:13] [S5-2] Ship partial core ownership scope cho Candidate, Client, Job: data layer them `ViewerScope`, filter theo `createdById` va `assignedToId`, scope list/detail/edit/create/update/delete actions chinh, va API client options.
[2026-04-04 02:13] [S5-2] Bulk assign/tag candidate va job search modal da duoc scope theo ownership; member co the thao tac tren du lieu minh so huu, admin van thay toan bo.
[2026-04-04 02:13] [VERIFY] `npm run build` pass sau S5-2 partial.
[2026-04-04 08:37] [S5-13] Tach direct Prisma queries khoi `import-actions.ts`, `moderation-actions.ts`, `employer-actions.ts` sang data layer moi: `imports.ts`, `moderation.ts`, `employers.ts`.
[2026-04-04 08:37] [S5-13] Chuan hoa lai employer portal actions de goi qua wrapper data layer, giu hanh vi cu va build xanh sau khi siet type `JobPostingStatus`.
[2026-04-04 08:37] [VERIFY] `npm run build` pass sau S5-13.
[2026-04-04 08:49] [S5-4] Them bridge data cho Job Order, tao `JobBridgeCard` tren trang chi tiet job va action `publishJobToFdiWorkAction()` de dang Job Order len FDIWork theo flow moderation.
[2026-04-04 08:49] [S5-4] Dong bo noi dung/trang thai tu CRM sang `JobPosting` da link khi sua job hoac dong job; them auto-link exact-match `Client <-> Employer` theo ten cong ty de giam thao tac tay trong bridge.
[2026-04-04 08:49] [VERIFY] `npm run build` pass sau S5-4.
[2026-04-04 09:01] [S5-3] Bat dau Zod validation voi shared schemas trong `src/lib/validation/forms.ts`; da cover login CRM, public apply, create/update client va create/update job order.
[2026-04-04 09:01] [S5-3] Them dependency `zod` vao `package.json`, refactor `client-actions.ts` va `public-apply-actions.ts` theo schema-first, dong thoi chen validation gate vao `job-actions.ts` va `actions.ts` cho login.
[2026-04-04 09:01] [VERIFY] `npm run build` pass sau S5-3 partial.
[2026-04-04 10:48] [S5-2] Hoan tat ownership va visibility scope cho dashboard, revenue, reminders, global search va candidate detail actions; member gio chi thay du lieu trong scope candidate/client/job cua minh.
[2026-04-04 10:48] [S5-2] Client detail va dashboard da khong con keo toan bo doanh thu, activity, reminder, pipeline hay job relations ngoai scope; Global Search mo cho MEMBER nhung tu dong loc theo ownership.
[2026-04-04 10:48] [VERIFY] `npm run build` pass sau S5-2 completion.
[2026-04-04 12:26] [S5-3] Hoan tat schema-first validation cho candidate create/update/reminder, candidate detail subforms, employer portal forms va moderation admin actions bang shared Zod schemas trong `src/lib/validation/forms.ts`.
[2026-04-04 12:26] [S5-3] Refactor `actions.ts`, `candidate-detail-actions.ts`, `employer-actions.ts`, `moderation-actions.ts` sang pattern parse FormData -> safeParse -> mutate; bo validation tay con sot trong scope Sprint 5.
[2026-04-04 12:26] [VERIFY] `npm run build` pass sau S5-3 completion.
[2026-04-04 12:28] [VERIFY] `npx prisma validate` pass; schema hop le, con warning preview feature `driverAdapters` da deprecated.
[2026-04-04 12:40] [S3-9] Da xac nhan repo co template test tai `docs/templates`: `import-candidates-template.csv`, `import-clients-template.csv`, va `IMPORT-GUIDE.md`.
[2026-04-04 12:40] [S3-9] Candidate template co the dung de verify ky thuat import vi parser da map header tieng Viet/Anh; tuy nhien task van chua done vi chua co du lieu that tu PM/client. Template client hien moi la tai lieu mau, app chua co flow import client trong `/import`.
[2026-04-04 15:48] [IMPORT-CLIENT] Them business logic `importClientsAction()` + `importClientsForUser()`, mo rong data layer `imports.ts` de dedup theo `companyName` / `website` va auto-link Employer exact-match sau import.
[2026-04-04 15:48] [IMPORT-CLIENT] Rebuild trang `/import` thanh 2 khu vuc import song song cho candidate va client, them `ClientSpreadsheetImporter`, shared spreadsheet parsing utils, va cap nhat `docs/templates/IMPORT-GUIDE.md`.
[2026-04-04 15:48] [VERIFY] `npm run build` pass sau khi ship flow import client.
[2026-04-04 15:53] [S3-9] Sua root cause parser CSV/XLSX: `normalizeHeader()` gio normalize ca ky tu `Đ/đ`, nen map dung cac cot `So Dien Thoai` va `Dia Chi` trong template tieng Viet.
[2026-04-04 15:53] [S3-9] Chay `npx tsx scripts/verify-import-templates.ts` tren DB dev/staging: import duoc 5/5 client mau, import duoc 5/5 candidate mau sau khi repair dong dau bi miss do bug parser cu.
[2026-04-04 15:53] [S3-9] Them script `scripts/verify-import-templates.ts` de team co the rerun verify template bat cu luc nao; script dung chinh import service cua app va user admin dau tien lam `createdById`.
[2026-04-04 15:53] [VERIFY] `npm run build` pass sau parser fix va sau khi verify import template.
[2026-04-04 16:47] [S3-9] PM chap nhan dung template mau trong `docs/templates` de chot Sprint 3. Tracker cap nhat `S3-9` thanh done va Sprint 3 thanh `10/10`.
```

---

## VẤN ĐỀ / BLOCKERS

> Ghi vấn đề cần PM quyết định.

| Ngày       | Vấn đề                                                    | Mức độ     | Cần PM quyết định                           |
| ---------- | --------------------------------------------------------- | ---------- | ------------------------------------------- |
| 2026-04-03 | GIN indexes bị drop rồi restore qua 2 migrations          | Thấp       | Chấp nhận, không cần fix                    |
| 2026-04-03 | S3-9 da duoc dong bang verify E2E voi template mau; neu can du lieu nghiep vu that thi xu ly o Sprint 4 khi onboard user that | Thap | Khong can quyet dinh them cho Sprint 3 |
| 2026-04-03 | Notification system vẫn chưa có (C4 audit)                | Cao        | Để Sprint 5 hoặc 6 tùy business need        |
| 2026-04-03 | SSL warning: connection string đang dùng `sslmode=require` | Thấp       | Có thể đổi sang `sslmode=verify-full` khi chốt connection strings |

---

## TÀI LIỆU THAM CHIẾU

| File                                                                          | Nội dung                                      |
| ----------------------------------------------------------------------------- | --------------------------------------------- |
| [README.md](./audit/README.md)                                                   | Hướng dẫn đọc audit + rules + patterns        |
| [PROMPT-AUTO-IMPLEMENT.md](./audit/PROMPT-AUTO-IMPLEMENT.md)                     | Prompt auto-implement Sprint 1                |
| [PROMPT-SPRINT3.md](./audit/PROMPT-SPRINT3.md)                                   | Prompt chỉ đạo Sprint 3                       |
| [01-architecture-audit.md](./audit/01-architecture-audit.md)                     | Kiến trúc + 13 vấn đề P0/P1/P2               |
| [02-recruiter-journey-core.md](./audit/02-recruiter-journey-core.md)             | Flow core recruiter                           |
| [03-recruiter-journey-supporting.md](./audit/03-recruiter-journey-supporting.md) | Flow phụ: detail, import, moderation, client  |
| [04-product-strategy.md](./audit/04-product-strategy.md)                         | Business model hybrid + roadmap               |
| [05-backend-code-audit.md](./audit/05-backend-code-audit.md)                     | Backend performance + security                |
| [06-refactor-3day-plan.md](./audit/06-refactor-3day-plan.md)                     | Code snippets refactor 3 ngày                 |
| [PROJECT_REVIEW_20260403.md](./PROJECT_REVIEW_20260403.md)                        | Báo cáo review 2026-04-03                     |
| [ARCHITECTURE.md](../ARCHITECTURE.md)                                            | Kiến trúc hệ thống                            |
| [CODEBASE.md](../CODEBASE.md)                                                    | Bản đồ codebase                               |
