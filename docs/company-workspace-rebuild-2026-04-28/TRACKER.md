# Company Workspace Rebuild Tracker

Status legend:

- `[ ]` Not started
- `[~]` In progress or partial
- `[x]` Done and verified
- `[!]` Blocked or needs decision

## Rules

After every implementation slice:

1. Update task status.
2. Add verification commands and result.
3. Add changed files summary.
4. Add remaining risk or blocker.
5. Do not delete history.

## Phase 0: Planning Baseline

| ID | Task | Status | Owner | Notes |
| --- | --- | --- | --- | --- |
| P0-01 | Create plan folder and sub-plan files | [x] | Agent | Done 2026-04-28 |
| P0-02 | Confirm accepted direction: Company Workspace, one portal, Inbox + Kanban | [x] | Product | Confirmed 2026-04-28 |
| P0-03 | Record dirty worktree before implementation | [x] | Agent | Dirty code changes already existed before this plan folder; future implementation must isolate scope |

## Phase 1: Domain Model Foundation

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P1-01 | Inspect Prisma relation names | [x] | No conflicts. Used WorkspaceEmployer, WorkspaceClient, WorkspacePortalUsers, WorkspaceFeedback, FeedbackJobCandidate, FeedbackAuthor |
| P1-02 | Add CompanyWorkspace model | [x] | Additive migration |
| P1-03 | Add CompanyPortalUser model | [x] | Workspace-scoped login |
| P1-04 | Add SubmissionFeedback model | [x] | Client-visible feedback |
| P1-05 | Add backfill migration/script | [x] | scripts/backfill-workspaces.ts |
| P1-06 | Add workspace access helpers | [x] | src/lib/workspace.ts |
| P1-07 | Add domain tests | [ ] | Skipped — no test infra yet; manual verification via prisma generate + tsc |

## Phase 2: Admin CRM Workspace

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P2-01 | Add `/companies` list | [x] | Master workspace list with facet badges |
| P2-02 | Add `/companies/[id]` detail tabs | [x] | 9 tabs: overview, mapping, jobs, applications, orders, submissions, portal users, billing, activity |
| P2-03 | Build Account Mapping wizard | [~] | Mapping tab with read-only cards; write actions exist but wizard UI deferred |
| P2-04 | Add duplicate detection | [ ] | Deferred to when mapping wizard gets interactive UI |
| P2-05 | Add mapping server actions | [x] | link/unlink employer/client, toggle portal — all with ActivityLog |
| P2-06 | Add ActivityLog events | [x] | All mapping actions logged |
| P2-07 | Link old Employer/Client pages to workspace | [ ] | Deferred — existing pages still functional |

## Phase 3: Company Portal

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P3-01 | Add company portal auth helpers | [x] | company-portal-auth.ts with JWT, workspace capabilities |
| P3-02 | Add `/company/login` | [x] | Client component with useActionState |
| P3-03 | Add `/company` layout and nav | [x] | CompanyPortalSidebar with capability-aware tabs |
| P3-04 | Add dashboard | [x] | Stat cards by workspace facets |
| P3-05 | Add `/employer/*` compatibility redirects/wrappers | [ ] | Deferred — existing employer routes still functional |
| P3-06 | Add portal user management | [ ] | Deferred to later iteration |
| P3-07 | Add auth/access tests | [ ] | No test infra; verified via tsc |

## Phase 4: Applications Inbox

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P4-01 | Build applications inbox route | [x] | `/company/applications` now replaces stub |
| P4-02 | Add server-side filters and pagination | [x] | Page size 25; filters for keyword, job, status, CV, import state, date range |
| P4-03 | Add preview drawer | [x] | Right-side preview panel with contact, CV, cover letter, status |
| P4-04 | Add explicit status actions | [x] | Reviewed, shortlist, reject, imported marker |
| P4-05 | Replace noisy job chips | [x] | Compact job select plus keyword search; no repeated chips |
| P4-06 | Add empty/loading/error states | [x] | Empty list state plus route loading/error files |
| P4-07 | Verify 100+ application responsiveness | [x] | Temporary 120-application smoke passed, then cleanup deleted all smoke rows |

## Phase 5: Submissions Portal

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P5-01 | Build submissions inbox route | [x] | `/company/submissions` now replaces stub with server-side filters and pagination |
| P5-02 | Add safe client-facing candidate preview | [x] | Client-facing preview only exposes candidate/contact/CV/job order fields; internal notes remain out of portal payload |
| P5-03 | Add feedback action | [x] | Workspace-scoped decision/message action creates SubmissionFeedback without mutating CRM stage/result |
| P5-04 | Show feedback in admin CRM | [x] | `/companies/[id]?tab=submissions` now shows portal feedback summary, latest feedback, and per-submission feedback |
| P5-05 | Add cross-company tests | [x] | Positive client-workspace smoke passed; negative DB smoke confirmed another Client workspace cannot read the source submission |

## Phase 6: Builder Sync

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P6-01 | Audit admin vs portal builder fields | [x] | Existing uncommitted builder work audited; see 06-builder-sync-audit-2026-04-29.md |
| P6-02 | Define shared builder contract | [~] | `content-blocks.ts` has shared theme/capability/block normalization; formal field-by-field contract still pending |
| P6-03 | Add profile draft flow if needed | [ ] | Draft, submit, approve/reject |
| P6-04 | Update company profile editor | [x] | Existing portal profile editor uses BlockBuilder, theme, logo/cover upload, capabilities |
| P6-05 | Add draft preview | [ ] | No accidental publish |
| P6-06 | Add admin profile draft review | [ ] | Publish control |
| P6-07 | Align job posting builder fields | [~] | Employer create/edit has markdown content, cover image/alt, taxonomy, language, shift, FDI fields; admin parity still needs final comparison |
| P6-08 | Share media validation | [~] | Upload permissions and limits exist, but validation is not fully centralized yet |

