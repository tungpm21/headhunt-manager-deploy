# Impeccable Audit - FDIWork Public Core

**Date:** 2026-04-25  
**Requested preview:** `https://fdiwork-iuysmscpq-tungpm21s-projects.vercel.app/`  
**Audited runtime:** `http://localhost:3000`  
**Reason:** the Vercel preview redirects to Vercel Authentication, so the public UI could not be inspected directly from the preview URL.

## Scope

- Homepage: `/`
- Job listing: `/viec-lam`
- Job detail: `/viec-lam/[slug]`
- Company listing: `/cong-ty`

## Method

- Audit rubric followed the `impeccable-audit` intent manually because the `impeccable` CLI is not available in `PATH`.
- Checked desktop at `1440x900`.
- Checked mobile at `390x844`.
- Reviewed visual hierarchy, theming, responsive behavior, accessibility surface, and runtime quality.
- Captured local timing signals from the browser performance API for context.

## Scorecard

| Area | Score | Notes |
|------|------:|-------|
| Visual direction | 6/10 | Better than the older public UI, but still too safe and card-driven after the hero |
| Hierarchy & storytelling | 5/10 | Homepage and job detail do not clearly sell the value of the platform |
| Responsive behavior | 7/10 | No major overflow seen on audited pages; mobile remains usable |
| Accessibility surface | 7/10 | Structure and tap targets are generally fine; issues are more about emphasis than breakage |
| Runtime quality | 6/10 | Homepage is acceptable, but listing/detail are still heavy in dev timing |
| Content curation | 5/10 | Some company content feels raw and under-curated, which weakens trust |

**Overall:** `6.0/10`  
No P0 issues found. The current gap is mostly product presentation and hierarchy, not functional instability.

## Findings

### P1 - Homepage proposition is visually missing

The homepage starts with a capable search shell, but the visible page does not clearly state why FDIWork is different or why a candidate should trust it. In practice, the hero reads as:

- fixed header
- search box
- trending chips
- employer banner

The intended H1 and supporting narrative are currently hidden in `sr-only` inside [HeroSection.tsx](/abs/path/not/available). Concretely, that means the page is technically structured for SEO/accessibility, but the user does not actually see the platform promise.

**Impact**

- First impression feels like a module, not a brand.
- The page lacks a strong top-of-fold reason to continue scrolling.
- The premium visual intent from the redesign does not fully land.

**Primary implementation surface**

- `src/components/public/HeroSection.tsx`

### P1 - The visual system collapses after the hero

The top section has a more opinionated navy atmosphere, but the rest of the homepage drops into safe off-white cards with similar spacing, similar borders, and similar shadow treatment:

- featured jobs
- top employers
- industry grid
- blog cards

Each section is individually cleaner than before, but together they flatten into the same rhythm. The result feels competent, not distinctive.

**Impact**

- Brand memory is weak.
- Scroll experience becomes repetitive after the first screen.
- The redesign reads as "refined template" instead of a deliberate visual system.

**Primary implementation surfaces**

- `src/app/(public)/page.tsx`
- `src/components/public/FeaturedJobs.tsx`
- `src/components/public/TopEmployers.tsx`
- `src/components/public/BlogSection.tsx`

### P1 - Job detail page is functionally correct but visually underpowered

This is currently the weakest public page. The data is present and the CTA is visible, but the page does not sell the opportunity strongly enough.

What is happening now:

- the top card is mostly white and informational
- the sidebar is small relative to the canvas
- the body content leaves a lot of dead space
- the recommendations look like secondary utilities, not persuasive continuation paths

On mobile, the page becomes a long stack of pale cards without enough sectional contrast. On desktop, it feels sparse rather than editorial.

**Impact**

- Weak conversion energy on the most important public page.
- The job content feels transactional instead of aspirational.
- Company trust signals are present but not prominent enough.

**Primary implementation surface**

- `src/app/(public)/viec-lam/[slug]/page.tsx`

### P2 - Job listing is usable but still generic

The listing page is organized and readable, but the visual language is not yet strong enough for a premium FDI recruitment product.

Current issues:

