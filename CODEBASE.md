# CODEBASE.md — Headhunt Manager File Map

> **Mục đích:** Bản đồ toàn bộ source code cho AI agent query nhanh.
> **Auto-generated:** Chạy `npx tsx scripts/gen-codebase-map.ts` để cập nhật.
> **Cập nhật lần cuối:** 2026-04-01

---

## Route Pages (37 files)

| File | Size | Path |
|------|------|------|
| `layout.tsx` | 285B | `src/app/(auth)/layout.tsx` |
| `page.tsx` | 803B | `src/app/(auth)/login/page.tsx` |
| `page.tsx` | 1.7KB | `src/app/(dashboard)/candidates/[id]/edit/page.tsx` |
| `page.tsx` | 3.2KB | `src/app/(dashboard)/candidates/[id]/page.tsx` |
| `page.tsx` | 1.2KB | `src/app/(dashboard)/candidates/new/page.tsx` |
| `page.tsx` | 2.8KB | `src/app/(dashboard)/candidates/page.tsx` |
| `page.tsx` | 3.0KB | `src/app/(dashboard)/clients/[id]/page.tsx` |
| `page.tsx` | 1.3KB | `src/app/(dashboard)/clients/new/page.tsx` |
| `page.tsx` | 2.1KB | `src/app/(dashboard)/clients/page.tsx` |
| `page.tsx` | 9.0KB | `src/app/(dashboard)/dashboard/page.tsx` |
| `page.tsx` | 6.6KB | `src/app/(dashboard)/employers/page.tsx` |
| `page.tsx` | 1.8KB | `src/app/(dashboard)/import/page.tsx` |
| `page.tsx` | 3.1KB | `src/app/(dashboard)/jobs/[id]/page.tsx` |
| `page.tsx` | 1.4KB | `src/app/(dashboard)/jobs/new/page.tsx` |
| `page.tsx` | 2.0KB | `src/app/(dashboard)/jobs/page.tsx` |
| `layout.tsx` | 1.4KB | `src/app/(dashboard)/layout.tsx` |
| `page.tsx` | 7.3KB | `src/app/(dashboard)/moderation/applications/page.tsx` |
| `page.tsx` | 6.1KB | `src/app/(dashboard)/moderation/page.tsx` |
| `page.tsx` | 4.2KB | `src/app/(dashboard)/packages/page.tsx` |
| `page.tsx` | 4.8KB | `src/app/(employer)/employer/(auth)/login/page.tsx` |
| `page.tsx` | 8.0KB | `src/app/(employer)/employer/(auth)/register/page.tsx` |
| `page.tsx` | 9.2KB | `src/app/(employer)/employer/(portal)/company/page.tsx` |
| `page.tsx` | 7.0KB | `src/app/(employer)/employer/(portal)/dashboard/page.tsx` |
| `page.tsx` | 8.9KB | `src/app/(employer)/employer/(portal)/job-postings/[id]/page.tsx` |
| `page.tsx` | 10.9KB | `src/app/(employer)/employer/(portal)/job-postings/new/page.tsx` |
| `page.tsx` | 6.6KB | `src/app/(employer)/employer/(portal)/job-postings/page.tsx` |
| `layout.tsx` | 777B | `src/app/(employer)/employer/(portal)/layout.tsx` |
| `page.tsx` | 6.9KB | `src/app/(employer)/employer/(portal)/subscription/page.tsx` |
| `page.tsx` | 6.7KB | `src/app/(public)/cong-ty/[slug]/page.tsx` |
| `page.tsx` | 2.9KB | `src/app/(public)/cong-ty/page.tsx` |
| `layout.tsx` | 874B | `src/app/(public)/layout.tsx` |
| `page.tsx` | 705B | `src/app/(public)/page.tsx` |
| `page.tsx` | 3.1KB | `src/app/(public)/ung-tuyen/page.tsx` |
| `page.tsx` | 2.3KB | `src/app/(public)/ung-tuyen/thanh-cong/page.tsx` |
| `page.tsx` | 11.5KB | `src/app/(public)/viec-lam/[slug]/page.tsx` |
| `page.tsx` | 4.2KB | `src/app/(public)/viec-lam/page.tsx` |
| `layout.tsx` | 1.0KB | `src/app/layout.tsx` |

## Components (46 files)

