# Audit Implementation Guide - Headhunt Manager

> Muc dich: huong dan AI agent doc audit reports va implement fixes theo dung thu tu uu tien.
> Ngay audit: 2026-04-02/03
> He thong: Headhunt Manager - CRM + ATS + FDIWork Job Board

---

## Thu Tu Doc File

Doc theo thu tu sau de build dung context:

| # | File | Doc de hieu |
|---|------|-------------|
| 1 | [01-architecture-audit.md](./01-architecture-audit.md) | Kien truc tong quan, cac diem gay no va backlog P0/P1/P2 |
| 2 | [02-recruiter-journey-core.md](./02-recruiter-journey-core.md) | Flow recruiter core: tao job, tim ung vien, gan pipeline |
| 3 | [03-recruiter-journey-supporting.md](./03-recruiter-journey-supporting.md) | Flow phu: candidate detail, import, moderation, client |
| 4 | [04-product-strategy.md](./04-product-strategy.md) | Business model hybrid va ly do CRM la core revenue |
| 5 | [05-backend-code-audit.md](./05-backend-code-audit.md) | Backend bottlenecks, security risks, bad patterns, query analysis |
| 6 | [06-refactor-3day-plan.md](./06-refactor-3day-plan.md) | Ke hoach refactor cu the theo tung ngay, co code snippets |

> Neu chi implement fixes, uu tien doc file 5 va 6 truoc.

---

## Priority Matrix

### Tier 1 - Quick Fixes

| ID | Van de | File can sua | Tai lieu tham chieu |
|----|--------|--------------|---------------------|
| B3 | Connection pool khong config | `src/lib/prisma.ts` | 05-backend-code-audit.md |
| S4 | CV delete-before-upload race condition | `src/app/api/candidates/[id]/cv/route.ts` | 05-backend-code-audit.md |
| B4a | Dashboard count candidate thieu `isDeleted` | `src/app/(dashboard)/dashboard/page.tsx` | 05-backend-code-audit.md |
| FIX-4 | Tag update khong co transaction | `src/lib/candidates.ts` | 06-refactor-3day-plan.md Day 1 |

### Tier 2 - Core Fixes

| ID | Van de | File can sua | Tai lieu tham chieu |
|----|--------|--------------|---------------------|
| FIX-1 | Skills normalize + GIN index | Prisma migration + `src/lib/candidates.ts` | 06-refactor-3day-plan.md Day 1 |
| FIX-5 | JobPosting.skills String -> String[] | Prisma migration + FDIWork flow | 06-refactor-3day-plan.md Day 1 |
| FIX-3 | Extract shared utils | Tao `src/lib/utils/` | 06-refactor-3day-plan.md Day 1 |
| JOB-FORM | Job form thieu 4 fields | `src/components/jobs/job-form.tsx` + `src/lib/job-actions.ts` | 06-refactor-3day-plan.md Day 1 |
| B2 | Import N+1 sequential | `src/lib/import-actions.ts` | 06-refactor-3day-plan.md Day 2 |

### Tier 3 - CRM Unblock

| ID | Van de | File can sua/tao | Tai lieu tham chieu |
|----|--------|------------------|---------------------|
| CROSS-REF | Candidate khong hien job pipelines | `src/lib/candidates.ts` + `src/components/candidates/candidate-pipelines.tsx` | 06-refactor-3day-plan.md Day 2 |
| ASSIGN | Assign modal qua basic | `src/components/jobs/assign-candidate-modal.tsx` + `src/lib/jobs.ts` | 06-refactor-3day-plan.md Day 2 |
| BRIDGE | Application -> Pipeline auto-import | `src/lib/moderation-actions.ts` | 06-refactor-3day-plan.md Day 3 |
| AUDIT-LOG | Khong co activity tracking | Prisma model + action hooks | 06-refactor-3day-plan.md Day 3 |
| DASHBOARD | Dashboard chi co so lieu tong | `src/app/(dashboard)/dashboard/page.tsx` | 06-refactor-3day-plan.md Day 3 |

---

## Rules Cho AI Agent

