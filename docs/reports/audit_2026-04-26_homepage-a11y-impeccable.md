# Impeccable Audit — FDIWork Homepage

**Date:** 2026-04-26
**URL audited:** https://fdiwork.vercel.app/
**Branch:** `codex/fdiwork-ux-preview-20260425`
**Scope:** Homepage (`/`) — accessibility, performance, responsive, theming, anti-patterns
**Method:** Live site fetch + full source inspection of all homepage components
**Task file:** `docs/tasks/homepage-a11y-impeccable-fixes-2026-04-26.md`

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | 3 P0 violations: nested `<main>`, no `<h1>`, no skip link |
| 2 | Performance | 3/4 | Global `*` transition missing `prefers-reduced-motion` guard |
| 3 | Responsive Design | 3/4 | Touch targets at 40px on hero controls (minimum is 44px) |
| 4 | Theming | 2/4 | 15+ hard-coded hex values bypass token system; wrong focus ring color |
| 5 | Anti-Patterns | 2/4 | Hero-metric template confirmed; identical card grids in 2 sections |
| **Total** | | **12/20** | **Acceptable — significant work needed** |

---

## Anti-Patterns Verdict

**2 confirmed AI tells.** Not gallery-level slop, but two explicit violations from the banned list:

1. **Hero-metric template** — `home-market` section (`src/app/(public)/page.tsx:56-70`): `text-4xl font-black` number + small label + description + gradient background card. Exact match for the banned SaaS cliché pattern.

2. **Identical card grids** — `FeaturedJobs` (3-col job cards) and `BlogSection` (3-col blog cards) use the same icon + heading + text structure repeated identically. Two sections back-to-back, same visual rhythm.

**What's working well:** Color palette is distinctive (`#0A6F9D` / `#1FB7C1` / `#F25C24`). Hero gradient is thoughtful. No gradient text, no glassmorphism, no bounce animations. ARIA on the search combobox is excellent.

---

## Homepage Component Map

| Order | Component | File | Type |
|-------|-----------|------|------|
| 1 | `HomepageSectionDots` | `src/components/public/HomepageSectionDots.tsx` | Client |
| 2 | `HeroSection` | `src/components/public/HeroSection.tsx` | Client |
| 3 | `EmployerBannerCarousel` | `src/components/public/EmployerBannerCarousel.tsx` | Client |
| 4 | `TopEmployers` | `src/components/public/TopEmployers.tsx` | Client |
| 5 | `FeaturedJobs` | `src/components/public/FeaturedJobs.tsx` | Client |
| 6 | `IndustryGrid` | `src/components/public/IndustryGrid.tsx` | Client |
| 7 | Market Signal stats | `src/app/(public)/page.tsx:45-72` | Server (inline) |
| 8 | `BlogSection` | `src/components/public/BlogSection.tsx` | Server async |

Layout wrappers: `src/app/(public)/layout.tsx` (public) → `src/app/layout.tsx` (root)

---

## Design System Tokens

Defined in `src/app/globals.css` under `@theme inline`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-fdi-primary` | `#0A6F9D` | Buttons, badges, links |
| `--color-fdi-primary-hover` | `#07577E` | Hover states |
| `--color-fdi-accent` | `#1FB7C1` | Secondary teal accent |
| `--color-fdi-accent-orange` | `#F25C24` | Primary CTA, salary |
| `--color-fdi-dark` | `#062B50` | Hero background |
| `--color-fdi-ink` | `#071A2F` | Main heading text |
| `--color-fdi-paper` | `#FFFFFB` | Card/surface background |
| `--color-fdi-mist` | `#F3F7F8` | Page background |
| `--color-fdi-text` | `#111827` | Body text |
| `--color-fdi-text-secondary` | `#627086` | Subtitles, descriptions |
| `--shadow-fdi-soft` | `0 34px 90px -56px rgba(7,26,47,0.55)` | Card shadows |
| `--ease-fdi` | `cubic-bezier(0.32, 0.72, 0, 1)` | All interactions |

**Note:** `--color-primary` (`#6366F1`, admin purple) is a separate token used in the global `:focus-visible` rule — this bleeds into the public site incorrectly.

---

## Detailed Findings

### P0 — Blocking (fix before any production traffic)

#### P0-1: No skip-to-main-content link
- **File:** `src/app/(public)/layout.tsx`
- **Location:** Missing before `<PublicHeader>` render
- **Impact:** Keyboard users must tab through 7+ header elements before reaching content on every page load
- **WCAG:** 2.4.1 Bypass Blocks (Level A) — this is a Level A failure, the most severe class
- **Fix:** Add `<a href="#home-hero" className="sr-only focus:not-sr-only ...">Chuyển đến nội dung chính</a>` as first child in the layout

