# Impeccable Audit — FDIWork All Public Pages

**Date:** 2026-04-26
**URL audited:** https://fdiwork.vercel.app/
**Branch:** `codex/fdiwork-ux-preview-20260425`
**Homepage audit:** `docs/reports/audit_2026-04-26_homepage-a11y-impeccable.md`
**Task file:** `docs/tasks/all-pages-impeccable-fixes-2026-04-26.md`
**Scope:** All public pages excluding `/` (already audited)

---

## Scorecard

| Page | A11y | Perf | Responsive | Theming | Anti-patterns | Total |
|------|------|------|------------|---------|---------------|-------|
| `/viec-lam` | 2/4 | 3/4 | 3/4 | 2/4 | 3/4 | **13/20** |
| `/viec-lam/[slug]` | 2/4 | 3/4 | 3/4 | 2/4 | 3/4 | **13/20** |
| `/cong-ty` | 2/4 | 3/4 | 3/4 | 3/4 | 2/4 | **13/20** |
| `/cong-ty/[slug]` | 2/4 | 3/4 | 3/4 | 2/4 | 3/4 | **13/20** |
| `/chia-se` | 2/4 | 3/4 | 4/4 | 2/4 | 1/4 | **12/20** |
| `/chia-se/[slug]` | 2/4 | 2/4 | 4/4 | 2/4 | 2/4 | **12/20** |
| `/lien-he` | 2/4 | 3/4 | 3/4 | 3/4 | 2/4 | **13/20** |
| `/ung-tuyen` | 3/4 | 3/4 | 3/4 | 3/4 | 3/4 | **15/20** |
| `/ung-tuyen/thanh-cong` | 2/4 | 4/4 | 3/4 | 2/4 | 2/4 | **13/20** |

**Average across all pages: 13.2/20** — Acceptable. All pages have fixable issues, no pages are fundamentally broken (except Pagination routing, see P0).

---

## Cross-cutting Issues (affect all pages)

These appear across every public page and should be fixed once, globally.

### [P1-X1] Skip link target `#home-hero` only exists on the homepage
**File:** `src/app/(public)/layout.tsx` — the `<a href="#home-hero">` skip link
**Impact:** On every page except `/`, keyboard users who activate the skip link (Tab → Enter) have focus land on a non-existent anchor. The browser silently ignores it. The skip link is broken for 9 of 10 public pages.
**Fix:** Change `href="#home-hero"` to `href="#main-content"`. Add `id="main-content"` to the first meaningful content element on each page (see Task 1.1).

### [P2-X2] Global `*` transition applies to every DOM element
**File:** `src/app/globals.css:105-108`
**Impact:** `background-color`, `border-color`, and `color` transitions fire on every element in every state change. Form focus/hover, disabled states, error states — all get an unintended 240ms delay. Creates janky UX on interactive forms. (Note: `prefers-reduced-motion` guard was already added in Wave 2.1 of homepage fixes.)
**Fix:** Remove the `*` rule entirely; apply `transition-colors duration-[240ms]` only on elements that need it (buttons, links, input borders). Or scope to `[data-theme-transition] *` for theme toggle only.

### [P2-X3] Focus ring bleeds from public layout CSS variable override
**File:** `src/app/(public)/layout.tsx` — `style={{ '--color-primary': 'var(--color-fdi-primary)' }}` on `<main>`
**Status:** The homepage fix (Task 3.1) overrides `--color-primary` inside `<main>`. But `<PublicHeader>` is a sibling of `<main>`, not a child — focus rings on header nav items still show admin purple `#6366F1`.
**Fix:** Move the CSS variable override to a wrapper element that contains both `<PublicHeader>` and `<main>`, or override at a higher scope. See Task 1.2.

---

## /viec-lam — Job Listing

### Score: 13/20

### Findings

**[P1] Skip link broken** — Cross-cutting issue P1-X1

**[P1] Pagination buttons are `<button>` not `<Link>`**
- **File:** `src/components/public/Pagination.tsx:43-79`
- **Impact:** Page numbers use `router.push()` inside `<button>`. Middle-click, Cmd+click (open in new tab), right-click→open in new tab, and search engine crawling all fail. Pagination pages are not shareable or bookmarkable. Screen readers lose the "link" semantic cue.
- **WCAG:** 2.4.5 Multiple Ways (Level AA)
- **Fix:** Replace `<button onClick={() => router.push(...)}>` with `<Link href={buildPageUrl(page)}>` for each page number

