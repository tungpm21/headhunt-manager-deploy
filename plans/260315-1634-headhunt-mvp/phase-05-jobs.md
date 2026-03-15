# Phase 05: Job Order Management
Status: ⬜ Pending
Dependencies: Phase 03, Phase 04

## Mục tiêu
Quản lý đơn hàng tuyển dụng - kết nối DN với ứng viên.

## Tasks

### CRUD Job Order
1. [ ] Trang danh sách Jobs (table view, lọc theo trạng thái)
2. [ ] Tạo Job Order mới (chọn DN, nhập JD, lương, deadline)
3. [ ] Trang chi tiết Job Order
4. [ ] Sửa/đóng job order

### Gán ứng viên
5. [ ] Tìm & gán ứng viên phù hợp vào job
6. [ ] Cập nhật status ứng viên trong job (Giới thiệu → Interview → Offer → Placed / Rejected)
7. [ ] Bỏ gán ứng viên khỏi job

### Tracking
8. [ ] Trạng thái job: Đang tuyển / Tạm dừng / Đã tuyển / Hủy
9. [ ] Phí dịch vụ (fee headhunt)
10. [ ] Ghi chú cho job order

### Thông tin Job Order cần lưu
- Tên vị trí cần tuyển
- Doanh nghiệp (liên kết Client)
- Mô tả công việc (JD)
- Mức lương (min-max)
- Số lượng cần tuyển
- Deadline
- Người phụ trách trong team
- Trạng thái
- Phí dịch vụ
- Danh sách ứng viên đã gán (với trạng thái từng người)

## Output
- Job Order CRUD đầy đủ
- Gán & track ứng viên theo job
- Nhìn được tổng quan job nào đang mở, có bao nhiêu ứng viên

---
Next Phase: Phase 06 - Excel Import & Polish
