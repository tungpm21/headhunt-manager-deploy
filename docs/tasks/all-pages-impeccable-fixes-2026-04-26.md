# FDIWork All Pages — Impeccable Fixes

**Orchestrator:** Claude (Sonnet 4.6)
**Branch:** `codex/fdiwork-ux-preview-20260425`
**Audit source:** `docs/reports/audit_2026-04-26_all-pages-impeccable.md`
**Last updated:** 2026-04-26
**Status:** Not started

**Note:** Homepage fixes are tracked separately in `docs/tasks/homepage-a11y-impeccable-fixes-2026-04-26.md` (13/14 done).

---

## Agent Instructions

You are an implementation agent. Execute tasks in wave order. Do not start Wave N+1 until Wave N is verified complete. Tasks marked `[PARALLEL]` within a wave are independent and can run concurrently.

**Rules:**
- Surgical changes only — do not edit files outside the listed paths for each task
- Do not refactor surrounding code unless the task explicitly requires it
- After each task, verify the success criterion before marking done
- Never re-apply tasks already marked ✅

**Stack context:**
- Next.js 15 App Router, TypeScript, Tailwind v4
- Public routes: `src/app/(public)/`
- Public components: `src/components/public/`
- Shared lib: `src/lib/`
- API routes: `src/app/api/public/`
- Global styles: `src/app/globals.css`

---

## Wave 1 — P0 Critical (run first, unblocks everything else)

### Task 1.1 — Fix Pagination: hardcoded `/viec-lam` path breaks company listing `[PARALLEL]`

**Priority:** P0 — pagination is completely broken on `/cong-ty`
**File:** `src/components/public/Pagination.tsx`

**Find the router.push line** (will look approximately like):
```tsx
router.push(`/viec-lam?${params.toString()}`)
```

**Replace the entire Pagination component** to accept a `basePath` prop:
1. Add `basePath?: string` to the component's props interface (default `"/viec-lam"`)
2. Replace the hard-coded path with `basePath`:
```tsx
router.push(`${basePath}?${params.toString()}`)
```

**Then update the call site in `src/app/(public)/cong-ty/page.tsx`** — find `<Pagination` and add `basePath="/cong-ty"`:
```tsx
<Pagination ... basePath="/cong-ty" />
```

The job listing page (`/viec-lam/page.tsx`) does not need `basePath` since it defaults to `"/viec-lam"`.

**Success criterion:**
- On `/cong-ty` page 2: URL becomes `/cong-ty?page=2`, not `/viec-lam?page=2`
- Clicking pagination on `/viec-lam` still navigates to `/viec-lam`

---

### Task 1.2 — Fix nested `<main>` in blog detail `[PARALLEL]`

**Priority:** P0 — same invalid HTML as homepage issue, different file
**File:** `src/app/(public)/chia-se/[slug]/page.tsx`

**Find:**
```tsx
<main className="min-h-screen bg-[#F6F8FB]">
```

**Replace:**
```tsx
<div className="min-h-screen bg-[#F6F8FB]">
```

Also find the closing `</main>` at the bottom of this component and change to `</div>`.

**Success criterion:** `document.querySelectorAll('main').length === 1` on `/chia-se/[slug]`

---

## Wave 2 — P1 Cross-cutting (affects all pages)

### Task 2.1 — Fix skip link target to work on all pages `[PARALLEL]`

**Priority:** P1
**Files:**
1. `src/app/(public)/layout.tsx` — change `href="#home-hero"` to `href="#main-content"`
2. Add `id="main-content"` to the first major content element on each non-home page (6 files total)

**Step A — Update the skip link in layout:**

Find:
```tsx
href="#home-hero"
```
Replace:
```tsx
href="#main-content"
```

**Step B — Add `id="main-content"` to each page's content root.** For each file below, find the outermost content `<div>` or `<section>` that follows the hero/header area and add the id:

| File | Element to find | Add |
|------|-----------------|-----|
| `src/app/(public)/viec-lam/page.tsx` | Root `<div>` of the page | `id="main-content"` |
| `src/app/(public)/viec-lam/[slug]/page.tsx` | Root `<div>` or `<section>` | `id="main-content"` |
| `src/app/(public)/cong-ty/page.tsx` | Root `<div>` of the page | `id="main-content"` |
| `src/app/(public)/cong-ty/[slug]/page.tsx` | Root `<div>` or `<section>` | `id="main-content"` |
| `src/app/(public)/chia-se/page.tsx` | Root `<div>` of the page | `id="main-content"` |
| `src/app/(public)/lien-he/page.tsx` | Root `<div>` or `<section>` | `id="main-content"` |
| `src/app/(public)/ung-tuyen/page.tsx` | Root `<div>` | `id="main-content"` |
| `src/app/(public)/ung-tuyen/thanh-cong/page.tsx` | Root `<div>` | `id="main-content"` |

For `/chia-se/[slug]/page.tsx`: the root was just changed to `<div>` in Task 1.2 — add `id="main-content"` to that same element.

**Success criterion:** On every public page, Tab → Enter on the skip link scrolls/focuses to `#main-content`. Verify at least on `/viec-lam`, `/cong-ty`, `/lien-he`.

---

### Task 2.2 — Fix contact form: add label-input associations `[PARALLEL]`

**Priority:** P1 | **WCAG:** 1.3.1, 4.1.2 Level A
**File:** `src/app/(public)/lien-he/page.tsx`

There are 4 form fields (name, phone, email, message). For each, do two things:

1. Add `id` to the input/textarea
2. Add `htmlFor` to the label, and `aria-hidden="true"` to the icon inside the label

**For the name field** — find pattern like:
```tsx
<label className="...">
  <User className="..." />
  Họ và tên <span className="text-red-400">*</span>
</label>
<input ... />
```
Change to:
```tsx
<label htmlFor="contact-name" className="...">
  <User className="..." aria-hidden="true" />
  Họ và tên <span className="text-red-400">*</span>
</label>
<input id="contact-name" ... />
```

Apply the same pattern to all 4 fields using these ids:
- Name field: `id="contact-name"`, `htmlFor="contact-name"`
- Phone field: `id="contact-phone"`, `htmlFor="contact-phone"`
- Email field: `id="contact-email"`, `htmlFor="contact-email"`
- Message textarea: `id="contact-message"`, `htmlFor="contact-message"`

Also add `aria-hidden="true"` to the `<Phone>`, `<Mail>`, `<MessageSquare>` icons inside their labels.

**Success criterion:** Clicking a label text focuses the corresponding input. axe DevTools shows no "Form elements must have labels" violations on `/lien-he`.

---

### Task 2.3 — Fix contact form: AT feedback for loading and success states `[PARALLEL]`

**Priority:** P1 | **WCAG:** 4.1.3 Status Messages
**File:** `src/app/(public)/lien-he/page.tsx`

**Part A — Loading state feedback:**

Find the submit button (will have `disabled={loading}` or similar). Add `aria-busy`:
```tsx
<button
  type="submit"
  disabled={loading}
  aria-busy={loading}
  ...
>
```

**Part B — Success state focus management:**

Find the success state render (will show "Gửi thành công!" and hide the form). The success container (usually an `<h2>` or `<div>`) needs to receive focus after the state change.

Add a `ref` to the success heading/container:

```tsx
const successRef = useRef<HTMLDivElement>(null);

// After setSubmitted(true), add:
useEffect(() => {
  if (submitted) {
    successRef.current?.focus();
  }
}, [submitted]);

// On the success container:
<div ref={successRef} tabIndex={-1} className="outline-none ...">
  <h2>Gửi thành công!</h2>
  ...
</div>
```

**Success criterion:** Submit the form with valid data. Screen reader announces the success message immediately after submit, without requiring manual navigation.

---

### Task 2.4 — Fix unencoded Vietnamese in error messages (7 strings) `[PARALLEL]`

**Priority:** P1 | **WCAG:** 3.1.2 Level AA
**Files:**
1. `src/lib/public-apply-actions.ts` — lines ~59, ~82, ~98, ~129
2. `src/app/api/public/apply-cv/route.ts` — lines ~25, ~44, ~58

Search each file for strings containing unencoded Vietnamese (ASCII-only words that should have diacritics). Replace each with the correct UTF-8 Vietnamese:

