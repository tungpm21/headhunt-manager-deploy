# Phase 01: Split-Screen UI & Setup
Status: ⬜ Pending
Dependencies: None

## Objective
Thay đổi layout của trang Chi tiết Ứng viên thành dạng Chia đôi màn hình (Split-Screen) và tích hợp component Upload CV vào đúng vị trí.

## Requirements
### Functional
- [x] Trang `/candidates/[id]` chia thành 2 cột độc lập (có thể cuộn riêng biệt từng cột).
- [x] Cột Trái: Chứa "Thông tin liên hệ", "Upload CV", "Nghề nghiệp", "Tags".
- [x] Cột Phải: Chứa "Timeline Ghi chú" và (sau này là) "Khung xem CV".
- [x] Tích hợp `CvUpload` component (đã có sẵn) vào bên dưới khối Thông tin liên hệ ở cột trái.

### Non-Functional
- [x] UI gọn gàng, phù hợp màn hình Desktop (Headhunter form). Responsive: nếu màn hình nhỏ (Mobile) thì tự động xếp dọc.

## Implementation Steps
1. [x] Sửa file `src/app/(dashboard)/candidates/[id]/page.tsx` để đổi layout grid thành dạng split-screen (ví dụ `grid-cols-1 lg:grid-cols-2` hoặc tỷ lệ `4:6`).
2. [x] Thêm styles `h-[calc(100vh-100px)] overflow-y-auto` cho 2 cột để có thể cuộn độc lập.
3. [x] Import và chèn component `<CvUpload>` vào layout cột trái.
4. [x] Truyền đúng các props (`candidateId`, `currentCvUrl`, `currentCvFileName`) vào `<CvUpload>`.

## Files to Modify
- `src/app/(dashboard)/candidates/[id]/page.tsx` - Sửa cấu trúc Layout.

## Test Criteria
- [ ] Layout hiển thị dạng 2 cột trên Desktop.
- [ ] Scroll cột trái không làm chạy cột phải.
- [ ] Nút Upload CV hiển thị đúng trạng thái CV hiện tại (nếu có).

---
Next Phase: phase-02-cv-viewer.md
