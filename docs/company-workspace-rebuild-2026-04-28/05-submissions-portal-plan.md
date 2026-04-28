# 05. Submissions Portal Plan

## Goal

Build `/company/submissions` for company workspaces with a CRM Client facet.

This is the partner-side review surface for CRM candidates submitted to a client. It must be safe by default: partners can inspect client-facing candidate data and leave feedback, while internal recruiter notes, compensation math, and admin-only pipeline controls stay inside CRM.

## Scope

Included:

- Replace the `/company/submissions` stub.
- Query only `JobCandidate` rows belonging to the current workspace's client job orders.
- Add filters for job order, stage, result, keyword, and feedback state.
- Add pagination with default page size 25.
- Add preview panel with candidate summary, CV link, job order details, client-visible notes, latest feedback.
- Add feedback action with decision and message.

Deferred:

- Admin CRM feedback review surface.
- Client-side direct stage mutation.
- Email notifications on partner feedback.
- Dedicated portal user management for CRM-only clients.

## Access Rules

- User must pass `requireCompanyPortalSession()`.
- Workspace must have `capabilities.client === true`.
- Every submission query must use `withWorkspaceSubmissionAccess(session.workspaceId)`.
- Feedback action must verify the `JobCandidate` belongs to the same workspace before writing.

## Feedback Decisions

- `INTERESTED`
- `NEED_MORE_INFO`
- `INTERVIEW`
- `REJECTED`

Feedback records are appended to `SubmissionFeedback`. They do not directly mutate `JobCandidate.stage` or `JobCandidate.result` in this phase.

## Phase Prompt

```text
Implement `/company/submissions` as a server-filtered submissions inbox.
Use `requireCompanyPortalSession()` and `withWorkspaceSubmissionAccess()`.
Expose only client-safe candidate fields.
Allow partner feedback through `SubmissionFeedback`, without direct internal pipeline mutation.
Run typecheck, build, targeted eslint, browser smoke, then update TRACKER.md.
```
