# 🎨 DESIGN: Headhunt Manager MVP

Ngày tạo: 2026-03-15
Dựa trên: [BRIEF.md](docs/BRIEF.md) + [plan.md](plans/260315-1634-headhunt-mvp/plan.md)

---

## 1. 📊 CÁCH LƯU THÔNG TIN (Database)

> 💡 Mỗi bảng giống như 1 **Sheet Excel**. Các bảng liên kết với nhau bằng ID.

### Sơ đồ tổng quan:

```
┌─────────────────────┐
│  👤 USER (Team)     │
│  - Tên              │
│  - Email            │
│  - Mật khẩu         │
│  - Vai trò          │
└────────┬────────────┘
         │ tạo/sửa dữ liệu
         ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │ 👤 CANDIDATE     │         │ 🏢 CLIENT        │      │
│  │ (Ứng viên)       │         │ (Doanh nghiệp)   │      │
│  │ - Họ tên         │         │ - Tên công ty     │      │
│  │ - SĐT            │         │ - Ngành           │      │
│  │ - Email           │         │ - Quy mô          │      │
│  │ - Vị trí         │         │ - Địa chỉ         │      │
│  │ - Ngành           │         │ - Ghi chú         │      │
│  │ - Kinh nghiệm    │         └────────┬─────────┘      │
│  │ - Lương           │                  │                │
│  │ - Trạng thái      │                  │ có nhiều       │
│  │ - CV file         │                  ▼                │
│  │ - Nguồn           │         ┌──────────────────┐      │
│  └───────┬──────────┘         │ 👥 CONTACT        │      │
│          │                     │ (Người liên hệ)  │      │
│          │ có nhiều            │ - Tên             │      │
│          ▼                     │ - Chức vụ         │      │
│  ┌──────────────────┐         │ - SĐT             │      │
│  │ 📝 NOTE          │         │ - Email            │      │
│  │ (Ghi chú)        │         └──────────────────┘      │
│  │ - Nội dung       │                                    │
│  │ - Ai viết        │                                    │
│  │ - Ngày           │                                    │
│  └──────────────────┘                                    │
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │ 🏷️ TAG           │         │ 📋 JOB ORDER     │      │
│  │ (Nhãn)           │◄────────│ (Đơn tuyển dụng) │      │
│  │ - Tên tag        │  gắn   │ - Vị trí          │      │
│  │ - Màu            │  tag   │ - JD              │      │
│  └──────────────────┘         │ - Lương min-max   │      │
│                               │ - Deadline        │      │
│          ┌────────────────────│ - Trạng thái      │      │
│          │ gán ứng viên       │ - Phí dịch vụ     │      │
│          ▼                    │ - DN nào? ─────────►     │
│  ┌──────────────────┐         └──────────────────┘      │
│  │ 🔗 JOB_CANDIDATE │                                   │
│  │ (Bảng nối)       │                                    │
│  │ - Ứng viên nào   │                                    │
│  │ - Job nào         │                                    │
│  │ - Trạng thái      │                                    │
│  │   (Giới thiệu →  │                                    │
│  │    Interview →    │                                    │
│  │    Offer/Reject)  │                                    │
│  └──────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

---

### Chi tiết từng bảng (giống các cột trong Excel):

#### 👤 User (Tài khoản team)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã định danh |
| name | Chữ | Tên hiển thị |
| email | Chữ | Email đăng nhập (duy nhất) |
| password | Chữ | Mật khẩu (đã mã hóa) |
| role | Chọn 1 | ADMIN hoặc MEMBER |
| avatar | Chữ | Ảnh đại diện (URL) |
| createdAt | Ngày | Ngày tạo tài khoản |

#### 👤 Candidate (Ứng viên) ⭐ BẢNG QUAN TRỌNG NHẤT
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã ứng viên |
| fullName | Chữ | Họ và tên |
| phone | Chữ | Số điện thoại |
| email | Chữ | Email |
| dateOfBirth | Ngày | Ngày sinh |
| gender | Chọn 1 | Nam / Nữ / Khác |
| address | Chữ | Địa chỉ |
| currentPosition | Chữ | Vị trí hiện tại |
| currentCompany | Chữ | Công ty hiện tại |
| industry | Chữ | Ngành nghề |
| yearsOfExp | Số | Số năm kinh nghiệm |
| currentSalary | Số | Lương hiện tại (triệu VND) |
| expectedSalary | Số | Lương mong muốn (triệu VND) |
| location | Chữ | Khu vực (HCM, HN, ĐN...) |
| status | Chọn 1 | AVAILABLE / EMPLOYED / INTERVIEWING / BLACKLIST |
| source | Chọn 1 | LINKEDIN / TOPCV / REFERRAL / FACEBOOK / OTHER |
| cvFileUrl | Chữ | Đường dẫn file CV đã upload |
| cvFileName | Chữ | Tên file CV gốc |
| createdById | Liên kết | Ai tạo hồ sơ này (→ User) |
| createdAt | Ngày | Ngày tạo |
| updatedAt | Ngày | Ngày cập nhật cuối |
| isDeleted | Đúng/Sai | Đã xóa chưa (soft delete) |

#### 🏷️ Tag (Nhãn)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã tag |
| name | Chữ | Tên tag (VD: "Senior", "Java", "Sales") |
| color | Chữ | Mã màu (#FF5733) |

#### 🔗 CandidateTag (Nối ứng viên ↔ tag)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| candidateId | Liên kết | → Candidate |
| tagId | Liên kết | → Tag |

#### 📝 CandidateNote (Ghi chú ứng viên)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã ghi chú |
| content | Chữ dài | Nội dung ghi chú |
| candidateId | Liên kết | → Candidate |
| createdById | Liên kết | → User (ai viết) |
| createdAt | Ngày | Ngày viết |

#### 🏢 Client (Doanh nghiệp)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã DN |
| companyName | Chữ | Tên công ty |
| industry | Chữ | Ngành nghề |
| companySize | Chọn 1 | SMALL / MEDIUM / LARGE / ENTERPRISE |
| address | Chữ | Địa chỉ |
| website | Chữ | Website |
| notes | Chữ dài | Ghi chú (văn hóa, yêu cầu đặc biệt) |
| createdById | Liên kết | → User |
| createdAt | Ngày | Ngày tạo |
| isDeleted | Đúng/Sai | Soft delete |

#### 👥 ClientContact (Người liên hệ DN)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã |
| name | Chữ | Tên người liên hệ |
| position | Chữ | Chức vụ (HR Manager, CEO...) |
| phone | Chữ | SĐT |
| email | Chữ | Email |
| isPrimary | Đúng/Sai | Đầu mối chính? |
| clientId | Liên kết | → Client |

#### 📋 JobOrder (Đơn hàng tuyển dụng)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã job |
| title | Chữ | Tên vị trí cần tuyển |
| description | Chữ dài | Mô tả JD |
| salaryMin | Số | Lương tối thiểu (triệu VND) |
| salaryMax | Số | Lương tối đa |
| quantity | Số | Số lượng cần tuyển |
| deadline | Ngày | Hạn chót |
| status | Chọn 1 | OPEN / PAUSED / FILLED / CANCELLED |
| fee | Số | Phí dịch vụ headhunt |
| feeType | Chọn 1 | PERCENTAGE / FIXED |
| notes | Chữ dài | Ghi chú |
| clientId | Liên kết | → Client (DN nào đặt) |
| assignedToId | Liên kết | → User (ai phụ trách) |
| createdById | Liên kết | → User |
| createdAt | Ngày | Ngày tạo |

#### 🔗 JobCandidate (Gán ứng viên vào job)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã |
| jobOrderId | Liên kết | → JobOrder |
| candidateId | Liên kết | → Candidate |
| stage | Chọn 1 | SOURCED / CONTACTED / INTERVIEW / OFFER / PLACED / REJECTED |
| notes | Chữ dài | Ghi chú (lý do reject...) |
| createdAt | Ngày | Ngày gán |
| updatedAt | Ngày | Ngày cập nhật stage |

---

## 2. 📱 DANH SÁCH MÀN HÌNH

| # | Tên | Mục đích | URL |
|---|-----|----------|-----|
| 1 | 🔐 Đăng nhập | Xác thực user | /login |
| 2 | 🏠 Dashboard | Tổng quan nhanh (số ứng viên, job đang mở, placement gần đây) | / |
| 3 | 👤 Danh sách ứng viên | Xem, tìm, lọc tất cả ứng viên | /candidates |
| 4 | 👤 Thêm ứng viên | Form nhập ứng viên mới | /candidates/new |
| 5 | 👤 Chi tiết ứng viên | Xem/sửa hồ sơ, ghi chú, CV, jobs liên quan | /candidates/[id] |
| 6 | 🏢 Danh sách DN | Xem tất cả doanh nghiệp | /clients |
| 7 | 🏢 Thêm DN | Form nhập DN mới | /clients/new |
| 8 | 🏢 Chi tiết DN | Xem/sửa thông tin DN, người liên hệ, jobs | /clients/[id] |
| 9 | 📋 Danh sách Jobs | Xem/lọc đơn hàng tuyển dụng | /jobs |
| 10 | 📋 Thêm Job | Form tạo job order mới | /jobs/new |
| 11 | 📋 Chi tiết Job | Xem/sửa job, danh sách ứng viên gán | /jobs/[id] |
| 12 | 📥 Import Excel | Upload & import dữ liệu từ Excel | /import |

---

## 3. 🚶 LUỒNG HOẠT ĐỘNG (Hành trình người dùng)

### Hành trình 1: Đăng nhập & xem tổng quan
```
Mở trình duyệt → Nhập địa chỉ app
    → Chưa đăng nhập? → Trang Login → Nhập email/pass → Vào Dashboard
    → Đã đăng nhập?   → Thẳng vào Dashboard
         → Thấy: Số ứng viên, số Job đang mở, placement gần đây
