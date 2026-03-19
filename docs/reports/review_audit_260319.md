# 📊 BÁO CÁO TỔNG HỢP: Review + Audit
**Ngày:** 19/03/2026  
**Dự án:** Headhunt Manager MVP  
**Người thực hiện:** Antigravity AI

---

## 🎯 APP NÀY LÀM GÌ?
Web App quản lý hồ sơ ứng viên và quy trình headhunt cho team 4 người, thay thế Excel.

---

## 📋 TỔNG QUAN TÍNH NĂNG

| Module | Tính năng | Trạng thái |
|--------|-----------|-----------|
| 🔐 **Auth** | Đăng nhập email/password (NextAuth v5, JWT) | ✅ Hoàn thành |
| 📊 **Dashboard** | Tổng quan số liệu, chart | ✅ Hoàn thành |
| 👤 **Ứng viên** | CRUD, tìm kiếm, lọc nâng cao, pagination | ✅ Hoàn thành |
| 👤 **Ứng viên - Tags** | Gắn/gỡ tag, tạo tag mới, multi-tag | ✅ Hoàn thành |
| 👤 **Ứng viên - Notes** | Timeline ghi chú, xem ai tạo lúc nào | ✅ Hoàn thành |
| 👤 **Ứng viên - CV** | Upload PDF/Word, xóa CV, preview split-screen | ✅ Hoàn thành |
| 👤 **Ứng viên - CV Viewer** | Iframe nhúng PDF, resize kéo thả, zoom toàn màn hình | ✅ Hoàn thành |
| 🏢 **Khách hàng** | CRUD doanh nghiệp, quản lý contacts | ✅ Hoàn thành |
| 📋 **Job Orders** | Tạo đơn tuyển, pipeline ứng viên, đổi stage | ✅ Hoàn thành |
| 📥 **Import Excel** | Nhập ứng viên hàng loạt từ file Excel | ✅ Hoàn thành |

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Frontend | React 19, Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM (driver adapter) |
| Auth | NextAuth.js v5 (Credentials, JWT) |
| Icons | Lucide React |
| File Upload | Local disk (`/public/uploads/`) |
| Dev Build | Webpack (Turbopack đã tắt để tiết kiệm RAM) |

---

## 📁 CẤU TRÚC CODE

```
src/
├── app/
│   ├── (auth)/login/          # Trang đăng nhập
│   ├── (dashboard)/           # Layout chính có sidebar
│   │   ├── page.tsx           # Dashboard
│   │   ├── candidates/        # Module Ứng viên (list, detail, edit, new)
│   │   ├── clients/           # Module Khách hàng
│   │   ├── jobs/              # Module Job Orders
│   │   └── import/            # Module Import Excel
│   └── api/candidates/[id]/cv/ # API Upload/Delete CV
├── components/
│   ├── candidates/            # 8 components (form, info, tags, notes, cv-upload, cv-viewer...)
│   ├── clients/               # Components khách hàng
│   ├── jobs/                  # Components job orders
│   └── import/                # Components import
├── lib/
│   ├── actions.ts             # Server Actions: Candidate + Auth
│   ├── client-actions.ts      # Server Actions: Client
│   ├── job-actions.ts         # Server Actions: Job
│   ├── candidates.ts          # Data layer: Candidate queries
│   ├── clients.ts             # Data layer: Client queries
│   ├── jobs.ts                # Data layer: Job queries
│   └── prisma.ts              # Prisma client singleton
└── types/                     # TypeScript type definitions
```

---

# 🏥 AUDIT: ĐÁNH GIÁ SỨC KHỎE CODE

## 📊 Tổng quan

| Hạng mục | Kết quả | Đánh giá |
|----------|---------|----------|
| 🔐 Bảo mật Auth | Tất cả Server Actions đều check `auth()` | ✅ Tốt |
| 🛡️ SQL Injection | Dùng Prisma ORM (parameterized queries) | ✅ An toàn |
| 📁 File .env | Đã nằm trong `.gitignore` | ✅ Tốt |
| 📝 Console.log dư thừa | Không tìm thấy | ✅ Sạch |
| 📌 TODO/FIXME bỏ quên | Không tìm thấy | ✅ Sạch |
| ✅ Input Validation | Có validation server-side cho required fields | ✅ Tốt |
| 🗑️ Soft Delete | Candidate + Client dùng `isDeleted` flag | ✅ Chuẩn |

