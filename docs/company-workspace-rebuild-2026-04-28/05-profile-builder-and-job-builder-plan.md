# 05. Profile Builder and Job Builder Plan

## Goal

Bring the deeper Admin CRM editing capabilities into the company portal without losing moderation control.

Employers/partners should be able to manage their public company presence and job content from the portal, but admin should still control what gets published when review is required.

## Current Gap

- Admin has richer company page editing and content/media builder logic.
- Employer portal only exposes a narrower profile form.
- Job posting creation/editing has improved fields, but the employer experience is not fully aligned with admin capabilities.
- Public company links and CRM client links are conceptually mixed.

## Shared Builder Direction

Use shared builder components and shared normalization logic:

- `BlockBuilder`
- content block normalization helpers.
- company profile theme/capability helpers.
- media upload helpers.
- job taxonomy/config option helpers.

Do not fork an admin-only builder and employer-only builder unless permissions require it.

## Company Profile Draft Flow

Recommended v1:

- Company user edits a draft profile.
- Company can preview draft internally.
- Company submits for admin review.
- Admin approves and publishes to public profile.
- Admin can edit and publish directly.

Suggested model if needed:

```prisma
model CompanyProfileDraft {
  id            Int      @id @default(autoincrement())
  workspaceId   Int
  submittedById Int?
  status        CompanyDraftStatus @default(DRAFT)
  payload       Json
  submittedAt   DateTime?
  reviewedAt    DateTime?
  reviewedById  Int?
  rejectReason  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum CompanyDraftStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
}
```

If this is too large for the first implementation pass, start by sharing the builder UI and keep direct update behavior behind admin-only controls.

## Profile Fields

Company portal profile should support:

- Logo.
- Cover image and cover position.
- Company name.
- Description.
- Industry.
- Company size.
- Location.
- Industrial zone.
- Address.
- Website.
- Phone.
- Public slug preview.
- Profile theme.
- Content blocks allowed by package/capabilities.
- Gallery/video/html only if enabled.

## Job Builder Alignment

Job posting form should support the same key fields across admin and company portal:

- Title.
- Description.
- Requirements.
- Benefits.
- Salary min/max/display.
- Industry.
- Position.
- Location.
- Work type.
- Quantity.
- Skills/tags.
- Industrial zone.
- Required language.
- Language proficiency.
- Shift type.
- Cover image and alt text if supported.

Moderation:

- New or edited company-submitted jobs should remain `PENDING` unless the account is explicitly trusted.
- Rejected jobs should show reason and allow resubmission.

## Tasks

- [ ] Audit current admin and employer builder fields.
- [ ] Define shared builder field contract.
- [ ] Add or confirm company profile draft storage.
- [ ] Update company portal profile editor to use shared builder.
- [ ] Add preview route/state for draft profile.
- [ ] Add submit-for-review action.
- [ ] Add admin review/publish/reject flow for profile drafts.
- [ ] Align job posting create/edit fields with admin capabilities.
- [ ] Ensure media upload limits and validation are shared.
- [ ] Add copy that separates public company page link from CRM account mapping.

## Acceptance Criteria

- Company portal can edit the same core public profile fields as admin.
- Unsupported premium blocks are hidden or disabled with clear package messaging.
- Draft preview does not publish changes accidentally.
- Admin can approve/reject profile changes.
- Job post create/edit fields match the agreed builder contract.
- Rejected job/profile changes show actionable reason to the company.

## Phase Prompt

```text
Implement Phase 6 from docs/company-workspace-rebuild-2026-04-28/05-profile-builder-and-job-builder-plan.md.
First compare admin and portal builder fields.
Use GitNexus impact analysis before editing BlockBuilder, profile actions, job posting actions, or shared content helpers.
Extract shared builder contracts instead of duplicating logic.
Keep public publish behavior controlled by moderation.
Run form, upload, and build/type checks.
Update TRACKER.md.
```
