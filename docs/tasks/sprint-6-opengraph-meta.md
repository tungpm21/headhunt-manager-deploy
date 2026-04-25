# Sprint 6 — OpenGraph Meta Tags cho Social Sharing

**Assigned to:** Codex  
**Branch:** master  
**Last updated:** 2026-04-21  
**Status:** Ready to execute

---

## 1. Context

FDI Credibility Kit đã hoàn chỉnh. Sprint 6 là sprint cuối trước khi launch: thêm OpenGraph meta tags để khi share link lên Zalo/Facebook/LinkedIn hiển thị rich preview (title + description + logo) thay vì plain URL.

**Hiện trạng:** `generateMetadata` trên job detail và company profile chỉ trả `title` + `description`. Không có `openGraph` → share link không có preview hình, không professional.

**Mục tiêu sau sprint này:** Share `/viec-lam/ky-su-san-xuat-samsung` lên Zalo → hiện preview: tên job, tên công ty, mô tả ngắn, logo Samsung.

---

## 2. Task 1 — Public layout: `metadataBase`

### File: `src/app/(public)/layout.tsx`

**Thêm `metadataBase`** vào `metadata` object và bổ sung OG site-level defaults. Tìm:

```ts
export const metadata: Metadata = {
  title: {
    default: "FDIWork - Việc làm FDI tại Việt Nam",
    template: "%s | FDIWork",
  },
  description: "...",
};
```

**Sửa thành:**

```ts
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: {
    default: "FDIWork - Việc làm FDI tại Việt Nam",
    template: "%s | FDIWork",
  },
  description:
    "Nền tảng tuyển dụng hàng đầu cho doanh nghiệp FDI tại Việt Nam. Tìm việc làm chất lượng cao, kết nối nhà tuyển dụng với ứng viên.",
  openGraph: {
    siteName: "FDIWork",
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "FDIWork - Việc làm FDI tại Việt Nam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fdiwork",
  },
};
```

*Lưu ý: `/og-default.png` là placeholder — nếu file không tồn tại, Zalo/FB vẫn render title+description, chỉ không có hình. Không cần tạo ảnh này ngay.*

---

## 3. Task 2 — Job detail: OpenGraph

### File: `src/app/(public)/viec-lam/[slug]/page.tsx`

Tìm `generateMetadata` function (dòng ~41). **Sửa return statement** để thêm `openGraph`:

**TRƯỚC:**
```ts
return {
  title: `${result.job.title} - ${result.job.employer.companyName}`,
  description: result.job.description.slice(0, 160),
};
```

**SAU:**
```ts
const job = result.job;
const title = `${job.title} - ${job.employer.companyName}`;
const description = job.description.replace(/\n/g, " ").slice(0, 200);

return {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: job.employer.logo
      ? [{ url: job.employer.logo, width: 400, height: 400, alt: job.employer.companyName }]
      : [],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: job.employer.logo ? [job.employer.logo] : [],
  },
};
```

---

## 4. Task 3 — Company profile: OpenGraph

### File: `src/app/(public)/cong-ty/[slug]/page.tsx`

Tìm `generateMetadata` function. **Sửa return statement** tương tự, thêm `openGraph` với logo công ty:

```ts
// Giả sử hiện tại return là:
// return { title: company.companyName, description: company.description?.slice(0, 160) ?? "..." };

// Sửa thành (đọc file trước để biết chính xác current return):
const title = `${company.companyName} | Tuyển dụng FDI`;
const description = (company.description ?? "").replace(/\n/g, " ").slice(0, 200) || 
  `${company.companyName} đang tuyển dụng tại FDIWork - Job board FDI hàng đầu Việt Nam.`;

return {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: company.logo
      ? [{ url: company.logo, width: 400, height: 400, alt: company.companyName }]
      : [],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: company.logo ? [company.logo] : [],
  },
};
```

*Đọc file thực tế để biết tên biến đúng (`company`, `data`, hay gì khác).*

---

## 5. Task 4 — Thêm `NEXT_PUBLIC_SITE_URL` vào `.env.example`

```bash
# Public Site URL (used for OpenGraph metadataBase)
NEXT_PUBLIC_SITE_URL="https://fdiwork.vn"
```

Thêm dòng này vào cuối `.env.example`.

---

## 6. Verification

```bash
npx tsc --noEmit
npm run build
```

### Manual check (nếu có ngrok hoặc Vercel preview URL)

1. Dùng [opengraph.xyz](https://www.opengraph.xyz) hoặc [metatags.io](https://metatags.io) để preview
2. Paste URL job: `/viec-lam/ky-su-san-xuat-samsung`
3. Confirm hiện: title "Kỹ sư sản xuất (Production Engineer) - Samsung Electronics Vietnam", description, logo Samsung

*Nếu không test được ngay, TypeScript pass là đủ để commit.*

---

## 7. Commit

```bash
git add "src/app/(public)/layout.tsx" \
  "src/app/(public)/viec-lam/[slug]/page.tsx" \
  "src/app/(public)/cong-ty/[slug]/page.tsx" \
  .env.example

git commit -m "feat: add OpenGraph meta tags for social sharing on job + company pages (Sprint 6)"
```

---

## 8. Files KHÔNG được sửa

| File | Lý do |
|------|-------|
| `src/app/layout.tsx` | Root layout cho admin CRM, không phải public |
| `src/app/(public)/viec-lam/page.tsx` | List page không cần OG đặc biệt — dùng layout default |
| Tất cả file khác | Sprint 6 chỉ sửa 3 file public + 1 file env example |
