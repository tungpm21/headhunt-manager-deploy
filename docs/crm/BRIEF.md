# 💡 BRIEF: Headhunt Manager

**Ngày tạo:** 2026-03-15
**Loại sản phẩm:** Web App

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Team headhunt 4 người đang quản lý hồ sơ ứng viên trên Excel:
- Nhập liệu thủ công, mất thời gian
- Dữ liệu phân mảnh (nhiều file Excel)
- Khó tìm kiếm ứng viên phù hợp khi có yêu cầu
- Không track được lịch sử trao đổi
- Khó phối hợp team (ai đang xử lý ứng viên nào?)

## 2. GIẢI PHÁP ĐỀ XUẤT
Web app quản lý tập trung: hồ sơ ứng viên, khách hàng (DN), đơn hàng tuyển dụng.
Team 4 người cùng truy cập, dữ liệu đồng bộ, tìm kiếm nhanh.

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Primary:** Team headhunt 4 người (recruiter)
- **Secondary:** Quản lý/sếp (xem báo cáo - phase sau)

## 4. NGHIÊN CỨU THỊ TRƯỜNG

### Đối thủ:
| App | Điểm mạnh | Điểm yếu |
|-----|-----------|----------|
| Zoho Recruit | ATS+CRM, parse CV, hệ sinh thái Zoho | Phức tạp, thừa tính năng |
| Recruit CRM | Đúng cho agency, pipeline đẹp | Đắt (~$200/tháng cho 4 user) |
| Manatal | AI matching, giá tốt | AI chưa tốt với tiếng Việt |
| JazzHR | Rẻ, dễ dùng | Không có CRM cho client |

### Điểm khác biệt của mình:
- Tiếng Việt 100%, UX thân thuộc
- Đơn giản, chỉ có đúng tính năng cần
- Tự build = không tốn subscription hàng tháng
- Tùy chỉnh theo quy trình riêng

## 5. TÍNH NĂNG

### 🚀 MVP (Bắt buộc có):
- [ ] Quản lý ứng viên (CRUD, tìm kiếm, lọc, ghi chú, tags)
- [ ] Upload & lưu CV (PDF/Word)
- [ ] Quản lý khách hàng - doanh nghiệp (CRUD, người liên hệ)
- [ ] Job Order cơ bản (tạo, gán ứng viên, trạng thái)
- [ ] Tài khoản team 4 người (đăng nhập, phân quyền cơ bản)
- [ ] Import dữ liệu từ Excel hiện tại

### 🎁 Phase 2 (Làm sau):
- [ ] Pipeline/Kanban view cho Job Order
- [ ] Dashboard & báo cáo tổng quan
- [ ] Nhắc nhở / Reminder
- [ ] Activity Log (ai làm gì, lúc nào)
- [ ] Export báo cáo (Excel/PDF)

### 💭 Phase 3 (Cân nhắc):
- [ ] Báo cáo doanh thu / phí dịch vụ
- [ ] Báo cáo hiệu suất team
- [ ] Analytics nguồn ứng viên

## 6. ƯỚC TÍNH SƠ BỘ
- **Độ phức tạp:** Trung bình
- **Rủi ro:** Cần backup dữ liệu tốt, bảo mật thông tin ứng viên

## 7. BƯỚC TIẾP THEO
→ Chạy `/plan` để lên thiết kế chi tiết cho MVP
