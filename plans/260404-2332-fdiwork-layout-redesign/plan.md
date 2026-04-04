<!-- /autoplan restore point: /c/Users/Admin/.gstack/projects/tungpm21-headhunt-manager-deploy/master-autoplan-restore-20260404-233624.md -->
# Plan: FDIWork Layout Redesign — VietnamWorks Style
Created: 2026-04-04
Status: 🔵 Under autoplan review — Phase 1 CEO complete
Branch: master

## Context

User muốn redesign public website FDIWork (headhunt-manager-deploy.vercel.app) để layout
giống VietnamWorks (vietnamworks.com). Hiện tại code backend (database, server actions) ổn,
chỉ cần thay đổi UI/layout của các public pages.

**Reference site:** https://www.vietnamworks.com/
**Current site:** https://headhunt-manager-deploy.vercel.app/

---

## Scope

Chỉ đụng vào **public-facing UI** — không đụng CRM dashboard, không đổi database schema,
không đổi server actions. Các file nằm trong:

- `src/app/(public)/` — public routes (trang chủ, /viec-lam, /cong-ty, /ung-tuyen)
- `src/components/` — components được dùng trong public pages
- `src/app/globals.css` — CSS variables / design tokens

---

## Mục tiêu

### 1. Color Palette & Design Tokens
Từ teal → Ocean Blue **#0077B6** (midpoint teal↔blue, distinct from VietnamWorks #005AFF)
- Primary: `#0077B6`
- Primary hover: `#005F91`
- Accent: `#00B4D8` (cyan highlight)
- Dark: `#023E8A`
- Hero gradient: `#0077B6 → #023E8A`
- Surface: `#F0F9FF` (light sky instead of teal surface)

> Premise gate confirmed by user 2026-04-04. QA exit criteria per phase: mobile 375px + H1 intact + build pass.

### 2. Homepage (/)
**Hiện tại:**
- Static hero với search bar đơn giản
- Stats banner (22+ jobs, 8+ companies)
- Featured jobs grid
- Employers grid
- Industry categories

**Mục tiêu (giống VietnamWorks):**
- Hero gradient background (blue→dark blue) với search bar nổi bật
- Carousel featured employers (rotating, có quote/CTA)
- Sticky header
- Pill-shaped buttons (border-radius: 9999px)
- Extended SEO footer với location/industry quicklinks

### 3. Header/Navigation
**Hiện tại:** Logo + Jobs/Companies links + Employer Login/Post Job buttons
**Mục tiêu:**
- Sticky on scroll
- Category dropdown (job categories)
- Pill buttons thay rectangular
- Rõ ràng candidate vs employer path

### 4. Job Listing (/viec-lam)
**Hiện tại:** Grid cards với logo, title, salary, location, employment type
**Mục tiêu:**
- Filter sidebar (industry, location, salary range, employment type)
- Sort options (newest, salary, relevance)
- Card layout chuẩn hơn với visual hierarchy tốt hơn
- Pagination

### 5. Company Listing (/cong-ty)
**Hiện tại:** Grid công ty với logo, tên, industry, credential badge
**Mục tiêu:**
- Search/filter by industry
- Company card với "X new jobs" badge (giống VietnamWorks)
- Better visual hierarchy

### 6. Footer
**Hiện tại:** 3-column dark footer cơ bản
**Mục tiêu:**
- Multi-column SEO footer
- Location-based job search links
- Industry-based job search links
- App download links placeholder
- Social media links

---

## Files Affected (Expected)

### Public Layout
- `src/app/(public)/layout.tsx` — sticky header, footer
- `src/app/(public)/page.tsx` — homepage

### Components
- `src/components/public/header.tsx` (or equivalent)
- `src/components/public/footer.tsx`
- `src/components/public/hero-section.tsx`
- `src/components/public/employer-carousel.tsx` (NEW)
- `src/components/public/job-card.tsx`
- `src/components/public/company-card.tsx`
- `src/components/public/search-bar.tsx`

### Pages
- `src/app/(public)/viec-lam/page.tsx`
- `src/app/(public)/cong-ty/page.tsx`

### Styles
- `src/app/globals.css` — update CSS variables

---

## Phases

