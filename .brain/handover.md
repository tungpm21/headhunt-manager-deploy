━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HANDOVER DOCUMENT — Headhunt Manager
Cập nhật: 2026-04-02 20:36 (ICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Đang làm: Admin Employer & Job Posting Management
🔢 Trạng thái: Lên plan xong, chưa implement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ĐÃ XONG (session 2026-04-02)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Application Detail View (commit 46772a1)
  → Expandable rows trong /moderation/applications
  → 3-cột: thông tin UV, vị trí ứng tuyển, thư giới thiệu + tải CV
  → Component: src/app/(dashboard)/moderation/applications/application-table.tsx

- Dashboard Dark Mode (commit 46772a1)
  → Replaced tất cả bg-white + text-gray-* → design tokens (bg-surface, text-foreground, text-muted)
  → ThemeToggle component: src/components/theme-toggle.tsx
  → Wired vào dashboard layout header

- Fix seed data mojibake (commits 80542a0, dd5b0eb)
  → Sửa triple-encoding UTF-8 → Windows-1252 → UTF-8 trong prisma/seed.ts
  → 3-pass fix script (control chars + Windows-1252 smart quotes)
  → DB re-seeded: 22 job postings + 2 applications clean

- Plan admin employer management (docs/PLAN-admin-employer-mgmt.md)
  → Phase 1: FDIWork links (1-2h)
  → Phase 2: Employer detail page /employers/[id] (3-4h)
  → Phase 3: Company page editor /employers/[id]/edit (2-3h)
  → Phase 4: UX polish (1h)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ VIỆC TIẾP THEO (theo thứ tự ưu tiên)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [HIGH] Phase 1 — Quick Links
   - application-table.tsx: job title → link /viec-lam/[slug]
   - moderation/page.tsx: thêm nút "Xem trên FDIWork"
   - employers/page.tsx: thêm link 🌐 → /cong-ty/[slug]
   - Cần: thêm `slug` vào getApplicationsForImport + getPendingJobPostings

2. [MEDIUM] Phase 2 — Employer Detail Page
   - NEW: src/app/(dashboard)/employers/[id]/page.tsx (server component)
   - NEW: src/app/(dashboard)/employers/[id]/employer-detail-tabs.tsx (client, 3 tabs)
   - NEW: getEmployerById action trong moderation-actions.ts
   - employers/page.tsx: tên → link /employers/[id]

3. [MEDIUM] Phase 3 — Company Page Editor
   - NEW: src/app/(dashboard)/employers/[id]/edit/page.tsx
   - NEW: employer-edit-form.tsx + updateEmployerInfo() action
   - Preview link → /cong-ty/[slug]

4. [LOW] Phase 4 — UX polish
   - Di chuyển Link Client từ employers list → detail page tab "Thông tin"
   - Tooltip giải thích mục đích Link Client

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 QUYẾT ĐỊNH QUAN TRỌNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "Link Client": Employer ↔ CRM Client. Samsung trên FDIWork → Samsung trong CRM.
  Cho phép track headhunt contract cho cùng 1 công ty.
- Không cần schema changes cho employer mgmt plan — tất cả fields đã có sẵn
- Client components nhận data qua JSON.parse(JSON.stringify(...)) để serialize Date objects
- Dashboard dùng CSS design tokens thay hardcoded color classes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ LƯU Ý CHO SESSION SAU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Seed data đã clean (không còn mojibake). Nếu thêm seed data mới: kiểm tra encoding
- Job posting slug format: ví dụ "giam-doc-nha-may-plant-manager-lg"
- Public company page: /cong-ty/[slug] đã có — getCompanyBySlug trong public-actions.ts
- Employer model có đủ fields: slug, description, logo, website, phone, industry, companySize, address

📁 FILES QUAN TRỌNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- docs/PLAN-admin-employer-mgmt.md → full plan 4 phases
- src/app/(dashboard)/moderation/applications/application-table.tsx → expandable rows (mới)
- src/components/theme-toggle.tsx → dark mode toggle (mới)
- src/lib/moderation-actions.ts → data layer (employer, jobs, applications)
- src/app/(dashboard)/employers/page.tsx → employers list (cần update links)
- prisma/seed.ts → data demo (fixed encoding)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Đã lưu! Để tiếp tục: Gõ /recap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
