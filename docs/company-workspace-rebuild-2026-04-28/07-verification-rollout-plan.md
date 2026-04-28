# 07. Verification and Rollout Plan

## Goal

Define how each rebuild phase is checked before moving to the next phase.

## Automated Checks

Run when relevant:

- `npm run lint`
- `npm run build`
- TypeScript check if separate from build.
- Prisma generate after schema changes.
- Prisma migration status after migrations.
- Focused unit/integration tests if present.
- Playwright/browser smoke for major UI paths.

If a command is missing or fails due unrelated existing issues, record it in `TRACKER.md` with exact failure summary.

## Test Scenarios

### Domain Model

- Employer-only row creates workspace.
- Client-only row creates workspace.
- Linked Employer+Client creates one workspace.
- Duplicate slug gets deterministic suffix.
- Workspace helper returns correct Employer/Client facets.

### Admin CRM

- Admin opens `/companies`.
- Admin filters by Employer, Client, Both, Portal Enabled.
- Admin opens company detail.
- Admin links Employer to Client.
- Admin sees conflict when Client already linked.
- Admin enables portal for CRM-only client.

### Company Portal

- CRM-only partner logs in and sees Job Orders/Submissions only.
- Employer logs in and sees Job Postings/Applications/Profile/Billing.
- Combined company sees both sets.
- Viewer cannot manage users.
- Suspended workspace cannot access dashboard.

### Applications Inbox

- Empty state renders.
- 1 application renders.
- 25 applications paginate.
- 100+ applications remain responsive.
- Filter by job works even with duplicate job titles.
- Preview drawer opens and shows CV link.
- Status action succeeds and shows updated state.
- Failed status action rolls back.

### Submissions Inbox

- Partner sees only submissions for linked Client.
- Partner leaves feedback.
- Admin sees feedback in CRM.
- Internal notes remain hidden.
- Feedback cannot be submitted for another company's job candidate.

### Builder

- Company edits profile draft.
- Preview shows draft.
- Submit for review creates pending item.
- Admin approves and public page updates.
- Admin rejects and company sees reason.
- Media validation rejects unsupported or oversized files.

### Public Compatibility

- `/cong-ty/[slug]` still loads.
- `/viec-lam/[slug]` still loads.
- Existing `/employer/login` still works or redirects correctly.
- Existing admin `/employers` and `/clients` still work.

## Manual QA Checklist

- [ ] Vietnamese text displays correctly, no encoding corruption.
- [ ] Buttons and labels distinguish `Trang cong ty public`, `CRM Client`, and `Portal access`.
- [ ] No card-in-card clutter in dense admin screens.
- [ ] Tables do not overflow on laptop width.
- [ ] Preview drawer is usable on mobile or has mobile fallback.
- [ ] Drag-and-drop is not required to complete a workflow.
- [ ] Loading and empty states are specific and useful.

## Rollout Notes

Recommended release order:

1. Ship additive schema and helpers.
2. Ship admin workspace and mapping.
3. Enable portal for test company only.
4. Ship applications inbox.
5. Ship submissions feedback.
6. Ship builder sync.
7. Redirect legacy employer portal routes.
8. Retire old confusing link UI.

## Phase Prompt

```text
Run verification for the selected Company Workspace rebuild phase.
Read docs/company-workspace-rebuild-2026-04-28/07-verification-rollout-plan.md and the phase file.
Run the listed automated checks that apply.
Use Playwright or browser verification for UI flows when a page changed.
Record exact commands, results, screenshots if any, and remaining risk in TRACKER.md.
Do not mark a task done until acceptance criteria and relevant test scenarios pass or are explicitly waived.
```
