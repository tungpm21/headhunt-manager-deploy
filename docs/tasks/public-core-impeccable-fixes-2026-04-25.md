# FDIWork Public Core - High-End Redesign Task List

**Assigned to:** Codex  
**Branch:** `codex/fdiwork-ux-preview-20260425`  
**Last updated:** 2026-04-26  
**Status:** In progress  
**Based on:** `docs/reports/audit_2026-04-25_impeccable-public-core.md`  
**Design input:** `high-end-visual-design`

---

## 1. Context

The public UI has already moved past the old "dated website" phase, but it still does not feel authored at a premium product level. The current gap is not frontend correctness. The gap is perception, hierarchy, and conversion energy.

This redesign pass should use the `high-end-visual-design` skill as the visual benchmark for:

- stronger first-view storytelling
- more deliberate section rhythm
- layered surface design instead of repeated flat cards
- better CTA architecture
- softer but more intentional motion
- more curated trust presentation across jobs and employers

The redesign should stay within the current stack and product constraints:

- Next.js App Router
- Tailwind v4 styling approach already in the repo
- existing public routing structure
- no new frontend dependency unless absolutely required

---

## 2. Chosen Design Direction

Use a **Soft Structuralism** base with a controlled **Editorial Luxury** accent:

- keep the current deep navy public brand direction for hero and trust-heavy surfaces
- introduce cleaner white and warm-neutral content planes for reading sections
- use more macro whitespace and fewer repeated card treatments
- make key surfaces feel machined and layered, not flat
- use the skill's "double-bezel" logic for major hero/search/feature containers where it improves depth
- use more refined motion curves and nested CTA/icon treatment for premium feel

Do **not** apply the skill mechanically where it would fight the existing product. The task is to upgrade FDIWork into a more expensive-looking product experience, not to force a totally unrelated aesthetic.

---

## 3. Shared Visual Foundation - P1

**Implementation status:** Done in the current pass.

### Goal

Establish a stronger public design system before touching individual pages, so the redesign does not become another set of isolated component tweaks.

### Primary files

- `src/app/globals.css`
- `src/app/(public)/layout.tsx`
- `src/components/public/PublicHeader.tsx`
- `src/components/public/PublicFooter.tsx`

### Changes

- Refine public design tokens for:
  - backgrounds
  - section surfaces
  - accent usage
  - public-only shadows
  - radii
  - motion timing curves
- Reduce reliance on generic white cards with thin gray borders and mild shadows.
- Introduce a more intentional public section spacing scale.
- Make the public header and footer feel like part of the same premium system, not separate utility bars.
- Apply the high-end skill selectively for:
  - layered shells
  - nested CTA construction
  - premium spacing
  - custom easing

### Done when

- The public site has a recognizable shared visual language before page-specific redesign starts.
- Header, footer, and core public surfaces feel like one product family.

### Implemented in this pass

- Added public-facing ink, navy, paper, mist, shadow, and motion tokens in `src/app/globals.css`.
- Moved public typography toward the Poppins-led brand system by updating the public body token.
- Reworked the public header into a floating, layered navigation shell with a stronger employer CTA.
- Reworked the public footer into a darker premium closing surface with a subtle grid texture and layered container.
- Increased public layout top spacing to account for the floating header.

---

## 4. Homepage Story and First View - P1

**Implementation status:** Done in the current pass.

### Goal

Turn the homepage into a clear, premium landing surface for FDI hiring instead of a search widget with supporting modules.

### Primary files

- `src/app/(public)/page.tsx`
- `src/components/public/HeroSection.tsx`
- `src/components/public/EmployerBannerCarousel.tsx`
- `src/components/public/TopEmployers.tsx`

### Changes

- Make the homepage H1 and visible value proposition explicit in the live hero.
- Recompose the hero so search is still the primary action, but not the only visible story.
- Add visible trust framing in the first viewport:
  - job count
  - employer count
  - hiring momentum
  - or equivalent signals already supported by available data
