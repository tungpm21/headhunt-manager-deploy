# 04. Pipeline UX Plan

## Goal

Fix recruitment management by making the primary workflow fast, clear, and inspectable.

The default is not a drag-and-drop board. The default is:

1. Inbox list.
2. Filters.
3. Preview drawer.
4. Explicit status/stage actions.
5. Optional Kanban for selected job.

## Two Workflows

### Applications

Applications are public candidates who applied to FDIWork job postings.

Source table:

- `Application`

Status lifecycle:

- `NEW`
- `REVIEWED`
- `SHORTLISTED`
- `REJECTED`
- `IMPORTED`

Primary users:

- Company portal users with Employer facet.
- Admin moderation users.

### Submissions

Submissions are CRM candidates sent to a client for review.

Source table:

- `JobCandidate`

Stage lifecycle:

- `SENT_TO_CLIENT`
- `CLIENT_REVIEWING`
- `INTERVIEW`
- `FINAL_INTERVIEW`
- `OFFER`
- `HIRED`
- `REJECTED`

Primary users:

- Admin/recruiter users.
- Company portal users with Client facet.

## Applications Inbox

Route:

- `/company/applications`
- Admin equivalent can live under `/companies/[id]/applications`

List columns:

- Candidate name.
- Job title.
- Email and phone summary.
- Applied date.
- Status.
- CV availability.
- Import state.

Filters:

- Job posting search/select.
- Status.
- Date range.
- Keyword.
- Has CV.
- Imported/not imported.

Preview drawer:

- Full name, email, phone.
- Job applied to.
- Cover letter.
- CV preview/download.
- Timeline: applied, viewed, status changes, imported.
- Action buttons: mark reviewed, shortlist, reject, import to CRM.
- Notes if supported by existing or new model.

Performance:

- Server-side pagination with default page size 25.
- Do not render all applications into client state.
- Do not render job filter as dozens of chips. Use searchable select or compact segmented filter with overflow.

## Submissions Inbox

Route:

- `/company/submissions`
- Admin equivalent remains `/submissions` and can be linked from company detail.

List columns:

- Candidate display name.
- Job order.
- Stage.
- Result.
- Last update.
- Feedback state.

Preview drawer:

- Candidate summary safe for client view.
- CV link if approved for client visibility.
- Stage/result.
- Interview date.
- Existing client-visible notes.
- Feedback form: interested, need more info, interview, reject, message.

Privacy:

- Do not expose internal candidate notes by default.
- Do not expose recruiter-only salary/commission fields unless explicitly whitelisted.

## Kanban View

Kanban is secondary and must require a selected job or job order.

Rules:

- Do not show all jobs in one board by default.
- Use explicit stage dropdown/buttons in every selected-card detail.
- Use per-card pending state.
- Do not lock the whole board while one update is saving.
- Add "Open in inbox" for detailed inspection.
- Disable or simplify drag-and-drop on narrow mobile screens.

## Tasks

- [ ] Replace employer pipeline entry point with Applications Inbox.
- [ ] Add application preview drawer.
- [ ] Add explicit application status actions.
- [ ] Add job filter as searchable select.
- [ ] Add server-side pagination and filtering.
- [ ] Add company submissions inbox for Client facet.
- [ ] Add submission preview drawer.
- [ ] Add partner feedback action.
- [ ] Refactor existing Kanban into secondary selected-job view.
- [ ] Add loading, empty, error, and permission states.

## Acceptance Criteria

- Company can review applications without dragging cards.
- Duplicate job titles no longer create confusing repeated chips.
- A user can open and preview a CV from the inbox.
- Status changes update quickly and show rollback/error if save fails.
- Partner company can review submissions and leave feedback.
- Company cannot see unrelated applications or submissions.
- Kanban remains available but no longer blocks the core workflow.

## Phase Prompt

```text
Implement Phase 4 from docs/company-workspace-rebuild-2026-04-28/04-pipeline-ux-plan.md.
Start with Applications Inbox before touching Submissions.
Use GitNexus impact analysis before editing pipeline components or employer/company actions.
Prefer server-side filters and pagination over large client-side arrays.
Keep Kanban as secondary, not the default.
Run UI smoke tests for 0, 1, 25, and 100+ applications.
Update TRACKER.md.
```
