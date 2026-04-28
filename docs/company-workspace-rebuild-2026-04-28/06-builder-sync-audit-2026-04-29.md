# 06. Builder Sync Audit - 2026-04-29

## Scope

Audit current uncommitted Phase 6 work before adding more code. The worktree already contains large changes in employer company profile, job posting forms, shared content builder, media upload, and employer actions.

## What Is Already Present

- Employer company profile page now uses `BlockBuilder` and shared content block normalization.
- Employer can edit logo, cover image, cover position, profile theme, primary video URL, and rich profile sections.
- Profile blocks are filtered by company capabilities before saving.
- Job posting create/edit pages now use `MarkdownEditor`, `MediaUploadButton`, cover image, cover alt text, salary display/min/max, taxonomy options, FDI-specific fields, skills, language, proficiency, and shift fields.
- Content image upload permission now allows admin or authenticated employer portal users.
- Typecheck, targeted lint, and production build pass with warnings only for plain `<img>` preview elements.

## What Is Still Missing

- No `CompanyProfileDraft` model or draft status lifecycle yet.
- Employer profile edits still write directly to public profile data.
- No admin review / approve / reject flow for profile drafts.
- No draft preview route isolated from public publish state.
- Job builder parity still needs a field-by-field comparison with Admin CRM forms before being marked complete.
- Media validation exists in multiple places but is not fully centralized as a shared contract.

## Current Risk

The shared builder UI is usable, but moderation control is not production-complete. If FDIWork requires admin approval before public company profile changes go live, Phase 6 should not be considered complete until the draft/review workflow is implemented.

## Recommended Next Slice

Implement profile draft flow as a separate, bounded slice:

1. Add `CompanyProfileDraft` + `CompanyDraftStatus` migration.
2. Change employer profile save to write draft payload instead of publishing directly.
3. Add `/company/profile/preview` or `/employer/company/preview` draft preview.
4. Add admin `/companies/[id]?tab=profile-drafts` review surface.
5. Add approve/reject server actions.
6. Only approval writes to `Employer` + `EmployerProfileConfig` public fields.

## Verification Performed

```text
npx eslint src/components/content/BlockBuilder.tsx src/components/content/ContentBlocksRenderer.tsx src/components/content/MarkdownEditor.tsx src/components/content/MediaUploadButton.tsx src/lib/content-media-actions.ts src/lib/employer-actions.ts src/lib/employers.ts src/app/(employer)/employer/(portal)/company/page.tsx src/app/(employer)/employer/(portal)/job-postings/new/page.tsx src/app/(employer)/employer/(portal)/job-postings/[id]/edit/page.tsx src/app/(employer)/employer/(portal)/job-postings/[id]/edit/EditJobPostingForm.tsx
Result: pass with 3 no-img-element warnings for preview images.

npm run build
Result: pass with existing Postgres SSL mode warning.
```
