# 04. Applications Inbox Plan

## Goal

Build the first real Company Portal workflow for Employer-facet workspaces: `/company/applications`.

This phase intentionally avoids the old all-jobs Kanban default. The main workflow is a fast inbox:

1. Server-filtered application list.
2. Compact filters.
3. One selected application preview panel.
4. Explicit status actions.
5. Pagination with a small page size.

## Scope

Included:

- Replace the `/company/applications` stub.
- Query only applications belonging to the current company workspace employer facet.
- Add filters for job posting, status, keyword, CV availability, and import state.
- Add pagination with default page size 25.
- Add preview panel with candidate/contact/job/CV/cover letter details.
- Add server action to update application status.

Deferred:

- Real CRM candidate import creation.
- Notes/history model for application changes.
- Drag-and-drop Kanban optimization.
- Admin company-detail applications tab.

## Access Rules

- User must pass `requireCompanyPortalSession()`.
- Workspace must have `capabilities.employer === true`.
- Every application query must use `withWorkspaceApplicationAccess(session.workspaceId)`.
- Every status update must verify the application belongs to the same workspace before updating.

## Status Actions

Allowed transitions are implemented as explicit actions:

- `NEW`
- `REVIEWED`
- `SHORTLISTED`
- `REJECTED`
- `IMPORTED`

`IMPORTED` in this phase means "marked imported" only. It does not create a CRM Candidate yet.

## Verification Checklist

- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] Targeted eslint for new/changed Phase 4 files
- [ ] Manual smoke: empty state
- [ ] Manual smoke: filtered list
- [ ] Manual smoke: status action

## Phase Prompt

```text
Implement `/company/applications` as a server-filtered Applications Inbox.
Use `requireCompanyPortalSession()` and `withWorkspaceApplicationAccess()`.
Keep the client component page-sized only; do not load all applications into browser state.
Use explicit status buttons instead of drag-and-drop.
Run typecheck, build, targeted eslint, then update TRACKER.md.
```
