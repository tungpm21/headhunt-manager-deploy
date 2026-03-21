# 💡 BRIEF: FDIWork.com — Nền tảng tuyển dụng FDI + CRM tích hợp

**Ngày tạo:** 2026-03-21  
**Brainstorm cùng:** Antigravity AI  
**Trạng thái:** Chờ review & bổ sung

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

Website fdiwork.com hiện tại:
- Giao diện lỗi thời (UI/UX chỉ đạt 3.1/10)
- Không có hệ thống tài khoản nhà tuyển dụng → mọi thứ làm thủ công
- Logo công ty trên homepage chỉ trưng bày, **không kiếm được tiền** từ nó
- CV ứng viên nộp vào nhưng **không tự động đổ về CRM** → mất lead
- Không kiểm soát được content (bài đăng, thông tin công ty) vì thuê outsource

**→ Cần build lại hoàn toàn**, biến web thành kênh kinh doanh + kết nối CRM Headhunt Manager.

---

## 2. GIẢI PHÁP ĐỀ XUẤT

Build lại FDIWork.com thành **nền tảng tuyển dụng có bán gói dịch vụ (B2B SaaS)**, với 3 luồng chính:

```
┌─────────────────────────────────────────────────┐
│              FDIWork.com (Web mới)               │
│                                                   │
│  🏢 NHÀ TUYỂN DỤNG        👤 ỨNG VIÊN            │
│  • Mua gói dịch vụ        • Xem việc làm          │
│  • Tự đăng tin tuyển       • Apply CV              │
│  • Upload thông tin cty    • Tạo profile           │
│  • Logo banner homepage    • Nhận thông báo         │
│                                                   │
│  ⚙️ ADMIN (CRM)                                   │
│  • Duyệt bài đăng         • Quản lý gói           │
│  • Chuẩn hóa CV → CRM     • Dashboard analytics   │
│  • AI auto-review          • Quản lý thanh toán     │
└─────────────────────────────────────────────────┘
```

---

## 3. ĐỐI TƯỢNG SỬ DỤNG

| Vai trò | Mô tả | Ưu tiên |
|---------|-------|:-------:|
| **Nhà tuyển dụng (Employer)** | Công ty FDI/VN cần tuyển người, mua gói để đăng tin | 🔴 Chính |
| **Ứng viên (Candidate)** | Người tìm việc, nộp CV online | 🔴 Chính |
| **Admin (Headhunter)** | Quản trị nội dung, duyệt bài, quản lý CRM | 🟡 Nội bộ |

---

## 4. NGHIÊN CỨU THỊ TRƯỜNG

### Đối thủ chính tại Việt Nam:

| Nền tảng | Giá đăng tin | Banner/Branding | Điểm mạnh | Điểm yếu |
|----------|:----------:|:---------------:|-----------|----------|
| **TopCV** | 4.4–9.6M VND/tin | 8–30M VND | Lớn nhất VN, AI matching | Quá đông, khó nổi bật |
| **VietnamWorks** | Liên hệ (giảm ~42%) | Có gói branding | Uy tín lâu, chuyên nghiệp | Đắt, không minh bạch giá |
| **CareerBuilder VN** | Liên hệ | Có | Tập trung mid-senior | Ít phổ biến hơn |
| **JobStreet** | ~2–5M/tin | Có | Thị trường ĐNA | Chưa mạnh VN |

### Mô hình giá phổ biến trên thế giới:

| Mô hình | Mô tả | Phù hợp FDIWork? |
|---------|-------|:-:|
| **Duration-based** | Trả phí đăng tin theo số ngày (30/60 ngày) | ✅ Phù hợp |
| **Subscription** | Gói tháng/quý/năm, giới hạn số tin | ✅ Rất phù hợp |
| **CPC (Cost Per Click)** | Trả theo số lượt click vào tin | ❌ Phức tạp |
| **Freemium** | Đăng tin miễn phí + trả phí nâng cấp | 🟡 Có thể kết hợp |