```

### Hành trình 2: Thêm ứng viên mới (thường ngày)
```
Dashboard → Bấm "👤 Ứng viên" ở sidebar
    → Bấm "➕ Thêm ứng viên"
    → Nhập thông tin: tên, SĐT, email, vị trí, ngành, kinh nghiệm, lương...
    → Upload CV (kéo thả hoặc chọn file)
    → Gắn tags: "Senior", "Java", "HCM"
    → Bấm "Lưu"
    → ✅ Chuyển về trang chi tiết ứng viên (vừa tạo)
    → Viết ghi chú đầu tiên (VD: "Tìm thấy trên LinkedIn, profile tốt")
```

### Hành trình 3: DN gọi đến, cần tìm ứng viên
```
Nhận yêu cầu từ DN: "Cần 2 Senior Java Developer, HCM, 30-40 triệu"

Bước 1 - Tạo Job Order:
    Dashboard → Bấm "📋 Jobs" → "➕ Tạo Job"
    → Chọn DN → Nhập vị trí, JD, lương, deadline
    → Bấm "Lưu"

Bước 2 - Tìm ứng viên phù hợp:
    → "👤 Ứng viên" → Lọc: Ngành=IT, Tag=Java, Khu vực=HCM, Lương ≤40tr, Status=Available
    → Thấy 5 ứng viên phù hợp

