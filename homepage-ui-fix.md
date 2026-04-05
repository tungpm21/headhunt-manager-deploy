# Homepage UX/UI Fix Plan

## Goal
Sửa lại giao diện trang chủ FDIWork cho giống VietnamWorks: ẩn hero khi load, phóng to logo/text employers, đồng bộ màu nền gradient xuyên suốt, phân chia section rõ ràng.

## Tasks

- [ ] **Task 1: HeroSection — Ẩn mặc định, hiện khi click search**
  - Mặc định chỉ hiện Header. khu vực Hero (tiêu đề + search bar + stats + tags) bị collapsed (`max-height: 0`).
  - Khi user click vào ô search trên Header → hero animate mở ra (`max-height` transition, ~400ms ease-out).
  - Thêm State `heroExpanded` vào component, điều khiển bằng callback từ Header.
  - → Verify: Load trang, hero ẩn. Click search, hero trượt xuống mượt.

- [ ] **Task 2: EmployerBannerCarousel — Đồng bộ gradient nền**
  - Background section chuyển sang gradient liền mạch từ HeroSection: `from-[var(--color-fdi-primary)] via-[#005A9E] to-[var(--color-fdi-dark)]`.
  - Tăng padding-top section nếu hero collapsed, giảm nếu hero expanded (transition mượt).
  - → Verify: Nền banner liền mạch với khu vực hero, không có đường cắt ngang.

- [ ] **Task 3: TopEmployers — Phóng to logo + text**
  - Card thay đổi: `w-[220px] h-[260px]`, logo container `h-[100px]` chiếm trọng tâm.
  - Tên công ty: từ `text-xs` → `text-sm font-bold`, cho phép `line-clamp-2`.
  - Nền section: `bg-[var(--color-fdi-surface)]` (xanh nhạt) đồng bộ.
  - → Verify: Logo hiển thị to rõ, text tên công ty đọc được ngay trên mobile.

- [ ] **Task 4: IndustryGrid — Giữ layout dọc, tăng kích cỡ**
  - Icon circle từ `h-20 w-20` giữ nguyên. Text ngành nghề tăng lên `text-base font-bold`.
  - Số việc làm: `text-sm` thay vì quá nhỏ.
  - Container card: thêm `rounded-2xl shadow-md border border-gray-100` rõ rệt hơn.
  - → Verify: Các ô ngành nghề có kích cỡ dễ đọc, tách biệt nhau rõ ràng.

- [ ] **Task 5: FeaturedJobs — Phân chia màu section**
  - Section "Việc làm mới nhất": nền `bg-white` thay vì `bg-gray-50`.
  - JobCard: Logo employer tăng từ `h-11 w-11` → `h-14 w-14`. Tên job: `text-base`.
  - Thêm "Hot" badge màu đỏ cho `isFeatured` (thay vì "Nổi bật" vàng hiện tại) giống VietnamWorks.
  - Section heading: `text-3xl font-extrabold` + italic để nổi bật.
  - → Verify: Section jobs có contrast rõ với section trên/dưới.

- [ ] **Task 6: Verification — Kiểm tra tổng thể**
  - Mở trình duyệt, so sánh trực quan với VietnamWorks.
  - Kiểm tra responsive trên 375px, 768px, 1440px.
  - Focus state hoạt động đúng trên tất cả interactive elements.

## Notes
- Tất cả transition dùng `ease-out`, duration `300-400ms` (Doherty Threshold).
- Không phá vỡ SEO: giữ nguyên `h1` trong HeroSection dù ẩn (dùng CSS visibility, không xóa DOM).
- Tuân thủ Von Restorff Effect: CTA "Tìm kiếm" luôn nổi bật nhất bằng accent orange.
