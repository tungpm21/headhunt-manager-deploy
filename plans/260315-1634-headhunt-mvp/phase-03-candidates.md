# Phase 03: Candidate Management
Status: ✅ Complete
Dependencies: Phase 02

## Mục tiêu
Xây dựng toàn bộ tính năng quản lý ứng viên - phần CORE của app.

## Tasks

### CRUD Ứng viên
1. [x] Trang danh sách ứng viên (table view, phân trang)
2. [x] Trang thêm ứng viên mới (form đầy đủ)
3. [x] Trang chi tiết ứng viên (xem + sửa)
4. [x] Xóa ứng viên (soft delete - ẩn đi, không xóa hẳn)

### Upload CV
5. [x] Upload file CV (PDF/Word, max 10MB)
6. [x] Hiển thị link download CV trong hồ sơ
7. [x] Thay thế CV (upload lại)

### Tìm kiếm & Lọc
8. [x] Tìm kiếm theo tên, SĐT, email
9. [x] Lọc theo ngành, vị trí, khu vực
10. [x] Lọc theo mức lương (khoảng min-max)
11. [x] Lọc theo trạng thái (Available, Đã có việc...)
12. [x] Lọc theo tags

### Tags & Ghi chú
13. [x] Gắn tags cho ứng viên (chọn có sẵn hoặc tạo mới)
14. [x] Thêm ghi chú (text + timestamp + ai viết)
15. [x] Xem lịch sử ghi chú

### Thông tin ứng viên cần lưu
- Họ tên, SĐT, email, ngày sinh, giới tính
- Vị trí hiện tại, công ty hiện tại
- Ngành nghề, số năm kinh nghiệm
- Mức lương hiện tại, mức lương mong muốn
- Khu vực (TP.HCM, Hà Nội...)
- Trạng thái: Available / Đã có việc / Đang interview / Blacklist
- Nguồn: LinkedIn, TopCV, Giới thiệu, Khác
- CV file
- Tags
- Ghi chú (nhiều ghi chú, có timestamp)

## Files đã tạo
### Pages
- `src/app/(dashboard)/candidates/page.tsx` — Danh sách + filters + pagination
- `src/app/(dashboard)/candidates/new/page.tsx` — Form thêm mới
- `src/app/(dashboard)/candidates/[id]/page.tsx` — Chi tiết + sửa + CV + notes

### Components
- `src/components/candidates/candidate-table.tsx` — Table + mobile card view
- `src/components/candidates/candidate-form.tsx` — Form thêm mới
- `src/components/candidates/edit-candidate-form.tsx` — Form sửa
- `src/components/candidates/candidate-filters.tsx` — Bộ lọc nâng cao
- `src/components/candidates/cv-upload.tsx` — Upload CV
- `src/components/candidates/avatar-upload.tsx` — Upload avatar
- `src/components/candidates/candidate-notes.tsx` — Ghi chú
- `src/components/candidates/tag-selector.tsx` — Chọn + tạo tags
- `src/components/candidates/status-badge.tsx` — Badge trạng thái
- `src/components/candidates/delete-candidate-button.tsx` — Nút xóa

### API Routes
- `src/app/api/candidates/[id]/cv/route.ts` — Upload CV
- `src/app/api/candidates/avatar/route.ts` — Upload avatar

### Data Layer
- `src/lib/candidates.ts` — CRUD functions + filters + pagination
- `src/lib/tags.ts` — Tag management
- `src/lib/actions.ts` — Server Actions (create, update, delete, note, tag)

## Output
✅ Quản lý ứng viên đầy đủ, dễ dùng
✅ Upload & lưu CV (PDF/Word, max 10MB)
✅ Tìm kiếm + lọc nhanh (tên, SĐT, email, ngành, khu vực, lương, tags)
✅ Ghi chú & tags đầy đủ

---
Next Phase: Phase 04 - Client Management
