# 01. Domain Model Plan

## Goal

Create a single company-level ownership layer without breaking the existing Employer, Client, JobPosting, Application, JobOrder, and JobCandidate flows.

This phase should make later UI changes straightforward. It should not yet remove old routes or old tables.

## Proposed Data Model

Add these Prisma concepts.

```prisma
model CompanyWorkspace {
  id            Int      @id @default(autoincrement())
  displayName   String
  slug          String   @unique
  status        CompanyWorkspaceStatus @default(ACTIVE)
  portalEnabled Boolean  @default(false)

  employerId    Int?     @unique
  clientId      Int?     @unique

  employer      Employer? @relation(fields: [employerId], references: [id])
  client        Client?   @relation(fields: [clientId], references: [id])
  portalUsers   CompanyPortalUser[]
  feedback      SubmissionFeedback[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model CompanyPortalUser {
  id             Int      @id @default(autoincrement())
  workspaceId    Int
  email          String
  password       String?
  name           String?
  role           CompanyPortalRole @default(MEMBER)
  isActive       Boolean @default(true)
  lastLoginAt    DateTime?

  workspace      CompanyWorkspace @relation(fields: [workspaceId], references: [id])
  feedback       SubmissionFeedback[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([workspaceId, email])
  @@index([email])
}

model SubmissionFeedback {
  id                  Int      @id @default(autoincrement())
  workspaceId          Int
  jobCandidateId       Int
  authorPortalUserId   Int?
  decision             SubmissionFeedbackDecision?
  message              String?
  createdAt            DateTime @default(now())

  workspace            CompanyWorkspace @relation(fields: [workspaceId], references: [id])
  jobCandidate          JobCandidate @relation(fields: [jobCandidateId], references: [id])
  authorPortalUser      CompanyPortalUser? @relation(fields: [authorPortalUserId], references: [id])

  @@index([workspaceId, createdAt])
  @@index([jobCandidateId, createdAt])
}

enum CompanyWorkspaceStatus {
  ACTIVE
  PENDING
  SUSPENDED
}

enum CompanyPortalRole {
  OWNER
  MEMBER
  VIEWER
}

enum SubmissionFeedbackDecision {
  INTERESTED
  NEED_MORE_INFO
  INTERVIEW
  REJECTED
}
```

If existing relation names conflict, use explicit relation names in Prisma instead of changing business names.

## Backfill Rules

- For every `Employer`, create a workspace using employer company name and slug.
- For every `Client` without a linked employer, create a workspace using client company name.
- For every `Employer` with `clientId`, create one workspace linking both.
- If slug conflicts, append `-client-{id}` or `-employer-{id}`.
- `portalEnabled` is `true` only for active existing employers; CRM-only clients start disabled until admin enables portal.
- No existing `Employer.clientId` value is removed in this phase.

## Access Helpers

Add shared server helpers:

- `getCompanyWorkspaceById(id)`
- `getWorkspaceForEmployer(employerId)`
- `getWorkspaceForClient(clientId)`
- `requireCompanyPortalSession()`
- `canAccessWorkspace(userOrSession, workspaceId)`
- `withWorkspaceApplicationAccess(workspaceId)`
- `withWorkspaceSubmissionAccess(workspaceId)`

These helpers must be used by all new portal data access. Do not inline ownership checks in UI components.

## Tasks

- [ ] Inspect current Prisma relation names and choose non-conflicting relation names.
- [ ] Add workspace, portal user, and feedback models.
- [ ] Add migration with indexes and constraints.
- [ ] Write backfill script or migration-safe seed command.
- [ ] Add workspace lookup helpers.
- [ ] Add tests for workspace backfill from Employer-only, Client-only, and linked Employer+Client rows.
- [ ] Add tests for cross-workspace denial.
- [ ] Update docs if the final model differs from this plan.

## Acceptance Criteria

- Migration runs on local database without data loss.
- Every existing Employer and Client can be resolved to a workspace.
- Existing admin employer/client pages still load after migration.
- Existing employer login still works.
- Workspace helpers reject access to unrelated workspace data.

## Phase Prompt

```text
Implement Phase 1 from docs/company-workspace-rebuild-2026-04-28/01-domain-model-plan.md.
Before modifying Prisma-related helpers or server actions, use GitNexus impact analysis.
Keep Employer and Client behavior backward compatible.
Create the migration and helper functions only; do not build UI in this phase.
Run Prisma generate, relevant tests, and a build/type check if feasible.
Update TRACKER.md when done.
```