- Redesign the employer banner so it feels like a premium trust module, not a large rotating image card.
- Bring the top employers section into the same story arc as the hero instead of treating it as a disconnected carousel block.

### Done when

- A first-time visitor can understand the platform promise in one screen.
- The first viewport feels branded, premium, and conversion-aware.

### Implemented in this pass

- Added a visible homepage proposition above the fold: `Tìm việc FDI chất lượng cao tại Việt Nam`.
- Rebuilt the hero as a story-led surface instead of a search-only module.
- Added a desktop trust panel using existing job and employer counts.
- Rebuilt the hero search as a layered double-bezel surface with a nested CTA icon treatment.
- Tuned mobile first view so the proposition, search, trending tags, and trust stats fit without horizontal overflow.
- Redesigned `EmployerBannerCarousel.tsx` as a layered featured-employer trust module with stronger overlay, role count signal, and premium CTA.
- Connected `TopEmployers.tsx` visually to the hero story arc with a dark trust shell, refined cards, and matching motion/CTA treatment.

---

## 5. Homepage Section Rhythm - P1

### Goal

Break the repeated pattern of off-white cards and make each homepage block serve a distinct editorial role.

### Primary files

- `src/components/public/FeaturedJobs.tsx`
- `src/components/public/IndustryGrid.tsx`
- `src/components/public/BlogSection.tsx`
- `src/components/public/JobCard.tsx`

### Changes

- Rework homepage sections so they do not all use the same surface treatment.
- Give each block a clearer role:
  - featured jobs as dense premium utility
  - industries as navigational overview
  - blog as editorial support
- Reduce accent orange overuse so it becomes meaningful again.
- Use more deliberate contrast between dark sections, neutral sections, and utility sections.
- Improve section transitions so scrolling feels paced and intentional.

### Done when

- The homepage no longer reads like a stack of similar cards.
- Each section feels visually distinct but still coherent within one system.

---

## 6. Job Detail Redesign - P1

### Goal

Make job detail the strongest conversion page in the public flow.

### Primary files

- `src/app/(public)/viec-lam/[slug]/page.tsx`
- `src/components/public/JobCard.tsx`
- `src/components/public/LogoImage.tsx`

### Changes

- Redesign the top job module into a stronger job hero:
  - title hierarchy
  - employer proof
  - compensation visibility
  - location and role metadata
  - stronger apply CTA
- Rebalance or expand the company information block so trust signals are more prominent.
- Reduce dead white space in desktop content flow.
- Improve mobile section cadence so the page does not degrade into a long pale stack.
- Upgrade recommendation blocks so they feel like persuasive continuation paths, not leftover utility lists.

### Done when

- The first viewport on job detail clearly sells the opportunity.
- Employer credibility and apply intent are visible before the user enters long-form content.
- Desktop feels intentional, and mobile feels dense but controlled.

---

## 7. Job Listing Hierarchy - P2

### Goal

Make the job listing easier to scan and more differentiated without losing filter power.

### Primary files

- `src/app/(public)/viec-lam/page.tsx`
- `src/components/public/JobCard.tsx`
- `src/components/public/JobFilters.tsx`
- `src/components/public/Pagination.tsx`

### Changes

- Reduce the visual dominance of the filter rail.
- Improve hierarchy between ordinary jobs and high-value or featured jobs.
- Tighten card emphasis:
  - badge system
  - salary emphasis
  - metadata placement
  - CTA affordance
- Upgrade pagination and list framing so the page feels premium rather than generic.

### Done when

- The user can scan the first 12 jobs quickly and tell what matters first.
- Filters feel like tools, not competing content.

---

## 8. Company Discovery and Profile - P2

### Goal

Make company browsing feel curated and trustworthy instead of exposing raw CMS-like variation.

### Primary files

- `src/app/(public)/cong-ty/page.tsx`
- `src/app/(public)/cong-ty/[slug]/page.tsx`
- `src/components/public/CompanyCard.tsx`
- `src/components/public/LogoImage.tsx`

### Changes

