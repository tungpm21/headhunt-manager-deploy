# ARCHITECTURE.md — Headhunt Manager System Overview

> **Mục đích:** Giúp AI agent hiểu kiến trúc hệ thống trong 1 lần đọc.
> **Cập nhật:** 2026-04-01

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                 │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│  (auth)  │(dashboard)│(employer)│ (public) │    api/     │
│  Login   │  CRM     │ Portal   │ FDIWork  │  REST       │
│  (auth)  │  (auth)  │ (emp-jwt)│ (open)   │  NextAuth   │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│                    Server Actions                        │
│  actions.ts | job-actions.ts | client-actions.ts         │
│  employer-actions.ts | public-actions.ts | moderation-*  │
├─────────────────────────────────────────────────────────┤
│              Data Layer (Prisma Queries)                  │
│  candidates.ts | clients.ts | jobs.ts | tags.ts          │
├─────────────────────────────────────────────────────────┤
│                  Prisma ORM (v7.5)                       │
├─────────────────────────────────────────────────────────┤
│              PostgreSQL (Supabase / Docker)               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication

### CRM Dashboard — NextAuth v5
```
User → /login → NextAuth Credentials → JWT → Session
Middleware: src/auth.config.ts (whitelist public routes)
Protected: /dashboard/**
```

### Employer Portal — Custom JWT (jose)
```
Employer → /employer/login → bcrypt verify → jose JWT → Cookie
Middleware: src/proxy.ts → requireEmployerSession()
Protected: /employer/(portal)/**
Utility: src/lib/employer-auth.ts (sign/verify/set/clear cookies)
```

### Public — No Auth
```
FDIWork pages: /, /viec-lam, /cong-ty, /ung-tuyen
No auth required. Read-only data from public-actions.ts
```

---

## 🗄️ Database Schema (Prisma)

### Core CRM Models
```
User (admin accounts)
  └─ Candidate (ứng viên)
       ├─ CandidateNote[]      (ghi chú)
       ├─ CandidateTag[]       (tags M:N)
       └─ JobCandidate[]       (pipeline entries)
  └─ Client (khách hàng)
       ├─ ClientContact[]      (người liên hệ)
       └─ JobOrder[]           (đơn tuyển dụng)
  └─ JobOrder (đơn tuyển dụng)
       └─ JobCandidate[]       (pipeline: SOURCED→PLACED)
  └─ Tag (nhãn)
```

### FDIWork Models
```
Employer (nhà tuyển dụng)
  ├─ Subscription (gói dịch vụ)
  ├─ JobPosting[] (tin tuyển dụng)
  │    └─ Application[] (đơn ứng tuyển)
  └─ linkedClient? → Client (CRM link)
```

### Key Enums
| Enum | Values | Used By |
|------|--------|---------|
| `CandidateStatus` | NEW, SCREENING, QUALIFIED, TALENT_POOL, BLACKLISTED | Candidate |
| `CandidateSeniority` | INTERN, JUNIOR, MIDDLE, SENIOR, LEAD, MANAGER, DIRECTOR, C_LEVEL | Candidate |
| `ClientStatus` | ACTIVE, INACTIVE, BLACKLISTED | Client |
| `JobStatus` | OPEN, ON_HOLD, CLOSED, FILLED | JobOrder |
| `JobPriority` | LOW, NORMAL, HIGH, URGENT | JobOrder |
| `JobCandidateStage` | SOURCED, SUBMITTED, INTERVIEW, FINAL_INTERVIEW, OFFER, PLACED, REJECTED | JobCandidate |
| `SubmissionResult` | PENDING, PASSED, FAILED, WITHDRAWN | JobCandidate |
| `JobPostingStatus` | DRAFT, PENDING, APPROVED, REJECTED, CLOSED | JobPosting |
| `EmployerStatus` | PENDING, ACTIVE, SUSPENDED | Employer |
| `ApplicationStatus` | NEW, REVIEWED, SHORTLISTED, REJECTED, IMPORTED | Application |

---

## 📁 Data Flow Patterns

### Server Action Pattern (Standard)
```typescript
// All server actions follow this tuple pattern:
export async function createXAction(formData: FormData)
  : Promise<{ error?: string; success?: boolean; id?: number }>

// 1. Get userId from session
// 2. Parse FormData → typed input
// 3. Validate required fields
// 4. Call data layer function (candidates.ts, clients.ts, etc.)
// 5. revalidatePath() for cache invalidation
// 6. Return {success: true} or {error: "message"}
```

### Data Layer Pattern
```typescript
// Data layer files (candidates.ts, clients.ts, jobs.ts)
// Pure Prisma queries — no auth, no formData parsing
export async function createCandidate(input: CreateCandidateInput, userId: number)
export async function getCandidateById(id: number)
export async function searchCandidates(filters: CandidateFilters)
```

### CRM ↔ FDIWork Integration
```
Application (FDIWork) → importApplicationToCRM() → Candidate (CRM)
Employer (FDIWork) ← linkEmployerToClient() → Client (CRM)
```

---

## 🗺️ Route Group Rules

| Group | Auth | Layout | Use Case |
|-------|------|--------|----------|
| `(auth)` | None | Minimal | Login page |
| `(dashboard)` | NextAuth (JWT) | Sidebar + Header | CRM internal |
| `(employer)` | Custom JWT (jose) | EmployerSidebar + Header | Employer portal |
| `(public)` | None | PublicHeader + Footer | FDIWork public site |

---

## 🧭 Key Conventions

1. **Vietnamese slugs** for public URLs: `/viec-lam`, `/cong-ty`, `/ung-tuyen`
2. **Native PostgreSQL `String[]`** for simple lists (skills) — query with `hasSome`
3. **Soft delete** for Client (set `isDeleted = true`, not actual delete)
4. **Server Actions** return `{error?, success?}` tuple — never throw to client
5. **Vercel Blob** for file storage (CV uploads in production)
6. **revalidatePath()** after every mutation for cache invalidation
7. **Form pattern**: `useActionState()` hook + progressive enhancement

---

## 📚 Doc References

| Doc | Path | Purpose |
|-----|------|---------|
| **CODEBASE.md** | `./CODEBASE.md` | File → function map |
| **CRM Design** | `docs/crm/DESIGN.md` | Original CRM design spec |
| **FDIWork Design** | `docs/fdiwork/DESIGN_FDIWORK.md` | FDIWork design spec |
| **FDIWork Specs** | `docs/fdiwork/SPECS.md` | Technical architecture |
| **Schema** | `prisma/schema.prisma` | Database schema |
| **Brain** | `.brain/handover.md` | Current state & next steps |