- filter rail occupies a lot of visual weight
- job cards have similar emphasis across the grid
- orange accents are repeated often enough that they stop guiding the eye
- the page header is clean but not especially informative or memorable

This page now works, but it still feels like a polished default jobs board rather than a specialized FDI hiring destination.

**Impact**

- Scanning is fine, but selection energy is low.
- Too little differentiation between ordinary and high-value opportunities.

**Primary implementation surfaces**

- `src/app/(public)/viec-lam/page.tsx`
- `src/components/public/JobCard.tsx`

### P2 - Company listing exposes low-curation states

The company grid shows mixed content quality:

- high-quality cover images next to placeholders
- visually strong brands next to thin or generic records
- a visible `COMPANY` card with no real hiring signal

The UI component is not broken; the issue is that the design currently exposes low-trust data too directly.

**Impact**

- The page feels closer to raw CMS output than curated brand discovery.
- Trust drops when empty or generic records share the same visual importance as strong employers.

**Primary implementation surface**

- `src/components/public/CompanyCard.tsx`

### P2 - Header and search experience are dense but not premium

The fixed header is functional and the search suggestion system is useful, but the overall feel is still more "compact UI" than "confident product surface."

Observed issues:

- top navigation labels are small and quiet
- search field visually competes with nav and CTA rather than anchoring the bar
- the header does not create a strong enough transition between homepage and inner pages

This is especially noticeable because the header is visible everywhere, so any visual hesitation repeats across the whole public journey.

**Primary implementation surface**

- `src/components/public/PublicHeader.tsx`

### P3 - No obvious blocking accessibility or console issues on audited public pages

Across the local public pages that were checked:

- no major overflow was observed on audited desktop/mobile screens
- no blocking warning pattern was reproduced on the public pages themselves
- interactive controls were generally large enough to use

This means the next round should prioritize design hierarchy and curation over bug fixing.

## Performance Notes

These numbers are from the local dev server, so they are directional rather than release-grade metrics.

| Page | DCL | Load | FCP | Notes |
|------|----:|-----:|----:|-------|
| `/` | 466ms | 1447ms | 484ms | Acceptable for local dev |
| `/viec-lam` | 2819ms | n/a | 2356ms | Listing is noticeably heavier |
| `/viec-lam/[slug]` | 4991ms | 6997ms | 4460ms | Detail page feels the heaviest |

**Interpretation**

- Homepage is not the main runtime concern right now.
- Listing and detail need a production or preview re-check after the next UI pass.
- The current visual dissatisfaction is real, but it is not only a visual problem; the detail page especially is also heavy in runtime terms.

## Priority Action Plan

### 1. Rebuild the visible homepage story

- Make the H1 and core value proposition visible.
- Treat the hero as a brand statement, not only a search tool.
- Preserve search-first behavior, but let brand promise and trust signals lead.

### 2. Redefine the cross-section visual rhythm

- Stop repeating the same white-card treatment in every homepage block.
- Give each section a clearer role with more deliberate contrast, spacing, and density.
- Use orange more sparingly so it regains meaning.

### 3. Redesign job detail as the conversion page

- Turn the top module into a stronger editorial hero for the role.
- Promote company proof, benefits, and apply intent above generic metadata.
- Reduce dead space on desktop and improve cadence on mobile.

### 4. Curate company and job card presentation

- Down-rank or visually soften weak/empty records.
- Tighten placeholder behavior for covers and logos.
- Create more obvious distinction between premium, standard, and low-signal entries.

### 5. Re-check runtime on production-like environment

- Audit again on public preview or production-like build once preview auth is removed or a public share link is available.
- Compare perceived speed after the UI pass, especially on `/viec-lam` and `/viec-lam/[slug]`.

## Recommended Next Pass

If the next step is implementation, the strongest order is:

1. `HeroSection` and homepage section rhythm
2. `JobDetailPage`
3. `JobCard` and listing hierarchy
4. `CompanyCard` and company-list curation
5. production-like performance verification

## Verdict

The redesign has already fixed the old "dated website" problem, but it has not yet reached a level where the public experience feels convincingly premium or product-specific.

The main issue now is not frontend correctness. The main issue is that the UI still behaves like a clean component assembly instead of a fully authored public experience.