## Phase 7: Kanban Optimization and Cleanup

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P7-01 | Make Kanban selected-job only | [ ] | Secondary view |
| P7-02 | Add per-card pending state | [ ] | Avoid whole board lock |
| P7-03 | Add stage dropdown/buttons to selected card | [ ] | DnD fallback |
| P7-04 | Improve mobile fallback | [ ] | DnD not required |
| P7-05 | Remove old inline Link Client UI | [ ] | After Account Mapping stable |
| P7-06 | Redirect legacy employer pages | [ ] | After portal stable |

## Verification Log

Add entries newest first.

```text
Date:
Task:
Commands:
Result:
Changed files:
Remaining risk:
Next task:
```

```text
Date: 2026-04-29
Task: Phase 6 audit of existing builder sync work
Commands: targeted eslint for builder/profile/job files -> pass with 3 no-img-element warnings; npm run build -> pass
Result: Existing worktree already contains profile BlockBuilder integration and expanded job posting form fields. Phase 6 is partial because draft/review/publish moderation flow is still missing.
Changed files: docs/company-workspace-rebuild-2026-04-28/06-builder-sync-audit-2026-04-29.md, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: Employer profile edits currently publish directly. Do not mark Phase 6 complete until CompanyProfileDraft and admin review actions exist.
Next task: Implement profile draft/review flow as Phase 6 hardening slice.
```

```text
Date: 2026-04-29
Task: Phase 5 P5-04 through P5-05
Commands: npx tsc --noEmit -> pass; targeted eslint for src/app/(dashboard)/companies/[id]/page.tsx -> pass; DB negative smoke source workspace #10 vs other client workspace #11 -> pass; npm run build -> pass
Result: Admin CRM company detail submissions tab now shows portal feedback. Cross-client access predicate returned sourceCanRead=true and otherClientCanRead=false.
Changed files: src/app/(dashboard)/companies/[id]/page.tsx, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: Build still emits Postgres SSL mode warning from connection string. Admin feedback is read-only in this phase; follow-up actions can be added later.
Next task: Phase 6 builder sync.
```

```text
Date: 2026-04-29
Task: Phase 5 P5-01 through P5-03; partial P5-05 portal smoke
Commands: npx tsc --noEmit -> pass; targeted eslint for submissions files -> pass; npm run build -> pass; Playwright smoke /company/login -> /company/submissions -> pass; submit temporary feedback -> pass; cleanup -> deleted 1 smoke feedback and 1 temporary portal user, restored workspace portalEnabled=false
Result: /company/submissions now has a workspace-scoped inbox, filters, pagination, safe preview panel, and client feedback form. Temporary client portal user verified access against an existing client workspace with 19 submissions.
Changed files: src/app/(company)/company/(portal)/submissions/*, src/components/company/CompanySubmissionsInbox.tsx, src/lib/company-submission-actions.ts, docs/company-workspace-rebuild-2026-04-28/05-submissions-portal-plan.md
Remaining risk: Admin CRM does not yet display SubmissionFeedback. Explicit cross-workspace negative test still pending. Build still emits Postgres SSL mode warning from connection string.
Next task: Phase 5 P5-04 admin feedback review surface, then P5-05 negative access tests.
```

```text
Date: 2026-04-29
Task: Phase 4 P4-01 through P4-06; DB blocker execution
Commands: npx prisma migrate deploy -> pass; npx tsx scripts/backfill-workspaces.ts -> pass (15 workspaces, then 9 portal owners); npx tsc --noEmit -> pass; targeted eslint for Phase 4 files -> pass; npm run build -> pass; Playwright smoke /company/login -> /company/applications -> pass; temporary 120 applications smoke -> pass; cleanup -> deleted 120, remaining 0
Result: Company workspace migration applied to configured Neon DB. Backfill created 15 workspaces and 9 portal owner users from Employer credentials. /company/applications now has server-side inbox, filters, pagination, preview panel, status actions, loading/error/empty states.
Changed files: src/app/(company)/company/(portal)/applications/*, src/components/company/CompanyApplicationsInbox.tsx, src/lib/company-application-actions.ts, scripts/backfill-workspaces.ts, src/app/(dashboard)/companies/page.tsx, docs/company-workspace-rebuild-2026-04-28/04-applications-inbox-plan.md
Remaining risk: Build still emits Postgres SSL mode warning from connection string.
Next task: Phase 5 submissions portal.
```

```text
Date: 2026-04-28
Task: P1-01 through P1-06
Commands: npx prisma generate → ✅ | npx tsc --noEmit → ✅ (zero errors)
Result: Schema valid, types valid, workspace helpers compile clean
Changed files: prisma/schema.prisma, src/types/index.ts, src/lib/workspace.ts (new), scripts/backfill-workspaces.ts (new)
Remaining risk: Migration not yet run on DB. Backfill not yet executed (requires running DB). P1-07 domain tests deferred.
Next task: Run prisma migrate dev, then run backfill script, then start Phase 2.
```

```text
Date: 2026-04-28
Task: P0-01, P0-03
Commands: git status --short
Result: Plan docs created. Worktree already had unrelated modified code and new employer pipeline files before this planning artifact.
Changed files: docs/company-workspace-rebuild-2026-04-28/*
Remaining risk: Future code sessions must not assume all dirty files belong to the current task.
Next task: P1-01 Inspect Prisma relation names.
```

## Tracker Prompt

```text
Use this tracker as the source of truth.
Before coding, pick one unchecked task and read the matching phase file.
After coding, update the task status, verification log, changed files, and next task.
Never mark a task done without checks or an explicit waiver.
```
