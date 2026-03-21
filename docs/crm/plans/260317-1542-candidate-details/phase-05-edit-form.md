# Phase 05: Edit Info Form
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Tái sử dụng Form tạo mới (CandidateForm) hoặc tạo form tương tự để Chỉnh sửa thông tin Ứng viên đang có.

## Requirements
### Functional
- [ ] Bấm nút "Sửa" ở Header → Đổ toàn bộ dữ liệu hiện tại của ứng viên vào Form chỉnh sửa.
- [ ] Cho phép sửa các trường cơ bản (Tên, SĐT, Vị trí, Mức lương mong muốn, Ngành nghề, Khu vực).
- [ ] Nút "Lưu" gọi về `updateCandidateAction` và quay về màn Detail.
- [ ] Xử lý Validate giống như trang Create (Cần SĐT hoặc Email).

## Files to Create/Modify
- `src/app/(dashboard)/candidates/[id]/edit/page.tsx` - Mở trang riêng để sửa, rộng rãi và tái sử dụng component dễ hơn (Khuyến nghị).
- `src/components/candidates/candidate-form.tsx` - Điều chỉnh để nhận `initialData` chế độ Edit.
- `src/lib/actions.ts` - Thêm `updateCandidateAction(id, formData)`.

---
Next Phase: `phase-06-actions.md`
