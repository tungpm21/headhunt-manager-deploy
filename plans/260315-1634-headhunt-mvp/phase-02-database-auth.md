# Phase 02: Database & Auth
Status: ⬜ Pending
Dependencies: Phase 01

## Mục tiêu
Thiết kế database schema, tạo bảng, setup hệ thống đăng nhập cho team.

## Tasks
1. [ ] Thiết kế Prisma schema (tất cả bảng)
2. [ ] Chạy migration tạo database
3. [ ] Setup NextAuth.js (email/password)
4. [ ] Tạo trang đăng nhập
5. [ ] Tạo seed data (4 tài khoản team)
6. [ ] Middleware bảo vệ routes (phải đăng nhập)
7. [ ] Layout chính: sidebar + header

## Các bảng chính
- **User** - Tài khoản team (id, name, email, password)
- **Candidate** - Ứng viên (thông tin cá nhân, nghề nghiệp, trạng thái)
- **CandidateNote** - Ghi chú cho ứng viên (nhiều ghi chú/ứng viên)
- **CandidateTag** - Tags/nhãn
- **Client** - Doanh nghiệp khách hàng
- **ClientContact** - Người liên hệ của DN
- **JobOrder** - Đơn hàng tuyển dụng
- **JobCandidate** - Gán ứng viên vào job (bảng trung gian)

## Output
- Database PostgreSQL với đầy đủ bảng
- Đăng nhập hoạt động
- Layout chính với sidebar navigation

---
Next Phase: Phase 03 - Candidate Management
