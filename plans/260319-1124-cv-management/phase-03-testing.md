# Phase 03: Testing & Polish
Status: ⬜ Pending
Dependencies: phase-02

## Objective
Kiểm thử toàn bộ luồng Upload, hiển thị ngay lập tức (Sync state), Xoá CV.

## Requirements
### Functional
- [x] Đảm bảo khi Upload xong, UI ở component `<CvUpload>` tự động cập nhật.
- [x] Cần làm cách nào đó để khi Upload CV xong ở cột Trái, khung Preview ở cột Phải **tự động Re-render** để hiện file mới lên.
  - *Giải pháp:* Vì trang gốc là Server Component tĩnh, có thể dùng `useRouter().refresh()` trong callback `onSuccess` của `<CvUpload>` để kích hoạt tải lại nhẹ dữ liệu.

## Implementation Steps
1. [x] Bổ sung logic gọi hook `useRouter` trong file `src/components/candidates/cv-upload.tsx`, thêm `router.refresh()` vào phần `onSuccess`.
2. [x] Test thực tế với 1 file PDF mẫu trên trình duyệt.
3. [x] Xóa thử file bằng API/nút bấm (nếu có).

## Files to Modify
- `src/components/candidates/cv-upload.tsx` - Thêm logic làm mới trạng thái Server Component.

## Test Criteria
- [x] Up CV xong -> 1-2 giây sau bên phải hiện luôn CV.
- [x] Trải nghiệm mượt mà không lỗi console.

---
End of Plan.