**[P1] Mobile filter `<summary>` label is always "Mở" — never updates to "Đóng"**
- **File:** `src/app/(public)/viec-lam/page.tsx:98`
- **Impact:** When the `<details>` filter is open, the toggle label still reads "Mở" (Open). The disclosure triangle is also removed via `list-none` with no CSS replacement. State is visually ambiguous and AT announces "Mở" when filter is already open.
- **Fix:** Use a client component with controlled open state and toggle label; or use CSS `:is(details[open]) .filter-label { content: 'Đóng'; }` with a class on the text span

**[P2] `<SearchX>` empty-state icon missing `aria-hidden`**
- **File:** `src/app/(public)/viec-lam/page.tsx:134`
- **Fix:** Add `aria-hidden="true"` to the icon

**[P2] `<Filter>` icon in JobFilters header missing `aria-hidden`**
- **File:** `src/components/public/JobFilters.tsx:71`
- **Fix:** Add `aria-hidden="true"` to the icon

**[P2] Hard-coded hex colors in `JobCard` bypass tokens — 8 instances**
- **File:** `src/components/public/JobCard.tsx:40,53,83,91,102,111`
- **Hardcoded values:** `#DCE4EA`, `#BFD6DF`, `#FFFFFB`, `#687789`, `#E9F5F7`, `#0A6F9D`, `#8A98A8`, `#E8F5F7`
- **Token equivalents:** `#FFFFFB` = `var(--color-fdi-paper)`, `#0A6F9D` = `var(--color-fdi-primary)`, `#E9F5F7/E8F5F7` ≈ `var(--color-fdi-surface)`, `#687789/8A98A8` ≈ `var(--color-fdi-text-secondary)`
- **Fix:** Map to design tokens; add `--color-fdi-border: #DCE4EA` for border values

**[P3] `JobCard` focus ring uses `--color-fdi-accent-orange` instead of primary**
- **File:** `src/components/public/JobCard.tsx:36`
- **Fix:** Change to `focus-visible:ring-[var(--color-fdi-primary)]/40`

**[P3] Sort `<select>` focus ring at 20% opacity — imperceptible**
- **File:** `src/components/public/JobFilters.tsx:150`
- **Fix:** Change `focus-visible:ring-[var(--color-fdi-primary)]/20` to `/60`

### Positive Findings
- Correct heading hierarchy: `<h1>` + `<h3>` in cards, no skipped levels
- Search form correctly uses `role="search"` and `aria-label`
- `<aside>` landmark for filter sidebar
- `role="tablist"` / `role="tab"` on pagination with `aria-label` on Prev/Next
- 44px touch targets throughout (`min-h-11`)
- Server-side filtering via `searchParams` — shareable URLs
- `prefers-reduced-motion` respected globally

---

## /viec-lam/[slug] — Job Detail

### Score: 13/20

### Findings

**[P1] Breadcrumb is not a `<nav>` landmark**
- **File:** `src/app/(public)/viec-lam/[slug]/page.tsx:129-145`
- **Impact:** Plain `<div>` wrapping the breadcrumb. AT cannot identify as navigation. No `aria-current="page"` on final breadcrumb item.
- **Fix:**
  ```tsx
  <nav aria-label="Breadcrumb">
    <ol className="flex items-center gap-2 ...">
      <li><Link href="/viec-lam">Việc làm</Link></li>
      <li aria-current="page">{job.title}</li>
    </ol>
  </nav>
  ```

**[P1] Sidebar `<h3>` headings with no `<h2>` parent — broken hierarchy**
- **File:** `src/app/(public)/viec-lam/[slug]/page.tsx:284-285,354-355`
- **Impact:** Sidebar uses `<h3>` ("Thông tin công ty", "Việc làm gợi ý") directly after `<h1>` with no intervening `<h2>`. Screen reader heading outline breaks.
- **Fix:** Change sidebar `<h3>` to `<h2>`, or wrap two-column layout in `<section>` elements with their own heading hierarchy

**[P1] Hard-coded `#0077B6` for language badge**
- **File:** `src/app/(public)/viec-lam/[slug]/page.tsx:222-223`
- **Value:** `bg-[#0077B6]/10 text-[#0077B6]` — close to but not equal to `--color-fdi-primary`
- **Fix:** `bg-[var(--color-fdi-primary)]/10 text-[var(--color-fdi-primary)]`