Bước 3 - Gán ứng viên vào Job:
    → Vào trang Job Order → Bấm "Thêm ứng viên"
    → Chọn 3 ứng viên → Gán vào job
    → Trạng thái mỗi ứng viên: "Đã giới thiệu"

Bước 4 - Tracking quy trình:
    → DN phỏng vấn → Cập nhật: "Đang phỏng vấn"
    → DN offer ứng viên A → Cập nhật: "Offer"
    → Ứng viên nhận việc → Cập nhật: "Placed" 🎉
    → 2 ứng viên còn lại → Cập nhật: "Rejected"
```

### Hành trình 4: Import dữ liệu từ Excel (lần đầu)
```
Dashboard → "📥 Import" ở sidebar
    → Upload file Excel
    → App hiện preview: "Tìm thấy 200 dòng, 15 cột"
    → Map cột: "Cột A = Họ tên", "Cột B = SĐT"...
    → Bấm "Import"
    → Kết quả: "✅ 180 thành công, ⚠️ 15 trùng lặp (bỏ qua), ❌ 5 lỗi"
    → Xem chi tiết lỗi để sửa thủ công
```

---

## 4. ✅ CHECKLIST KIỂM TRA (Acceptance Criteria)

### TC-01: Đăng nhập
```
✅ Nhập đúng email/pass → Vào Dashboard
✅ Nhập sai → Hiện lỗi "Email hoặc mật khẩu không đúng"
✅ Bỏ trống → Hiện lỗi "Vui lòng nhập đầy đủ"
✅ Chưa đăng nhập mà vào trang khác → Chuyển về Login
✅ Đăng xuất → Quay về Login
```

### TC-02: Thêm ứng viên
```
✅ Nhập đủ thông tin bắt buộc (tên, SĐT) → Lưu thành công
✅ Bỏ trống tên → Hiện lỗi "Tên không được để trống"
✅ SĐT sai format → Hiện lỗi
✅ Upload CV (PDF ≤10MB) → Lưu thành công
✅ Upload file quá lớn (>10MB) → Hiện lỗi
✅ Upload file sai format (.exe) → Từ chối
✅ Gắn tags → Hiển thị tags trên hồ sơ
✅ Thêm ghi chú → Hiện tên người viết + timestamp
```

### TC-03: Tìm kiếm & Lọc ứng viên
```
✅ Gõ tên → Hiện ứng viên khớp (tìm gần đúng)
✅ Gõ SĐT → Hiện ứng viên khớp
✅ Lọc theo ngành → Chỉ hiện ứng viên ngành đó
✅ Lọc theo lương (20-30 triệu) → Chỉ hiện ứng viên trong khoảng
✅ Lọc theo status (Available) → Chỉ hiện ứng viên available
✅ Kết hợp nhiều bộ lọc → Hoạt động đúng
✅ Không tìm thấy → Hiện "Không có ứng viên phù hợp"
```

### TC-04: Quản lý DN
```
✅ Tạo DN mới → Hiện trong danh sách
✅ Thêm người liên hệ → Hiện trong trang DN
✅ Sửa thông tin DN → Cập nhật đúng
✅ Xóa DN (có job đang mở) → Cảnh báo trước khi xóa
```

### TC-05: Job Order
```
✅ Tạo job → Liên kết đúng DN
✅ Gán ứng viên → Hiện trong danh sách ứng viên của job
✅ Cập nhật stage (Sourced → Interview → Offer) → Lưu đúng
✅ Đổi status job (Open → Filled) → Cập nhật đúng
✅ Xem job từ trang DN → Hiện đúng các job của DN đó
```

### TC-06: Import Excel
```
✅ Upload .xlsx → Hiện preview dữ liệu
✅ Map cột → Đúng trường
✅ Import → Tạo đúng số ứng viên
✅ Trùng SĐT/email → Bỏ qua, báo cáo
✅ Dòng lỗi → Báo cáo chi tiết
✅ File rỗng → Hiện lỗi "File không có dữ liệu"
```

---

## 5. 🛠️ PRISMA SCHEMA (Code cho database)

> 💡 Đây là "bản vẽ kỹ thuật" mà code sẽ dùng để tạo database.
> Bạn không cần hiểu chi tiết - mình sẽ xử lý phần này.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  MEMBER
}

enum CandidateStatus {
  AVAILABLE
  EMPLOYED
  INTERVIEWING
  BLACKLIST
}

enum CandidateSource {
  LINKEDIN
  TOPCV
  REFERRAL
  FACEBOOK
  VIETNAMWORKS
  OTHER
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum CompanySize {
  SMALL
  MEDIUM
  LARGE
  ENTERPRISE
}

enum JobStatus {
  OPEN
  PAUSED
  FILLED
  CANCELLED
}

enum FeeType {
  PERCENTAGE
  FIXED
}

enum JobCandidateStage {
  SOURCED
  CONTACTED
  INTERVIEW
  OFFER
  PLACED
  REJECTED
}

// ==================== MODELS ====================

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      UserRole @default(MEMBER)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  createdCandidates  Candidate[]     @relation("CandidateCreatedBy")
  createdClients     Client[]        @relation("ClientCreatedBy")
  createdJobOrders   JobOrder[]      @relation("JobCreatedBy")
  assignedJobOrders  JobOrder[]      @relation("JobAssignedTo")
  candidateNotes     CandidateNote[]
}

model Candidate {
  id              Int              @id @default(autoincrement())
  fullName        String
  phone           String?
  email           String?
  dateOfBirth     DateTime?
  gender          Gender?
  address         String?
  currentPosition String?
  currentCompany  String?
  industry        String?
  yearsOfExp      Int?
  currentSalary   Float?
  expectedSalary  Float?
  location        String?
  status          CandidateStatus  @default(AVAILABLE)
  source          CandidateSource?
  sourceDetail    String?
  cvFileUrl       String?
  cvFileName      String?
  isDeleted       Boolean          @default(false)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  createdBy   User             @relation("CandidateCreatedBy", fields: [createdById], references: [id])
  createdById Int
  tags        CandidateTag[]
  notes       CandidateNote[]
  jobLinks    JobCandidate[]
}

model Tag {
  id         Int            @id @default(autoincrement())
  name       String         @unique
  color      String         @default("#6B7280")
  candidates CandidateTag[]
}

model CandidateTag {
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  candidateId Int
  tag         Tag       @relation(fields: [tagId], references: [id])
  tagId       Int

  @@id([candidateId, tagId])
}

model CandidateNote {
  id          Int       @id @default(autoincrement())
  content     String
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  candidateId Int
  createdBy   User      @relation(fields: [createdById], references: [id])
  createdById Int
  createdAt   DateTime  @default(now())
}

model Client {
  id          Int         @id @default(autoincrement())
  companyName String
  industry    String?
  companySize CompanySize?
  address     String?
  website     String?
  notes       String?
  isDeleted   Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  createdBy   User            @relation("ClientCreatedBy", fields: [createdById], references: [id])
  createdById Int
  contacts    ClientContact[]
  jobOrders   JobOrder[]
}

model ClientContact {
  id        Int     @id @default(autoincrement())
  name      String
  position  String?
  phone     String?
  email     String?
  isPrimary Boolean @default(false)

  client   Client @relation(fields: [clientId], references: [id])
  clientId Int
}

model JobOrder {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  salaryMin   Float?
  salaryMax   Float?
  quantity    Int       @default(1)
  deadline    DateTime?
  status      JobStatus @default(OPEN)
  fee         Float?
  feeType     FeeType?
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  client       Client         @relation(fields: [clientId], references: [id])
  clientId     Int
  assignedTo   User?          @relation("JobAssignedTo", fields: [assignedToId], references: [id])
  assignedToId Int?
  createdBy    User           @relation("JobCreatedBy", fields: [createdById], references: [id])
  createdById  Int
  candidates   JobCandidate[]
}

model JobCandidate {
  id          Int                @id @default(autoincrement())
  stage       JobCandidateStage  @default(SOURCED)
  notes       String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  jobOrder    JobOrder  @relation(fields: [jobOrderId], references: [id])
  jobOrderId  Int
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  candidateId Int

  @@unique([jobOrderId, candidateId])
}
```