#### P0-2: Nested `<main>` elements
- **File 1:** `src/app/(public)/layout.tsx` — renders `<main className="flex-1 pt-20">`
- **File 2:** `src/app/(public)/page.tsx:23` — renders `<main className="-mt-20 w-full max-w-full overflow-x-hidden bg-[var(--color-fdi-mist)]">`
- **Impact:** Two `<main>` landmarks on one page is invalid HTML. AT (assistive technology) navigating by landmarks will encounter duplicate main regions. Some screen readers skip the second `<main>` entirely.
- **WCAG:** 1.3.1 Info and Relationships (Level A)
- **Fix:** Change `<main>` in `page.tsx:23` to `<div>`. The layout wrapper's `<main>` is the correct one.

#### P0-3: No `<h1>` on the homepage
- **File:** All of `src/app/(public)/page.tsx` — every section starts at `<h2>`
- **Impact:** Screen reader users navigating by headings have no page-level topic anchor. Heading list starts at h2 with no parent h1 — assistive technology expects h1 as the root.
- **WCAG:** 2.4.6 Headings and Labels (Level AA)
- **Fix:** Add a visible or visually-hidden `<h1>` in `HeroSection` — e.g., "Tìm việc làm FDI tại Việt Nam". The `.sr-only` class works if the design requires it hidden.

---

### P1 — Major (fix before next deploy)

#### P1-1: Global `*` transition missing `prefers-reduced-motion` guard
- **File:** `src/app/globals.css:104-108`
- **Current code:**
  ```css
  *, *::before, *::after {
    transition: background-color 240ms cubic-bezier(0.32, 0.72, 0, 1),
      border-color 240ms cubic-bezier(0.32, 0.72, 0, 1),
      color 240ms cubic-bezier(0.32, 0.72, 0, 1);
  }
  ```