| Find | Replace |
|------|---------|
| `"Vui long thu lai sau` (any variant with no diacritics) | `"Vui lòng thử lại sau ${n} giây"` (preserve the variable interpolation) |
| `"Tin tuyen dung khong ton tai"` | `"Tin tuyển dụng không tồn tại hoặc đã hết hạn"` |
| `"Ban da ung tuyen vi tri nay roi"` | `"Bạn đã ứng tuyển vị trí này rồi"` |
| `"Khong the nop ho so luc nay"` | `"Không thể nộp hồ sơ lúc này, vui lòng thử lại"` |
| `"Chi chap nhan file PDF hoac Word"` | `"Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)"` |
| `"Noi dung file khong khop voi dinh dang"` | `"Nội dung file không khớp với định dạng PDF hoặc Word"` |

Also scan both files for any other ASCII-only strings that should be Vietnamese.

**Success criterion:** `grep -n '[A-Za-z] [A-Za-z]' src/lib/public-apply-actions.ts` returns only intentional English strings (like "PDF", "Word", "DOC"). All user-facing error messages contain proper Vietnamese diacritics.

---

## Wave 3 — P1 Page-specific Fixes

All tasks in this wave are independent. Run in parallel.

### Task 3.1 — Fix breadcrumbs: add `<nav>` landmark to job and company detail `[PARALLEL]`

**Priority:** P1
**Files:**
1. `src/app/(public)/viec-lam/[slug]/page.tsx` — lines ~129-145
2. `src/app/(public)/cong-ty/[slug]/page.tsx` — lines ~90-106

For each file, find the breadcrumb structure (a div containing `<Link href="/viec-lam">` or `<Link href="/cong-ty">` plus the current page title). Wrap in a `<nav>` with `aria-label` and change the inner list to `<ol>`:

```tsx
<nav aria-label="Breadcrumb" className="bg-white border-b border-[var(--color-fdi-mist)]">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <ol className="flex items-center gap-2 py-3 text-sm">
      <li>
        <Link href="/viec-lam" className="...">Việc làm</Link>
      </li>
      <li className="text-[var(--color-fdi-text-secondary)]">/</li>
      <li aria-current="page" className="truncate ...">
        {job.title}
      </li>
    </ol>
  </div>
</nav>
```

Apply the same pattern to the company detail breadcrumb (`cong-ty` variant).

**Success criterion:** `document.querySelector('[aria-label="Breadcrumb"]')` returns non-null on both detail pages.

---

### Task 3.2 — Fix job detail: sidebar heading hierarchy `[PARALLEL]`

**Priority:** P1
**File:** `src/app/(public)/viec-lam/[slug]/page.tsx` — lines ~284-285 and ~354-355

Find the two sidebar `<h3>` headings ("Thông tin công ty" and "Việc làm gợi ý"). These are section headings at the top level of the sidebar, not children of any `<h2>`. Change them to `<h2>`:

```tsx
// Find:
<h3 className="...">Thông tin công ty</h3>
// Change to:
<h2 className="...">Thông tin công ty</h2>
```

```tsx
// Find:
<h3 className="...">Việc làm gợi ý</h3>
// Change to:
<h2 className="...">Việc làm gợi ý</h2>
```

**Success criterion:** Heading outline on `/viec-lam/[slug]` shows: h1 (job title) → h2 (job content sections + sidebar sections) → h3 (job cards inside "Việc làm gợi ý"). No h3 appears at the same level as h1.

---

### Task 3.3 — Fix company listing: side-stripe border anti-pattern on tier cards `[PARALLEL]`

**Priority:** P1 (banned anti-pattern)
**File:** `src/components/public/CompanyCard.tsx` — line ~27

Find the side-stripe border on premium/VIP card styling:
```tsx
border-l-[3px] border-l-amber-400
```
(may also include `border-l-[3px] border-l-purple-400` for another tier)

**Replace with a top border** that communicates tier status without the side-stripe:
```tsx
border-t-2 border-t-amber-400/70
```

Do the same for any other tier variants (purple, etc.) in the same file.

**Success criterion:** No card on `/cong-ty` has a `border-l-[3px]` left accent stripe. VIP/Premium status is still visually communicated (via the top border + existing Crown icon badge).

---

### Task 3.4 — Fix company listing: add H2 for card grid section `[PARALLEL]`

**Priority:** P1
**File:** `src/app/(public)/cong-ty/page.tsx`

The page has `<h1>Doanh nghiệp FDI</h1>` then jumps straight to `CompanyCard` components whose internal headings are `<h3>`. Add a screen-reader-only `<h2>` above the card grid:

Find the `<div>` that opens the card grid (the parent of `{companies.map(...)}`). Add immediately before it:
```tsx
<h2 className="sr-only">Danh sách công ty</h2>
```

**Success criterion:** Heading outline on `/cong-ty` shows h1 → h2 → h3 (company names in cards). `document.querySelector('h2')` returns non-null.

---

### Task 3.5 — Fix apply page: file upload button accessible label `[PARALLEL]`

**Priority:** P1
**File:** `src/components/public/ApplyForm.tsx` — line ~184

Find the upload zone `<button type="button">` that triggers the hidden file input. It currently has no accessible label. Add `aria-label`:

```tsx
<button
  type="button"
  aria-label="Tải lên CV (PDF, DOC, DOCX, tối đa 5MB)"
  onClick={() => fileInputRef.current?.click()}
  ...
>
```

**Success criterion:** Screen reader (or axe) announces the upload button as "Tải lên CV (PDF, DOC, DOCX, tối đa 5MB) button".

---

### Task 3.6 — Fix apply page: Suspense fallback `[PARALLEL]`

**Priority:** P1
**File:** `src/app/(public)/ung-tuyen/page.tsx` — line ~84

Find:
```tsx
<Suspense>
  <ApplyForm ... />
</Suspense>
```

Replace with a skeleton fallback (keep it simple — 4 input-height skeleton rows + a button):
```tsx
<Suspense fallback={
  <div className="space-y-5 animate-pulse">
    <div className="h-11 rounded-lg bg-[var(--color-fdi-mist)]" />
    <div className="h-11 rounded-lg bg-[var(--color-fdi-mist)]" />
    <div className="h-11 rounded-lg bg-[var(--color-fdi-mist)]" />
    <div className="h-11 rounded-lg bg-[var(--color-fdi-mist)]" />
    <div className="h-11 w-full rounded-full bg-[var(--color-fdi-primary)]/20" />
  </div>
}>
  <ApplyForm ... />
</Suspense>
```

**Success criterion:** On slow 3G simulation, the apply page shows a skeleton instead of blank white during hydration.

---

### Task 3.7 — Fix blog listing: card links `aria-label` and category duplication `[PARALLEL]`

**Priority:** P1 + P2 combined
**File:** `src/app/(public)/chia-se/page.tsx`

**Part A — Add `aria-label` to each card link (P1):**

Find the card `<Link>` (wraps the entire card, has `href={/chia-se/${post.slug}}`). Add `aria-label={post.title}`:
```tsx
<Link
  href={`/chia-se/${post.slug}`}
  aria-label={post.title}
  className="..."
>
```

**Part B — Remove duplicate category overlay badge (P2):**

Find and remove the absolute-positioned category overlay inside the image area (the `<span>` or `<div>` at lines ~68-70 that renders `post.category`). The body pill at lines ~77-79 remains.

**Success criterion:**
- Each blog card link is announced as the post title (not full card text) in screen reader link list mode
- Category appears only once per card (in the body, not on the image overlay)

---

### Task 3.8 — Fix blog detail: performance issues `[PARALLEL]`

**Priority:** P1 (double DB fetch) + P1 (missing revalidate)
**File:** `src/lib/blog-actions.ts` (or wherever `getPublishedBlogPostBySlug` is defined) + `src/app/(public)/chia-se/[slug]/page.tsx`

**Part A — Deduplicate DB fetch with React.cache:**

In the file where `getPublishedBlogPostBySlug` is defined, wrap it with `React.cache`:
```ts
import { cache } from 'react';

export const getPublishedBlogPostBySlug = cache(async (slug: string) => {
  // existing implementation unchanged
});
```

This makes Next.js deduplicate calls within a single render pass — `generateMetadata` and the page component both call it, but only one DB query fires.

**Part B — Add `revalidate` to blog detail page:**

In `src/app/(public)/chia-se/[slug]/page.tsx`, add near the top (after imports):
```ts
export const revalidate = 300; // 5 minutes
```

**Success criterion:**
- Add a `console.log` to the fetch function temporarily; server logs should show it called only once per request (not twice) after the `cache()` wrap
- Vercel dashboard shows the route using ISR/cached responses after deployment

---

### Task 3.9 — Fix blog detail: article body text color `[PARALLEL]`

**Priority:** P1
**File:** `src/app/(public)/chia-se/[slug]/page.tsx` — line ~111

