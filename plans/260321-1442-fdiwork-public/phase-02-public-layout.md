# Phase 02: Public Layout + Homepage
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Tạo layout riêng cho web public (header, footer, navigation) và homepage với các section: hero banner, việc làm mới, top công ty.

## Implementation Steps
1. [ ] Tạo route group `(public)` với layout.tsx riêng
2. [ ] Build Header component: logo, navigation, search bar
3. [ ] Build Footer component: links, contact info, social
4. [ ] Build Hero section: search bar + trending tags
5. [ ] Build "Việc làm mới nhất" section: grid 6-8 jobs
6. [ ] Build "Top Employers" section: carousel logo (VIP/Premium)
7. [ ] Build "Ngành nghề" section: grid categories
8. [ ] Responsive cho mobile

## Files to Create
- `src/app/(public)/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/components/public/Header.tsx`
- `src/components/public/Footer.tsx`
- `src/components/public/HeroSection.tsx`
- `src/components/public/FeaturedJobs.tsx`
- `src/components/public/TopEmployers.tsx`
- `src/components/public/IndustryGrid.tsx`

## Test Criteria
- [ ] Homepage render đúng trên desktop và mobile
- [ ] Navigation hoạt động
- [ ] Dữ liệu từ database hiển thị đúng
- [ ] Logo VIP/Premium employers hiển thị ở Top Employers

---
Next Phase: phase-03-job-listing.md
