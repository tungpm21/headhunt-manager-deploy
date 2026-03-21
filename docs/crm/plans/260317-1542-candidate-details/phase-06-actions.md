# Phase 06: Delete & Action Logic
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Ngăn chặn và cảnh báo thao tác Xóa (Delete) an toàn cho người dùng, bổ sung thao tác cập nhật Trạng thái ứng viên (Available -> Employed -> Blacklist) nhanh chóng trên Header.

## Requirements
### Functional
- [ ] Logic "Đổi Trạng thái": Cạnh nút Back, tạo nút Dropdown `Toggle Status` cho phép click nhanh chọn trạng thái mới.
- [ ] Bấm nút "Xóa": Mở Modal AlertDialog (Hộp thoại cảnh báo) màu đỏ. "Xóa" chỉ sửa cờ `isDeleted = true` trong database (Soft delete), chứ không xóa thật khỏi PostgreSQL.
- [ ] Chuyển hướng người dùng về `/candidates` sau khi Xóa thành công.

## Files to Create/Modify
- `src/lib/actions.ts` - Thêm `updateCandidateStatusAction(id, status)` và `deleteCandidateAction(id)`.
- `src/components/candidates/delete-candidate-btn.tsx` - Nút màu đỏ và AlertDialog Confirm bảo mật.

---
End of Plan.
