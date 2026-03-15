# Phase 02: Database & Auth
Status: ✅ Complete
Dependencies: Phase 01

## Mục tiêu
Thiết kế database schema, tạo bảng, setup hệ thống đăng nhập cho team.

## Tasks
1. [x] Thiết kế Prisma schema (tất cả bảng)
2. [x] Chạy migration tạo database
3. [x] Setup NextAuth.js (email/password)
4. [x] Tạo trang đăng nhập
5. [x] Tạo seed data (4 tài khoản team)
6. [x] Middleware bảo vệ routes
7. [x] Layout chính: sidebar + header

## Các bảng chính
- **User** - Tài khoản team
- **Candidate** - Ứng viên
- **CandidateNote** - Ghi chú cho ứng viên
- **CandidateTag** - Tags/nhãn
- **Client** - Doanh nghiệp khách hàng
- **ClientContact** - Người liên hệ của DN
- **JobOrder** - Đơn hàng tuyển dụng
- **JobCandidate** - Gán ứng viên vào job

## Output
- Schema Postgres thiết lập thành công. Database host trên server Prisma.
- Hệ thống auth với NextAuth.js v5 hoạt động
- Role: ADMIN & MEMBER
- Đã seed 4 users (mật khẩu mặc định: headhunt123)

---
Next Phase: Phase 03 - Candidate Management
