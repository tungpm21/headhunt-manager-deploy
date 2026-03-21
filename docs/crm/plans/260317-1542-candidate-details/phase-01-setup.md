# Phase 01: Setup Layout & Load Data
Status: ⬜ Pending
Dependencies: None

## Objective
Tạo giao diện Layout cơ bản cho trang chi tiết ứng viên (Header có nút Back, nút Edit, Title, khu vực nội dung 2 cột). Đồng thời lấy được dữ liệu ứng viên hiện tại từ Server (bao gồm cả các Tag và Job liên kết) dựa trên tham số `id`.

## Requirements
### Functional
- [ ] Lấy dữ liệu Ứng viên (Candidate) từ database bằng Prisma. Xử lý trường hợp `id` không tồn tại (trả về 404).
- [ ] Dựng Header trang chi tiết với các nút bấm "Quay lại", "Chỉnh sửa" và "Xóa".
- [ ] Chia Layout khung sườn: Cột trái (Thông tin cá nhân), Cột phải (Tab Nội dung liên quan).
- [ ] Hiển thị thông tin siêu cơ bản ở trên cùng (Họ Tên, ID).

## Files to Create/Modify
- `src/app/(dashboard)/candidates/[id]/page.tsx` - File gốc của trang, chứa Server Component fetch Data và truyền prop xuống cho Client Components bên dưới.
- `src/app/(dashboard)/candidates/[id]/not-found.tsx` - Xử lý 404 nếu không tìm thấy ID ứng viên hợp lệ.

---
Next Phase: `phase-02-basic-info-view.md`