**[P1] Raw `→` in "Xem thêm việc làm" link**
- **File:** `src/app/(public)/viec-lam/[slug]/page.tsx:388`
- **Fix:** Replace with `<ArrowRight className="inline h-4 w-4" aria-hidden="true" />` (Lucide already imported)

**[P2] Sub-10px label text — below WCAG minimum**
- **File:** `src/app/(public)/viec-lam/[slug]/page.tsx:202`
- **Current:** `text-[10px]` on info grid labels ("Khu vực", "Hình thức", etc.)
- **Fix:** Change to `text-xs` (12px)

**[P2] `prose prose-sm` on plain-text `ContentSection` — dead CSS**
- **File:** `src/app/(public)/viec-lam/[slug]/page.tsx:446`
- **Impact:** `toPlainJobContent()` returns plain text with `\n` breaks rendered via `whitespace-pre-line`. The `prose` plugin targets HTML elements (`p`, `li`, `ul`) that don't exist in plain text — all prose styles are dead weight, wasting the typography plugin bundle.
- **Fix:** Remove `prose prose-sm` from `ContentSection` and style the container directly

**[P2] `LogoImage` over-fetches: `width={160} height={160}` but rendered at 56×56**
- **File:** `src/app/(public)/viec-lam/[slug]/page.tsx:155-159`
- **Fix:** Pass `sizes="56px"` and `width={112} height={112}` for Retina accuracy

**[P3] Badge colors use raw Tailwind (`emerald-100`, `orange-100`) — not FDI tokens**
- **File:** `src/app/(public)/viec-lam/[slug]/page.tsx:236-246`

**[P3] `cursor-pointer` on `<Link>` / `<a>` is redundant** — remove from 7+ occurrences

### Positive Findings
- `<h1>` job title → `<h2>` content sections → no skipped levels
- CTA "Ứng tuyển ngay" has `min-h-11`, correct focus ring, proper link semantics
- `LogoImage` has `Building2` fallback icon for broken images
- External links use `rel="noopener noreferrer"` + `target="_blank"`
- `generateMetadata` provides full OpenGraph + Twitter cards
- `lg:sticky lg:top-24` sidebar — excellent scrolling UX

---

## /cong-ty — Company Listing

### Score: 13/20

### Findings

**[P0] Pagination hardcodes `/viec-lam` path — broken on `/cong-ty`**
- **File:** `src/components/public/Pagination.tsx:24`
- **Current code:** `router.push(\`/viec-lam?${params.toString()}\`)`
- **Impact:** Clicking any page number on the company listing page navigates to the **job listing** page. Pagination is completely non-functional on `/cong-ty`. This is the highest-priority bug in the entire audit.
- **Fix:** Add a `basePath` prop to `Pagination` (default `"/viec-lam"`). Pass `basePath="/cong-ty"` from the company listing page.

**[P1] Side-stripe border on VIP/Premium cards — banned anti-pattern**
- **File:** `src/components/public/CompanyCard.tsx:27`
- **Current:** `border-l-[3px] border-l-amber-400` on Premium/VIP cards
- **Impact:** This is the explicit banned "side-stripe border > 1px as colored accent on cards" pattern from the impeccable design laws.
- **Fix:** Replace with a top border (`border-t-2 border-amber-400/60`) or a `ring-1 ring-amber-400/40` — the Crown icon badge already present communicates tier status without the stripe

**[P1] H1 → H3 heading skip — no H2 for card grid section**
- **File:** `src/app/(public)/cong-ty/page.tsx` — H1 "Doanh nghiệp FDI" then `CompanyCard.tsx:62` renders H3 for company names
- **Fix:** Add `<h2 className="sr-only">Danh sách công ty</h2>` above the card grid, or demote card headings to `<p>` since H1 already names the page

**[P1] No company search/filter UI — params wired but no UI**
- **File:** `src/app/(public)/cong-ty/page.tsx:18-22`
- **Impact:** `q` and `industry` searchParams are wired to `getPublicCompanies` but there is no `<input>` or filter on the page. Users cannot filter companies without manually editing the URL.
- **Fix:** Add a `CompanyFilters` component with a text input (`name="q"`) and industry `<select>`, submitting as a GET form

**[P2] Cover images have empty `alt=""` — inconsistent with logo**
- **File:** `src/components/public/CompanyCard.tsx:36`
- **Fix:** Either `alt={\`${company.companyName} cover\`}` or verify `alt=""` is intentional and document it