---

## 6. 🔌 API ENDPOINTS (Các "cửa" của app)

> 💡 Đây là danh sách các thao tác mà app hỗ trợ. Bạn không cần nhớ - code sẽ tự tạo.

### Auth
| Thao tác | Endpoint | Mô tả |
|----------|----------|-------|
| Đăng nhập | POST /api/auth/login | Nhập email + pass |
| Đăng xuất | POST /api/auth/logout | Thoát |
| Xem profile | GET /api/auth/me | Thông tin user hiện tại |

### Candidates
| Thao tác | Endpoint | Mô tả |
|----------|----------|-------|
| Danh sách | GET /api/candidates | Có phân trang, tìm kiếm, lọc |
| Chi tiết | GET /api/candidates/[id] | Bao gồm tags, notes, jobs |
| Tạo mới | POST /api/candidates | Thông tin ứng viên |
| Cập nhật | PUT /api/candidates/[id] | Sửa thông tin |
| Xóa | DELETE /api/candidates/[id] | Soft delete |
| Upload CV | POST /api/candidates/[id]/cv | File PDF/Word |
| Thêm note | POST /api/candidates/[id]/notes | Ghi chú mới |
| Gắn tags | PUT /api/candidates/[id]/tags | Danh sách tag IDs |

### Clients
| Thao tác | Endpoint | Mô tả |
|----------|----------|-------|
| Danh sách | GET /api/clients | Có phân trang |
| Chi tiết | GET /api/clients/[id] | Bao gồm contacts, jobs |
| Tạo mới | POST /api/clients | Thông tin DN |
| Cập nhật | PUT /api/clients/[id] | Sửa |
| Xóa | DELETE /api/clients/[id] | Soft delete |
| Thêm contact | POST /api/clients/[id]/contacts | Người liên hệ |
| Sửa contact | PUT /api/clients/[id]/contacts/[cId] | Sửa |
| Xóa contact | DELETE /api/clients/[id]/contacts/[cId] | Xóa |

### Job Orders
| Thao tác | Endpoint | Mô tả |
|----------|----------|-------|
| Danh sách | GET /api/jobs | Có lọc theo status, client |
| Chi tiết | GET /api/jobs/[id] | Bao gồm ứng viên gán |
| Tạo mới | POST /api/jobs | Thông tin job |
| Cập nhật | PUT /api/jobs/[id] | Sửa |
| Gán ứng viên | POST /api/jobs/[id]/candidates | candidateId |
| Cập nhật stage | PUT /api/jobs/[id]/candidates/[cId] | Stage mới |
| Bỏ gán | DELETE /api/jobs/[id]/candidates/[cId] | Bỏ ứng viên |

### Tags
| Thao tác | Endpoint | Mô tả |
|----------|----------|-------|
| Danh sách | GET /api/tags | Tất cả tags |
| Tạo mới | POST /api/tags | name + color |

### Import
| Thao tác | Endpoint | Mô tả |
|----------|----------|-------|
| Upload & Import | POST /api/import/candidates | File Excel + mapping |

---

*Tạo bởi AWF - Design Phase | 2026-03-15*