- Improve company-card treatment for mixed-quality data:
  - stronger placeholder logic
  - more controlled visual priority
  - softer presentation for low-signal records
- Rework company profile so the cover, logo, and company information feel premium and trustworthy.
- Make open jobs on company profile feel like an integrated hiring surface, not just a list under company info.
- Remove or visually downgrade weak records such as generic placeholder companies when they cannot be filtered out functionally.

### Done when

- Company listing feels curated.
- Company profile feels like a hiring destination, not only a record view.

---

## 9. Header, Search, and Navigation Shell - P2

### Goal

Make the global navigation shell feel premium and confident across homepage and inner pages.

### Primary files

- `src/components/public/PublicHeader.tsx`
- `src/components/public/HeroSection.tsx`
- `src/app/(public)/layout.tsx`

### Changes

- Rebalance nav, search, and employer CTA proportions on desktop.
- Improve active-state clarity and overall visual authority of top navigation.
- Make homepage and inner-page header states part of one system, with purposeful variation.
- Improve search dropdown anchoring so it feels like part of the system rather than an extra floating card.

### Done when

- The header feels premium on both homepage and inner pages.
- Search no longer visually competes with navigation and CTA for the same priority.

---

## 10. Footer Completion - P2

### Goal

Bring the footer up to the same level as the redesigned header and homepage.

### Primary files

- `src/components/public/PublicFooter.tsx`

### Changes

- Refine the footer information architecture and spacing.
- Make the footer feel less like a utility sitemap and more like a strong closing brand surface.
- Improve brand block, support links, and contact cluster hierarchy.
- Keep it useful, but remove the feeling of a generic jobs-site footer.

### Done when

- The footer feels intentional and premium instead of purely informational.

---

## 11. Production-Like QA and Runtime Recheck - P3

### Goal

Validate that the redesign is better visually without regressing perceived speed or interaction quality.

### Verification targets

- `/`
- `/viec-lam`
- `/viec-lam/[slug]`
- `/cong-ty`
- `/cong-ty/[slug]`

### Changes

- Re-run browser QA on a production-like build or a public preview without auth blocking.
- Re-check console cleanliness, image loading, and perceived interaction smoothness.
- Compare listing and detail timing against the local audit baseline.

### Done when

- A second QA pass confirms the redesign holds up on real runtime conditions.
- Listing and detail pages do not regress meaningfully against the current baseline.

---

## 12. Files in Scope

- `src/app/globals.css`
- `src/app/(public)/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/viec-lam/page.tsx`
- `src/app/(public)/viec-lam/[slug]/page.tsx`
- `src/app/(public)/cong-ty/page.tsx`
- `src/app/(public)/cong-ty/[slug]/page.tsx`
- `src/components/public/PublicHeader.tsx`
- `src/components/public/PublicFooter.tsx`
- `src/components/public/HeroSection.tsx`
- `src/components/public/EmployerBannerCarousel.tsx`
- `src/components/public/TopEmployers.tsx`
- `src/components/public/FeaturedJobs.tsx`
- `src/components/public/IndustryGrid.tsx`
- `src/components/public/BlogSection.tsx`
- `src/components/public/JobCard.tsx`
- `src/components/public/JobFilters.tsx`
- `src/components/public/CompanyCard.tsx`
- `src/components/public/Pagination.tsx`
- `src/components/public/LogoImage.tsx`

---

## 13. Suggested Execution Order

1. Shared visual foundation
2. Homepage story and first view
3. Homepage section rhythm
4. Job detail redesign
5. Job listing hierarchy
6. Company discovery and profile
7. Header and navigation shell refinement
8. Footer completion
9. Production-like QA and runtime recheck

---

## 14. Acceptance Check

Before closing the redesign pass, verify:

- the homepage has a visible proposition above the fold
- the homepage no longer repeats the same card language in every section
- job detail feels like the strongest conversion page in the public flow
- job listing is easier to scan and better prioritized
- company listing and company profile feel curated and trustworthy
- header and footer feel like a matched premium shell
- the redesign still behaves well on mobile
- a production-like QA pass has been completed