### Điểm khác biệt của FDIWork:

| # | Unique Selling Point |
|---|---------------------|
| 1 | **Chuyên FDI** — Tập trung doanh nghiệp nước ngoài tại VN (ngách, ít đối thủ) |
| 2 | **Tích hợp CRM** — Dữ liệu tuyển dụng chạy thẳng vào hệ thống Headhunt Manager |
| 3 | **AI duyệt bài** — Tự động kiểm tra chất lượng bài đăng, tiết kiệm nhân sự |
| 4 | **CV chuẩn hóa** — Parse CV thành data có cấu trúc, không cần nhập tay |
| 5 | **Giá cạnh tranh** — Rẻ hơn TopCV/VietnamWorks vì chạy trên infra có sẵn |

---

## 5. MÔ HÌNH GÓI DỊCH VỤ (ĐỀ XUẤT)

### 🏷️ Bảng gói dịch vụ:

| Quyền lợi | 🥉 Basic | 🥈 Standard | 🥇 Premium | 💎 VIP |
|-----------|:--------:|:-----------:|:----------:|:------:|
| **Giá/tháng** | 2M VND | 5M VND | 10M VND | 20M VND |
| **Số tin đăng** | 3 tin | 10 tin | 30 tin | Không giới hạn |
| **Thời hạn tin** | 15 ngày | 30 ngày | 45 ngày | 60 ngày |
| **Logo trang chủ** | ❌ | ❌ | ✅ Nhỏ | ✅ Lớn + link |
| **Banner trang chủ** | ❌ | ❌ | ❌ | ✅ Slide banner |
| **Profile công ty** | Cơ bản | Đầy đủ | Premium | VIP branded |
| **Hiển thị ưu tiên** | ❌ | ❌ | ✅ | ✅✅ |
| **Xem CV ứng viên** | ❌ | Giới hạn | Đầy đủ | Đầy đủ + Download |
| **Báo cáo tuyển dụng** | ❌ | Cơ bản | Nâng cao | Nâng cao + Export |
| **Hỗ trợ** | Email | Email + Chat | Ưu tiên | Hotline riêng |

> **Lưu ý:** Giá trên là đề xuất ban đầu, rẻ hơn ~50-70% so với TopCV để thu hút khách. Cần điều chỉnh dựa trên giá trị thực tế khi đi bán.

### 💡 Gói bổ sung (Add-on):

| Add-on | Giá | Mô tả |
|--------|-----|-------|
| Tin tuyển dụng thêm (1 tin) | 500K | Áp dụng khi hết quota |
| Gia hạn tin (thêm 15 ngày) | 300K | Kéo dài thời hạn tin đang đăng |
| Banner homepage (1 tuần) | 3M | Hiển thị banner quảng cáo |
| Đẩy tin lên đầu (1 lần) | 200K | Boost tin lên top danh sách |
| Branding page công ty | 5M (1 lần) | Trang công ty custom thiết kế |

---

## 6. TÍNH NĂNG CHI TIẾT

### 🚀 MVP (Phase 1 — Bắt buộc có):

#### Phía Nhà Tuyển Dụng (Employer Portal):
- [ ] Đăng ký / Đăng nhập tài khoản nhà tuyển dụng
- [ ] Upload thông tin công ty (logo, mô tả, ngành nghề, địa chỉ, website)
- [ ] Đăng tin tuyển dụng (với form mô tả, yêu cầu, phúc lợi, mức lương)
- [ ] Xem danh sách tin đã đăng + trạng thái (chờ duyệt / đang hiển thị / hết hạn)
- [ ] Xem danh sách ứng viên đã apply vào từng tin
- [ ] Quản lý gói dịch vụ (xem gói hiện tại, quota còn lại, gia hạn)

