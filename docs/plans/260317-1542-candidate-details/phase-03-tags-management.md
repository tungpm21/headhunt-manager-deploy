# Phase 03: Tags Management
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Hiển thị danh sách các Tag đã được gán cho Ứng viên. Cho phép người dùng Xem, Thêm và Xóa tag trực tiếp từ trang chi tiết ứng viên.

## Requirements
### Functional
- [ ] Xây dựng Component `CandidateTags` nằm ở cột trái (dưới Thông tin Cá nhân).
- [ ] Giao diện hiển thị các Badge Tag (có màu tương ứng).
- [ ] Action: Nhấn nút "+" để mở Popover/Dropdown chọn thêm Tag từ danh sách có sẵn (hoặc tìm Tag).
- [ ] Action: Mỗi Tag hiện tại có nút "x" nhỏ để gỡ Tag khỏi Ứng viên đó (gọi Server Action xóa quan hệ `CandidateTag`).

## Files to Create/Modify
- `src/components/candidates/candidate-tags.tsx` - Component Client tương tác quản lý Tags.
- `src/lib/actions.ts` - Thêm 2 Server Actions: `addTagToCandidate(candidateId, tagId)` và `removeTagFromCandidate(candidateId, tagId)`.

---
Next Phase: `phase-04-notes-timeline.md`