Find the `<div>` or wrapper that sets the article body's default text color to `--color-fdi-text-secondary`:
```tsx
className="... text-[var(--color-fdi-text-secondary)] ..."
```

Replace `text-[var(--color-fdi-text-secondary)]` with `text-[var(--color-fdi-text)]`.

**Success criterion:** Article body text on `/chia-se/[slug]` renders in `#111827` (near-black), not `#627086` (muted gray). Visually compare a blog post before and after.

---

### Task 3.10 — Fix apply success: focus management and token usage `[PARALLEL]`

**Priority:** P1 (focus) + P1 (tokens)
**File:** `src/app/(public)/ung-tuyen/thanh-cong/page.tsx`

**Part A — Add focus management (convert to client component):**

Add `"use client"` at the top of the file. Then:
```tsx
"use client";
import { useEffect, useRef } from "react";

export default function ApplySuccessPage({ searchParams }: ...) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    // ... existing JSX with:
    <h1 ref={headingRef} tabIndex={-1} className="outline-none ...">
      Ứng tuyển thành công!
    </h1>
    // ...
  );
}
```

**Part B — Replace `emerald-*` Tailwind colors with design tokens:**

Find:
```tsx
bg-emerald-50
text-emerald-500
```

Replace (the `--color-success: #10B981` token already exists in globals.css):
```tsx
bg-[color-mix(in_srgb,var(--color-success)_12%,white)]
text-[var(--color-success)]
```