**[P2] Hard-coded `#005A9E` in fallback gradient**
- **File:** `src/components/public/CompanyCard.tsx:44`, `src/app/(public)/cong-ty/[slug]/page.tsx:126`
- **Fix:** Add `--color-fdi-navy-mid: #005A9E` token or use `via-[var(--color-fdi-navy)]` if close enough

**[P2] Tier badge colors use raw Tailwind — not FDI tokens**
- **Files:** `src/components/public/CompanyCard.tsx:8-12`, `src/app/(public)/cong-ty/[slug]/page.tsx:17-22`
- **Colors:** `bg-amber-100 text-amber-700`, `bg-purple-100 text-purple-700`, `bg-blue-100 text-blue-700`
- **Fix:** Define `--color-fdi-tier-*` tokens or at minimum use a shared `TIER_BADGE_STYLES` map (currently duplicated in 2 files)

**[P3] `bg-gray-50/50` instead of `var(--color-fdi-mist)`**
- **Files:** `src/app/(public)/cong-ty/page.tsx:25`, `src/app/(public)/cong-ty/[slug]/page.tsx:88`
- **Fix:** Replace with `bg-[var(--color-fdi-mist)]`

**[P3] `TIER_BADGE_STYLES` map duplicated in 2 files**
- **Fix:** Extract to `src/lib/company-utils.ts` or `src/components/public/company-tier.ts`

### Positive Findings
- `imagePriority={index < 3}` for above-fold LCP images
- Card hover uses composited transform only — no layout property animation
- Pagination `aria-label` on Prev/Next buttons, `h-11 w-11` touch targets
- `min-h-11` on header search

---

## /cong-ty/[slug] — Company Detail

### Score: 13/20

### Findings

**[P1] Breadcrumb not a `<nav>` landmark**
- **File:** `src/app/(public)/cong-ty/[slug]/page.tsx:90-106`
- **Fix:** Same pattern as job detail — wrap in `<nav aria-label="Breadcrumb"><ol>...<li aria-current="page">...</li></ol></nav>`

**[P1] `JobCard` 6 hard-coded hex values — worst offender**
- **File:** `src/components/public/JobCard.tsx:40,53,83,91,102,111`
- Same issue as listed under `/viec-lam` — shared component, same fix

**[P1] External website link opens new tab with no SR announcement**
- **File:** `src/app/(public)/cong-ty/[slug]/page.tsx:244-251`
- **Fix:** Add `aria-label={\`${company.websiteUrl} (mở trong tab mới)\`}` or append `<span className="sr-only"> (mở trong tab mới)</span>`

**[P2] `LogoImage` `width={160}height={160}` — mismatched to rendered sizes**
- **File:** `src/components/public/LogoImage.tsx:27-28`
- In `CompanyCard` logo renders at 64×64; in detail at ~96px. Always fetching 160×160.
- **Fix:** Accept `width` and `height` as props from the parent, or use `fill` with `aspect-ratio: 1` container

**[P2] Missing `md:` breakpoint — abrupt column layout jump from mobile to desktop**
- **File:** `src/app/(public)/cong-ty/[slug]/page.tsx:174`
- **Current:** `flex-col` → `lg:flex-row` (no `md:` intermediate)
- **Fix:** Add `md:flex-row md:items-start` + `md:w-64 lg:w-80` for smoother tablet layout

**[P2] Logo `-mt-14` overlap can clip on narrow viewports (< 360px)**
- **File:** `src/app/(public)/cong-ty/[slug]/page.tsx:136`
- **Fix:** `sm:-mt-14 -mt-10`

**[P2] `text-[10px]` sidebar labels — below WCAG minimum + contrast issue**
- **File:** `src/app/(public)/cong-ty/[slug]/page.tsx:240`
- **Contrast:** `#627086` on white at 10px ≈ 3.8:1 — fails WCAG AA 4.5:1 for small text
- **Fix:** Change to `text-xs` (12px); contrast passes AA at 12px

**[P2] Info sidebar uses `<div>/<p>` instead of `<dl>/<dt>/<dd>` semantics**
- **File:** `src/app/(public)/cong-ty/[slug]/page.tsx:234-258`
- **Fix:** Wrap in `<dl>` and replace label `<p>` with `<dt>`, value `<p>` with `<dd>`

**[P3] `bg-white/70` on jobs container — pointless semi-transparency**
- **File:** `src/app/(public)/cong-ty/[slug]/page.tsx:204`
- The parent background is also near-white; the 70% opacity serves no visual purpose.
- **Fix:** Change to `bg-white` or remove wrapper entirely

