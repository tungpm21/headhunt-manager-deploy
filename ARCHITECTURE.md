# ARCHITECTURE.md - Headhunt Manager System Overview

> Mục đích: giúp AI agent hiểu kiến trúc hệ thống trong một lần đọc.
> Cập nhật: 2026-04-01

---

## System Architecture

```text
Next.js 16 App Router
|- (auth)       -> Login
|- (dashboard)  -> CRM nội bộ
|- (employer)   -> Employer portal
|- (public)     -> FDIWork public site
`- api/         -> REST endpoints

Server Actions
|- actions.ts
|- candidate-detail-actions.ts
|- client-actions.ts
|- employer-actions.ts
|- job-actions.ts
|- moderation-actions.ts
`- public-actions.ts

Data Layer
|- candidates.ts
|- candidate-cv.ts
|- candidate-language.ts
|- clients.ts
|- jobs.ts
|- tags.ts
`- work-experience.ts

Persistence
|- Prisma ORM 7.6
`- PostgreSQL (Supabase / Docker)
```

---

## Authentication

### CRM Dashboard - NextAuth v5

```text
User -> /login -> NextAuth Credentials -> JWT -> Session
Middleware: src/auth.config.ts
Protected: /dashboard/**
```

### Employer Portal - Custom JWT

```text
Employer -> /employer/login -> bcrypt verify -> jose JWT -> Cookie
Middleware: src/proxy.ts -> requireEmployerSession()
Protected: /employer/(portal)/**
Utility: src/lib/employer-auth.ts
```

### Public - No Auth

```text
FDIWork pages: /, /viec-lam, /cong-ty, /ung-tuyen
Read-only data from public-actions.ts
```

---

## Database Schema

### Core CRM Models

```text
User
|- Candidate
|  |- CandidateNote[]
|  |- CandidateCV[]
|  |- CandidateLanguage[]
|  |- WorkExperience[]
|  |- CandidateTag[]
|  `- JobCandidate[]
|- Client
|  |- ClientContact[]
|  `- JobOrder[]
|- JobOrder
|  `- JobCandidate[]
`- Tag
```

### FDIWork Models

```text
Employer
|- Subscription
|- JobPosting[]
|  `- Application[]
`- linkedClient? -> Client
```

### Key Enums

| Enum | Values | Used By |
|------|--------|---------|
| `CandidateStatus` | `AVAILABLE`, `EMPLOYED`, `INTERVIEWING`, `BLACKLIST` | Candidate |
| `CandidateSeniority` | `INTERN`, `JUNIOR`, `MID_LEVEL`, `SENIOR`, `LEAD`, `MANAGER`, `DIRECTOR` | Candidate |
| `ClientStatus` | `ACTIVE`, `INACTIVE`, `BLACKLISTED` | Client |
| `JobStatus` | `OPEN`, `PAUSED`, `FILLED`, `CANCELLED` | JobOrder |
| `JobPriority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT` | JobOrder |
| `JobCandidateStage` | `SOURCED`, `CONTACTED`, `INTERVIEW`, `OFFER`, `PLACED`, `REJECTED` | JobCandidate |
| `SubmissionResult` | `PENDING`, `HIRED`, `REJECTED`, `WITHDRAWN` | JobCandidate |
| `JobPostingStatus` | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CLOSED` | JobPosting |
| `EmployerStatus` | `PENDING`, `ACTIVE`, `SUSPENDED` | Employer |
| `ApplicationStatus` | `NEW`, `REVIEWED`, `SHORTLISTED`, `REJECTED`, `IMPORTED` | Application |

---

## Data Flow Patterns

### Server Action Pattern

```ts
export async function createXAction(formData: FormData)
  : Promise<{ error?: string; success?: boolean; id?: number }>
```

Flow chuẩn:
1. Lấy user id từ session
2. Parse `FormData` -> typed input
3. Validate dữ liệu
4. Gọi data layer
5. `revalidatePath()`
6. Trả `{ success }` hoặc `{ error }`

### Candidate Detail Extensions

```text
CandidateCV         -> nhiều phiên bản CV / primary CV
CandidateLanguage   -> filter ngoại ngữ cho FDI jobs
WorkExperience      -> timeline career path có cấu trúc
```

### CRM <-> FDIWork Integration

```text
Application (FDIWork) -> importApplicationToCRM() -> Candidate (CRM)
Employer (FDIWork) <- linkEmployerToClient() -> Client (CRM)
```

---

## Route Group Rules

| Group | Auth | Layout | Use Case |
|-------|------|--------|----------|
| `(auth)` | None | Minimal | Login page |
| `(dashboard)` | NextAuth | Sidebar + Header | CRM internal |
| `(employer)` | Custom JWT | EmployerSidebar + Header | Employer portal |
| `(public)` | None | PublicHeader + Footer | FDIWork public site |

---

## Key Conventions

1. Public routes dùng slug tiếng Việt: `/viec-lam`, `/cong-ty`, `/ung-tuyen`.
2. Dùng PostgreSQL `String[]` cho danh sách đơn giản như skills.
3. Dùng relation tables cho dữ liệu candidate detail mở rộng: CV, ngoại ngữ, work history.
4. Client dùng soft delete (`isDeleted = true`), không hard delete.
5. Server actions luôn trả `{ error?, success? }`, không throw ra client.
6. File storage đi qua `src/lib/storage.ts`.
7. Sau mutation phải `revalidatePath()`.
8. Form client ưu tiên `useActionState()` + progressive enhancement.

---

## Doc References

| Doc | Path | Purpose |
|-----|------|---------|
| `CODEBASE.md` | `./CODEBASE.md` | File -> function map |
| `docs/crm/DESIGN.md` | `docs/crm/DESIGN.md` | CRM design gốc |
| `docs/fdiwork/DESIGN_FDIWORK.md` | `docs/fdiwork/DESIGN_FDIWORK.md` | FDIWork design |
| `docs/fdiwork/SPECS.md` | `docs/fdiwork/SPECS.md` | Technical specs |
| `prisma/schema.prisma` | `prisma/schema.prisma` | Prisma schema |
| `.brain/handover.md` | `.brain/handover.md` | Current state / next step |
