# Task: Wire up CoverPositionEditor to Employer Portal

## Status: 3 files to change, then build + push

---

## Background

The cover image position/zoom feature is partially implemented. The goal is for both admin CRM and employer portal to have an interactive editor where users can drag to reposition and zoom the cover image — so the public company profile shows exactly what they intended.

**Already done (do NOT re-implement):**
- `prisma/schema.prisma`: `coverPositionX Int @default(50)`, `coverPositionY Int @default(50)`, `coverZoom Int @default(100)` added to `Employer` model
- Migration `20260405182700_add_cover_position_zoom` applied ✅
- `src/components/CoverPositionEditor.tsx`: fully implemented drag/pan + zoom slider component ✅
- `src/app/(dashboard)/employers/[id]/edit/employer-edit-form.tsx`: admin CRM form fully wired (CoverPositionEditor + hidden inputs) ✅
- `src/app/(dashboard)/employers/[id]/edit/page.tsx`: passes `coverPositionX/Y/zoom` to the form ✅
- `src/lib/moderation.ts`: `getEmployerModerationById` selects `coverPositionX/Y/zoom`, `updateEmployerModerationInfo` data type includes them ✅
- `src/lib/moderation-actions.ts`: `updateEmployerInfo` reads `coverPositionX/Y/zoom` from formData and passes to update ✅
- `src/lib/public-actions.ts`: `CompanyProfile` type has the fields, `getCompanyBySlug` selects them ✅
- `src/app/(public)/cong-ty/[slug]/page.tsx`: applies `objectPosition` + `transform: scale()` + `transformOrigin` using the values ✅

---

## Change 1 of 3: `src/lib/employers.ts`

**Function:** `updateEmployerProfileById` (around line 91)

**Current data type:**
```ts
data: {
  companyName: string;
  description: string | null;
  industry: string | null;
  companySize: "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE" | undefined;
  address: string | null;
  website: string | null;
  phone: string | null;
  coverImage?: string | null;
}
```

**Change:** Add three optional fields:
```ts
data: {
  companyName: string;
  description: string | null;
  industry: string | null;
  companySize: "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE" | undefined;
  address: string | null;
  website: string | null;
  phone: string | null;
  coverImage?: string | null;
  coverPositionX?: number;
  coverPositionY?: number;
  coverZoom?: number;
}
```

No other changes to this file. The `prisma.employer.update({ data })` call already spreads the object correctly.

---

## Change 2 of 3: `src/lib/employer-actions.ts`

**Function:** `updateCompanyProfileAction` (around line 244)

**Current call to `updateEmployerProfileById`** (around line 265):
```ts
await updateEmployerProfileById(session.employerId, {
  companyName: parsedInput.data.companyName,
  description: parsedInput.data.description || null,
  industry: parsedInput.data.industry || null,
  companySize: parsedInput.data.companySize ?? undefined,
  address: parsedInput.data.address || null,
  website: parsedInput.data.website || null,
  phone: parsedInput.data.phone || null,
  coverImage: formData.get("coverImage")?.toString().trim() || null,
});
```

**Change:** Add three lines reading from formData:
```ts
await updateEmployerProfileById(session.employerId, {
  companyName: parsedInput.data.companyName,
  description: parsedInput.data.description || null,
  industry: parsedInput.data.industry || null,
  companySize: parsedInput.data.companySize ?? undefined,
  address: parsedInput.data.address || null,
  website: parsedInput.data.website || null,
  phone: parsedInput.data.phone || null,
  coverImage: formData.get("coverImage")?.toString().trim() || null,
  coverPositionX: parseInt(formData.get("coverPositionX")?.toString() || "50") || 50,
  coverPositionY: parseInt(formData.get("coverPositionY")?.toString() || "50") || 50,
  coverZoom: parseInt(formData.get("coverZoom")?.toString() || "100") || 100,
});
```

No other changes to this file.

---

## Change 3 of 3: `src/app/(employer)/employer/(portal)/company/page.tsx`

This is the biggest change. The page is `"use client"`. Currently it has a simple URL text input for `coverImage` and a static preview. Replace that whole section with a proper upload/preview + CoverPositionEditor.

**Imports to add at top:**
```ts
import { useRef, useState, useEffect } from "react";
import { CoverPositionEditor } from "@/components/CoverPositionEditor";
import { ImagePlus, X } from "lucide-react";
```
(Note: `useState` and `useEffect` are already imported. `useRef` may not be — add it.)

