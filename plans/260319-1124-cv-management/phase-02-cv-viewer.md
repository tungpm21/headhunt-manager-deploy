# Phase 02: CV Viewer Implementation
Status: ⬜ Pending
Dependencies: phase-01

## Objective
Nhúng trình xem file CV (PDF/Doc) vào cột bên phải để Headhunter xem trực tiếp.

## Requirements
### Functional
- [x] Nếu ứng viên đã có `cvFileUrl`, hiển thị khung xem PDF nhúng (chứa nội dung CV) ở cột bên phải (bên cạnh hoặc phía trên Notes Timeline).
- [x] Nếu ứng viên chưa có CV, hiển thị Empty State "Chưa có CV" kèm nút kêu gọi Upload.
- [x] Hỗ trợ render PDF trực tiếp bằng `<object>` hoặc `<iframe src={...}>` gốc của trình duyệt để nhẹ và nhanh.

### Non-Functional
- [x] Khung Preview chiếm tối đa không gian cột phải để đọc dễ nhất.

## Implementation Steps
1. [x] Tạo file component mới `src/components/candidates/cv-viewer.tsx`.
2. [x] Truyền prop `cvUrl` vào component này.
3. [x] Component sẽ return một thẻ `iframe` hiển thị PDF `src={`${cvUrl}#toolbar=0`}` (hoặc giao diện rỗng nếu không có link).
4. [x] Nhúng `<CvViewer>` vào `src/app/(dashboard)/candidates/[id]/page.tsx` (Cột phải).

## Files to Create/Modify
- `src/components/candidates/cv-viewer.tsx` (NEW) - Component hiển thị nội dung file.
- `src/app/(dashboard)/candidates/[id]/page.tsx` - Gọi component CvViewer.

## Test Criteria
- [ ] File PDF hiển thị bình thường trong khung.
- [ ] Giao diện rỗng hiện ra đẹp mắt khi chưa có file.

---
Next Phase: phase-03-testing.md