- **Impact:** All users with `prefers-reduced-motion: reduce` still receive 240ms transitions on every element. Also applies to interactive states — hover, focus, active — with no override. Applies to every element on every page site-wide.
- **WCAG:** 2.3.3 Animation from Interactions (Level AAA recommendation)
- **Fix:** Add immediately after the rule:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; }
  }
  ```

#### P1-2: Poppins font missing `vietnamese` subset
- **File:** Root layout font config (wherever `next/font/google` loads Poppins)
- **Impact:** Poppins only loads `latin` + `latin-ext`. All Vietnamese diacritics (ắ, ộ, ị, ử, etc.) silently fall back to the system font. Every heading on the page renders in a different typeface than intended on end-user machines.
- **Fix:** Add `'vietnamese'` to the `subsets` array in the Poppins font config

#### P1-3: Location search sub-input has no `aria-label`
- **File:** `src/components/public/HeroSection.tsx` — location filter dropdown input
- **Impact:** The location text input has only `placeholder` with no `<label>` or `aria-label`. Screen readers announce it as an unnamed edit field.
- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Fix:** Add `aria-label="Tìm kiếm tỉnh/thành phố"` to that input element

#### P1-4: `<h2>` headings inside `role="listbox"` container
- **File:** `src/components/public/HeroSection.tsx` — search suggestions dropdown
- **Current pattern:** Two `<h2>` tags ("Không có tìm kiếm gần đây", "Việc làm bạn sẽ thích") inside the `role="listbox"` element
- **Impact:** Heading elements inside listboxes are not part of the ARIA spec. AT will misbehave — some screen readers report unexpected heading counts or lose focus position.
- **WCAG:** 4.1.1 Parsing (Level A)
- **Fix:** Replace `<h2>` with `<p role="presentation">` or use a `role="group"` + `aria-label` wrapper `<div>` instead

---

### P2 — Minor (fix in next pass)

#### P2-1: Hard-coded hex colors bypass token system — 15+ instances
- **File:** `src/app/(public)/page.tsx:46-71`
- **Examples:** `border-[#D8E7EA]`, `bg-[#EAF7FA]`, `border-[#BFDCE4]`, `bg-[linear-gradient(180deg,#F5F8FA_0%,#FFFFFB_100%)]`, `shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]`
- **Impact:** These values will drift from the design system. Existing unused tokens could replace most: `--color-fdi-surface`, `--shadow-fdi-soft`, `--color-fdi-paper`
- **Fix:** Audit all inline hex values against `--color-fdi-*` tokens; replace where a token exists; add tokens for recurring values that are missing

#### P2-2: Focus ring uses admin token (`#6366F1`) on public FDI site
- **File:** `src/app/globals.css:97-99`
- **Current:** `outline: 2px solid var(--color-primary)` where `--color-primary` = `#6366F1` (admin indigo)
- **Impact:** All keyboard focus rings on the public site show indigo, clashing with the `#0A6F9D` brand blue
- **Fix:** Override in public layout: add `--color-primary: var(--color-fdi-primary)` to the `(public)` layout's root element, or scope a separate `:focus-visible` rule

#### P2-3: Hero controls touch targets at 40px (below 44px minimum)
- **File:** `src/components/public/HeroSection.tsx` — location dropdown button + search submit button
- **Current:** `min-h-10` (40px)
- **WCAG:** 2.5.5 Target Size (Level AAA); 2.5.8 (Level AA in WCAG 2.2)
- **Fix:** Change to `min-h-11` (44px) on both elements

#### P2-4: Hero-metric template — Market Signal stat section
- **File:** `src/app/(public)/page.tsx:45-72`
- **Pattern:** Three cards with `text-4xl font-black` number + small label + description, gradient card background. Matches the banned "hero-metric template" anti-pattern exactly.
- **Fix:** Redesign as a data narrative: single featured insight with trend context, or strip to one strong statement: "X việc làm FDI đang mở — cập nhật liên tục"

#### P2-5: HTML character entities in JSX source
- **File:** `src/app/(public)/page.tsx:53-69`
- **Examples:** `T&#7893;ng h&#7907;p` instead of `Tổng hợp`, `&#224;` instead of `à`, etc. — at least 6 lines of copy affected
- **Impact:** JSX natively supports UTF-8. Using HTML entities makes the source unreadable, breaks grep/search, and is maintenance-hostile
- **Fix:** Replace all HTML entities with direct UTF-8 Vietnamese characters

#### P2-6: Footer links have no minimum touch target
- **File:** `src/components/public/PublicFooter.tsx`
- **Current:** Only `py-1.5` on link wrappers — approximately 24-28px height
- **Fix:** Add `min-h-[44px] flex items-center` to footer link wrappers, especially Zalo and social links

---

### P3 — Polish (nice to fix when time permits)

#### P3-1: Duplicate `<h2>` for employer name in carousel
- **File:** `src/components/public/EmployerBannerCarousel.tsx`
- **Issue:** Same employer name in two separate `<h2>` elements (one desktop overlay, one info bar). Screen readers read the company name twice.
- **Fix:** Add `aria-hidden="true"` to the decorative overlay version

#### P3-2: Market Signal stat numbers lack screen-reader context
- **File:** `src/app/(public)/page.tsx:57-68`
- **Issue:** `<p className="text-4xl">{data.stats.totalJobs}+</p>` — screen reader reads just a number with no context
- **Fix:** Use `<dl>/<dt>/<dd>` structure, or add `aria-label="X việc đang mở"` on the number element

#### P3-3: `aria-haspopup="true"` should be `aria-haspopup="menu"`
- **File:** `src/components/public/PublicHeader.tsx`
- **Fix:** Change `aria-haspopup="true"` to `aria-haspopup="menu"` for ARIA 1.2 explicitness

#### P3-4: Raw `→` arrow character in link text
- **Files:** `FeaturedJobs.tsx`, `TopEmployers.tsx`, `IndustryGrid.tsx` — "Khám phá thêm →"
- **Issue:** `→` announces as "rightwards arrow" to screen readers; doesn't scale cleanly with font
- **Fix:** Replace with `<ArrowRight className="h-4 w-4" aria-hidden="true" />` (Lucide icon already used elsewhere)

#### P3-5: `HomepageSectionDots` has no accessible label
- **File:** `src/components/public/HomepageSectionDots.tsx`
- **Fix:** Add `aria-label="Điều hướng trang"` or `role="navigation"` + `aria-label` to the container element

---

## Systemic Issues

1. **Token discipline** — `--color-fdi-*` tokens exist but inline Tailwind hex values bypass them throughout `page.tsx` and likely other components. A system-wide token audit is needed, not just `page.tsx`.

2. **P0 cluster around HTML structure** — Nested `<main>`, missing `<h1>`, missing skip link are three foundational structural errors. Suggests no a11y review was done pre-launch.

3. **Global `*` transition with no motion guard** — Applies to every element on every page. Without `prefers-reduced-motion` override, affects all users with vestibular disorders site-wide.

---

## Positive Findings

- **ARIA on hero search combobox is excellent** — `role="combobox"`, `aria-autocomplete`, `aria-expanded`, `aria-activedescendant`, `role="listbox"`, `role="option"`, `aria-selected` all correctly implemented
- **Carousel controls properly labeled** — All prev/next, dot indicators (`role="tablist"`/`role="tab"`), and scroll buttons have clear `aria-label` values
- **Design tokens are well-named** — `--color-fdi-*` system is semantically clear and comprehensive
- **`<section>` landmarks with ids** — All 6 homepage sections use `<section id="...">` with scroll targets
- **`lang="vi"` correctly set** on `<html>` element in root layout
- **Decorative icons universally `aria-hidden="true"`** — clean and consistent throughout

---

## Recommended Next Steps

In priority order:

1. `$impeccable harden` — P0+P1 structural and ARIA fixes (skip link, nested main, h1, location input label, listbox headings, prefers-reduced-motion, focus ring token)
2. `$impeccable typeset` — Add `vietnamese` subset to Poppins font
3. `$impeccable clarify` — Replace HTML entities with direct UTF-8 text
4. `$impeccable adapt` — Fix 40px touch targets on hero controls + footer links
5. `$impeccable distill` — Redesign hero-metric stat section
6. `$impeccable extract` — Consolidate hard-coded hex values into design tokens
7. `$impeccable bolder` — Differentiate Blog and FeaturedJobs card sections
8. `$impeccable polish` — Final pass: carousel duplicate h2, arrow characters, section dots label