---

## ✅ ĐIỂM TỐT (Code health)

1. **Auth bảo mật tốt:** Tất cả Server Actions (`actions.ts`, `client-actions.ts`, `job-actions.ts`) và API routes (`cv/route.ts`) đều gọi `auth()` hoặc `getCurrentUserId()` để check đăng nhập trước khi thao tác.
2. **Không bị SQL Injection:** Toàn bộ truy vấn DB dùng Prisma ORM — tự động parameterize, không viết raw SQL.
3. **Input validation đầy đủ:** Form validate cả client-side (JS trên form) lẫn server-side (trong Server Actions).
4. **Code tổ chức tốt:** Tách rõ ràng: Data layer (`candidates.ts`) → Actions layer (`actions.ts`) → UI layer (`components/`).
5. **Prisma singleton tốt:** Dùng globalForPrisma pattern tránh tạo nhiều connection pool khi dev hot-reload.
6. **File upload validate đúng:** Kiểm tra MIME type + kích thước file trước khi lưu.

---

## ⚠️ CẦN CẢI THIỆN

| # | Vấn đề | Mức độ | Giải thích đời thường |
|---|--------|--------|----------------------|
| 1 | **CV file upload lưu vào `public/uploads/`** | 🟡 Trung bình | File CV được lưu thẳng vào thư mục public. Ai biết đường link đều tải được. Nên chuyển sang thư mục riêng và serve qua API có check quyền. |
| 2 | **Không có Rate Limiting cho login** | 🟡 Trung bình | Hacker có thể thử đăng nhập liên tục (brute force) mà không bị chặn. Nên giới hạn 5 lần/phút. |
| 3 | **`deleteCandidateAction` và `deleteClientAction` không check quyền** | 🟡 Trung bình | Hàm delete không gọi `getCurrentUserId()` để kiểm tra ai đang xóa. Nếu ai đó tìm ra endpoint, có thể xóa dữ liệu. |
| 4 | **`updateCandidateStatusAction` dùng `as any`** | 🟢 Thấp | Type casting `as any` bỏ qua check TypeScript, dễ gây bug nếu cấu trúc thay đổi. |
| 5 | **Helper functions lặp lại** | 🟢 Thấp | `enumVal`, `strVal`, `getCurrentUserId` copy-paste ở 3 file actions. Nên gom vào 1 file dùng chung. |
| 6 | **CV DELETE chưa xóa file vật lý** | 🟡 Trung bình | Khi xóa CV, chỉ xóa link trong DB, file PDF vẫn nằm trên server. Lâu dần sẽ chiếm rất nhiều dung lượng. |

---

## 🔧 GỢI Ý CẢI THIỆN

### Ưu tiên cao (Nên làm sớm):
1. **Thêm auth check vào delete actions** — Thêm `await getCurrentUserId()` vào `deleteCandidateAction` và `deleteClientAction`.
2. **Xóa file vật lý khi DELETE CV** — Khi gọi API DELETE, nên `fs.unlink()` file cũ trên disk.

### Ưu tiên trung bình (Làm khi có thời gian):
3. **Gom helper functions** — Tạo file `src/lib/form-utils.ts` chứa `enumVal`, `strVal`, `getCurrentUserId` dùng chung.
4. **Xem xét bảo vệ file CV** — Chuyển upload sang `/uploads/` (ngoài `public/`) và serve qua API route có check auth.

### Ưu tiên thấp (Nice to have):
5. **Thêm Rate Limiting cho login** — Dùng middleware hoặc library như `rate-limiter-flexible`.
6. **Sửa `as any`** — Tạo type đúng cho `updateCandidateStatusAction`.

---

## ➡️ NEXT STEPS

```
1️⃣ Sửa ngay 2 lỗi ưu tiên cao? (em sửa luôn ~2 phút)
2️⃣ Lưu báo cáo, sửa sau? /save-brain
3️⃣ Tiếp tục /code tính năng mới?
```
