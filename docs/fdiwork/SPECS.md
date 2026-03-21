# 📋 SPECS: FDIWork Public Website + CRM Integration

**Ngày tạo:** 2026-03-21  
**Dựa trên:** BRIEF_FDIWORK_REBUILD.md  
**Trạng thái:** Chờ review

---

## 1. Executive Summary

Build thêm **public website** cho FDIWork.com trong cùng project Headhunt Manager (Next.js), sử dụng route group `(public)` song song với `(dashboard)` CRM hiện tại. Chia sẻ chung database PostgreSQL và Prisma ORM.

**3 vai trò người dùng:**
- **Ứng viên** (anonymous) — xem việc, nộp CV
- **Nhà tuyển dụng (Employer)** — đăng tin, quản lý gói
- **Admin** (CRM users hiện tại) — duyệt bài, quản lý

---

## 2. Kiến trúc tổng thể

```
📁 src/app/
├── (auth)/          ← Đã có ✅ (Login CRM)
├── (dashboard)/     ← Đã có ✅ (CRM Admin: candidates, clients, jobs)
├── (public)/        ← MỚI 🆕 (FDIWork public website)
│   ├── layout.tsx           # Layout riêng: header, footer public
│   ├── page.tsx             # Homepage: banner, jobs mới, top cty
│   ├── viec-lam/
│   │   ├── page.tsx         # Danh sách việc làm + lọc
│   │   └── [slug]/page.tsx  # Chi tiết việc làm
│   ├── cong-ty/
│   │   ├── page.tsx         # Danh sách công ty
│   │   └── [slug]/page.tsx  # Profile công ty
│   ├── tin-tuc/
│   │   └── page.tsx         # Blog/Tin tức
│   └── ung-tuyen/
│       └── page.tsx         # Form nộp CV
├── (employer)/      ← MỚI 🆕 (Portal nhà tuyển dụng)
│   ├── layout.tsx           # Layout employer dashboard
│   ├── login/page.tsx       # Đăng nhập employer
│   ├── register/page.tsx    # Đăng ký employer
│   ├── dashboard/page.tsx   # Dashboard employer
│   ├── company/page.tsx     # Quản lý profile công ty
│   ├── job-postings/
│   │   ├── page.tsx         # Danh sách tin đã đăng
│   │   └── new/page.tsx     # Đăng tin mới
│   └── subscription/page.tsx # Quản lý gói dịch vụ
└── api/
    ├── auth/         ← Đã có ✅
    ├── candidates/   ← Đã có ✅
    └── public/       ← MỚI 🆕
        ├── jobs/          # API việc làm public
        ├── companies/     # API công ty public
        ├── apply/         # API nộp CV
        └── employer/      # API cho employer portal
```

---

## 3. Database Schema mở rộng

### 3.1. Models MỚI cần thêm vào Prisma:

