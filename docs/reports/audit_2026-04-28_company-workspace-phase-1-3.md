# Audit Report - Company Workspace Phase 1-3

Date: 2026-04-28  
Scope: Phase 1-3 implementation from `walkthrough.md.resolved`  
Auditor: Codex with `ag-audit`

## Summary

- Critical issues: 4
- Warnings: 4
- Checks passed: `npx prisma validate`, `npx tsc --noEmit`, `npm run build`
- Checks not clean: `npm run lint` timed out after 120s and reported existing lint errors plus new unused imports in `/companies`
- GitNexus `detect_changes`: critical risk because the worktree touches many existing employer/job-builder flows outside the new Phase 1-3 files.

## Critical Issues

### 1. Admin company pages are visible to all authenticated CRM members

Files:

- `src/app/(dashboard)/companies/page.tsx:33`
- `src/app/(dashboard)/companies/[id]/page.tsx:44`
- `src/lib/workspace.ts:119`

Problem:

The admin Companies pages call `requireViewerScope()` instead of `requireAdmin()`, and `listWorkspaces()` has no scope filtering. Any authenticated MEMBER can open `/companies` and `/companies/[id]` and see all company workspaces, linked Employer/Client identities, portal state, and aggregate counts.

Impact:

This can expose CRM client/employer relationships and partner portal setup data beyond admin users.

Fix:

Use `requireAdmin()` for these Phase 2 admin routes, or implement explicit workspace-scoped access if non-admin access is intended.

### 2. Schema changed but no migration file exists

Files:

- `prisma/schema.prisma:669`
- missing `prisma/migrations/*company*workspace*`

Problem:

The schema adds `CompanyWorkspace`, `CompanyPortalUser`, and `SubmissionFeedback`, but the repo does not include a migration directory for these tables. The walkthrough instructs humans to run `npx prisma migrate dev --name add-company-workspace`, which is not safe as a committed implementation artifact.

Impact:

Deployment or another environment can build successfully but fail at runtime because the database tables do not exist.

Fix:

Create and commit a real Prisma migration for Phase 1. Verify with migration status on a clean DB before continuing Phase 4.

### 3. New mapping actions do not keep legacy `Employer.clientId` in sync

Files:

- `src/lib/workspace-actions.ts:32`
- `src/lib/workspace-actions.ts:70`

Problem:

`linkWorkspaceToClient()` updates only `CompanyWorkspace.clientId`; `linkWorkspaceToEmployer()` updates only `CompanyWorkspace.employerId`. During the transition, old admin pages, revenue summary, and existing Employer/Client logic still depend on `Employer.clientId`.

Impact:

Admin may see one mapping in `/companies` and a different mapping in old `/employers` or `/clients` flows. Revenue and subscription linkage can become inconsistent.

Fix:

When a workspace has both facets, synchronize `Employer.clientId` in the same transaction. Define the transition rule clearly: workspace mapping is source of truth, but legacy field must mirror it until old flows are retired.

### 4. Portal navigation links to routes that do not exist yet

Files:

- `src/components/company/CompanyPortalSidebar.tsx:37`
- `src/app/(company)/company/(portal)/dashboard/page.tsx:60`

Problem:

The sidebar and dashboard expose `/company/job-postings`, `/company/applications`, `/company/job-orders`, `/company/submissions`, `/company/profile`, `/company/users`, and `/company/billing`, but Phase 3 only created `/company/dashboard` and `/company/login`.

Impact:

The portal appears complete but most navigation leads to 404. This is especially confusing because the screenshot/walkthrough says Phase 3 is complete.

Fix:

Either add protected stub pages for all visible nav links, or hide future tabs/cards until each route exists.

## Warnings

### 1. Portal session capabilities are stored in JWT and can become stale

Files:

- `src/lib/company-portal-auth.ts:36`
- `src/lib/company-portal-auth.ts:61`

Problem:

Capabilities are calculated at login and embedded in the token. `requireCompanyPortalSession()` checks active state but returns the old token payload without recomputing capabilities.

Impact:

After admin links/unlinks Employer or Client, existing sessions can show wrong navigation or miss newly enabled tabs until logout/login.

Fix:

Recompute capabilities in `requireCompanyPortalSession()` or store only user/workspace IDs in JWT and derive capabilities from DB per request.

### 2. Company portal login is ambiguous for duplicate emails

Files:

- `prisma/schema.prisma:706`
- `src/lib/company-portal-actions.ts:24`

Problem:

Schema allows the same email in multiple workspaces with `@@unique([workspaceId, email])`, but login does `findFirst({ email })` with no workspace selector.

Impact:

If the same contact belongs to multiple company workspaces, login can select an arbitrary account.

Fix:

Make email globally unique for portal users, or add workspace/company selection to login.

### 3. Duplicate `requireCompanyPortalSession()` helper exists as a stub

Files:

- `src/lib/workspace.ts:56`
- `src/lib/company-portal-auth.ts:61`

Problem:

`workspace.ts` still exports a stub `requireCompanyPortalSession()` returning null, while the real implementation lives in `company-portal-auth.ts`.

Impact:

Future phases can import the wrong helper and accidentally treat every portal request as unauthenticated.

Fix:

Remove the stub or re-export the real helper from one canonical module.

### 4. New `/companies` page has unused imports and lint is not clean

Files:

- `src/app/(dashboard)/companies/page.tsx:7`

Problem:

`npm run lint` reported unused imports in the new companies page. The command also shows pre-existing lint errors elsewhere.

Impact:

Lint is not a reliable green gate for this branch until existing and new errors are separated.

Fix:

Clean the new unused imports and record pre-existing lint debt separately.

## Verification Run

```text
npx prisma validate
Result: passed

npx tsc --noEmit
Result: passed

npm run build
Result: passed

npm run lint
Result: timed out after 120s; reported 12 errors and 18 warnings. New Phase 1-3 warning: unused imports in src/app/(dashboard)/companies/page.tsx.

GitNexus detect_changes(scope=all)
Result: critical risk; 58 changed symbols, 78 affected symbols, 19 changed files.
```

## Recommendation

Do not start Phase 4 yet. Fix the four critical issues first, especially admin authorization and committed Prisma migration. Then run a clean migration on a fresh database, backfill, and smoke `/companies`, `/company/login`, and `/company/dashboard`.