#### Phía Ứng Viên (Public Website):
- [ ] Homepage: Banner công ty VIP, việc làm mới nhất, top công ty
- [ ] Danh sách việc làm + bộ lọc (ngành, vị trí, khu vực, mức lương)
- [ ] Chi tiết việc làm + nút "Ứng tuyển ngay"
- [ ] Form nộp CV (upload file + điền thông tin cơ bản)
- [ ] Danh sách & profile công ty

#### Phía Admin (CRM Integration):
- [ ] Duyệt bài đăng trước khi hiển thị (Approve / Reject / Yêu cầu sửa)
- [ ] CV ứng viên apply → Auto-create Candidate trong CRM Headhunt Manager
- [ ] Chuẩn hóa CV: parse file CV → trích xuất thông tin → điền vào các trường candidate
- [ ] Quản lý gói dịch vụ: tạo gói, assign cho employer, theo dõi thanh toán
- [ ] Dashboard: số tin đăng, số apply, doanh thu

### 🎁 Phase 2 (Làm sau):
- [ ] AI tự động duyệt bài (check nội dung theo chuẩn, gợi ý sửa)
- [ ] AI parse CV (OCR + NLP trích xuất thông tin từ PDF/DOCX)
- [ ] Đăng ký/Đăng nhập ứng viên (tạo profile, lưu CV, theo dõi ứng tuyển)
- [ ] Email notification (thông báo duyệt bài, ứng viên mới, hết hạn gói)
- [ ] Thanh toán online (VNPay / MoMo / Bank Transfer)
- [ ] SEO automation (auto meta tags, sitemap, structured data)
- [ ] Đa ngôn ngữ (Việt / Anh / Hàn / Nhật / Trung)

### 💭 Backlog (Cân nhắc):
- [ ] Mobile App (React Native / Flutter)
- [ ] Job alert subscription cho ứng viên
- [ ] Đánh giá công ty (review)
- [ ] Video giới thiệu công ty
- [ ] Chat giữa employer và ứng viên
- [ ] Tích hợp Google Jobs / Indeed

---

## 7. LUỒNG HOẠT ĐỘNG CHÍNH

### 7.1. Luồng Nhà Tuyển Dụng:
```
Đăng ký → Chọn gói → Thanh toán → Upload thông tin cty
    → Đăng tin tuyển → Chờ duyệt → Tin hiển thị
    → Ứng viên apply → Xem hồ sơ → Liên hệ
```

### 7.2. Luồng Ứng Viên:
```
Vào web → Tìm/lọc việc → Xem chi tiết → Nộp CV
    → CV vào database → Chuẩn hóa → Vào CRM
```

### 7.3. Luồng Admin:
```
Nhận tin mới → Duyệt (manual / AI) → Approve/Reject
    → CV mới → Auto-parse → Create Candidate trong CRM
    → Theo dõi doanh thu, gói dịch vụ, analytics
```

---

## 8. ƯỚC TÍNH SƠ BỘ

| Hạng mục | Độ phức tạp | Thời gian ước tính |
|----------|:-----------:|:-----------------:|
| **MVP Phase 1** | 🟡 Trung bình | 4-6 tuần |
| **Phase 2 (AI + Payment)** | 🔴 Cao | 3-4 tuần |
| **Backlog** | 🔴 Cao | Theo nhu cầu |

### Rủi ro:
- ⚠️ **AI parse CV** — Cần API bên ngoài (OpenAI/Gemini), có chi phí sử dụng
- ⚠️ **Thanh toán online** — Cần đăng ký merchant với VNPay/MoMo, mất thời gian
- ⚠️ **Content moderation** — Phase 1 duyệt tay, Phase 2 mới có AI hỗ trợ
- ⚠️ **SEO migration** — Cần redirect URL cũ sang URL mới để giữ ranking

---

## 9. BƯỚC TIẾP THEO

→ Anh review Brief này, sửa/bổ sung nếu cần  
→ Sau đó chạy `/plan` để thiết kế chi tiết (Database, API, UI)  
→ Rồi `/design` → `/code` → `/run` → `/test` → `/deploy`
