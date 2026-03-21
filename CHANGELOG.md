# Changelog

Mọi thay đổi đáng chú ý của dự án Headhunt Manager sẽ được ghi chép tại đây.

## [2026-03-19] - Hoàn thiện Phiên bản MVP (v1.0.0)
### Hạ tầng (Infrastructure)
- **Vercel Deployment**: Cấu hình và triển khai thành công ứng dụng lên môi trường Vercel (Production).
- **Vercel Blob Storage**: Tích hợp module `@vercel/blob`, chuyển đổi lưu trữ file mềm (CV, Avatar) từ local disk sang Cloud Storage để tương thích với Serverless.

### Thêm mới (Added)
- **Module Job Orders**: Khởi tạo, theo dõi quy trình duyệt ứng viên (Pipeline SOURCED -> PLACED).
- **Trang Import Excel**: Hỗ trợ nạp hàng loạt Ứng viên từ file thiết lập sẵn (`.xlsx`).
- **Dashboard**: Màn hình tổng quan với Widget thống kê nhanh trạng thái hệ thống.
- Modal tìm kiếm và gán nhanh ứng viên (Assign) vào Yêu cầu tuyển dụng.
- Cơ chế chặn xoá mềm (Soft Delete) đối với Khách hàng.

### Sửa lỗi (Fixed)
- Sửa lỗi Prisma khi gọi tính năng import thiếu `createdBy`.
- Căn chỉnh lại `enum` Status của phần Candidate cho tương thích toàn bộ hệ thống.
- Fix UI padding/margin ở một số card giao diện dạng danh sách.

### Công nghệ (Tech)
- Tích hợp thêm thư viện `xlsx` để parser dữ liệu từ file văn phòng.

---

## [2026-03-18] - Candidate & Client Management

### Thêm mới (Added)
- Module Ứng viên: Hệ thống bảng danh sách, Card lưới thông tin và Form thêm ứng viên thủ công.
- Module Doanh nghiệp: Quản trị Client và Danh bạ liên hệ (Contact Person).
- Cấu hình NextAuth.JS bản v5 cho Edge Runtime.
- Khởi tạo Data Schema toàn cục trên Supabase/PostgreSQL.