| File | Size | Path |
|------|------|------|
| `avatar-upload.tsx` | 4.6KB | `src/components/candidates/avatar-upload.tsx` |
| `candidate-detail-tabs.tsx` | 2.4KB | `src/components/candidates/candidate-detail-tabs.tsx` |
| `candidate-filters.tsx` | 11.0KB | `src/components/candidates/candidate-filters.tsx` |
| `candidate-form.tsx` | 16.3KB | `src/components/candidates/candidate-form.tsx` |
| `candidate-header-actions.tsx` | 3.3KB | `src/components/candidates/candidate-header-actions.tsx` |
| `candidate-info.tsx` | 5.5KB | `src/components/candidates/candidate-info.tsx` |
| `candidate-notes.tsx` | 3.1KB | `src/components/candidates/candidate-notes.tsx` |
| `candidate-table.tsx` | 9.0KB | `src/components/candidates/candidate-table.tsx` |
| `candidate-tags.tsx` | 1.7KB | `src/components/candidates/candidate-tags.tsx` |
| `cv-list.tsx` | 8.6KB | `src/components/candidates/cv-list.tsx` |
| `cv-upload.tsx` | 5.2KB | `src/components/candidates/cv-upload.tsx` |
| `cv-viewer.tsx` | 5.5KB | `src/components/candidates/cv-viewer.tsx` |
| `delete-candidate-button.tsx` | 966B | `src/components/candidates/delete-candidate-button.tsx` |
| `edit-candidate-form.tsx` | 11.6KB | `src/components/candidates/edit-candidate-form.tsx` |
| `language-list.tsx` | 10.9KB | `src/components/candidates/language-list.tsx` |
| `status-badge.tsx` | 1.0KB | `src/components/candidates/status-badge.tsx` |
| `tag-selector.tsx` | 6.3KB | `src/components/candidates/tag-selector.tsx` |
| `work-history.tsx` | 13.2KB | `src/components/candidates/work-history.tsx` |
| `client-contacts.tsx` | 5.9KB | `src/components/clients/client-contacts.tsx` |
| `client-filters.tsx` | 3.3KB | `src/components/clients/client-filters.tsx` |
| `client-form.tsx` | 6.7KB | `src/components/clients/client-form.tsx` |
| `client-table.tsx` | 5.7KB | `src/components/clients/client-table.tsx` |
| `delete-client-button.tsx` | 958B | `src/components/clients/delete-client-button.tsx` |
| `EmployerHeader.tsx` | 1.2KB | `src/components/employer/EmployerHeader.tsx` |
| `EmployerSidebar.tsx` | 2.8KB | `src/components/employer/EmployerSidebar.tsx` |
| `spreadsheet-importer.tsx` | 10.6KB | `src/components/import/spreadsheet-importer.tsx` |
| `index.ts` | 173B | `src/components/index.ts` |
| `assign-candidate-modal.tsx` | 5.4KB | `src/components/jobs/assign-candidate-modal.tsx` |
| `job-filters.tsx` | 3.2KB | `src/components/jobs/job-filters.tsx` |
| `job-form.tsx` | 8.7KB | `src/components/jobs/job-form.tsx` |
| `job-pipeline.tsx` | 10.5KB | `src/components/jobs/job-pipeline.tsx` |
| `job-table.tsx` | 5.3KB | `src/components/jobs/job-table.tsx` |
| `login-form.tsx` | 2.1KB | `src/components/login-form.tsx` |
| `ApplyForm.tsx` | 8.4KB | `src/components/public/ApplyForm.tsx` |
| `CompanyCard.tsx` | 3.4KB | `src/components/public/CompanyCard.tsx` |
| `FeaturedJobs.tsx` | 2.1KB | `src/components/public/FeaturedJobs.tsx` |
| `HeroSection.tsx` | 5.7KB | `src/components/public/HeroSection.tsx` |
| `IndustryGrid.tsx` | 2.8KB | `src/components/public/IndustryGrid.tsx` |
| `JobCard.tsx` | 3.3KB | `src/components/public/JobCard.tsx` |
| `JobFilters.tsx` | 4.3KB | `src/components/public/JobFilters.tsx` |
| `Pagination.tsx` | 2.6KB | `src/components/public/Pagination.tsx` |
| `PublicFooter.tsx` | 3.9KB | `src/components/public/PublicFooter.tsx` |
| `PublicHeader.tsx` | 4.4KB | `src/components/public/PublicHeader.tsx` |
| `TopEmployers.tsx` | 3.7KB | `src/components/public/TopEmployers.tsx` |
| `sidebar.tsx` | 4.3KB | `src/components/sidebar.tsx` |
| `pagination.tsx` | 2.9KB | `src/components/ui/pagination.tsx` |

## Server Actions (8 files)

| File | Size | Path |
|------|------|------|
| `candidate-detail-actions.ts` | 9.2KB | `src/lib/candidate-detail-actions.ts` |
| `client-actions.ts` | 4.6KB | `src/lib/client-actions.ts` |
| `employer-actions.ts` | 14.3KB | `src/lib/employer-actions.ts` |
| `import-actions.ts` | 2.0KB | `src/lib/import-actions.ts` |
| `job-actions.ts` | 7.5KB | `src/lib/job-actions.ts` |
| `moderation-actions.ts` | 10.2KB | `src/lib/moderation-actions.ts` |
| `public-actions.ts` | 14.4KB | `src/lib/public-actions.ts` |
| `public-apply-actions.ts` | 3.1KB | `src/lib/public-apply-actions.ts` |

## Data Layer (15 files)