**Success criterion:**
- After arriving on `/ung-tuyen/thanh-cong`, screen reader immediately announces "Ứng tuyển thành công!" without requiring manual navigation
- Success icon circle renders with a teal-adjacent green (not Tailwind's default emerald), consistent with the FDI color system

---

## Wave 4 — P2 Quality Fixes

Run after Wave 3. Tasks are independent — run in parallel.

### Task 4.1 — Fix `JobCard` hard-coded hex values → design tokens `[PARALLEL]`

**Priority:** P2
**File:** `src/components/public/JobCard.tsx`

Replace each hard-coded hex with the corresponding design token:

| Find | Replace |
|------|---------|
| `#FFFFFB` | `var(--color-fdi-paper)` |
| `#0A6F9D` | `var(--color-fdi-primary)` |
| `#E9F5F7` or `#E8F5F7` | `var(--color-fdi-surface)` |
| `#687789` or `#8A98A8` | `var(--color-fdi-text-secondary)` |
| `#DCE4EA` or `#BFD6DF` | add `--color-fdi-border: #DCE4EA` to globals.css, then use `var(--color-fdi-border)` |

**Success criterion:** `grep -n '#[0-9A-Fa-f]' src/components/public/JobCard.tsx` returns zero results.

---

### Task 4.2 — Fix `text-[10px]` labels on job and company detail `[PARALLEL]`

**Priority:** P2
**Files:**
1. `src/app/(public)/viec-lam/[slug]/page.tsx` — line ~202
2. `src/app/(public)/cong-ty/[slug]/page.tsx` — line ~240

In both files, find `text-[10px]` and change to `text-xs` (12px). Also find `text-[11px]` (blog listing line ~68) in `src/app/(public)/chia-se/page.tsx` and change to `text-xs`.

**Success criterion:** No `text-[10px]` or `text-[11px]` remain in public-facing components. `grep -rn 'text-\[1[01]px\]' src/app/(public)/' returns zero results.

---

### Task 4.3 — Fix `bg-gray-50/50` → `var(--color-fdi-mist)` across all pages `[PARALLEL]`

**Priority:** P2
**Files:** Run this replacement across all files in `src/app/(public)/`:

Find: `bg-gray-50/50`
Replace all with: `bg-[var(--color-fdi-mist)]`

Also find: `bg-gray-50` (without opacity) used as page background (not as hover states)
Replace with: `bg-[var(--color-fdi-mist)]`

Also fix `border-gray-100` and `border-gray-200` on structural borders (not hover/interactive states):
Replace with: `border-[var(--color-fdi-mist)]`

**Note:** Be careful not to change `hover:bg-gray-50` interactive states — only structural backgrounds.

**Success criterion:** `grep -rn 'bg-gray-50' src/app/(public)/' returns only hover state classes (prefixed with `hover:`), not structural background classes.

---

### Task 4.4 — Fix `#005A9E` hard-coded color in CompanyCard `[PARALLEL]`

**Priority:** P2
**Files:**
1. `src/components/public/CompanyCard.tsx` — line ~44
2. `src/app/(public)/cong-ty/[slug]/page.tsx` — line ~126

Find: `via-[#005A9E]` in the fallback gradient

Add this token to `src/app/globals.css` under the FDIWork section:
```css
--color-fdi-navy-mid: #005A9E;
```

Then replace `via-[#005A9E]` with `via-[var(--color-fdi-navy-mid)]` in both files.

**Success criterion:** `grep -rn '#005A9E' src/` returns zero results.

---

### Task 4.5 — Fix company detail: `LogoImage` flexible sizing `[PARALLEL]`

**Priority:** P2
**File:** `src/components/public/LogoImage.tsx`

**Current issue:** `LogoImage` always uses `width={160} height={160}` regardless of where it's rendered. In `CompanyCard` it's 64×64px; in detail pages ~96px.

**Add `size` prop:**
```tsx
interface LogoImageProps {
  src?: string | null;
  alt: string;
  size?: number;  // new prop, default 160
  className?: string;
}

export function LogoImage({ src, alt, size = 80, className }: LogoImageProps) {
  // ...
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      // ...
    />
  );
}
```

Then update call sites:
- In `CompanyCard.tsx`: add `size={64}`
- In `cong-ty/[slug]/page.tsx`: add `size={96}`
- In `viec-lam/[slug]/page.tsx`: add `size={56}` (job header logo)

**Success criterion:** `CompanyCard` logo `<img>` has `width="64"` attribute in rendered HTML.

---

### Task 4.6 — Fix `/lien-he` hard-coded `text-blue-100` `[PARALLEL]`

**Priority:** P2
**File:** `src/app/(public)/lien-he/page.tsx` — line ~63

Find: `text-blue-100`
Replace with: `text-white/80`

**Success criterion:** No `text-blue-100` in `lien-he/page.tsx`.

---

### Task 4.7 — Fix company detail: info sidebar `<dl>/<dt>/<dd>` semantics `[PARALLEL]`

**Priority:** P2
**File:** `src/app/(public)/cong-ty/[slug]/page.tsx` — info items section (~lines 234-258)

Find the info items render loop (iterates over fields like "Ngành nghề", "Địa chỉ", etc.). Currently uses `<div>` + `<p>` pairs.

Replace the outer container with `<dl>` and each label `<p>` with `<dt>`, each value `<p>` with `<dd>`:
```tsx
<dl className="space-y-3">
  {infoItems.map(item => (
    <div key={item.label} className="flex gap-3">
      <item.icon className="..." aria-hidden="true" />
      <div>
        <dt className="text-[11px] uppercase tracking-wide text-[var(--color-fdi-text-secondary)]">
          {item.label}
        </dt>
        <dd className="text-sm font-medium text-[var(--color-fdi-text)]">
          {item.value}
        </dd>
      </div>
    </div>
  ))}
</dl>
```

**Success criterion:** Company detail sidebar info section uses `<dl>/<dt>/<dd>` structure. Screen reader announces "Ngành nghề: Thực phẩm & Đồ uống" as a definition pair.

---

### Task 4.8 — Fix apply CTA and success page: standardize to `rounded-full` `[PARALLEL]`

**Priority:** P2
**Files:**
1. `src/app/(public)/ung-tuyen/page.tsx` — submit/CTA buttons
2. `src/app/(public)/ung-tuyen/thanh-cong/page.tsx` — primary CTA button
3. `src/app/(public)/lien-he/page.tsx` — submit button (verify it already uses `rounded-full`)

Find `rounded-xl` on primary action buttons and change to `rounded-full`.

**Do NOT change** `rounded-xl` or other radii on cards, containers, or form inputs — only on primary CTA buttons.

**Success criterion:** All primary CTA buttons across the apply flow (`/ung-tuyen`, `/ung-tuyen/thanh-cong`) use `rounded-full`.

---

### Task 4.9 — Fix apply form header: remove gradient anti-pattern `[PARALLEL]`

**Priority:** P2
**File:** `src/app/(public)/ung-tuyen/page.tsx` — line ~60

Find:
```tsx
bg-gradient-to-r from-[var(--color-fdi-primary)] to-[var(--color-fdi-accent)]
```

Replace with:
```tsx
bg-[var(--color-fdi-primary)]
```

**Success criterion:** The apply form header is solid `#0A6F9D` blue, not a gradient. Matches the contact page header style.

---

## Wave 5 — P3 Polish

Run after Wave 4. All tasks are independent.

### Task 5.1 — Fix viec-lam listing: small decorative icon `aria-hidden` `[PARALLEL]`

**Files:** `src/app/(public)/viec-lam/page.tsx:134`, `src/components/public/JobFilters.tsx:71`

Add `aria-hidden="true"` to:
- `<SearchX>` icon in the empty state
- `<Filter>` icon in the JobFilters header

---

### Task 5.2 — Fix viec-lam listing: `JobCard` focus ring color consistency `[PARALLEL]`

**File:** `src/components/public/JobCard.tsx:36`

Find: `focus-visible:ring-[var(--color-fdi-accent-orange)]`
Replace: `focus-visible:ring-[var(--color-fdi-primary)]`

---

### Task 5.3 — Fix viec-lam listing: sort select focus ring opacity `[PARALLEL]`

**File:** `src/components/public/JobFilters.tsx:150`

Find: `focus-visible:ring-[var(--color-fdi-primary)]/20`
Replace: `focus-visible:ring-[var(--color-fdi-primary)]/60`

---

### Task 5.4 — Fix job detail: language badge `#0077B6` → token `[PARALLEL]`

**File:** `src/app/(public)/viec-lam/[slug]/page.tsx` — lines ~222-223

Find: `bg-[#0077B6]/10` and `text-[#0077B6]`
Replace: `bg-[var(--color-fdi-primary)]/10` and `text-[var(--color-fdi-primary)]`

---

### Task 5.5 — Fix company detail: `bg-white/70` pointless opacity `[PARALLEL]`

**File:** `src/app/(public)/cong-ty/[slug]/page.tsx` — line ~204

Find: `bg-white/70`
Replace: `bg-white`

---

### Task 5.6 — Fix blog detail: blockquote side-stripe → background tint `[PARALLEL]`

**File:** `src/app/(public)/chia-se/[slug]/page.tsx` — the `[&_blockquote]:border-l-4` rule in the article body className

Find:
```
[&_blockquote]:border-l-4 [&_blockquote]:border-[var(--color-fdi-primary)]
```

Replace with a background-tint + italic approach (no side-stripe):
```
[&_blockquote]:bg-[var(--color-fdi-surface)] [&_blockquote]:rounded-lg [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_blockquote]:border-0
```

---

### Task 5.7 — Fix blog detail: back link focus ring opacity `[PARALLEL]`

**File:** `src/app/(public)/chia-se/[slug]/page.tsx` — line ~79

Find: `ring-[var(--color-fdi-accent-orange)]/35` or similar low-opacity ring on the back link
Replace: `ring-[var(--color-fdi-primary)]` at full opacity

---

### Task 5.8 — Fix contact form: add optional indicator to textarea `[PARALLEL]`

**File:** `src/app/(public)/lien-he/page.tsx` — textarea label (line ~119)

Find the message/textarea label. Add "(không bắt buộc)" after the label text:
```tsx
<label htmlFor="contact-message" className="...">
  <MessageSquare className="..." aria-hidden="true" />
  Nội dung <span className="text-xs text-[var(--color-fdi-text-secondary)] font-normal">(không bắt buộc)</span>
</label>
```

---

### Task 5.9 — Fix apply success: fix broken sentence when `companyName` is empty `[PARALLEL]`

**File:** `src/app/(public)/ung-tuyen/thanh-cong/page.tsx`

Find the success message sentence with the `companyName` conditional. Fix the double-space/grammar issue:
```tsx
{companyName
  ? `Hồ sơ của bạn đã được gửi tới ${companyName} cho vị trí`
  : `Hồ sơ của bạn đã được gửi cho vị trí`
} <strong>{jobTitle}</strong> thành công.
```

---

## Wave 6 — Design Work (requires human design decision)

These tasks require visual design choices and are intentionally deferred from the code-fix waves. A human must review and approve the design direction before implementation.

### Design Task D1 — Blog listing: differentiate card grid (anti-pattern fix)
**Issue:** Identical 3-col card grid with gradient placeholders is AI slop
**Decision needed:** Feature the first post as a hero card? Use actual cover images? Per-category color? Define desired outcome before implementing.
**Command:** `$impeccable bolder src/app/(public)/chia-se/page.tsx`

### Design Task D2 — Blog listing: replace gradient image placeholders
**Issue:** `linear-gradient(135deg,#F8FBFF,#EDF6FF,#FFF7ED)` on every card is a classic AI fill-in
**Decision needed:** Require cover images on posts? Per-category solid color? Illustrated placeholder?
**Command:** `$impeccable bolder` or `$impeccable shape /chia-se`

### Design Task D3 — Contact success state: improve copy and next actions
**Issue:** Generic success screen with no timeline, no next action
**Decision needed:** Expected response time, confirmation email mention, second CTA
**Command:** `$impeccable clarify src/app/(public)/lien-he/page.tsx`

### Design Task D4 — Apply success: meaningful post-submission experience
**Issue:** "Nhà tuyển dụng sẽ xem xét và liên hệ bạn sớm nhất" is meaningless
**Decision needed:** Actual timeline, confirmation channel, application tracking CTA
**Command:** `$impeccable clarify src/app/(public)/ung-tuyen/thanh-cong/page.tsx`

### Design Task D5 — Company listing: add search/filter UI
**Issue:** `q` and `industry` params are wired but there's no UI
**Decision needed:** Filter layout (inline vs sidebar), which filters to expose
**Command:** `$impeccable shape /cong-ty`

---

## Verification Checklist (after Waves 1-5)

- [ ] `npx tsc --noEmit` — passes
- [ ] `npx eslint src/app/(public)/ src/components/public/ src/lib/public-apply-actions.ts src/app/api/public/` — no new errors
- [ ] `/cong-ty` pagination goes to `/cong-ty?page=2`, not `/viec-lam`
- [ ] `document.querySelectorAll('main').length === 1` on `/chia-se/[slug]`
- [ ] Skip link works on `/viec-lam`, `/cong-ty`, `/lien-he`, `/chia-se` (Tab → Enter → focus on content)
- [ ] Breadcrumb renders as `<nav>` on job and company detail pages
- [ ] Contact form: clicking label "Họ và tên" focuses the name input
- [ ] Apply form: file upload button announced as labeled button by screen reader
- [ ] All error messages on `/ung-tuyen` flow show correct Vietnamese diacritics
- [ ] Blog detail pages load with ISR (check Vercel function logs — single DB call per request)
- [ ] `grep -rn 'text-\[10px\]' src/app/(public)/` → zero results
- [ ] `grep -rn 'bg-gray-50/50' src/app/(public)/` → zero results
- [ ] `grep -rn 'border-l-\[3px\]' src/components/public/` → zero results (side-stripe removed)

---

## Commit Message Template

```
fix(a11y+quality): all-pages impeccable fixes

- Fix Pagination: basePath prop replaces hardcoded /viec-lam (P0)
- Fix nested <main> in /chia-se/[slug] (P0)
- Fix skip link: href="#main-content" + id on all page content roots
- Fix contact form: htmlFor/id label-input associations (WCAG 4.1.2)
- Fix contact form: aria-busy, focus management on submit/success
- Fix 7 unencoded Vietnamese strings in apply/upload error messages
- Fix breadcrumbs: <nav aria-label="Breadcrumb"> on job + company detail
- Fix job detail sidebar: h3→h2 for section headings
- Fix company listing: side-stripe border → top border (anti-pattern)
- Fix company listing: add sr-only <h2> for card grid section
- Fix apply: aria-label on file upload button
- Fix apply: <Suspense> fallback skeleton
- Fix blog listing: aria-label on card links, remove duplicate category badge
- Fix blog detail: React.cache() deduplication, revalidate=300, text color
- Fix apply success: client component + focus management
- Replace 8 hardcoded hex values in JobCard with design tokens
- Replace text-[10px] labels with text-xs (12px) across 3 files
- Replace bg-gray-50/50 with var(--color-fdi-mist) across all pages
- Replace gradient form header with solid brand color
- Add --color-fdi-border and --color-fdi-navy-mid tokens
- Add LogoImage size prop for proper image dimensions
- Standardize primary CTAs to rounded-full
- Fix blockquote side-stripe → background tint in blog detail

Audit score before: 12-15/20 per page
Ref: docs/reports/audit_2026-04-26_all-pages-impeccable.md
```