**Add cover position state** inside the component, after the existing `useState` hooks:
```ts
const [coverPos, setCoverPos] = useState({ positionX: 50, positionY: 50, zoom: 100 });
const [coverImageUrl, setCoverImageUrl] = useState<string>("");
const [coverPreview, setCoverPreview] = useState<string | null>(null);
const coverFileRef = useRef<HTMLInputElement>(null);
```

**Sync with loaded employer data** — update the existing `useEffect` (around line 33) that calls `getCompanyProfile()`:
```ts
useEffect(() => {
  getCompanyProfile().then((data) => {
    setEmployer(data);
    setCoverPos({
      positionX: data?.coverPositionX ?? 50,
      positionY: data?.coverPositionY ?? 50,
      zoom: data?.coverZoom ?? 100,
    });
    setCoverImageUrl(data?.coverImage ?? "");
    setCoverPreview(data?.coverImage ?? null);
    setLoading(false);
  });
}, []);
```

**Replace the cover image section** (currently lines ~99–156, the static preview + URL text input). Replace the entire block from `{/* Cover image preview */}` down to the closing `</div>` of the URL input group with:

```tsx
{/* Cover image */}
<div className="pb-5 border-b border-gray-100 space-y-3">
  <p className="text-sm font-medium text-gray-700">Ảnh bìa công ty</p>

  {/* Preview / drag zone */}
  {coverPreview ? (
    <CoverPositionEditor
      imageUrl={coverPreview}
      positionX={coverPos.positionX}
      positionY={coverPos.positionY}
      zoom={coverPos.zoom}
      onChange={setCoverPos}
    />
  ) : (
    <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-400">Chưa có ảnh bìa</p>
    </div>
  )}

  {/* File upload */}
  <input
    ref={coverFileRef}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      setCoverPreview(objectUrl);
    }}
  />

  {/* URL input (hidden — carries persisted URL) */}
  <input type="hidden" name="coverImage" value={coverImageUrl} />

  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => coverFileRef.current?.click()}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition cursor-pointer"
    >
      <ImagePlus className="h-4 w-4" />
      {coverPreview ? "Đổi ảnh bìa" : "Tải ảnh lên"}
    </button>
    {coverPreview && (
      <button
        type="button"
        onClick={() => { setCoverPreview(null); setCoverImageUrl(""); }}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 hover:bg-gray-50 transition cursor-pointer"
      >
        <X className="h-4 w-4" />
        Xóa ảnh bìa
      </button>
    )}
  </div>

  <p className="text-xs text-gray-400">JPG, PNG, WebP. Khuyến nghị 1200×400px.</p>
</div>

{/* Hidden position inputs */}
<input type="hidden" name="coverPositionX" value={coverPos.positionX} />
<input type="hidden" name="coverPositionY" value={coverPos.positionY} />
<input type="hidden" name="coverZoom" value={coverPos.zoom} />
```

**Important note on file upload:** The employer portal currently uses URL-based `coverImage`, not file upload (unlike admin CRM which uses `uploadFile`). The employer portal `updateCompanyProfileAction` reads `coverImage` as a URL string from formData. If you want to support actual file upload here too, that requires changes to `updateCompanyProfileAction` to call `uploadFile`. For now, keep it URL-only: the `coverFileRef` input creates an object URL for local preview only, while the actual `coverImage` value submitted is the existing URL from the database. This matches the current pattern where admin uploads the file, employer just adjusts the crop/zoom.

If you choose to support actual file upload in employer portal, follow the same pattern as `moderation-actions.ts` `updateEmployerInfo` which uses `uploadFile` and `deleteFile` from `@/lib/storage`.

---

## After all 3 changes

Run type check and build:
```bash
cd d:/MH/Headhunt_pj
npx tsc --noEmit
npm run build
```

If both pass, commit and push:
```bash
git add src/lib/employers.ts src/lib/employer-actions.ts "src/app/(employer)/employer/(portal)/company/page.tsx"
git commit -m "feat: add cover position/zoom editor to employer portal"
git push
```

---

## Key files for reference

- `src/components/CoverPositionEditor.tsx` — the editor component (props: `imageUrl`, `positionX`, `positionY`, `zoom`, `onChange`)
- `src/app/(dashboard)/employers/[id]/edit/employer-edit-form.tsx` — working example of how the editor is used in admin CRM
- `src/lib/moderation-actions.ts` lines ~265–275 — working example of how to read coverPositionX/Y/zoom from formData
