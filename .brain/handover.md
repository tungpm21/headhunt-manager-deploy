━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HANDOVER DOCUMENT — FDIWork + Headhunt Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cập nhật: 2026-04-21

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 MỤC TIÊU SẢN PHẨM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FDIWork là job board niche cho thị trường FDI (Foreign Direct Investment) tại Việt Nam.
Khác biệt so với VietnamWorks/TopCV: có các trường đặc thù FDI mà không board nào có:
  - Khu công nghiệp (KCN-level, không chỉ tỉnh thành)
  - Ngôn ngữ yêu cầu + mức thành thạo (N3, TOPIK 2...)
  - Hỗ trợ visa / giấy phép lao động
  - Ca làm việc (ngày/đêm/xoay ca)

Chiến lược launch: 10 seed listings thủ công TRƯỚC khi outreach employer.
Critical path: Admin phải post được FDI listings → đó là Sprint 2 Task 1.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Framework: Next.js 15 App Router
- UI: React 19, Tailwind CSS v4
- DB: Prisma 7 + PostgreSQL (Neon serverless)
- Deploy: Vercel
- Auth: custom session (iron-session pattern, không dùng NextAuth)
- Storage: Cloudflare R2 (cho file upload)

Design tokens:
  --color-fdi-primary: #0077B6
  --color-fdi-accent-orange: #FF6600
  --color-fdi-dark: #023E8A
  --color-fdi-surface: #F0F9FF
  Font heading: Poppins, font body: Open Sans

QUAN TRỌNG — prisma migrate dev không chạy được (shadow DB lỗi enum migration
"SENT_TO_CLIENT" ở migration 20260406152933_align_submission_stages).
Dùng `npx prisma db push` thay thế cho schema changes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 KIẾN TRÚC THƯ MỤC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/app/
  (public)/          → Job seeker facing (không auth)
    viec-lam/        → Job listing + filters
    viec-lam/[slug]/ → Job detail
    cong-ty/[slug]/  → Company profile
  (employer)/        → Employer portal (auth: employer session)
    employer/(portal)/
      job-postings/  → CRUD tin tuyển dụng
      company/       → Company profile editor
  (dashboard)/       → Admin CRM (auth: admin session)
    moderation/      → Duyệt job postings
    employers/       → Quản lý employer accounts
    jobs/            → CRM JobOrders (≠ JobPostings)

src/lib/
  employer-actions.ts     → Server actions cho employer portal
  admin-job-posting-actions.ts → Server actions cho admin moderation
  employers.ts            → DB functions cho employer data
  public-actions.ts       → Data fetching cho public pages
  validation/forms.ts     → Zod schemas (employerJobPostingSchema có đủ FDI fields)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ĐÃ HOÀN THÀNH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2026-04-21] commit 911eec3 — FDI Credibility Kit Sprint 1:
  ✅ prisma/schema.prisma: 5 FDI fields trong JobPosting model:
       industrialZone String?, requiredLanguages String[], 
       languageProficiency String?, visaSupport String?, shiftType String?
  ✅ DB pushed (prisma db push), Prisma client regenerated
  ✅ src/lib/validation/forms.ts: employerJobPostingSchema có đủ 5 FDI fields
  ✅ src/lib/employer-actions.ts: buildEmployerJobPostingInput parse FDI fields,
       createJobPostingAction + updateJobPostingAction pass FDI fields
  ✅ src/lib/employers.ts: type signatures updated
  ✅ src/app/(employer)/employer/(portal)/job-postings/new/page.tsx:
       Form có section "Yêu cầu đặc thù FDI" với KCN dropdown (16 zones),
       language+proficiency, visa support, shift type
  ✅ src/lib/public-actions.ts: JobFilters type + getPublicJobs filter by FDI fields,
       getCachedFilterOptions trả về industrialZones + languages
  ✅ src/components/public/JobFilters.tsx: sidebar có 4 FDI filter groups
  ✅ src/app/(public)/viec-lam/page.tsx: pass FDI params vào filters

[Trước 2026-04-21] — UI/UX improvements:
  ✅ Search: inline dropdown TopCV-style (bỏ fullscreen overlay)
  ✅ Accent-insensitive location search (removeTones)
  ✅ NavigationProgress component (top loading bar)
  ✅ Skeleton loading.tsx cho 10 dashboard routes
  ✅ Cover image position/zoom editor (employer + admin)
  ✅ QA 15 trang passed, deploy Vercel production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ SPRINT 2 — CẦN LÀM NGAY (chặn seed strategy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Plan đầy đủ: docs/tasks/sprint-2-fdi-completion.md

TASK 1 (CRITICAL — admin cần post được FDI listings để seed):
  ❌ src/lib/admin-job-posting-actions.ts
       buildJobPostingInput: thêm parse 5 FDI fields
       createAdminJobPosting: thêm FDI fields vào prisma.create data
       updateAdminJobPosting: thêm FDI fields vào prisma.update data
       getAdminJobPostingById select: thêm 5 FDI fields
  ❌ src/app/(dashboard)/moderation/new/new-job-posting-form.tsx
       Thêm section FDI (copy pattern từ employer form)
  ❌ src/app/(dashboard)/moderation/[id]/edit/job-posting-edit-form.tsx
       Thêm section FDI với defaultValues từ job object

TASK 2 (job seekers thấy FDI badges):
  ❌ src/lib/public-actions.ts
       JobDetail type: thêm 5 FDI fields
       getPublicJobBySlug select: thêm 5 FDI fields
  ❌ src/app/(public)/viec-lam/[slug]/page.tsx
       Thêm FDI badge row (KCN, language, visa, shift type badges)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 BACKLOG (sau Sprint 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  - Seed 10 FDI listings thủ công qua admin portal
  - Employer edit page (/employer/job-postings/[id]) chưa có FDI section
  - Job card trong list view chưa có language badge
  - Mobile test search dropdown
  - Thu thập feedback sau seed listings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 PATTERNS QUAN TRỌNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FormData parsing pattern (xem employer-actions.ts):
  - Nullable string: formData.get("field")?.toString().trim() || null
  - Array từ single select: 
      const lang = formData.get("requiredLanguage")?.toString().trim();
      return lang && lang !== "none" ? [lang] : [];

FDI field reference (employer form, đã ship):
  src/app/(employer)/employer/(portal)/job-postings/new/page.tsx
  — Copy INDUSTRIAL_ZONES, LANGUAGES, PROFICIENCY_LEVELS constants từ file này

DB pattern cho requiredLanguages filter (Prisma array contains):
  where.requiredLanguages = { has: filters.language }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 ĐỂ TIẾP TỤC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Codex prompt đầy đủ: docs/tasks/sprint-2-fdi-completion.md
Đọc file đó để biết chính xác từng thay đổi cần làm ở từng file.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