### Positive Findings
- H1 → H2 → H3 heading hierarchy is correct
- `priority` + `sizes` correctly set on cover image
- `rel="noopener noreferrer"` on external links
- Full `generateMetadata` with OpenGraph
- Sticky sidebar with scroll lock — good UX

---

## /chia-se — Blog Listing

### Score: 12/20

### Findings

**[P1] Card links have no `aria-label` — verbose AT announcement**
- **File:** `src/app/(public)/chia-se/page.tsx:62-97`
- **Impact:** Each `<Link>` wraps the entire card. Screen readers announce category pill + date + title + excerpt + "Đọc thêm" — extremely verbose in link-list navigation mode.
- **Fix:** Add `aria-label={post.title}` to each card `<Link>`

**[P2] Category label uses `text-[10px]` — below minimum**
- **File:** `src/app/(public)/chia-se/page.tsx:77`
- **Fix:** Change to `text-xs` (12px). Also fix the `text-[11px]` overlay badge at line 68 → `text-xs`

**[P2] `bg-gray-50/50` background instead of design token**
- **File:** `src/app/(public)/chia-se/page.tsx:35`
- **Fix:** `bg-[var(--color-fdi-mist)]`

**[P2] Category displayed twice per card — overlay badge and body pill**
- **File:** `src/app/(public)/chia-se/page.tsx:68-70` (overlay) and `:77-79` (body pill)
- **Fix:** Remove the overlay badge (lines 68-70); keep the body pill

**[P3] "Đang cập nhật thêm…" footer always renders, contradicts empty state**
- **File:** `src/app/(public)/chia-se/page.tsx:103-105`
- **Fix:** Wrap in `{blogPosts.length > 0 && (...) }`

### Anti-Patterns
**[ANTI] Identical card grid** — All cards are structurally identical: gradient placeholder + icon + category + date + title + excerpt + "Đọc thêm". No visual hierarchy, no size variation, no differentiation by importance or recency. Pure AI-reflex grid.
**Fix:** Feature the first post as a wide hero card (`col-span-2`); use actual cover images when available; vary card treatment by recency or category

**[ANTI] Gradient placeholder image area** — `src/app/(public)/chia-se/page.tsx:67` — `linear-gradient(135deg,#F8FBFF_0%,#EDF6FF_52%,#FFF7ED_100%)` on every card. A three-stop pastel gradient as a decorative placeholder for every card. Classic AI slop fill-in.
**Fix:** Require a cover image on each post; use per-category color from the FDI token palette as fallback

### Positive Findings
- Responsive grid (1→2→3 columns) is correctly specified
- `revalidate = 60` on listing page for ISR
- Decorative icons have `aria-hidden="true"`
- "Đọc thêm" span has `min-h-11` touch target

---

## /chia-se/[slug] — Blog Detail

### Score: 12/20

### Findings

**[P0] Nested `<main>` inside layout `<main>`**
- **File:** `src/app/(public)/chia-se/[slug]/page.tsx:74`
- **Current:** `<main className="min-h-screen bg-[#F6F8FB]">` — same issue as homepage, different file
- **Fix:** Change to `<div>` — the `<article>` at line 109 is already the semantic container

**[P1] Double DB fetch — `getPublishedBlogPostBySlug` called in both `generateMetadata` and page component**
- **File:** `src/app/(public)/chia-se/[slug]/page.tsx:53,69`
- **Impact:** Two DB round trips per page load
- **Fix:** Wrap `getPublishedBlogPostBySlug` in `React.cache()` in `blog-actions.ts`, or deduplicate by passing data from a shared layer

**[P1] No `revalidate` export — full SSR on every blog post request**
- **File:** `src/app/(public)/chia-se/[slug]/page.tsx` (entire file — no `export const revalidate`)
- **Fix:** Add `export const revalidate = 300` (or use `generateStaticParams` for ISR)

