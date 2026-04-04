# Plan: FDIWork Employer-Centric Homepage & Company Profile Redesign

**Branch:** master  
**Date:** 2026-04-05  
**Status:** REVIEWED — awaiting approval  

---

## Problem Statement

The current FDIWork homepage looks like a job board. It is not. The product is a B2B
relationship-driven platform where client FDI companies pay for visibility. The current
layout buries employers in small carousel cards and leads with job listings — backwards
for the actual business model.

The user's exact words: "Web thiên hướng để PR cho các công ty hơn là dành cho người
dùng vào tìm việc, vì tôi làm về các công ty FDI từ các mối quan hệ cá nhân."

Employers are the customers. Job seekers are secondary.

---

## Current State

Homepage order:
1. Hero (search bar)
2. FeaturedJobs (8 cards, 4-col grid) — WRONG PRIORITY
3. EmployerCarousel (4-up small cards, auto-rotate) — buried
4. IndustryGrid

Company profile page:
- Basic card layout, no cover image
- No visual differentiation between tiers
- Logo is 64×64px, barely visible

Employer model (`prisma/schema.prisma:410`):
- No `coverImage` field
- Has `showBanner Boolean` on Subscription model (line 447) — already designed for this

---

## Target State

### Homepage (top to bottom)
1. **HeroSection** — kept as-is
2. **EmployerBannerCarousel** — NEW: full-width rotating banners. Shows employers where
   `subscription.showBanner = true`. Uses employer `coverImage`.
   Fallback: branded gradient (`from-[--color-fdi-dark] to-[--color-fdi-primary]`) with
   logo + company name centered. CTA: "Xem công ty" → `/cong-ty/[slug]`.
   Height: `h-[280px] sm:h-[360px]`. Guard: hidden if 0 qualifying employers.
   Auto-rotate: 5s interval. Pause on hover (WCAG 2.2.2).
3. **TopEmployers** — REWORKED: larger cards, sorted by tier (VIP → Premium → Standard →
   Basic → no-sub), ALL active employers (no showLogo filter), max 24.
   Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`.
   Tier badge: VIP=`amber-500`, PREMIUM=`sky-500`, STANDARD=`slate-400`, BASIC=`gray-400`.
4. **FeaturedJobs** — moved to bottom
5. **IndustryGrid** — unchanged

### Company Profile Page (`/cong-ty/[slug]`)
- **Cover image** — full-width, `h-48 sm:h-64 object-cover`, gradient fallback
- **Logo** — absolute `bottom-0 left-6 translate-y-1/2`, `h-20 w-20`, `ring-4 ring-white`
- **Company name + tier badge** below cover
- **Main area** — description + job listings (same 2-col grid)
- **Sidebar** — contact info (unchanged)

### Database
- Add `coverImage String?` to Employer model
- Migration: `prisma migrate dev --name add-employer-cover-image`

### Employer Dashboard
- Add `coverImage` URL input field (same UX as logo)
- Update `updateCompanyProfileAction` to persist it

---

## Scope

### In-scope (8 files)
1. `prisma/schema.prisma` — add `coverImage String?` to Employer
2. `src/lib/public-actions.ts` — add bannerEmployers query; topEmployers: no take limit,
   include coverImage; JS tier sort (VIP=0, PREMIUM=1, STANDARD=2, BASIC=3, none=4);
   update `HomepageEmployer` type + `CompanyProfile` type
3. `src/lib/employer-actions.ts` — add coverImage to updateCompanyProfileAction
4. `src/components/public/EmployerBannerCarousel.tsx` — NEW
5. `src/components/public/TopEmployers.tsx` — full rework
6. `src/app/(public)/page.tsx` — reorder sections, pass bannerEmployers
7. `src/app/(public)/cong-ty/[slug]/page.tsx` — cover image section
8. `src/app/(employer)/employer/(portal)/company/page.tsx` — coverImage URL input

### Out-of-scope (defer)
- File upload for coverImage (use URL, consistent with logo)
- Tier upgrade CTA on employer dashboard
- Analytics ("X views this week")
- Admin cover image upload from dashboard

---

## Technical Decisions

### Tier sort order
```typescript
const TIER_ORDER: Record<string, number> = {
  VIP: 0, PREMIUM: 1, STANDARD: 2, BASIC: 3
};
// Sort in JS after fetching all active employers (≤100 expected)
employers.sort((a, b) => {
  const aT = a.subscription?.tier ? TIER_ORDER[a.subscription.tier] ?? 4 : 4;
  const bT = b.subscription?.tier ? TIER_ORDER[b.subscription.tier] ?? 4 : 4;
  return aT - bT;
});
```

### Banner carousel — data separation
```
getHomepageData() Promise.all:
  - bannerEmployers: subscription.showBanner=true, status=ACTIVE (separate query)
  - topEmployers: all status=ACTIVE, no take limit, JS sort, take first 24
```

### Banner fallback
If `employer.coverImage` is null: CSS gradient `from-[var(--color-fdi-dark)] to-[var(--color-fdi-primary)]`
with company logo (or Building2 icon) centered + company name + industry tag.

### Tier badge colors
| Tier | Color | Tailwind |
|------|-------|----------|
| VIP | Amber | `bg-amber-100 text-amber-700` |
| PREMIUM | Sky | `bg-sky-100 text-sky-700` |
| STANDARD | Slate | `bg-slate-100 text-slate-600` |
| BASIC | Gray | `bg-gray-100 text-gray-500` |

---

## Files Modified

| File | Change Type |
|------|------------|
| `prisma/schema.prisma` | Add field |
| `src/lib/public-actions.ts` | Query + type updates |
| `src/lib/employer-actions.ts` | Add coverImage field |
| `src/components/public/EmployerBannerCarousel.tsx` | NEW |
| `src/components/public/TopEmployers.tsx` | Full rework |
| `src/app/(public)/page.tsx` | Section reorder |
| `src/app/(public)/cong-ty/[slug]/page.tsx` | Cover image section |
| `src/app/(employer)/employer/(portal)/company/page.tsx` | URL input |

---

## QA Exit Criteria
- [ ] Homepage: Hero → BannerCarousel (hidden if no showBanner employers) → TopEmployers → FeaturedJobs → IndustryGrid
- [ ] BannerCarousel: auto-rotates 5s, pauses on hover, gradient fallback when no coverImage
- [ ] TopEmployers: VIP first, tier badges visible, 2/3/4/6 responsive grid, click → company profile
- [ ] Company profile: cover image (or gradient fallback), logo overlaid at bottom-left
- [ ] Employer dashboard: coverImage URL field saves, shows preview
- [ ] `tsc --noEmit` passes
- [ ] Vercel deploy succeeds

---

## GSTACK REVIEW REPORT

| Review | Status | Key Findings |
|--------|--------|-------------|
| CEO Review | PASS | Premises valid. Scope approved. BannerCarousel serves existing VIP clients. |
| Design Review | PASS with additions | Tier badge colors, banner height, TopEmployers grid cols added to plan |
| Eng Review | PASS with fixes | bannerEmployers needs separate query; topEmployers: remove take limit, JS sort |

**VERDICT:** APPROVED for implementation. 8 files, ~30 min CC effort. No migration blockers.
