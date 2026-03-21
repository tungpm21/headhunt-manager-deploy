# 💡 BRIEF: Candidate CV Upload & Preview

**Ngày tạo:** 19/03/2026
**Brainstorm cùng:** Admin

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Trang chi tiết và form nhập của Ứng Viên hiện tại chưa hỗ trợ Upload CV và cũng chưa có khung Preview CV (PDF/DOC) để Headhunter xem nhanh nội dung CV.

## 2. GIẢI PHÁP ĐỀ XUẤT
Tích hợp tính năng Quản lý CV vào trang Ứng Viên, cho phép:
- Upload file CV (PDF, Word) dễ dàng.
- Xem trực tiếp nội dung CV ngay trên web mà không cần tải về.
- Cho phép tải về hoặc xóa CV cũ để cập nhật CV mới.

## 3. THỰC TRẠNG (TECHNICAL REALITY)
- Đã có cột `cvFileUrl` trong CSDL.
- Đã có API upload file: `/api/candidates/[id]/cv`
- Đã có component Upload cơ bản (UI kéo thả, hỗ trợ PDF/DOC tối đa 10MB).
=> **Chỉ thiếu phần Tích hợp lên giao diện thật và xây UI Xem trước (Preview).**

## 4. TÍNH NĂNG (GỢI Ý)

### 🚀 MVP (Bắt buộc có):
- [ ] Gắn khung Upload CV vào cột bên trái (bên dưới Thông tin liên hệ) trên trang chi tiết ứng viên.
- [ ] Gắn nút/khung hiển thị CV để Headhunter xem.

### ❓ CẦN QUYẾT ĐỊNH (TÙY CHỌN PREVIEW):
- **Cách 1: Nút bấm hiển thị Popup (Modal).** (Gọn gàng nhất)
- **Cách 2: Chia đôi màn hình.** Bên trái là thông tin ứng viên, bên phải là khung nhúng PDF mở sẵn. (Phù hợp với Headhunter dùng màn hình máy tính to).
- **Cách 3: Mở sang tab mới.** (Đơn giản nhất, dùng tính năng mặc định mặc định của trình duyệt).

## 5. BƯỚC TIẾP THEO
Anh cho ý kiến về phương án trình bày tính năng Preview nhé. Sau đó chúng ta sẽ chốt Brief và em sẽ code.