**[P1] Article body uses `--color-fdi-text-secondary` (#627086) — wrong text color**
- **File:** `src/app/(public)/chia-se/[slug]/page.tsx:111`
- **Impact:** Long-form article body is rendered in muted secondary gray. `#627086` is designed for supporting text (dates, labels), not body copy. Fails readability and WCAG contrast on some backgrounds.
- **Fix:** Change to `text-[var(--color-fdi-text)]` (`#111827`)

**[P2] Hard-coded `#F6F8FB` twice — not a design token**
- **File:** `src/app/(public)/chia-se/[slug]/page.tsx:74,111`
- **Fix:** Add `--color-fdi-mist-alt: #F6F8FB` or map to closest existing token `--color-fdi-mist` (#F3F7F8)

**[P2] `sanitizeBlogHtml` does not strip `data:` URIs or `style` attributes**
- **File:** `src/app/(public)/chia-se/[slug]/page.tsx:26-35`
- **Impact:** Allows CSS `position:fixed` overlays via `style=`, background exfiltration via `url(data:...)`, and `data:` URI payloads on src/href. Low risk for admin-authored content but not zero.
- **Fix:** Replace regex sanitizer with `sanitize-html` npm package (server-safe); or add explicit deny rules for `data:` URIs and `style=` attributes

**[P3] Missing per-post Open Graph metadata**
- **File:** `src/app/(public)/chia-se/[slug]/page.tsx:51-65`
- **Current:** Only `title` and `description` in `generateMetadata`. All social shares use the generic `/og-default.png`.
- **Fix:** Add `openGraph.type = "article"`, `openGraph.publishedTime`, `openGraph.images` with post cover

**[P3] No JSON-LD structured data**
- **Fix:** Add `Article` schema.org JSON-LD in `generateMetadata` for Google rich results eligibility

**[P3] Back link focus ring at 35% opacity — below contrast minimum**
- **File:** `src/app/(public)/chia-se/[slug]/page.tsx:79`
- **Fix:** `ring-[var(--color-fdi-primary)]` at full opacity

### Anti-Patterns
**[ANTI] Blockquote side-stripe border** — `src/app/(public)/chia-se/[slug]/page.tsx:111` — `[&_blockquote]:border-l-4 [&_blockquote]:border-[var(--color-fdi-primary)]`. A 4px left accent stripe on blockquotes is the most common AI-reflex blog styling choice.
**Fix:** Use `<figure>` + italic typesetting + subtle `border-t` overline, or `background-tint` on the blockquote, or `border-l-[2px]` (≤1px not the issue, >1px is)

### Positive Findings
- `<article>` semantic wrapper correctly used
- `notFound()` on missing slug — correct 404 behavior
- Date formatting uses `Intl.DateTimeFormat("vi-VN")`
- Tailwind arbitrary variants for rich text styling (`[&_h2]:`, `[&_ul]:`) — clean scoped approach
- `sanitizeBlogHtml` correctly strips `<script>`, `<iframe>`, `javascript:` URIs (partial credit)

---

## /lien-he — Contact

### Score: 13/20

### Findings

**[P1] Labels not associated with inputs — no `htmlFor`/`id` pairing**
- **File:** `src/app/(public)/lien-he/page.tsx:74,89,104,119`
- **Impact:** `<label>` elements wrap an icon + text but inputs have no `id` and labels have no `htmlFor`. Clicking a label does not move focus to its input. Screen readers announce form controls as unlabeled.
- **WCAG:** 1.3.1 Level A, 4.1.2 Level A
- **Fix:** Add `id="contact-name"` (etc.) to each input and `htmlFor="contact-name"` to each label. Add `aria-hidden="true"` to the `<User>`, `<Phone>`, `<Mail>`, `<MessageSquare>` icons inside labels.

**[P1] Loading state has no screen reader feedback**
- **File:** `src/app/(public)/lien-he/page.tsx:131-144`
- **Impact:** Submit button switches to "Đang gửi..." text but no `aria-live` or `aria-busy` is set. SR users submit and hear nothing until success/error appears.
- **Fix:** Add `aria-busy={loading}` to the `<button>`. The `aria-live="polite"` error div is already correct — mirror with a `role="status"` persistent status element.

**[P1] Success state has no live region and no focus management**
- **File:** `src/app/(public)/lien-he/page.tsx:25-50`
- **Impact:** On success the form unmounts and a new tree renders. Focus remains on the now-gone submit button. SR users don't hear the success message unless they manually navigate.
- **Fix:** Either keep form in DOM and show success in a `role="alert"` region, or `useRef` the success `<h2>` and call `.focus()` after `setSubmitted(true)` with `tabIndex={-1}` on the heading.

**[P2] Hard-coded `text-blue-100` color — not a FDI token**
- **File:** `src/app/(public)/lien-he/page.tsx:63`
- **Fix:** Replace with `text-white/80`

**[P2] `bg-gray-50/50`, `border-gray-100`, `border-gray-200` use raw Tailwind**
- **File:** `src/app/(public)/lien-he/page.tsx:27,53,70`
- **Fix:** `bg-[var(--color-fdi-mist)]`, `border-[var(--color-fdi-mist)]`

**[P3] Success state — generic AI-slop copy**
- "Gửi thành công!" + green circle + "Cảm ơn bạn đã liên hệ" + single "Về trang chủ" CTA is textbook generic success screen. No response timeline, no what-happens-next, no alternative CTA.
- **Fix:** Show response time ("trong giờ hành chính"), add second CTA "Xem tin tuyển dụng →", keep form visible but disabled

**[P3] `<textarea>` has no optional indicator**
- **File:** `src/app/(public)/lien-he/page.tsx:123`
- All other fields show a red asterisk. "Nội dung" field is optional but gives no signal.
- **Fix:** Add `<span className="text-xs text-[var(--color-fdi-text-secondary)]">(không bắt buộc)</span>` to the label

### Positive Findings
- Rate limiting implemented server-side
- `focus:ring` on inputs uses the design token
- `name` attributes correct for browser autofill

---

## /ung-tuyen — Apply

### Score: 15/20 (best-performing page)

### Findings

**[P1] `<Suspense>` wrapper has no `fallback` — blank flash on hydration**
- **File:** `src/app/(public)/ung-tuyen/page.tsx:84`
- **Current:** `<Suspense><ApplyForm ... /></Suspense>` — no fallback prop
- **Fix:** Add skeleton fallback matching the 4-field form layout: `<Suspense fallback={<ApplyFormSkeleton />}>`

**[P1] File upload: visible `<button>` has no accessible label**
- **File:** `src/components/public/ApplyForm.tsx:184-203`
- **Impact:** The upload zone button is the only affordance but has no `aria-label`. AT users navigating by button list hear an unlabeled button.
- **Fix:** Add `aria-label="Tải lên CV (PDF, DOC, DOCX, tối đa 5MB)"` directly to the `<button type="button">`

**[P1] Unencoded Vietnamese in 7 error strings — user-visible broken text**
- **Files:** `src/lib/public-apply-actions.ts:59,82,98,129`, `src/app/api/public/apply-cv/route.ts:25,44,58`
- **Broken strings:**
  - `"Vui long thu lai sau X giay"` → `"Vui lòng thử lại sau ${n} giây"`
  - `"Tin tuyen dung khong ton tai"` → `"Tin tuyển dụng không tồn tại hoặc đã hết hạn"`
  - `"Ban da ung tuyen vi tri nay roi"` → `"Bạn đã ứng tuyển vị trí này rồi"`
  - `"Khong the nop ho so luc nay"` → `"Không thể nộp hồ sơ lúc này"`
  - `"Chi chap nhan file PDF hoac Word"` → `"Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)"`
  - `"Noi dung file khong khop voi dinh dang"` → `"Nội dung file không khớp với định dạng PDF hoặc Word."`
- **Impact:** Every Vietnamese user who encounters an error sees garbled Latin characters without diacritics. Immediate credibility damage.
- **WCAG:** 3.1.2 Language of Parts (Level AA)

**[P2] Gradient on form header — banned anti-pattern**
- **File:** `src/app/(public)/ung-tuyen/page.tsx:60`
- **Current:** `bg-gradient-to-r from-[var(--color-fdi-primary)] to-[var(--color-fdi-accent)]`
- **Fix:** `bg-[var(--color-fdi-primary)]` — solid color; matches `/lien-he` pattern

**[P2] Back link "Quay lại" has no destination context for AT**
- **File:** `src/app/(public)/ung-tuyen/page.tsx:47-51`
- **Fix:** `aria-label={\`Quay lại: ${job.title}\`}` on the `<Link>`

**[P3] CV filename truncates silently — no tooltip**
- **File:** `src/components/public/ApplyForm.tsx:173`
- **Fix:** Add `title={cvFile.name}` to the filename `<span>`

**[P3] `rounded-xl` on submit button — inconsistent with `rounded-full` used in `/lien-he`**
- Standardize to `rounded-full` for all primary CTAs site-wide

### Positive Findings
- Correct `id`/`htmlFor` pairing on all text inputs — best form a11y of all 3 form pages
- `autoComplete` attributes correct (`name`, `email`, `tel`)
- `inputMode="tel"` on phone field
- `aria-live="polite"` on error div
- `aria-label="Xóa file CV đã chọn"` on remove button
- `aria-hidden="true"` on all decorative icons
- Zod validation + duplicate application detection + cleanup on failure paths

---

## /ung-tuyen/thanh-cong — Apply Success

### Score: 13/20

### Findings

**[P1] No focus management after redirect**
- **File:** `src/app/(public)/ung-tuyen/thanh-cong/page.tsx` (entire page)
- **Impact:** User arrives via `router.push()` from the apply form. Focus stays on the now-gone submit button. SR users won't hear the success message without manual navigation.
- **Fix:** Convert to client component; add `useEffect(() => { document.querySelector('h1')?.focus(); }, [])` with `tabIndex={-1}` on the `<h1>`

**[P1] `bg-emerald-50` / `text-emerald-500` — not FDI tokens**
- **File:** `src/app/(public)/ung-tuyen/thanh-cong/page.tsx:21-22`
- `--color-success: #10B981` is already defined in `globals.css` but unused here
- **Fix:** `bg-[color-mix(in_srgb,var(--color-success)_10%,white)]` or add `--color-success-bg` token. `text-[var(--color-success)]`

**[P2] Generic success page — AI slop copy**
- "Ứng tuyển thành công!" + green circle + "Nhà tuyển dụng sẽ xem xét và liên hệ bạn sớm nhất" is the canonical AI success screen template. "Sớm nhất" is meaningless.
- **Fix:** Add expected timeline ("3-5 ngày làm việc"), mention confirmation email if applicable, second CTA "Xem thêm việc làm"

**[P2] `rounded-xl` on primary CTA vs `rounded-full` in `/lien-he`**
- **File:** `src/app/(public)/ung-tuyen/thanh-cong/page.tsx:41`
- **Fix:** Standardize to `rounded-full`

**[P2] `jobTitle` and `companyName` from unvalidated `searchParams`**
- **File:** `src/app/(public)/ung-tuyen/thanh-cong/page.tsx:14-15`
- Not an XSS risk (text rendering only) but page can show misleading content with crafted URLs
- **Consider:** Look up the latest application for the current user from DB instead of trusting URL params

**[P3] `companyName` sentence structure breaks when value is empty**
- **Fix:** `{companyName ? \`gửi tới ${companyName} cho vị trí\` : \`cho vị trí\`} <strong>{jobTitle}</strong>`

### Positive Findings
- Zero client JS — pure server component, fast render
- Graceful fallback for missing `jobTitle` param
- `ArrowRight` and `Home` icons are `aria-hidden` by default (Lucide default)
- Responsive CTA layout (`flex-col sm:flex-row`)

---

## Systemic Issues Summary

| Issue | Affects | Severity |
|-------|---------|----------|
| Skip link `#home-hero` broken on all non-home pages | All 9 pages | P1 |
| Global `*` transition applies to every element | All pages | P2 |
| Focus ring bleeds outside `<main>` (header nav items) | All pages | P2 |
| `Pagination` hardcodes `/viec-lam` path | `/cong-ty` | P0 |
| `JobCard` 6 hard-coded hex values | All pages with jobs | P2 |
| `text-[10px]` labels — below WCAG minimum | `/viec-lam/[slug]`, `/cong-ty/[slug]` | P2 |
| `bg-gray-50/50` instead of `var(--color-fdi-mist)` | 4 pages | P3 |
| Unencoded Vietnamese in error messages | `/ung-tuyen` (all errors) | P1 |
| Identical card grid anti-pattern | `/chia-se`, homepage | Anti-pattern |
| Gradient placeholder image areas | `/chia-se` | Anti-pattern |
| Breadcrumbs not `<nav>` landmarks | `/viec-lam/[slug]`, `/cong-ty/[slug]` | P1 |

---

## Positive Findings Across All Pages

- `generateMetadata` with full OpenGraph + Twitter cards on all detail pages
- `rel="noopener noreferrer"` consistently applied on external links
- `prefers-reduced-motion` guard in globals.css (added in Wave 2.1)
- 44px touch targets (`min-h-11`) consistently applied on interactive elements
- Vietnamese locale formatting (`vi-VN`) throughout
- `LogoImage` error fallback with `Building2` icon
- Zod validation on all form submissions
- Server-side rate limiting on apply and contact forms
- `aria-hidden="true"` on decorative icons consistently applied