### Rule 1: Doc truoc khi code

Truoc khi sua bat ky file nao:

1. Doc section tuong ung trong audit.
2. Hieu van de goc, khong chi symptom.
3. Doc code snippet fix trong `06-refactor-3day-plan.md` neu co.
4. Sau moi issue, chay `npm run build`.

### Rule 2: Khong sua FDIWork/employer/public scope

Khong sua cac file sau, tru khi fix bridge integration:

- `src/app/(public)/**`
- `src/app/(employer)/**`
- `src/components/public/**`
- `src/components/employer/**`
- `src/lib/employer-actions.ts`
- `src/lib/public-actions.ts`

Ly do: pass nay tap trung vao CRM/ATS core.

### Rule 3: Follow existing patterns

Server Action pattern:

1. Lay user tu auth helper shared.
2. Parse `FormData` thanh typed input.
3. Validate va return message tieng Viet neu invalid.
4. Goi data layer, tranh viet query Prisma truc tiep trong action neu da co abstraction.
5. `revalidatePath()` sau mutation.
6. Return `{ success: true }` hoac `{ error: "..." }`.

Component pattern:

- Dat trong `src/components/{domain}/`
- Mot component mot file
- Icons: Lucide React
- Error messages: tieng Viet

### Rule 4: Database changes

Khi sua schema:

1. Edit `prisma/schema.prisma`
2. Chay `npx prisma migrate dev --name <ten_mo_ta>`
3. Update types neu can
4. Update `CODEBASE.md` bang `npx tsx scripts/gen-codebase-map.ts`
5. Validate lai schema va build

### Rule 5: Khong over-engineer

Ngoai scope pass nay:

- Chuyen sang Elasticsearch/Meilisearch
- Them Redis chi de toi uu som
- Them validation framework toan codebase
- RBAC/team ownership day du
- Email integration
- Kanban drag-drop
- Mobile PWA

---

## Workflow Implement Tung Issue

### Buoc 1: Chon issue

1. Chon issue tu Priority Matrix.
2. Doc audit section lien quan.
3. Doc snippet fix trong `06-refactor-3day-plan.md`.

### Buoc 2: Implement

1. Sua code theo existing patterns.
2. Neu co migration, tao migration va regenerate artifacts can thiet.
3. Neu co UI change, giu dung dashboard/CRM scope.

### Buoc 3: Verify

Sau moi issue hoac checkpoint:

1. `npm run build`
2. `npx prisma validate` neu co sua schema
3. Manual sanity check neu co flow UI/API
4. Cap nhat section Progress Tracking ben duoi

---

## Progress Tracking

Cap nhat den ngay 2026-04-03:

### Tier 1 - Quick Fixes

- [x] B3 - Pool config
- [x] S4 - CV delete order
- [x] B4a - Dashboard isDeleted count
- [x] FIX-4 - Tag transaction

### Tier 2 - Core Fixes

- [x] FIX-1 - Skills normalize + GIN
- [x] FIX-5 - JobPosting.skills migration
- [x] FIX-3 - Shared utils extract
- [x] JOB-FORM - Job form missing fields
- [x] B2 - Import batch

### Tier 3 - CRM Unblock

- [x] CROSS-REF - Candidate <-> Job panel
- [x] ASSIGN - Smart assign modal
- [x] BRIDGE - Auto-import application
- [x] AUDIT-LOG - Activity log model
- [x] DASHBOARD - Pipeline overview + activity

> Cap nhat bo sung 2026-04-03: da ship them dynamic candidate filters, kanban pipeline view, revenue summary, va reminder/follow-up system theo Phase 2 roadmap. Sprint 2 da hoan tat.

---

## File Map - Audit Documents

```text
docs/audit/
|-- README.md
|-- 01-architecture-audit.md
|-- 02-recruiter-journey-core.md
|-- 03-recruiter-journey-supporting.md
|-- 04-product-strategy.md
|-- 05-backend-code-audit.md
|-- 06-refactor-3day-plan.md
`-- PROMPT-AUTO-IMPLEMENT.md
```
