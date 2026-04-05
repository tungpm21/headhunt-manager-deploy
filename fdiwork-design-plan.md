# FDIWork Design Implementation Plan

> Nguồn: `docs/demo-fdiwork-config/` (4 mockups) + [design_analysis.md](file:///C:/Users/Admin/.gemini/antigravity/brain/88374590-b8a6-452f-b218-933998b30d8c/design_analysis.md)

## Goal
Implement tất cả tính năng còn thiếu từ 4 mockups FDIWork, chia thành 5 sprint theo mức ưu tiên.

---

## Sprint 1: Navigation Header + Sort Logic *(Nền tảng)*

### Tại sao trước? Header xuất hiện mọi trang, sort logic ảnh hưởng data flow.

- [ ] **1.1** `PublicHeader.tsx` — Thêm dropdown menu cho "Doanh Nghiệp" (Tất cả / Nổi bật) và "Việc Làm" (Tất cả / Nổi bật / Ngành nghề nổi bật)
  → Verify: hover/click menu hiện dropdown đúng sub-items
- [ ] **1.2** `PublicHeader.tsx` — Thêm menu "Chia Sẻ" + menu "Nhà Tuyển Dụng" (với link Liên hệ)
  → Verify: all 5 menu items hiển thị, responsive mobile hamburger
- [ ] **1.3** `PublicHeader.tsx` — Search bar trong header: dropdown "Việc làm" + ô "Nhập từ khoá" + nút tìm kiếm
  → Verify: search redirect đến `/viec-lam?q=...`
- [ ] **1.4** `public-actions.ts` — Sort doanh nghiệp: tier VIP/PREMIUM (vàng) trước, còn lại (xanh) sau, mỗi group sort mới → cũ
  → Verify: `getPublicCompanies` + `getHomepageData` trả kết quả VIP/PREMIUM trước
- [ ] **1.5** `public-actions.ts` — Sort việc làm: `isFeatured` hoặc employer tier >= PREMIUM trước, rồi mới → cũ
  → Verify: `getPublicJobs` + homepage `featuredJobs` sort đúng

---

## Sprint 2: Homepage — 3 Sections Mới

### Thêm "Tất cả DN", "Ngành nghề nổi bật" (kiểm tra IndustryGrid), "Thông tin chia sẻ"

- [ ] **2.1** `public-actions.ts` — `getHomepageData()` thêm field `allEmployers` (grid 3×2, sort mới → cũ, featured trước)
  → Verify: query trả 6 employers
- [ ] **2.2** `AllEmployersSection.tsx` [NEW] — Grid 3×2 card nhỏ (logo + tên + "X công việc") + "Khám phá thêm →"
  → Verify: component render 6 cards, link /cong-ty
- [ ] **2.3** `IndustryGrid.tsx` — Kiểm tra match mockup: carousel 1 hàng (5 items) + icon + "X công việc" badge đỏ + "Khám phá thêm →"
  → Verify: style match, có badge số lượng
- [ ] **2.4** `BlogSection.tsx` [NEW] — Placeholder grid 3 cột (ảnh + tiêu đề + nội dung). Hardcode 3 bài mẫu
  → Verify: section render dưới FeaturedJobs
- [ ] **2.5** `(public)/page.tsx` — Thêm `AllEmployersSection` + `BlogSection` vào homepage, đúng thứ tự mockup:
  Banner → TopEmployers → AllEmployers → IndustryGrid → FeaturedJobs → BlogSection
  → Verify: homepage hiển thị đủ 6-7 sections

---

## Sprint 3: Job Detail — Sidebar Mở Rộng

### Thêm "Việc làm gợi ý", "Doanh nghiệp nổi bật", sửa breadcrumb

- [ ] **3.1** `public-actions.ts` — `getPublicJobBySlug()` thêm `sameEmployerJobs` (việc làm khác cùng DN, max 3) + `featuredEmployers` (max 4)
  → Verify: query trả thêm 2 arrays
- [ ] **3.2** `viec-lam/[slug]/page.tsx` — Breadcrumb 2 dạng: `Việc làm > Ngành > Tên CV` hoặc `DN > Tên DN > Tên CV`
  → Verify: breadcrumb hiển thị đúng path
- [ ] **3.3** `viec-lam/[slug]/page.tsx` — Sidebar thêm "Việc làm gợi ý" (5 items, vàng = nổi bật, xanh = thường) dưới card công ty
  → Verify: sidebar có 2 blocks
- [ ] **3.4** `viec-lam/[slug]/page.tsx` — Sidebar thêm "Doanh nghiệp nổi bật" (4 company cards) + "Khám phá thêm →"
  → Verify: sidebar có 3 blocks total
- [ ] **3.5** `viec-lam/[slug]/page.tsx` — Section "Việc làm khác cùng DN" ở cuối main content (trước "Việc làm tương tự")
  → Verify: 2 sections việc làm related ở cuối trang

---

## Sprint 4: Footer + Blog/Chia Sẻ

- [ ] **4.1** `PublicFooter.tsx` — Redesign: Logo FDIWork + slogan, "Thông tin chia sẻ" (2 links), "Liên kết" (5 links), Zalo icon
  → Verify: footer match mockup layout
- [ ] **4.2** `(public)/chia-se/page.tsx` [NEW] — Blog listing page placeholder
  → Verify: URL `/chia-se` accessible
- [ ] **4.3** `(public)/lien-he/page.tsx` [NEW] — Form liên hệ: tên, SĐT, email, nội dung + submit
  → Verify: form hiển thị, submit gửi data

---

## Sprint 5: Ads Banner + Color-coding UI

- [ ] **5.1** `AdsBanner.tsx` [NEW] — Banner quảng cáo trên cùng header (có thể gắn link, có nút close)
  → Verify: banner hiển thị trên header, click → URL
- [ ] **5.2** `JobCard.tsx` + `CompanyCard.tsx` — Thêm color-coding: border/bg vàng cho nổi bật, xanh cho thường
  → Verify: card featured có viền vàng nhẹ, card thường có viền xanh nhẹ
- [ ] **5.3** Sub-pages: `/cong-ty?filter=featured`, `/viec-lam?filter=featured`, `/viec-lam?filter=industry`
  → Verify: filter params hoạt động

---

## Done When
- [ ] Homepage hiển thị đủ 6+ sections theo mockup
- [ ] Header có 5 menu items với dropdown
- [ ] Job detail sidebar có 3 blocks (công ty, việc làm gợi ý, DN nổi bật)
- [ ] Footer có Zalo + links
- [ ] Sort: nổi bật (vàng) luôn trước, thường (xanh) sau
- [ ] Color-coding visible trên cards

## Notes
- **Blog/Chia sẻ**: Phase 1 dùng hardcode content, sau này mới cần CMS
- **Ads banner**: Có thể hard-code link + ảnh trước, config qua admin sau
- **"Nhà Tuyển Dụng" menu**: hiện đã có "Đăng tin tuyển dụng", cần thêm "Liên hệ"
