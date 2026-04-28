# 06. Migration and Security Plan

## Goal

Ship the rebuild without breaking production data, public SEO routes, or tenant boundaries.

This project already has live production deployment, public job pages, company pages, employer auth, admin CRM auth, file uploads, and CRM candidate data. Migration must be conservative.

## Migration Strategy

Use additive migration first:

1. Add new workspace tables.
2. Backfill workspaces.
3. Add helpers and new routes.
4. Link old pages to new pages.
5. Move traffic gradually.
6. Only remove old UX after usage is verified.

Do not remove:

- `Employer`
- `Client`
- `Employer.clientId`
- Existing `/employer/*` routes
- Existing `/clients/*` routes
- Existing `/employers/*` routes

until after the replacement flows are verified.

## Route Compatibility

Keep public routes:

- `/cong-ty/[slug]`
- `/viec-lam/[slug]`

Keep old portal routes initially:

- `/employer/login`
- `/employer/dashboard`
- `/employer/job-postings`
- `/employer/company`
- `/employer/subscription`

After `/company/*` is stable, old employer routes can redirect to equivalent company portal pages.

## Security Rules

- Admin CRM auth remains separate from company portal auth.
- Company portal session must include `workspaceId`.
- Every company portal query must scope by workspace.
- Linked Client access must use workspace clientId, not a raw route param from the browser.
- Linked Employer access must use workspace employerId, not a raw route param from the browser.
- Submission feedback may only be created for `JobCandidate` rows whose `jobOrder.clientId` matches the workspace clientId.
- Application updates may only affect `Application` rows whose `jobPosting.employerId` matches the workspace employerId.
- Internal CRM notes are hidden from company portal unless explicitly marked client-visible.

## Audit Events

Add ActivityLog events for:

- Workspace created.
- Employer linked to Client.
- Employer unlinked from Client.
- Portal enabled.
- Portal disabled.
- Portal user invited/created/deactivated.
- Company profile draft submitted.
- Company profile draft approved/rejected.
- Application status changed by company user.
- Submission feedback submitted by company user.

## Rollout Gates

Gate 1: Domain migration verified locally.

- All existing Employer rows have workspace.
- All existing Client rows have workspace.
- Linked Employer+Client pairs resolve to one workspace.

Gate 2: Admin workspace verified.

- Admin can find and inspect companies.
- Account Mapping wizard works.
- Old pages still work.

Gate 3: Portal auth verified.

- CRM-only partner can login.
- Existing employer can login.
- Suspended workspace cannot login.

Gate 4: Pipeline verified.

- Applications inbox works.
- Submissions inbox works.
- Feedback sync works.
- Cross-company access tests pass.

Gate 5: Builder verified.

- Company profile draft flow works.
- Public profile publish is controlled.
- Job posting moderation still works.

## Tasks

- [ ] Add data migration dry-run notes before applying production migration.
- [ ] Add rollback notes for each additive migration.
- [ ] Add route compatibility redirects only after new routes pass checks.
- [ ] Add cross-tenant tests for applications and submissions.
- [ ] Add audit events for portal and mapping actions.
- [ ] Add production smoke checklist.
- [ ] Verify no public route loses SEO metadata.

## Acceptance Criteria

- Migration is additive and reversible at the route level.
- No old production flow is removed before its replacement is verified.
- All new portal data access is workspace-scoped.
- ActivityLog can explain who changed mapping, portal access, application status, or submission feedback.

## Phase Prompt

```text
Implement migration/security items from docs/company-workspace-rebuild-2026-04-28/06-migration-security-plan.md.
Before touching auth, access-scope, or migration-sensitive helpers, run GitNexus impact analysis.
Prefer additive changes and compatibility wrappers.
Write cross-workspace tests before enabling portal data access.
Run GitNexus detect_changes before any commit.
Update TRACKER.md.
```
