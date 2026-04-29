# 06. Builder Field Contract

Date: 2026-04-29

This document is the field-level contract for company profile builder and job posting builder parity across Admin CRM, Employer Portal, and Company Portal migration work.

## Scope

This contract is based on the current implementation in:

- `src/lib/content-blocks.ts`
- `src/lib/employer-actions.ts`
- `src/lib/admin-job-posting-actions.ts`
- `src/lib/validation/forms.ts`
- `src/app/(employer)/employer/(portal)/company/page.tsx`
- `src/app/(employer)/employer/(portal)/job-postings/new/page.tsx`
- `src/app/(employer)/employer/(portal)/job-postings/[id]/edit/EditJobPostingForm.tsx`
- `src/app/(dashboard)/moderation/new/new-job-posting-form.tsx`
- `src/app/(dashboard)/moderation/[id]/edit/job-posting-edit-form.tsx`

## Profile Builder Contract

### Canonical fields

| Field | Type | Owner | Publish behavior |
| --- | --- | --- | --- |
| `companyName` | string, required | Employer / Admin | Employer submits draft; admin approval publishes |
| `description` | string nullable | Employer / Admin | Draft gated |
| `industry` | config option nullable | Employer / Admin | Draft gated |
| `companySize` | config option nullable | Employer / Admin | Draft gated |
| `location` | config option nullable | Employer / Admin | Draft gated |
| `industrialZone` | config option nullable | Employer / Admin | Draft gated |
| `address` | string nullable | Employer / Admin | Draft gated |
| `website` | normalized URL nullable | Employer / Admin | Draft gated |
| `phone` | string nullable | Employer / Admin | Draft gated |
| `logo` | uploaded image URL nullable | Employer / Admin | Draft gated |
| `coverImage` | uploaded image URL nullable | Employer / Admin | Draft gated |
| `coverPositionX` | number | Employer / Admin | Draft gated |
| `coverPositionY` | number | Employer / Admin | Draft gated |
| `coverZoom` | number | Employer / Admin | Draft gated |
| `profileTheme` | `CompanyProfileTheme` | Employer / Admin | Draft gated, capability gated |
| `profileSections` | `ContentBlock[]` | Employer / Admin | Draft gated, normalized and capability gated |
| `primaryVideoUrl` | string nullable | Employer / Admin | Draft gated, video capability gated |

### Content block contract

All profile builder blocks must be normalized through `normalizeContentBlocks`.

Allowed block types:

- `richText`
- `image`
- `gallery`
- `quote`
- `stats`
- `benefits`
- `video`
- `html`
- `cta`

Capability rules:

- `gallery` is removed unless `capabilities.gallery` is true.
- `video` is removed unless `capabilities.video` is true.
- `html` is removed unless `capabilities.html` is true.
- Total images in builder content must not exceed `capabilities.maxImages`.
- Theme edits are only accepted when `capabilities.theme` is true.

### Moderation rule

Company-submitted profile edits must write to `CompanyProfileDraft`, not directly to public `Employer` or `EmployerProfileConfig` records. Admin approval is the only path that publishes draft payload into the public profile state.

## Job Builder Contract

### Canonical fields

Both Admin CRM and Employer Portal must support this field set.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Used for slug generation on create |
| `coverImage` | URL nullable | no | If present, `coverAlt` is required |
| `coverAlt` | string nullable | conditional | Required when `coverImage` exists |
| `description` | markdown string | yes | Supports inline image uploads through `MarkdownEditor` |
| `requirements` | markdown string nullable | no | Supports inline image uploads |
| `benefits` | markdown string nullable | no | Supports inline image uploads |
| `salaryMin` | number nullable | no | Must be non-negative |
| `salaryMax` | number nullable | no | Must be non-negative and >= `salaryMin` when both exist |
| `salaryDisplay` | string nullable | no | Human-readable salary copy |
| `industry` | config option nullable | no | Employer resolves through config options |
| `position` | string nullable | no | Uses `JOB_POSITIONS` in employer edit UI |
| `location` | config option nullable | no | Employer resolves through config options |
| `workType` | config option nullable | no | Employer resolves through config options |
| `quantity` | positive integer | yes | Defaults to 1 |
| `skills` | string array | no | Parsed from comma-separated form input |
| `industrialZone` | config option nullable | no | FDI-specific field |
| `requiredLanguages` | string array | no | Current UI writes one selected language into an array |
| `languageProficiency` | config option nullable | no | FDI-specific field |
| `shiftType` | config option nullable | no | FDI-specific field |

### Shared validation

Both admin and employer job mutations validate the canonical field set with `employerJobPostingSchema`.

Shared validation rules:

- `title` and `description` are required.
- `salaryMin` and `salaryMax` are nullable non-negative numbers.
- `salaryMax` must be greater than or equal to `salaryMin` when both values exist.
- `quantity` must be a positive integer.
- `skills` is normalized into a unique string array.
- `requiredLanguages` is normalized into a string array.
- `coverAlt` is required when `coverImage` is present.

### Moderation and status rules

| Surface | Create status | Edit status |
| --- | --- | --- |
| Employer Portal | `PENDING` | Keeps current status, but `REJECTED` returns to `PENDING` after edit |
| Admin CRM | `APPROVED` | Admin can edit existing content without forcing review |

Admin-created jobs require an active employer subscription and available quota. Employer-created jobs also require active subscription quota and duplicate protection.

## Current Parity Result

### Field coverage

Field coverage is aligned:

- Employer create/edit supports the canonical job field set.
- Admin create/edit supports the canonical job field set.
- Both admin and employer actions persist the same fields into `JobPosting`.
- Both paths use `employerJobPostingSchema`.

### Remaining UI standardization

The field set is aligned, but option sources are not fully centralized:

- Employer job forms load `industry`, `location`, `workType`, `industrialZone`, `requiredLanguage`, `languageProficiency`, and `shiftType` from config option helpers.
- Admin edit uses shared taxonomy constants for several FDI fields.
- Admin create still has hard-coded option lists and plain text inputs for some taxonomy fields.

This is acceptable for P6-07 field parity, but should be cleaned up under P6-08 or a dedicated option-source standardization slice.

## Media Validation Contract

Current rules:

- Image MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Logo max size: 2MB.
- Cover max size: 5MB.
- Job/content image uploads go through `MediaUploadButton` and `uploadContentImage`.
- Employer profile logo/cover file validation is still local to the profile page/action pair.

P6-08 remains partial until the MIME/type/size rules are exported from one shared module and reused by:

- profile logo upload
- profile cover upload
- job cover upload
- content inline image upload
- admin upload surfaces

## Implementation Rule

New builder work must update this contract first when adding/removing fields. Code should then change in this order:

1. Update shared schema or shared normalization.
2. Update server actions.
3. Update admin UI.
4. Update company/employer UI.
5. Update preview/public rendering.
6. Run typecheck, targeted lint, build, and browser smoke when credentials are available.