```prisma
// ==================== ENUMS MỚI ====================

enum EmployerStatus {
  PENDING       // Chờ duyệt
  ACTIVE        // Đang hoạt động
  SUSPENDED     // Tạm khóa
}

enum JobPostingStatus {
  DRAFT         // Nháp
  PENDING       // Chờ duyệt
  APPROVED      // Đã duyệt, đang hiển thị
  REJECTED      // Bị từ chối
  EXPIRED       // Hết hạn
  PAUSED        // Tạm ẩn
}

enum SubscriptionTier {
  BASIC
  STANDARD
  PREMIUM
  VIP
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}

enum ApplicationStatus {
  NEW           // Mới nộp
  REVIEWED      // Đã xem
  SHORTLISTED   // Vào danh sách chọn
  REJECTED      // Không phù hợp
  IMPORTED      // Đã import vào CRM
}

// ==================== MODELS MỚI ====================

model Employer {
  id            Int             @id @default(autoincrement())
  email         String          @unique
  password      String
  companyName   String
  logo          String?
  description   String?
  industry      String?
  companySize   CompanySize?
  address       String?
  website       String?
  phone         String?
  status        EmployerStatus  @default(PENDING)
  slug          String          @unique
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  // Relations
  subscription  Subscription?
  jobPostings   JobPosting[]
  
  // Link to CRM Client (optional)
  clientId      Int?
  client        Client?         @relation(fields: [clientId], references: [id])

  @@index([status])
  @@index([slug])
}

model Subscription {
  id            Int                @id @default(autoincrement())
  tier          SubscriptionTier
  status        SubscriptionStatus @default(ACTIVE)
  jobQuota      Int                // Số tin được đăng
  jobsUsed      Int                @default(0)
  jobDuration   Int                // Số ngày tin hiển thị
  showLogo      Boolean            @default(false)
  showBanner    Boolean            @default(false)
  startDate     DateTime
  endDate       DateTime
  price         Float
  createdAt     DateTime           @default(now())

  // Relations
  employer      Employer           @relation(fields: [employerId], references: [id])
  employerId    Int                @unique

  @@index([status])
  @@index([endDate])
}

model JobPosting {
  id              Int               @id @default(autoincrement())
  title           String
  slug            String            @unique
  description     String
  requirements    String?
  benefits        String?
  salaryMin       Float?
  salaryMax       Float?
  salaryDisplay   String?           // "15-20 triệu" hoặc "Thỏa thuận"
  industry        String?
  position        String?           // Vị trí: Nhân viên, Trưởng phòng...
  location        String?
  workType        String?           // Full-time, Part-time
  quantity        Int               @default(1)
  skills          String?           // Comma-separated skills
  status          JobPostingStatus  @default(DRAFT)
  rejectReason    String?           // Lý do từ chối (nếu bị reject)
  publishedAt     DateTime?
  expiresAt       DateTime?
  viewCount       Int               @default(0)
  applyCount      Int               @default(0)
  isFeatured      Boolean           @default(false)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relations
  employer        Employer          @relation(fields: [employerId], references: [id])
  employerId      Int
  applications    Application[]

  // Link to CRM JobOrder (optional, admin có thể link)
  jobOrderId      Int?
  jobOrder        JobOrder?         @relation(fields: [jobOrderId], references: [id])

  @@index([status])
  @@index([industry])
  @@index([location])
  @@index([slug])
  @@index([employerId])
}

model Application {
  id              Int               @id @default(autoincrement())
  fullName        String
  email           String
  phone           String?
  coverLetter     String?
  cvFileUrl       String?
  cvFileName      String?
  status          ApplicationStatus @default(NEW)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relations
  jobPosting      JobPosting        @relation(fields: [jobPostingId], references: [id])
  jobPostingId    Int

  // Link to CRM Candidate (sau khi import)
  candidateId     Int?
  candidate       Candidate?        @relation(fields: [candidateId], references: [id])

  @@index([jobPostingId])
  @@index([status])
}
```

### 3.2. Models CẦN SỬA (thêm relation):

```prisma
// Client — thêm relation đến Employer
model Client {
  // ... existing fields ...
  employer    Employer?   // 1 Client có thể link 1 Employer account
}

// Candidate — thêm relation đến Application
model Candidate {
  // ... existing fields ...
  applications Application[]  // CV apply từ web public
}

// JobOrder — thêm relation đến JobPosting
model JobOrder {
  // ... existing fields ...
  jobPostings  JobPosting[]  // Tin tuyển dụng public link đến Job Order
}
```

---

## 4. User Stories

### Ứng viên:
- Tôi muốn xem danh sách việc làm và lọc theo ngành/vị trí/khu vực
- Tôi muốn xem chi tiết việc làm, thông tin công ty, mức lương
- Tôi muốn nộp CV nhanh chóng (upload file + điền thông tin)
- Tôi muốn xem các công ty đang tuyển

