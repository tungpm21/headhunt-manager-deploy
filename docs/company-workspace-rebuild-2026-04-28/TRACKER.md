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
| P2-03 | Build Account Mapping wizard | [x] | `/companies/[id]?tab=mapping` now links/unlinks Employer and Client, and toggles portal |
| P2-04 | Add duplicate detection | [x] | Mapping selects disable entities already assigned to another workspace and show the workspace name |
| P2-05 | Add mapping server actions | [x] | link/unlink employer/client, toggle portal — all with ActivityLog |
| P2-06 | Add ActivityLog events | [x] | All mapping actions logged |
| P2-07 | Link old Employer/Client pages to workspace | [x] | Employer and Client detail pages now route admins to Company Workspace mapping |

## Phase 3: Company Portal

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P3-01 | Add company portal auth helpers | [x] | company-portal-auth.ts with JWT, workspace capabilities |
| P3-02 | Add `/company/login` | [x] | Client component with useActionState |
| P3-03 | Add `/company` layout and nav | [x] | CompanyPortalSidebar with capability-aware tabs |
| P3-04 | Add dashboard | [x] | Stat cards by workspace facets |
| P3-05 | Add `/employer/*` compatibility redirects/wrappers | [ ] | Deferred — existing employer routes still functional |
| P3-06 | Add portal user management | [x] | `/company/users` now lets Owners create users, update roles, reset passwords, and activate/deactivate workspace users |
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
| P6-02 | Define shared builder contract | [x] | Formal field-level contract added in `06-builder-field-contract.md` |
| P6-03 | Add profile draft flow if needed | [x] | Added CompanyProfileDraft model/migration; employer profile submits draft instead of publishing directly |
| P6-04 | Update company profile editor | [x] | Existing portal profile editor uses BlockBuilder, theme, logo/cover upload, capabilities |
| P6-05 | Add draft preview | [x] | Admin preview route `/companies/[id]/profile-drafts/[draftId]/preview` renders draft payload without publishing |
| P6-06 | Add admin profile draft review | [x] | `/companies/[id]?tab=profile-drafts` can approve/publish or reject submitted profile drafts |
| P6-07 | Align job posting builder fields | [x] | Field coverage compared and aligned; option-source cleanup remains under P6-08 |
| P6-08 | Share media validation | [x] | Builder image MIME/type/size rules centralized in `src/lib/media-validation.ts` and reused by profile, job/content, and admin upload surfaces |

