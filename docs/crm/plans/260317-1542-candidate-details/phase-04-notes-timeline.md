# Phase 04: Notes Timeline
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Xây dựng cột bên phải hiển thị Tab "Ghi chú" (Notes). Cho phép người dùng lưu lại lịch sử làm việc với ứng viên (ví dụ: đã gọi điện ngày nào, kết quả ra sao) dưới dạng Dòng thời gian (Timeline).

## Requirements
### Functional
- [ ] Phần đầu của luồng Notes có form nhập liệu giản lược: Một textarea và nút "Thêm ghi chú".
- [ ] Danh sách ghi chú hiển thị bên dưới, sắp xếp mới nhất lên đầu.
- [ ] Mỗi ghi chú hiển thị: Nội dung, Tên người tạo (dựa vào Session), Thời gian tạo (VD: 2 giờ trước, 15/03/2026).
- [ ] Cần Server Action `addCandidateNote(candidateId, content)`.

## Files to Create/Modify
- `src/components/candidates/candidate-notes.tsx` - Box nhập ghi chú và danh sách Timeline.
- `src/lib/actions.ts` - Thêm `addCandidateNote` Server Action hỗ trợ `revalidatePath`.

---
Next Phase: `phase-05-edit-form.md`