### Nhà tuyển dụng:
- Tôi muốn đăng ký tài khoản và chọn gói dịch vụ
- Tôi muốn tự upload thông tin công ty (logo, mô tả)
- Tôi muốn đăng tin tuyển dụng theo quota gói
- Tôi muốn xem danh sách ứng viên đã apply
- Tôi muốn biết còn bao nhiêu tin đăng và ngày hết hạn

### Admin (CRM):
- Tôi muốn duyệt/từ chối tin tuyển dụng trước khi lên web
- Tôi muốn CV ứng viên từ web tự động tạo Candidate trong CRM
- Tôi muốn quản lý gói dịch vụ và theo dõi doanh thu

---

## 5. Luồng hoạt động chính

### 5.1. Ứng viên nộp CV:
```
Xem job → Click "Ứng tuyển" → Điền form (tên, email, phone, upload CV)
  → Lưu Application → Admin xem trong CRM
  → Admin click "Import" → Tạo Candidate + link Application
```

### 5.2. Employer đăng tin:
```
Đăng ký → Chọn gói → Admin duyệt tài khoản
  → Login → Upload thông tin cty → Đăng tin tuyển dụng
  → Admin duyệt tin → Tin hiển thị trên web
  → Ứng viên apply → Employer xem trong dashboard
```

### 5.3. Admin duyệt bài:
```
Tin mới từ Employer → Vào CRM Dashboard "Duyệt bài"
  → Đọc nội dung → Approve / Reject (+ lý do)
  → Nếu Approve → Tin hiển thị, gửi email employer
  → Nếu Reject → Employer nhận thông báo, sửa rồi submit lại
```

---

## 6. Tình huống đặc biệt

| Tình huống | Cách xử lý |
|-----------|-----------|
| Employer hết quota tin đăng | Hiện thông báo "Hết quota", gợi ý nâng gói |
| Tin tuyển dụng hết hạn | Tự động chuyển status EXPIRED, ẩn khỏi web |
| Gói dịch vụ hết hạn | Subscription status → EXPIRED, tin đang hiển thị vẫn giữ đến hết thời hạn tin |
| Employer bị khóa (SUSPENDED) | Tất cả tin bị ẩn, không đăng tin mới được |
| CV trùng (cùng email) | Tạo Application mới, khi import CRM → link Candidate cũ nếu trùng email |
| Admin từ chối tin | Employer nhận reject reason, sửa rồi submit lại |

---

## 7. Tech Stack

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | Cùng CRM, chia sẻ code |
| Database | PostgreSQL + Prisma | Cùng CRM |
| Auth (CRM) | NextAuth | Đã có |
| Auth (Employer) | NextAuth (separate provider) | Tách biệt CRM user |
| Styling | Tailwind CSS | Cùng CRM |
| File Upload | Vercel Blob / Local | Cùng CRM |
| Deployment | Vercel | Cùng CRM |

---

## 8. Phases chia nhỏ

| Phase | Tên | Tasks | Ước tính |
|:-----:|-----|:-----:|:--------:|
| 01 | Database Schema | 5 | 1 session |
| 02 | Public Layout + Homepage | 8 | 1-2 sessions |
| 03 | Danh sách & Chi tiết Việc làm | 7 | 1-2 sessions |
| 04 | Công ty & Form Ứng tuyển | 6 | 1 session |
| 05 | Employer Auth & Dashboard | 10 | 2-3 sessions |
| 06 | Employer: Đăng tin & Quản lý | 8 | 1-2 sessions |
| 07 | Admin: Duyệt bài & Gói dịch vụ | 7 | 1-2 sessions |
| 08 | CRM Integration (Import CV) | 5 | 1 session |
| **Tổng** | | **56** | **~10 sessions** |

---

## 9. BƯỚC TIẾP THEO

→ Anh review SPECS này  
→ Nếu OK → Em chạy `/design` để thiết kế DB migration + API chi tiết  
→ Rồi `/code phase-01` để bắt đầu code
