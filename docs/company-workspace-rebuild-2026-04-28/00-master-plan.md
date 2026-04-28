# 00. Master Plan

## Goal

Rebuild the recruitment management experience so admins, FDIWork employers, and CRM partner companies all work from the same understandable company model.

The target product should answer these questions clearly:

- Which company is this?
- Is it a public FDIWork employer, a CRM client, or both?
- Who can log in for this company?
- Which jobs, applications, submissions, feedback, and public profile belong to it?
- What can the company do itself, and what still needs admin approval?

## Current Problems

- Employer portal has only part of the admin profile builder and job builder capabilities.
- Employer pipeline uses public `Application.status`, while CRM recruitment uses `JobCandidate.stage`; users see one "pipeline" label for two different workflows.
- Pipeline job filters are noisy when many job postings share the same title.
- Drag-and-drop is the primary action, causing poor UX and lag when many cards render.
- Employer portal lacks a proper candidate/application management tab with preview.
- Admin CRM splits `Nha tuyen dung` and `Doanh nghiep doi tac`, but linking is hidden behind a small dropdown and is not explained.
- Partner companies in CRM have richer business data but no login/management portal.
- The public company link and CRM client link concepts are mixed together.

## Target Architecture

Use one product-level concept: `Company Workspace`.

`Company Workspace` can have these facets:

- FDIWork employer facet: public profile, public jobs, subscriptions, FDI applications.
- CRM client facet: job orders, submissions, client contacts, headhunt revenue.
- Portal facet: login users, permissions, feedback, partner self-service.

Existing tables stay in place during migration:

- `Employer` remains the public job-board account.
- `Client` remains the CRM customer/business record.
- `CompanyWorkspace` links them and becomes the entry point for admin and portal UX.

## Phase Roadmap

### Phase 0: Planning Baseline

- Create this docs folder.
- Freeze the accepted direction and task loop.
- Identify current dirty worktree changes before implementation.

### Phase 1: Domain Model Foundation

- Add `CompanyWorkspace`, `CompanyPortalUser`, and `SubmissionFeedback`.
- Backfill workspaces from existing `Employer` and `Client` rows.
- Preserve `Employer.clientId` during transition.
- Add server-side helpers for workspace lookup and permission checks.

### Phase 2: Admin Company Workspace

- Add admin `/companies` master list.
- Add company detail page with tabs for overview, mapping, profile, jobs, applications, job orders, submissions, portal users, and billing.
- Replace inline `Link Client` dropdown with Account Mapping wizard.

### Phase 3: Company Portal

- Add `/company/login` and `/company/*` portal routes.
- Authenticate company users with workspace-scoped session.
- Show navigation by capability.
- Keep `/employer/*` routes as redirects or compatibility wrappers during transition.

### Phase 4: Applications Inbox

- Build employer/company applications inbox.
- Add preview drawer for CV, cover letter, applicant details, status, notes, and import state.
- Use filters and pagination instead of rendering every card in a board.

### Phase 5: Client Submissions Portal

- Let partner companies review CRM submissions sent to them.
- Add feedback and decision workflow without exposing internal-only CRM notes.
- Sync partner feedback back to admin CRM.

### Phase 6: Builder Sync

- Share the company profile builder capabilities between Admin CRM and Company Portal.
- Add company-side draft/preview/submit flow.
- Keep admin publish/approval controls.
- Align job posting builder fields and media handling.

### Phase 7: Kanban Optimization and Cleanup

- Keep Kanban as a secondary view for selected job only.
- Optimize DnD state and prevent whole-board pending locks.
- Clean old menu labels and redirects after the new portal is stable.

## Definition of Done

The rebuild is complete when:

- Admin can find any company once and understand all linked Employer/Client/Portal state.
- A CRM partner can log in and review only its own job orders/submissions.
- An FDI employer can manage profile, job posts, and applications from the company portal.
- Candidate/application preview works without downloading files first.
- Pipeline actions work without drag-and-drop.
- Existing public URLs for jobs and company pages continue to work.
- Existing Employer and Client data is preserved after migration.
- Authorization tests prove cross-company data cannot leak.

## Tracking Tasks

- [x] Choose core direction: Company Workspace, one portal, Inbox + Kanban.
- [x] Create phase plan files.
- [x] Create task tracker and reusable prompts.
- [ ] Complete Phase 1 domain model.
- [ ] Complete Phase 2 admin workspace.
- [ ] Complete Phase 3 company portal.
- [ ] Complete Phase 4 applications inbox.
- [ ] Complete Phase 5 submissions portal.
- [ ] Complete Phase 6 builder sync.
- [ ] Complete Phase 7 Kanban cleanup and redirects.

## Master Prompt

Use this when starting a full implementation session:

```text
Read docs/company-workspace-rebuild-2026-04-28/README.md and TRACKER.md.
Pick the next unchecked task from one phase only.
Read that phase plan file.
Analyze current code with GitNexus and file reads.
Before editing any function/class/method, run GitNexus impact analysis and report risk.
Implement the smallest complete slice.
Run the phase checks.
Update TRACKER.md with status, verification, and remaining risks.
Do not expand scope beyond the selected phase without stopping for confirmation.
```