| File | Size | Path |
|------|------|------|
| `actions.ts` | 10.4KB | `src/lib/actions.ts` |
| `authz.ts` | 505B | `src/lib/authz.ts` |
| `candidate-cv.ts` | 2.8KB | `src/lib/candidate-cv.ts` |
| `candidate-language.ts` | 1013B | `src/lib/candidate-language.ts` |
| `candidates.ts` | 6.7KB | `src/lib/candidates.ts` |
| `clients.ts` | 4.2KB | `src/lib/clients.ts` |
| `employer-auth.ts` | 1.9KB | `src/lib/employer-auth.ts` |
| `employer-jwt.ts` | 318B | `src/lib/employer-jwt.ts` |
| `jobs.ts` | 3.3KB | `src/lib/jobs.ts` |
| `prisma.ts` | 577B | `src/lib/prisma.ts` |
| `rate-limit.ts` | 2.2KB | `src/lib/rate-limit.ts` |
| `storage.ts` | 1.7KB | `src/lib/storage.ts` |
| `tags.ts` | 972B | `src/lib/tags.ts` |
| `utils.ts` | 1.9KB | `src/lib/utils.ts` |
| `work-experience.ts` | 1.3KB | `src/lib/work-experience.ts` |

## Types (4 files)

| File | Size | Path |
|------|------|------|
| `candidate.ts` | 3.1KB | `src/types/candidate.ts` |
| `client.ts` | 1005B | `src/types/client.ts` |
| `index.ts` | 2.9KB | `src/types/index.ts` |
| `job.ts` | 1.2KB | `src/types/job.ts` |

## API Routes (4 files)

| File | Size | Path |
|------|------|------|
| `route.ts` | 74B | `src/app/api/auth/[...nextauth]/route.ts` |
| `route.ts` | 2.5KB | `src/app/api/candidates/[id]/cv/route.ts` |
| `route.ts` | 1.5KB | `src/app/api/candidates/avatar/route.ts` |
| `route.ts` | 1.9KB | `src/app/api/public/apply-cv/route.ts` |

## Config (3 files)

| File | Size | Path |
|------|------|------|
| `auth.config.ts` | 1.7KB | `src/auth.config.ts` |
| `auth.ts` | 1.3KB | `src/auth.ts` |
| `proxy.ts` | 1.8KB | `src/proxy.ts` |

## Other (26 files)

| File | Size | Path |
|------|------|------|
| `not-found.tsx` | 877B | `src/app/(dashboard)/candidates/[id]/not-found.tsx` |
| `employer-status-actions.tsx` | 1.7KB | `src/app/(dashboard)/employers/employer-status-actions.tsx` |
| `link-employer-form.tsx` | 2.5KB | `src/app/(dashboard)/employers/link-employer-form.tsx` |
| `import-button.tsx` | 2.6KB | `src/app/(dashboard)/moderation/applications/import-button.tsx` |
| `moderation-actions-ui.tsx` | 2.7KB | `src/app/(dashboard)/moderation/moderation-actions-ui.tsx` |
| `assign-form.tsx` | 5.0KB | `src/app/(dashboard)/packages/assign-form.tsx` |
| `actions.tsx` | 1.5KB | `src/app/(employer)/employer/(portal)/job-postings/[id]/actions.tsx` |
| `favicon.ico` | 25.3KB | `src/app/favicon.ico` |
| `globals.css` | 2.5KB | `src/app/globals.css` |
| `browser.ts` | 1.3KB | `src/generated/prisma/browser.ts` |
| `client.ts` | 2.3KB | `src/generated/prisma/client.ts` |
| `commonInputTypes.ts` | 38.8KB | `src/generated/prisma/commonInputTypes.ts` |
| `enums.ts` | 1.8KB | `src/generated/prisma/enums.ts` |
| `class.ts` | 70.1KB | `src/generated/prisma/internal/class.ts` |
| `prismaNamespace.ts` | 49.3KB | `src/generated/prisma/internal/prismaNamespace.ts` |
| `prismaNamespaceBrowser.ts` | 6.3KB | `src/generated/prisma/internal/prismaNamespaceBrowser.ts` |
| `models.ts` | 672B | `src/generated/prisma/models.ts` |
| `Candidate.ts` | 108.5KB | `src/generated/prisma/models/Candidate.ts` |
| `CandidateNote.ts` | 59.9KB | `src/generated/prisma/models/CandidateNote.ts` |
| `CandidateTag.ts` | 54.6KB | `src/generated/prisma/models/CandidateTag.ts` |
| `Client.ts` | 70.8KB | `src/generated/prisma/models/Client.ts` |
| `ClientContact.ts` | 54.7KB | `src/generated/prisma/models/ClientContact.ts` |
| `JobCandidate.ts` | 63.5KB | `src/generated/prisma/models/JobCandidate.ts` |
| `JobOrder.ts` | 96.1KB | `src/generated/prisma/models/JobOrder.ts` |
| `Tag.ts` | 41.5KB | `src/generated/prisma/models/Tag.ts` |
| `User.ts` | 75.8KB | `src/generated/prisma/models/User.ts` |

---

## 📊 Summary: 143 total source files

- **Route Pages:** 37 files
- **Components:** 46 files
- **Server Actions:** 8 files
- **Data Layer:** 15 files
- **Types:** 4 files
- **API Routes:** 4 files
- **Config:** 3 files
- **Other:** 26 files