## Phase 7: Kanban Optimization and Cleanup

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| P7-01 | Make Kanban selected-job only | [x] | `/employer/pipeline` now renders a job selector first; applications load only after a job is selected |
| P7-02 | Add per-card pending state | [x] | Status updates track pending by application id instead of locking the whole board |
| P7-03 | Add stage dropdown/buttons to selected card | [x] | Cards and preview panel both support explicit status updates without drag-and-drop |
| P7-04 | Improve mobile fallback | [x] | Mobile uses stacked cards with select/buttons; drag-and-drop board is desktop-only |
| P7-05 | Remove old inline Link Client UI | [x] | Employer detail now links to Company Workspace mapping instead of mutating legacy Employer.clientId inline |
| P7-06 | Redirect legacy employer pages | [~] | Safe subset redirected: login, dashboard, profile, pipeline, job-postings list/new/detail/edit. Subscription/register remain until canonical replacements are ready |
| P7-06a | Replace `/company/job-postings` stub | [x] | Portal now renders a workspace-scoped job postings list with status filters, counts, application links, and public preview links |
| P7-06b | Add `/company/job-postings` detail/create/edit actions | [x] | Company Portal now exposes job detail, create, edit, pause/resume, delete through route-aware legacy job builder/actions |
| P7-06c | Replace `/company/profile` stub with profile builder | [x] | Company Portal profile now reuses the full employer profile builder through workspace-scoped profile actions |
| P7-06d | Extract profile builder before `/employer/company` redirect | [x] | Company Portal imports `CompanyProfileRoute.tsx`; legacy `/employer/company` now redirects to `/company/profile` |
| P7-06e | Extract job posting form/detail before deeper job redirects | [x] | Job form/detail/edit implementations moved to route implementation files so Company Portal no longer imports redirecting legacy pages |
| P7-06f | Add canonical Company Portal pipeline | [x] | `/company/pipeline` now owns the Kanban route; legacy `/employer/pipeline` redirects with selected job preserved |

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
Task: Phase 7 P7-06f canonical company pipeline route
Commands: GitNexus impact EmployerPipelinePage/getRecruitmentPipelineData/updateApplicationPipelineStatusAction/EmployerPipelineBoard/CompanyPortalSidebar -> LOW; npx tsc --noEmit -> pass; targeted eslint -> pass; npm run build -> pass with existing Postgres SSL mode warning; GitNexus detect_changes staged -> MEDIUM because legacy EmployerPipelinePage auth/subscription processes now redirect to Company Portal
Result: Added `/company/pipeline`, moved the legacy pipeline page into `PipelineRoute.tsx`, added a Company Portal sidebar tab, made the board route-aware, and updated pipeline data/status actions to resolve Company Portal employer access. Legacy `/employer/pipeline` redirects to `/company/pipeline` while preserving `job`.
Changed files: src/app/(company)/company/(portal)/pipeline/page.tsx, src/app/(employer)/employer/(portal)/pipeline/page.tsx, src/app/(employer)/employer/(portal)/pipeline/PipelineRoute.tsx, src/components/company/CompanyPortalSidebar.tsx, src/components/employer/EmployerPipelineBoard.tsx, src/lib/employer-actions.ts, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: `/employer/subscription` and `/employer/register` remain legacy because Company Portal billing/user provisioning flows still need a product decision.
Next task: Audit Company Portal client-side navigation and decide whether billing should replace employer subscription or remain admin-managed.
```

```text
Date: 2026-04-29
Task: Phase 7 P7-06d profile route extraction and legacy redirect
Commands: GitNexus exact impact for `CompanyProfilePage` mis-resolved to public company route, so cypher was used to confirm target symbols; GitNexus impact useImageUpload/CompanyProfileForm -> LOW; npx tsc --noEmit -> pass; targeted eslint -> pass with existing no-img-element warning; npm run build -> pass with existing Postgres SSL mode warning; GitNexus detect_changes staged -> LOW
Result: Moved the profile builder implementation to `CompanyProfileRoute.tsx`. Company Portal imports the route implementation directly, and legacy `/employer/company` redirects to `/company/profile` without creating an import loop.
Changed files: src/app/(company)/company/(portal)/profile/page.tsx, src/app/(employer)/employer/(portal)/company/page.tsx, src/app/(employer)/employer/(portal)/company/CompanyProfileRoute.tsx, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: `/employer/pipeline`, `/employer/subscription`, and `/employer/register` remain legacy because the Company Portal does not yet have canonical equivalents for those flows.
Next task: Decide whether `/company/applications` should replace `/employer/pipeline`, then build the canonical applications/pipeline route before redirecting the legacy route.
```

```text
Date: 2026-04-29
Task: Phase 7 P7-06e job posting route extraction and legacy redirects
Commands: GitNexus impact NewJobPostingPage/JobPostingDetailPage/EditJobPostingPage -> LOW; npx tsc --noEmit -> pass; targeted eslint -> pass with existing no-img-element warnings; npm run build -> pass with existing Postgres SSL mode warning; GitNexus detect_changes staged -> LOW
Result: Moved job posting new/detail/edit implementations to `NewJobPostingRoute.tsx`, `JobPostingDetailRoute.tsx`, and `EditJobPostingRoute.tsx`. Company Portal imports those route implementation files directly. Legacy employer new/detail/edit pages now redirect to canonical Company Portal URLs.
Changed files: src/app/(company)/company/(portal)/job-postings/new/page.tsx, src/app/(company)/company/(portal)/job-postings/[id]/page.tsx, src/app/(company)/company/(portal)/job-postings/[id]/edit/page.tsx, src/app/(employer)/employer/(portal)/job-postings/new/page.tsx, src/app/(employer)/employer/(portal)/job-postings/new/NewJobPostingRoute.tsx, src/app/(employer)/employer/(portal)/job-postings/[id]/page.tsx, src/app/(employer)/employer/(portal)/job-postings/[id]/JobPostingDetailRoute.tsx, src/app/(employer)/employer/(portal)/job-postings/[id]/edit/page.tsx, src/app/(employer)/employer/(portal)/job-postings/[id]/edit/EditJobPostingRoute.tsx, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: `/employer/company` still cannot redirect until the profile builder is extracted from the legacy page. Pipeline/subscription/register are still legacy routes until canonical Company Portal equivalents exist.
Next task: Extract the profile builder into a route implementation file, update `/company/profile` to import it, then redirect `/employer/company` to `/company/profile`.
```

```text
Date: 2026-04-29
Task: Phase 7 P7-06 safe legacy employer redirects
Commands: GitNexus impact EmployerLoginPage/EmployerDashboardPage/JobPostingsPage/NewJobPostingPage/JobPostingDetailPage/EditJobPostingPage -> LOW; attempted impact for employer CompanyProfilePage but GitNexus resolved the public company page, so `/employer/company` was left unchanged; initial typecheck caught that company new/detail/edit still import legacy pages, so those deeper redirects were rolled back; npx tsc --noEmit -> pass; targeted eslint -> pass; npm run build -> pass with existing Postgres SSL mode warning
Result: Legacy `/employer/login`, `/employer/dashboard`, and `/employer/job-postings` now redirect to canonical Company Portal routes. Query params are preserved for the job-postings list.
Changed files: src/app/(employer)/employer/(auth)/login/page.tsx, src/app/(employer)/employer/(portal)/dashboard/page.tsx, src/app/(employer)/employer/(portal)/job-postings/page.tsx, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: `/employer/company`, `/employer/job-postings/new`, `/employer/job-postings/[id]`, and `/employer/job-postings/[id]/edit` are intentionally not redirected yet because Company Portal currently imports those legacy implementations. Redirecting them now would create loops or break company routes. Pipeline/subscription/register are also left unchanged until canonical replacements are ready.
Next task: Extract profile and job posting route implementations into shared components, then finish the remaining legacy redirects.
```

```text
Date: 2026-04-29
Task: Phase 7 P7-06b company portal job detail/create/edit
Commands: GitNexus impact getJobPostingFormOptions/getJobPostingDetail/createJobPostingAction/updateJobPostingAction/toggleJobPostingStatus/deleteJobPostingAction/getJobApplicants/NewJobPostingPage/EditJobPostingForm/JobPostingDetailPage/EditJobPostingPage/JobActionButtons -> LOW; npx tsc --noEmit -> pass; targeted eslint for company/employer job posting routes/actions -> pass with existing no-img-element warnings; npm run build -> pass with existing Postgres SSL mode warning; GitNexus detect_changes staged -> CRITICAL due expected job-posting action/page fanout
Result: Added canonical Company Portal job-posting management routes for list -> new/detail/edit. Existing job builder/detail/action UI is route-aware and server actions resolve the linked Employer from Company Portal requests under `/company/job-postings`.
Changed files: src/lib/employer-actions.ts, src/app/(company)/company/(portal)/job-postings/page.tsx, src/app/(company)/company/(portal)/job-postings/new/page.tsx, src/app/(company)/company/(portal)/job-postings/[id]/page.tsx, src/app/(company)/company/(portal)/job-postings/[id]/edit/page.tsx, src/app/(employer)/employer/(portal)/job-postings/new/page.tsx, src/app/(employer)/employer/(portal)/job-postings/[id]/page.tsx, src/app/(employer)/employer/(portal)/job-postings/[id]/actions.tsx, src/app/(employer)/employer/(portal)/job-postings/[id]/edit/page.tsx, src/app/(employer)/employer/(portal)/job-postings/[id]/edit/EditJobPostingForm.tsx, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: Company routes reuse the existing legacy job builder UI instead of a fully extracted shared component. GitNexus reports CRITICAL because this intentionally touches shared job-posting read/write actions and route-aware page controls. P7-06 redirects are now unblocked but still not implemented.
Next task: Implement compatibility redirects/wrappers for `/employer/*` to canonical `/company/*`.
```

```text
Date: 2026-04-29
Task: Phase 7 P7-06c company portal profile builder
Commands: GitNexus impact getCompanyProfile/updateCompanyProfileAction/getCompanyProfileOptions -> LOW; GitNexus could not resolve getCompanyProfileDraftStatus in the current index; npx tsc --noEmit -> pass; npx eslint "src/lib/employer-actions.ts" "src/app/(company)/company/(portal)/profile/page.tsx" -> pass; npm run build -> pass with existing Postgres SSL mode warning; GitNexus detect_changes staged -> CRITICAL due employer-actions line-map fanout, diff reviewed
Result: `/company/profile` now uses the real profile builder instead of a stub. Profile read, draft status, option loading, and submit-for-review actions can resolve the linked Employer from an active Company Portal workspace while preserving legacy `/employer/company` behavior.
Changed files: src/app/(company)/company/(portal)/profile/page.tsx, src/lib/employer-actions.ts, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: The route currently imports the existing legacy profile client page to avoid duplicating a 600+ line builder. GitNexus reports CRITICAL because the helper change in `employer-actions.ts` shifts indexed ranges into job-posting symbols, but the staged diff changes only profile access/read/update behavior. P7-06b still blocks full legacy redirect because company job detail/create/edit actions are not native yet.
Next task: Implement `/company/job-postings` detail/create/edit actions.
```

```text
Date: 2026-04-29
Task: Phase 7 P7-06a company portal job postings list
Commands: GitNexus impact CompanyJobPostingsPage -> LOW; npx tsc --noEmit -> pass; npx eslint "src/app/(company)/company/(portal)/job-postings/page.tsx" -> pass; npm run build -> pass with existing Postgres SSL mode warning
Result: Replaced `/company/job-postings` stub with a workspace-scoped list backed by the linked Employer. The page supports status filters, summary counts, application links filtered by job, rejected reasons, and public preview links.
Changed files: src/app/(company)/company/(portal)/job-postings/page.tsx, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: Create/edit/detail management still lives only under legacy `/employer/job-postings`, so P7-06 remains blocked until P7-06b and P7-06c are done.
Next task: Implement `/company/job-postings` detail/create/edit actions or replace `/company/profile` stub.
```

```text
Date: 2026-04-29
Task: Phase 6 P6-08 shared media validation
Commands: GitNexus impact uploadContentImage/MediaUploadButton/updateCompanyProfileAction/useImageUpload/updateEmployerInfo/uploadImageFile/EmployerEditForm -> LOW; npx tsc --noEmit -> pass; targeted eslint for media/profile/admin upload files -> pass with existing no-img-element warnings; npm run build -> first run failed on transient /chia-se DB timeout after compile/type, second run pass; GitNexus detect_changes staged -> HIGH due profile/media flow fanout; context reviewed for updateCompanyProfileAction/updateEmployerInfo/uploadContentImage
Result: Added `src/lib/media-validation.ts` as the shared builder image contract. Content uploads, job cover uploads, employer profile uploads, and admin employer media uploads now reuse the same MIME/type/size limits and extension mapping.
Changed files: src/lib/media-validation.ts, src/lib/content-media-actions.ts, src/components/content/MediaUploadButton.tsx, src/lib/employer-actions.ts, src/lib/moderation-actions.ts, src/app/(employer)/employer/(portal)/company/page.tsx, src/app/(dashboard)/employers/[id]/edit/employer-edit-form.tsx, docs/company-workspace-rebuild-2026-04-28/06-builder-field-contract.md, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: GitNexus flags HIGH because the shared validation touches employer profile/admin profile/content upload flows. Candidate avatar/CV uploads still use their own validation because they need signature checks and document MIME handling outside the builder contract.
Next task: Commit P6-08 if GitNexus detect_changes is expected.
```

```text
Date: 2026-04-29
Task: Phase 6 P6-02/P6-07 builder contract and job field parity
Commands: GitNexus query for builder/job/profile surfaces; manual field comparison across employer/admin job forms, employer/admin job actions, validation schema, content-block helpers
Result: Added formal builder field contract. Profile builder contract now defines draft-gated fields, content block capabilities, and moderation rule. Job builder contract confirms admin and employer field coverage parity and documents remaining option-source standardization separately.
Changed files: docs/company-workspace-rebuild-2026-04-28/06-builder-field-contract.md, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: No runtime code changed. Admin job create/edit option sources are still inconsistent with employer config-option helpers; tracked as P6-08 follow-up.
Next task: Commit docs slice, then implement P6-08 shared media/option validation if continuing Phase 6.
```

```text
Date: 2026-04-29
Task: Phase 3 P3-06 portal user management
Commands: GitNexus impact CompanyUsersPage -> LOW; npx tsc --noEmit -> pass; targeted eslint for company users page/component/actions -> pass; npm run build -> pass; GitNexus detect_changes staged -> LOW
Result: Replaced `/company/users` stub with Owner-only workspace user management. Owners can create portal users, change roles, reset passwords, and lock/unlock users with server-side workspace guards.
Changed files: src/app/(company)/company/(portal)/users/page.tsx, src/components/company/CompanyPortalUsersManager.tsx, src/lib/company-portal-user-actions.ts, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: Email delivery/invitation flow is not included; Owner must share temporary passwords out of band for now.
Next task: Commit Phase 3 P3-06 if staged diff remains scoped.
```

```text
Date: 2026-04-29
Task: Phase 2 P2-07 link old Client page to workspace
Commands: GitNexus impact ClientDetailPage -> LOW; npx tsc --noEmit -> pass; targeted eslint for src/app/(dashboard)/clients/[id]/page.tsx -> pass; npm run build -> pass; GitNexus detect_changes staged -> HIGH due ClientDetailPage process fanout; GitNexus context ClientDetailPage reviewed
Result: CRM Client detail now shows an admin-only Company Workspace panel with current workspace, portal/employer status, and a direct link to the workspace mapping tab.
Changed files: src/app/(dashboard)/clients/[id]/page.tsx, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: GitNexus flags the page as HIGH because it participates in several client/revenue/options read flows. The change is still scoped to an admin-only presentation panel and does not alter client access, revenue, or form mutation logic.
Next task: Commit Phase 2 P2-07 if staged diff remains scoped.
```

```text
Date: 2026-04-29
Task: Phase 2 P2-03/P2-04 Account Mapping wizard
Commands: GitNexus impact CompanyDetailPage/MappingTab/linkWorkspaceToClient/linkWorkspaceToEmployer -> LOW; npx tsc --noEmit -> pass; targeted eslint for companies detail + mapping panel -> pass; npm run build -> pass; Playwright smoke production /companies/3?tab=mapping -> pass
Result: Company Workspace mapping tab now has an interactive wizard for linking/unlinking FDI Employer and CRM Client, duplicate-aware disabled options, and portal toggle. It uses workspace-actions as the source of truth, preserving legacy Employer.clientId sync from prior fixes.
Changed files: src/app/(dashboard)/companies/[id]/page.tsx, src/components/dashboard/CompanyWorkspaceMappingPanel.tsx, docs/company-workspace-rebuild-2026-04-28/TRACKER.md
Remaining risk: Client detail page does not yet link back to workspace.
Next task: Commit Phase 2 mapping wizard if diff review is clean.
```

```text
Date: 2026-04-29
Task: Phase 7 P7-05 remove legacy inline Link Client UI
Commands: GitNexus impact EmployerDetailPage/EmployerDetailTabs/InfoTab/EmployersPage -> LOW; npx tsc --noEmit -> pass; targeted eslint for employer admin pages -> pass with existing no-img-element warning; npm run build -> pass; Playwright smoke /employers/44 info tab -> /companies/3?tab=mapping -> pass
Result: Employer detail no longer exposes the old inline Client dropdown. Admins see the current CRM Client mapping and use "Mở Company Workspace" to manage links from the workspace mapping source of truth. Employers list column label changed from "Link Client" to "CRM Client".
Changed files: src/app/(dashboard)/employers/page.tsx, src/app/(dashboard)/employers/[id]/page.tsx, src/app/(dashboard)/employers/[id]/employer-detail-tabs.tsx
Remaining risk: P7-06 should wait because Company Portal job-postings/profile routes are still stubs, while legacy employer portal still owns those workflows.
Next task: Commit Phase 7 P7-05 if diff review is clean.
```

```text
Date: 2026-04-29
Task: Phase 7 P7-01 through P7-04 employer pipeline optimization
Commands: GitNexus impact EmployerPipelineBoard/EmployerPipelinePage/getRecruitmentPipelineData/updateApplicationPipelineStatusAction/getEmployerApplicationPipelineData -> LOW; npx tsc --noEmit -> pass; targeted eslint for pipeline page, board, employers.ts -> pass; npm run build -> pass; Playwright smoke login -> /employer/pipeline -> ?job=117 -> pass; status update IMPORTED -> REVIEWED -> IMPORTED restore -> pass
Result: Employer pipeline no longer renders an all-jobs Kanban by default. The page now selects one job first, loads only that job's applications, provides per-card pending status, dropdown/button status updates, a profile preview panel, and a mobile list fallback.
Changed files: src/app/(employer)/employer/(portal)/pipeline/page.tsx, src/components/employer/EmployerPipelineBoard.tsx, src/lib/employers.ts
Remaining risk: Build still emits the existing Postgres SSL mode warning. P7-05 and P7-06 remain deferred because account mapping/legacy redirects need a separate product decision.
Next task: Commit Phase 7 P7-01 through P7-04 if diff review is clean.
```

```text
Date: 2026-04-29
Task: Phase 6 profile draft/review hardening
Commands: npx prisma generate -> pass; npx prisma validate -> pass; npx tsc --noEmit -> pass; targeted eslint for draft/profile/admin files -> pass with one no-img-element preview warning; npx prisma migrate deploy -> pass; npm run build -> pass
Result: Employer profile saves now create/update a submitted CompanyProfileDraft instead of writing public Employer/ProfileConfig records. Admin company detail has a profile-drafts review tab with approve/publish, reject actions, and draft-only preview route.
Changed files: prisma/schema.prisma, prisma/migrations/20260429110000_add_company_profile_drafts/migration.sql, src/lib/employer-actions.ts, src/lib/workspace-actions.ts, src/app/(employer)/employer/(portal)/company/page.tsx, src/app/(dashboard)/companies/[id]/page.tsx, src/app/(dashboard)/companies/[id]/profile-drafts/[draftId]/preview/page.tsx
Remaining risk: Employer form button copy still uses the existing saved-text in one label and should be polished with encoding-safe cleanup.
Next task: P6-02/P6-07 formal builder contract and admin job/profile parity comparison.
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