| Phase | Name | Scope | Ưu tiên |
|:-----:|------|-------|:-------:|
| 01 | Design Tokens + Header/Footer | globals.css, layout.tsx | P0 |
| 02 | Homepage Redesign | page.tsx + hero, carousel, stats | P0 |
| 03 | Job Listing Page | /viec-lam + filters + cards | P1 |
| 04 | Company Listing Page | /cong-ty + search + cards | P1 |

---

## Design Spec — Critical Decisions (Phase 2 output)

### Carousel Spec (EmployerCarousel)
- Position: **After FeaturedJobs** (Hero → FeaturedJobs → EmployerCarousel → IndustryGrid)
- Rotation: 4s auto-rotate, **pause on hover/focus** (WCAG 2.2.2)
- Navigation: dot indicators + prev/next arrows always visible
- Mobile (<768px): collapse to 2-col static grid
- Threshold: only render if ≥2 employers exist
- Card content: logo + companyName + industry + `${jobCount} việc làm` button (drop "quote" — not in data model)
- No new DB field needed: `HomepageEmployer._count` → read `getHomepageData` employers which already has subscription tier

### Phase 01 Additions (from design audit)
- **CRITICAL: Audit and replace all hardcoded `teal-*` Tailwind classes** in:
  - `src/components/public/HeroSection.tsx` (text-teal-100/80, text-teal-300/60, bg-teal-600/30, etc.)
  - `src/components/public/PublicFooter.tsx` (text-teal-100, text-teal-200/*, border-teal-800)
  - `src/app/(public)/viec-lam/[slug]/page.tsx` — color token update (out-of-scope page but shares CSS vars)
- Replace with new Ocean Blue equivalents:
  - `text-teal-*` → `text-sky-*/text-blue-*` or new CSS vars `text-fdi-light`
  - `border-teal-*` → `border-sky-*`

### JobCard Improvements
- Metadata order: **Location BEFORE Salary** (FDI geography is primary filter)
- Company name: upgrade to `text-sm font-medium text-[var(--color-fdi-text-secondary)]` (from text-xs)

### Footer SEO Links — Hardcoded
```
Việc làm theo khu vực:
- /viec-lam?location=Hà+Nội
- /viec-lam?location=TP.+Hồ+Chí+Minh
- /viec-lam?location=Bình+Dương
- /viec-lam?location=Đồng+Nai
- /viec-lam?location=Hải+Phòng

Việc làm theo ngành:
- /viec-lam?industry=Kỹ+thuật+cơ+khí
- /viec-lam?industry=IT+%2F+Phần+mềm
- /viec-lam?industry=Kế+toán
- /viec-lam?industry=Sản+xuất
- /viec-lam?industry=Nhân+sự
```

### Filter Sidebar — Keep `<select>` Elements
Style upgrade only: new border-radius, focus ring in Ocean Blue, hover states.
No conversion to pill-chips (higher risk, less accessible).

### Header Category Dropdown — DEFERRED
Too complex (positioning, keyboard nav, mobile fallback). Move to Sprint 6 Growth phase.
Header stays: Logo + Jobs/Companies links + pill-buttons (Employer Login + Post Job).

---

## Out of Scope

- CRM dashboard (không đụng)
- Database schema (không đổi)
- Server actions / API routes (không đổi, chỉ đọc data)
- Employer dashboard (/employer/*)
- Auth flows
- Phase 05-07 của plan FDIWork gốc (vẫn pending)

---

## /autoplan Review — Phase 1: CEO Review

> Reviewer: Claude subagent (independent). Codex: unavailable → single-reviewer mode [subagent-only]

### Step 0A — Premise Challenge

| Premise | Status | Risk |
|---------|--------|------|
| P1: Blue palette + pill buttons + carousel = better UX | ASSUMED | HIGH — no user data cited |
| P2: Looking like VietnamWorks improves conversion | ASSUMED | HIGH — cargo-cult design risk |
| P3: Teal color is a liability vs blue | PLAUSIBLE | MEDIUM — teal is differentiated |
| P4: UI-only changes have no downstream cost | FALSE | HIGH — QA, SEO, mobile regression needed |

### Step 0B — Existing Code Leverage

| Sub-problem | Existing code | Action |
|-------------|---------------|--------|
| Color tokens | `globals.css` `--color-fdi-*` variables | Update values, no new infra |
| Header sticky | Already `fixed top-0` in `PublicHeader` | Extend pill-button style |
| Hero gradient | Already has `bg-gradient-to-br` | Change from teal to blue vars |
| Employer carousel | `TopEmployers` exists as static grid | New `EmployerCarousel` component needed |
| SEO footer | `PublicFooter` 3-col | Expand columns, add location/industry links |
| Job card polish | `JobCard` functional, good meta display | Style improvements only |
| Company card | `CompanyCard` → need to read | Add "N new jobs" badge |
| Filters sidebar | `JobFilters` fully functional | Style improvements only |

### Step 0C — Dream State

```
CURRENT                    THIS PLAN                  12-MONTH IDEAL
────────────────────       ────────────────────────   ────────────────────────────
Teal palette               Blue #005AFF + orange      FDI-specialized visual lang.
Static hero                Blue gradient + carousel   Personalized hero (by sector)
Basic 3-col footer         SEO multi-col footer       500+ landing pages by location
No differentiation         Looks like VietnamWorks    Clearly "the FDI specialist"
```

### Step 0D — Mode: SELECTIVE EXPANSION

Auto-approved in blast radius:
- Phase 04 (company listing) → stays in scope, small cost
- Mobile responsiveness check → added to each phase's exit criteria

Auto-deferred to TODOS.md:
- Core Web Vitals baseline → pre-ship check
- SEO tag audit → pre-ship check
- Analytics instrumentation → deferred Sprint 6

### Step 0E — Temporal Interrogation

- **Hour 1:** Change `globals.css` CSS vars. All public pages immediately shift color. Risk: dark teal footer becomes dark-blue — verify legibility.
- **Hour 3:** Pill buttons, sticky header polish. Low risk.
- **Hour 6+:** Employer carousel (new component) — requires client-side state/animation. Needs `use client`, potential LCP impact.
- **Day 2:** SEO footer expansion. Pure HTML, low risk. Structured data links help SEO.
- **Day 3-4:** Job listing card polish, filter style updates.
- **Day 5:** Company listing "N new jobs" badge — needs `_count` from `getPublicCompanies` server action (check if available).

### Step 0.5 — Dual Voices (CEO)

**CLAUDE SUBAGENT (CEO — strategic independence):**
> CRITICAL: Copying VietnamWorks visual identity may signal "cheap clone" to users rather than "FDI specialist." The plan is executing on a wrong strategy — differentiation should come from FDI content moat, not color mimicry. Carousel is a carousel pattern, not a VietnamWorks patent. The specific color change (teal→blue) is the only real strategic risk.

**CODEX:** Unavailable — single-reviewer mode [subagent-only]

```
CEO DUAL VOICES — CONSENSUS TABLE (single-reviewer):
═══════════════════════════════════════════════════════════════
  Dimension                           Claude  Codex  Consensus
  ──────────────────────────────────── ─────── ─────── ─────────
  1. Premises valid?                   RISK    N/A    [subagent-only]
  2. Right problem to solve?           PARTIAL N/A    [subagent-only]
  3. Scope calibration correct?        YES     N/A    [subagent-only]
  4. Alternatives sufficiently explored? NO    N/A    [subagent-only]
  5. Competitive/market risks covered? NO      N/A    [subagent-only]
  6. 6-month trajectory sound?         RISK    N/A    [subagent-only]
═══════════════════════════════════════════════════════════════
```

### Sections 1-10 Findings

**Section 1 — Strategy:** The UI-only constraint is well-scoped and reduces risk. The teal→blue change is the most debatable call; everything else (pill buttons, carousel, better cards) is universally good practice regardless of VietnamWorks.

**Section 2 — Error & Rescue Registry:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LCP regression from employer carousel | MEDIUM | HIGH | Use CSS-only or minimal JS auto-rotate; defer images |
| SEO ranking drop from H1/nav structure change | LOW | HIGH | Keep existing H1 text, add `aria-label`, no URL changes |
| Dark footer color shift on teal→blue | LOW | MEDIUM | Test contrast ratio after CSS var change |
| `getPublicCompanies` no `_count` for "N new jobs" | MEDIUM | LOW | Check action, add count if missing (small DB query) |
| Mobile breakpoint regression | MEDIUM | HIGH | Test each phase on 375px before merge |

**Section 3 — Scope:** 4 phases across ~10 files, all `src/components/public/` + `src/app/(public)/`. Blast radius is narrow and well-defined.

**Section 4 — Alternatives (auto-decided P3/P6):** SEO landing pages and employer trust page are valid but different tasks. Deferred to TODOS.md. Mobile audit added as exit criterion per phase.

**Section 5 — Risk:** Color change from teal→blue is a brand identity change. If FDIWork has brand recognition in its target market with teal, this is a real loss. User has context here we lack. → **TASTE DECISION T1**

**Section 6-10:** No additional blockers. Content remains Vietnamese throughout. No auth surface touched. No server actions modified.

### NOT in Scope (deferred)

- SEO landing pages per location/industry
- Employer trust/ROI page
- Mobile PWA optimization
- Analytics instrumentation
- Core Web Vitals baseline measurement

### CEO Completion Summary

| Item | Status |
|------|--------|
| Premise challenge | ✅ 4 premises identified, 2 risky |
| Existing code leverage | ✅ Mapped |
| Dream state | ✅ Written |
| Mode selected | SELECTIVE EXPANSION |
| Dual voices | [subagent-only] — Codex unavailable |
| Critical gaps flagged | 1 taste decision on brand identity |

---

---

## /autoplan Review — Phase 2: Design Review

> Reviewer: Claude subagent [subagent-only]. Codex unavailable.

**Design Litmus Scorecard:**

| Dimension | Score | Key Finding |
|-----------|-------|-------------|
| 1. Information hierarchy | 6/10 | Carousel position was unspecified (fixed: after FeaturedJobs) |
| 2. Missing interaction states | 4/10 | Carousel spec was entirely missing (fixed: 4s/pause/dots/mobile grid) |
| 3. User journey | 6/10 | Stats "8+ companies" contradicts carousel (mitigated: threshold ≥2) |
| 4. Specificity | 5/10 | "Better hierarchy" replaced with concrete decisions |
| 5. Carousel spec | 3/10 → 9/10 | CRITICAL gaps resolved via auto-decisions |
| 6. Implementer traps | 4/10 → 8/10 | Hardcoded teal classes, footer column count, select vs chips — all resolved |
| 7. JobCard hierarchy | 6/10 → 8/10 | Location before Salary, company name weight upgraded |

**Critical auto-fixes applied:**
- Carousel position locked: Hero → FeaturedJobs → EmployerCarousel → IndustryGrid
- Carousel spec fully written (4s, pause hover/focus, dots, grid <768px)
- "Quote" field dropped — not in data model; use jobCount CTA instead
- Hardcoded `teal-*` audit added as Phase 01 mandatory task
- `/viec-lam/[slug]` color token update added to Phase 01
- JobCard: Location before Salary; company name → `text-sm font-medium`
- Footer SEO links: hardcoded static list (P5)
- Filter sidebar: keep `<select>`, pill-styled
- Header category dropdown: DEFERRED to Sprint 6

---

## /autoplan Review — Phase 3: Engineering Review

> Reviewer: Claude subagent [subagent-only]. Codex unavailable.

### Architecture Diagram

```
src/app/(public)/
├── layout.tsx
│   ├── PublicHeader.tsx  [pill buttons: rounded-full on ALL primary CTAs]
│   └── PublicFooter.tsx  [5-col: About+Candidate+Employer+KhuVuc+Nganh]
│                          [md:grid-cols-3 lg:grid-cols-5]
├── page.tsx (Homepage)
│   ├── HeroSection.tsx   [use client] [gradient #0077B6→via-[#005A9E]→#023E8A]
│   │                      [replace all teal-* Tailwind classes]
│   ├── FeaturedJobs.tsx  → JobCard.tsx [Location→Salary, company text-sm font-medium]
│   ├── EmployerCarousel.tsx [NEW, use client, 4s rotate, WCAG 2.2.2, grid<768px]
│   └── IndustryGrid.tsx
├── viec-lam/
│   ├── page.tsx → JobFilters.tsx [select + pill-style] + JobCard[]
│   └── [slug]/page.tsx  [color token update only, + rounded-full CTAs]
└── cong-ty/
    ├── page.tsx → CompanyCard.tsx [jobCount badge: verify/style]
    └── [slug]/page.tsx

src/lib/public-actions.ts
└── getHomepageData()  [ADD _count.jobPostings with scoped where clause]
    HomepageEmployer   [ADD _count?: { jobPostings: number } as optional]

src/app/globals.css
└── @theme inline {}   [update 5 --color-fdi-* tokens]
```

### Phase 01 Task List (complete)

1. `globals.css`: Update `--color-fdi-primary: #0077B6`, `--color-fdi-primary-hover: #005F91`, `--color-fdi-accent: #00B4D8`, `--color-fdi-dark: #023E8A`, `--color-fdi-surface: #F0F9FF`
2. `HeroSection.tsx`: Replace `via-[#115e59]` → `via-[#005A9E]` (hardcoded teal midpoint in gradient)
3. `HeroSection.tsx`: Replace all `teal-*` classes → `sky-*` / `blue-*` equivalents
4. `PublicFooter.tsx`: Replace all `teal-*` classes → `sky-*` / `blue-*` equivalents
5. `PublicFooter.tsx`: Expand 3→5 columns with location + industry SEO links; use `md:grid-cols-3 lg:grid-cols-5`
6. `PublicHeader.tsx`: `rounded-full` on CTA buttons
7. Also apply `rounded-full` to: `HeroSection.tsx` search button (line 93), `FeaturedJobs.tsx` mobile CTA, `viec-lam/[slug]/page.tsx` apply CTA

### Phase 02 Task List (complete)

8. `public-actions.ts`: Add `_count: { select: { jobPostings: { where: { status: "APPROVED", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } } } }` to `getHomepageData()` Employer query
9. `public-actions.ts`: Add `_count?: { jobPostings: number }` to `HomepageEmployer` type
10. Create `src/components/public/EmployerCarousel.tsx` with:
    - `if (employers.length < 2) return null` guard (or render static if 1)
    - `useEffect` timer: `const id = setInterval(() => ..., 4000); return () => clearInterval(id)` 
    - `activeIndex % employers.length` guard for safe indexing
    - `onMouseEnter/Leave` + `onFocus/Blur` on outer `<section>` for WCAG 2.2.2
    - `aria-live="off"`, `aria-label="Nhà tuyển dụng nổi bật"` on section
    - Dot indicators + prev/next arrow buttons
    - Mobile: `block md:hidden` for 2-col grid, `hidden md:block` for carousel
    - Card: `next/image` with `width={64} height={64}` (not raw `<img>`) 
11. `page.tsx`: Section order → HeroSection, FeaturedJobs, EmployerCarousel, IndustryGrid (replace TopEmployers)
12. `HeroSection.tsx`: Update gradient vars

### Phase 03 Task List (complete)

13. `JobCard.tsx`: Move Location badge before Salary badge in JSX
14. `JobCard.tsx`: Company name → `text-sm font-medium` (from `text-xs`)
15. `JobFilters.tsx`: Add Ocean Blue focus ring + pill-radius to `<select>` elements

### Phase 04 Task List (complete)

16. `CompanyCard.tsx`: Verify `_count.jobPostings` or similar exists; style jobCount badge consistently

### Failure Modes Registry

| Risk | Severity | Mitigation |
|------|----------|------------|
| EmployerCarousel: empty array crash | HIGH | `if (length < 2) return null` |
| EmployerCarousel: index out of bounds after ISR revalidation | MEDIUM | `activeIndex % length` guard |
| Hero gradient: teal midpoint remains after token change | HIGH | Replace `via-[#115e59]` → `via-[#005A9E]` |
| Footer 5-col compressed at 768px | MEDIUM | `md:grid-cols-3 lg:grid-cols-5` |
| `_count` missing → NaN/undefined in carousel CTA | HIGH | Add to query before implementing carousel |
| teal-* in employer portal accidentally changed | HIGH | Scope boundary: only `src/components/public/` + `src/app/(public)/` |
| Timer leak on unmount | MEDIUM | `return () => clearInterval(id)` cleanup |

### Deferred to TODOS.md

- `getPublicJobs` distinct filter queries: add `unstable_cache` when traffic scales
- Add Vitest unit test for EmployerCarousel timer (no test suite currently exists)
- `<img>` → `next/image` migration for existing `CompanyCard`, `JobCard` logos (pre-existing tech debt, not introduced by this plan)
- Dark mode support for `--color-fdi-*` tokens in `.dark {}` block

---

## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|---------|
| 1 | CEO | Keep Phase 04 in scope | Mechanical | P2 (boil lakes) | Small effort, in blast radius | Defer P04 |
| 2 | CEO | Add mobile check as exit criterion per phase | Mechanical | P1 (completeness) | Zero-cost addition, catches regressions | Skip mobile |
| 3 | CEO | Defer SEO landing pages to TODOS | Mechanical | P3 (pragmatic) | Different task type, out of blast radius | Include |
| T1 | CEO | Teal→Blue brand change | **TASTE** | P6 | Subagent warns brand risk. User chose Ocean Blue #0077B6. | Stay teal |
| 4 | CEO | Header category dropdown | Mechanical | P5 (explicit) | Too complex for Phase 01. Deferred to Sprint 6. | Include in Phase 01 |
| 5 | CEO | Footer SEO links: static vs dynamic | Mechanical | P5 (explicit) | Hardcoded — 5 locations + 5 industries. Zero DB queries. | Dynamic query |
| 6 | Design | Carousel position in homepage | Mechanical | P1 (completeness) | Hero → FeaturedJobs → Carousel → IndustryGrid | Carousel above jobs |
| 7 | Design | Carousel spec (rotation, WCAG, mobile) | Mechanical | P1 (completeness) | 4s auto, pause hover, dots nav, grid on mobile | Unspecified |
| 8 | Design | Carousel "quote" field doesn't exist | Mechanical | P4 (DRY) | Drop quote, use existing jobCount CTA | Add DB field |
| 9 | Design | Hardcoded teal-* Tailwind classes | Mechanical | P1 (completeness) | Add explicit audit+replace task to Phase 01 | Assume CSS vars cover it |
| 10 | Design | /viec-lam/[slug] color inconsistency | Mechanical | P1 (completeness) | Add token update to Phase 01 | Keep out of scope |
| 11 | Design | JobCard: Salary before Location | Mechanical | P1 (completeness) | Reorder: Location → Salary (FDI geo-first behavior) | Keep current order |
| 12 | Design | Company name visual weight in JobCard | Mechanical | P1 (completeness) | Upgrade to text-sm font-medium | Keep text-xs |
| 13 | Design | Filter: select vs pill-chip | Mechanical | P3/P5 | Keep select, pill-style only. Less risk, more accessible. | Pill chips |
| 14 | Design | "N new jobs" badge already exists | Mechanical | P4 (DRY) | Confirm styling only — no new logic needed | New feature |
| 15 | Eng | `_count.jobPostings` missing from getHomepageData() | Mechanical | P1 | Add to select with scoped where; update HomepageEmployer type as optional | Skip |
| 16 | Eng | `via-[#115e59]` hardcoded teal midpoint in hero gradient | Mechanical | P1 | Replace with `via-[#005A9E]` | Keep as-is |
| 17 | Eng | EmployerCarousel empty array crash | Mechanical | P1 | Guard: `if (employers.length < 2) return null` | Skip |
| 18 | Eng | teal-* scope: exclude employer portal files | Mechanical | P1 | Scope: only `src/components/public/` + `src/app/(public)/` | |
| 19 | Eng | rounded-full inconsistency across public CTAs | Mechanical | P1 | Apply rounded-full to ALL public primary CTAs | Header only |
| 20 | Eng | Footer 5-col compresses at 768px | Mechanical | P3 | Use `md:grid-cols-3 lg:grid-cols-5` | Equal columns |
| 21 | Eng | Timer cleanup in carousel | Mechanical | P1 | `return () => clearInterval(id)` in useEffect | Ref-based |
| 22 | Eng | WCAG 2.2.2 needs onFocus/onBlur not just hover | Mechanical | P1 | Add both handlers to outer section element | Mouse only |

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | clean | 1 taste (brand color — user resolved), 3 auto-decided |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | Codex unavailable — single-reviewer mode |
| Eng Review | `/plan-eng-review` | Architecture & tests | 1 | clean | 11 issues found, all auto-fixed |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clean | 14 issues found, 4 CRITICAL auto-fixed |
| DX Review | `/plan-devex-review` | Developer experience | 0 | skipped | No developer-facing scope detected |

**VERDICT:** APPROVED by user 2026-04-04. All critical gaps resolved. Ready to implement Phase 01.
