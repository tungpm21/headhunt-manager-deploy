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
Từ teal → blue professional (#005AFF primary, #FF7D55 accent, gradient hero #005aff→#001744)

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

## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|---------|
| 1 | CEO | Keep Phase 04 in scope | Mechanical | P2 (boil lakes) | Small effort, in blast radius | Defer P04 |
| 2 | CEO | Add mobile check as exit criterion per phase | Mechanical | P1 (completeness) | Zero-cost addition, catches regressions | Skip mobile |
| 3 | CEO | Defer SEO landing pages to TODOS | Mechanical | P3 (pragmatic) | Different task type, out of blast radius | Include |
| T1 | CEO | Teal→Blue brand change | **TASTE** | P6 | Subagent warns brand risk. User has domain context. | Stay teal |
