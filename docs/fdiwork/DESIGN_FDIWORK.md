# 🎨 DESIGN: FDIWork Public Website

Ngày tạo: 2026-03-21
Dựa trên: [SPECS.md](file:///d:/MH/Headhunt_pj/docs/fdiwork/SPECS.md) + [BRIEF](file:///d:/MH/Headhunt_pj/docs/fdiwork/BRIEF_FDIWORK_REBUILD.md)

---

## 1. 📊 CÁCH LƯU THÔNG TIN (Database Mở Rộng)

> 💡 Thêm 4 bảng mới vào database hiện tại. Các bảng CRM cũ **không bị ảnh hưởng**.

### Sơ đồ tổng quan:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ĐÃ CÓ (CRM)                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ 👤 User  │  │ 👤 Candidate │  │ 🏢 Client    │  │ 📋 Job    │  │
│  │ (Admin)  │  │ (Ứng viên)   │  │ (Doanh nghiệp)│  │ Order     │  │
│  └──────────┘  └──────┬───────┘  └──────┬────────┘  └─────┬─────┘  │
│                       │                  │                  │        │
└───────────────────────┼──────────────────┼──────────────────┼────────┘
                        │ link khi import  │ link thủ công    │ link thủ công
                        ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MỚI (FDIWork)                                                      │
│                                                                     │
│  ┌──────────────────┐     ┌───────────────────┐                     │
│  │ 🏭 Employer      │────▶│ 📦 Subscription   │                     │
│  │ (Nhà tuyển dụng) │     │ (Gói dịch vụ)     │                     │
│  │ - Email/Pass     │     │ - Gói (Basic→VIP) │                     │
│  │ - Tên công ty    │     │ - Quota tin đăng   │                     │
│  │ - Logo, mô tả    │     │ - Ngày hết hạn    │                     │
│  │ - Trạng thái     │     │ - Hiện logo?      │                     │
│  └────────┬─────────┘     └───────────────────┘                     │
│           │ đăng nhiều tin                                          │
│           ▼                                                         │
│  ┌──────────────────┐                                               │
│  │ 📄 JobPosting    │     ┌───────────────────┐                     │
│  │ (Tin tuyển dụng) │────▶│ 📝 Application    │                     │
│  │ - Tiêu đề, JD    │     │ (Đơn ứng tuyển)   │                     │
│  │ - Lương, khu vực │     │ - Tên, email, SĐT │                     │
│  │ - Trạng thái     │     │ - File CV          │                     │
│  │   (Chờ duyệt →   │     │ - Trạng thái      │                     │
│  │    Đã duyệt →    │     │   (Mới → Đã xem   │                     │
│  │    Hết hạn)       │     │    → Import CRM)   │                     │
│  └──────────────────┘     └───────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Chi tiết từng bảng MỚI:

#### 🏭 Employer (Nhà tuyển dụng)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã NTD |
| email | Chữ (duy nhất) | Email đăng nhập |
| password | Chữ | Mật khẩu (mã hóa bcrypt) |
| companyName | Chữ | Tên công ty |
| logo | Chữ? | URL logo công ty |
| description | Chữ dài? | Mô tả công ty |
| industry | Chữ? | Ngành nghề |
| companySize | Chọn 1? | SMALL / MEDIUM / LARGE / ENTERPRISE |
| address | Chữ? | Địa chỉ công ty |
| website | Chữ? | Website |
| phone | Chữ? | SĐT liên hệ |
| status | Chọn 1 | PENDING / ACTIVE / SUSPENDED |
| slug | Chữ (duy nhất) | URL-friendly name (auto từ companyName) |
| clientId | Liên kết? | → Client (CRM), admin link thủ công |

#### 📦 Subscription (Gói dịch vụ)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã gói |
| tier | Chọn 1 | BASIC / STANDARD / PREMIUM / VIP |
| status | Chọn 1 | ACTIVE / EXPIRED / CANCELLED |
| jobQuota | Số | Tổng tin được đăng trong gói |
| jobsUsed | Số | Số tin đã đăng (đếm ngược quota) |
| jobDuration | Số | Số ngày tin hiển thị (15/30/45/60) |
| showLogo | Đúng/Sai | Hiện logo ở trang chủ? (Premium+) |
| showBanner | Đúng/Sai | Hiện banner slide? (VIP) |
| startDate | Ngày | Ngày bắt đầu gói |
| endDate | Ngày | Ngày hết hạn gói |
| price | Số | Giá gói (VND) |
| employerId | Liên kết | → Employer (1:1, mỗi employer 1 gói) |

#### 📄 JobPosting (Tin tuyển dụng)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã tin |
| title | Chữ | Tiêu đề tin (VD: "Kỹ sư cơ khí") |
| slug | Chữ (duy nhất) | URL-friendly (auto) |
| description | Chữ dài | Mô tả công việc |
| requirements | Chữ dài? | Yêu cầu ứng viên |
| benefits | Chữ dài? | Phúc lợi |
| salaryMin | Số? | Lương tối thiểu (triệu VND) |
| salaryMax | Số? | Lương tối đa |
| salaryDisplay | Chữ? | Hiển thị: "15-20 triệu" / "Thỏa thuận" |
| industry | Chữ? | Ngành nghề |
| position | Chữ? | Cấp bậc: Nhân viên / Trưởng phòng... |
| location | Chữ? | Khu vực: HCM / HN / ĐN... |
| workType | Chữ? | Full-time / Part-time / Remote |
| quantity | Số | Số lượng tuyển (mặc định 1) |
| skills | Chữ? | Tags kỹ năng, phân cách bằng dấu phẩy |
| status | Chọn 1 | DRAFT / PENDING / APPROVED / REJECTED / EXPIRED / PAUSED |
| rejectReason | Chữ? | Lý do từ chối (admin điền) |
| publishedAt | Ngày? | Ngày được duyệt lên web |
| expiresAt | Ngày? | Ngày hết hạn (tính từ publishedAt + jobDuration) |
| viewCount | Số | Số lượt xem |
| applyCount | Số | Số lượt apply |
| isFeatured | Đúng/Sai | Tin nổi bật (VIP) |
| employerId | Liên kết | → Employer |
| jobOrderId | Liên kết? | → JobOrder (CRM), admin link thủ công |

#### 📝 Application (Đơn ứng tuyển)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Tự tăng | Mã đơn |
| fullName | Chữ | Họ tên ứng viên |
| email | Chữ | Email |
| phone | Chữ? | SĐT |
| coverLetter | Chữ dài? | Thư xin việc (tùy chọn) |
| cvFileUrl | Chữ? | URL file CV đã upload |
| cvFileName | Chữ? | Tên file gốc |
| status | Chọn 1 | NEW / REVIEWED / SHORTLISTED / REJECTED / IMPORTED |
| jobPostingId | Liên kết | → JobPosting |
| candidateId | Liên kết? | → Candidate (CRM), khi import |

---

## 2. 🔐 THIẾT KẾ ĐĂNG NHẬP (Auth Strategy)

> 💡 Hiện tại CRM dùng NextAuth v5 + JWT. Middleware redirect TẤT CẢ route chưa login về `/login`.
> Cần sửa middleware để: `(public)` = không cần login, `(employer)` = login employer, `(dashboard)` = login CRM.

### 2.1. Chiến lược Auth:

```
URL bắt đầu bằng...    │  Cần đăng nhập?  │  Ai được vào?
────────────────────────┼──────────────────┼──────────────
/                       │  ❌ Không         │  Ai cũng xem được
/viec-lam/*             │  ❌ Không         │  Ai cũng xem được
/cong-ty/*              │  ❌ Không         │  Ai cũng xem được
/ung-tuyen/*            │  ❌ Không         │  Ai cũng nộp CV
────────────────────────┼──────────────────┼──────────────
/employer/login         │  ❌ Không         │  Form đăng nhập
/employer/register      │  ❌ Không         │  Form đăng ký
/employer/dashboard     │  ✅ Employer      │  Chỉ Employer
/employer/job-postings  │  ✅ Employer      │  Chỉ Employer
/employer/company       │  ✅ Employer      │  Chỉ Employer
────────────────────────┼──────────────────┼──────────────
/login                  │  ❌ Không         │  CRM login form
/candidates/*           │  ✅ CRM User      │  Admin/Member
/clients/*              │  ✅ CRM User      │  Admin/Member
/jobs/*                 │  ✅ CRM User      │  Admin/Member
/moderation/*           │  ✅ CRM User      │  Admin/Member
```

### 2.2. Cách làm:

**Employer auth tách biệt khỏi CRM auth** — dùng system Session riêng (cookies khác tên):

```
CRM Auth:
  - NextAuth session (cookie: "authjs.session-token")
  - Bảng User (id, email, role)
  - Login page: /login

Employer Auth:
  - Custom JWT cookie (cookie: "employer-token")
  - Bảng Employer (id, email, status)
  - Login page: /employer/login
  - Đơn giản hơn: bcrypt verify + sign JWT manually
```

> ⚠️ **Quyết định thiết kế:** Employer auth dùng **custom JWT đơn giản** thay vì NextAuth thứ 2. Lý do: (1) Tránh conflict 2 NextAuth instances, (2) Dễ vibe code hơn, (3) Đủ an toàn cho MVP.

### 2.3. File cần sửa:

| File | Thay đổi |
|------|---------|
| `src/auth.config.ts` | Sửa `authorized` callback: cho phép `(public)` routes |
| `src/middleware.ts` | Thêm logic check employer cookie cho `/employer/*` routes |
| `src/lib/employer-auth.ts` | **MỚI** — Hàm login, register, verify JWT employer |

---

## 3. 📱 DANH SÁCH MÀN HÌNH

### 3.1. Trang Public (Ứng viên xem)

| # | Tên | URL | Mục đích |
|---|-----|-----|----------|
| P1 | 🏠 Homepage | `/` | Banner VIP, job mới, top công ty, ngành nghề |
| P2 | 📋 DS Việc làm | `/viec-lam` | Grid job cards + sidebar lọc |
| P3 | 📄 Chi tiết Việc | `/viec-lam/[slug]` | Full JD + thông tin cty + nút Apply |
| P4 | 🏢 DS Công ty | `/cong-ty` | Grid company cards |
| P5 | 🏢 Profile Cty | `/cong-ty/[slug]` | Chi tiết cty + jobs đang tuyển |
| P6 | ✉️ Form Apply | `/ung-tuyen?job=[id]` | Upload CV + info ứng viên |
| P7 | ✅ Apply Success | `/ung-tuyen/thanh-cong` | Xác nhận đã nộp thành công |

### 3.2. Trang Employer (Nhà tuyển dụng)

| # | Tên | URL | Mục đích |
|---|-----|-----|----------|
| E1 | 🔐 Đăng nhập | `/employer/login` | Login employer |
| E2 | 📝 Đăng ký | `/employer/register` | Register + chờ duyệt |
| E3 | 📊 Dashboard | `/employer/dashboard` | Tổng quan: tin đăng, ứng viên mới, quota |
| E4 | 🏢 Profile Cty | `/employer/company` | Upload/sửa thông tin công ty |
| E5 | 📋 DS Tin đăng | `/employer/job-postings` | List tin + trạng thái |
| E6 | ✏️ Đăng tin mới | `/employer/job-postings/new` | Form tạo tin tuyển dụng |
| E7 | 📄 Chi tiết tin | `/employer/job-postings/[id]` | Xem + edit + danh sách applicants |
| E8 | 💎 Gói dịch vụ | `/employer/subscription` | Gói hiện tại + quota + gia hạn |

### 3.3. Trang CRM (Admin — thêm vào dashboard hiện tại)

| # | Tên | URL | Mục đích |
|---|-----|-----|----------|
| A1 | ✅ Duyệt bài | `/moderation` | DS tin PENDING + Approve/Reject |
| A2 | 🏭 DS Employers | `/employers` | DS NTD + duyệt tài khoản |
| A3 | 💎 Quản lý Gói | `/packages` | Assign gói, theo dõi thanh toán |

---

## 4. 🔌 SERVER ACTIONS & API

> 💡 Dùng **Server Actions** (giống CRM hiện tại), không cần REST API riêng.

### 4.1. Public Actions (`src/lib/public-actions.ts`)

| Action | Input | Output | Ghi chú |
|--------|-------|--------|---------|
| `getPublicJobs` | filters, page, limit | JobPosting[] + count | Chỉ lấy APPROVED, chưa hết hạn |
| `getPublicJobBySlug` | slug | JobPosting + Employer | Tăng viewCount |
| `getPublicCompanies` | page | Employer[] (ACTIVE only) | Chỉ employer có gói ACTIVE |
| `getPublicCompanyBySlug` | slug | Employer + JobPostings | Kèm jobs đang tuyển |
| `getHomepageData` | - | featured jobs, VIP employers, stats | Cached, revalidate 5 phút |
| `submitApplication` | form data + CV file | Application | Upload CV → lưu Application |

### 4.2. Employer Actions (`src/lib/employer-actions.ts`)

| Action | Input | Output | Auth |
|--------|-------|--------|------|
| `registerEmployer` | email, pass, companyName | Employer (PENDING) | - |
| `loginEmployer` | email, pass | JWT token (cookie) | - |
| `logoutEmployer` | - | Clear cookie | ✅ |
| `getEmployerDashboard` | - | stats, recent jobs, new apps | ✅ |
| `updateCompanyProfile` | form data + logo | Employer updated | ✅ |
| `createJobPosting` | form data | JobPosting (DRAFT/PENDING) | ✅ Check quota |
| `updateJobPosting` | id, form data | JobPosting updated | ✅ Check ownership |
| `getMyJobPostings` | page, status | JobPosting[] | ✅ |
| `getMyApplicants` | jobPostingId | Application[] | ✅ |
| `pauseJobPosting` | id | status → PAUSED | ✅ |
| `resumeJobPosting` | id | status → APPROVED | ✅ Check hạn |

### 4.3. Moderation Actions (`src/lib/moderation-actions.ts`)

| Action | Input | Output | Auth |
|--------|-------|--------|------|
| `getPendingJobPostings` | page | JobPosting[] (PENDING) | ✅ CRM |
| `approveJobPosting` | id | status → APPROVED, set expiresAt | ✅ CRM |
| `rejectJobPosting` | id, reason | status → REJECTED + reason | ✅ CRM |
| `getPendingEmployers` | page | Employer[] (PENDING) | ✅ CRM |
| `approveEmployer` | id | status → ACTIVE | ✅ CRM |
| `suspendEmployer` | id | status → SUSPENDED, ẩn all jobs | ✅ CRM |
| `assignSubscription` | employerId, tier, duration | Create/Update Subscription | ✅ CRM |
| `importApplicationToCRM` | applicationId | Create Candidate + link | ✅ CRM |
| `getPendingApplications` | page | Application[] (NEW) | ✅ CRM |

### 4.4. API Routes cần thêm:

| Route | Method | Mục đích |
|-------|--------|----------|
| `/api/public/apply` | POST | Upload CV file + tạo Application |
| `/api/employer/logo` | POST | Upload logo công ty |

> Lý do dùng API route thay vì Server Action: Upload file cần FormData handler riêng.

---

## 5. 🚶 LUỒNG HOẠT ĐỘNG CHI TIẾT

### Hành trình 1: Ứng viên tìm việc + nộ CV

```
1️⃣ Vào homepage → Thấy banner, việc mới, top cty
2️⃣ Click "Việc làm" hoặc search bar
3️⃣ Trang danh sách: lọc theo ngành/khu vực/lương
4️⃣ Click vào 1 job → Trang chi tiết: JD, yêu cầu, lương, cty
5️⃣ Click "Ứng tuyển ngay →"
6️⃣ Trang form: Nhập tên, email, SĐT, upload CV, cover letter
7️⃣ Click "Nộp hồ sơ"
8️⃣ → Trang "Cảm ơn! Hồ sơ đã được gửi thành công"
9️⃣ (Hệ thống) Application lưu vào DB → Admin thấy trong CRM
```

### Hành trình 2: Employer đăng ký + đăng tin (lần đầu)

```
1️⃣ Employer vào /employer/register
2️⃣ Điền: email, mật khẩu, tên công ty
3️⃣ Submit → Tạo Employer (PENDING) → Hiện "Chờ duyệt"
4️⃣ (Admin) Vào CRM → Duyệt employer → ACTIVE
5️⃣ (Admin) Assign gói dịch vụ (Standard: 10 tin, 30 ngày)
6️⃣ Employer login → Dashboard → "Chào mừng! Gói Standard, 10/10 tin còn lại"
7️⃣ Click "Đăng tin tuyển" → Fill form: tiêu đề, JD, lương, khu vực...
8️⃣ Submit → JobPosting (PENDING) → "Tin đã gửi, chờ admin duyệt"
9️⃣ (Admin) Duyệt tin → APPROVED → Hiển thị trên web
🔟 Ứng viên apply → Employer thấy trong dashboard
```

### Hành trình 3: Admin duyệt bài + import CV

```
1️⃣ Admin mở CRM → Sidebar có thêm mục "FDIWork"
2️⃣ Click "Duyệt bài" → Thấy danh sách tin PENDING
3️⃣ Click vào 1 tin → Preview nội dung (tiêu đề, JD, cty)
4️⃣ Click "✅ Duyệt" → Tin chuyển APPROVED + hiển thị trên web
   HOẶC "❌ Từ chối" → Nhập lý do → Employer thấy notification
5️⃣ Click "Ứng viên mới" → Thấy Application[] (NEW)
6️⃣ Click "Import vào CRM" → Tạo Candidate mới trong CRM
   → Application status = IMPORTED
```

---

## 6. ✅ CHECKLIST KIỂM TRA (Acceptance Criteria)

### TC-01: Homepage
```
✅ Banner VIP employers hiển thị đúng (chỉ employer có showBanner = true)
✅ Logo Premium/VIP hiển thị ở section "Top Employers"
✅ "Việc làm mới nhất" lấy đúng 8 job APPROVED mới nhất
✅ Responsive: mobile hiển thị đúng (1 cột), desktop (3 cột)
```

### TC-02: Danh sách việc làm
```
✅ Chỉ hiển thị job APPROVED + chưa hết hạn
✅ Lọc theo ngành → chỉ hiện job đúng ngành
✅ Lọc theo khu vực → chỉ hiện job đúng khu vực
✅ Lọc theo lương → salary range đúng
✅ Phân trang: 12 items/page, click next/prev hoạt động
✅ Job card hiển thị: tiêu đề, cty, lương, khu vực, ngày đăng
```

### TC-03: Chi tiết việc làm
```
✅ URL slug đúng (/viec-lam/ky-su-co-khi-samsung)
✅ Hiện đầy đủ: tiêu đề, JD, yêu cầu, phúc lợi, lương, khu vực
✅ Sidebar thông tin công ty: logo, tên, ngành, quy mô
✅ Nút "Ứng tuyển" redirect đúng sang form
✅ "Việc làm tương tự" hiển thị 4 jobs cùng ngành
✅ viewCount tăng mỗi lần xem
```

### TC-04: Form ứng tuyển
```
✅ Required: Họ tên, Email → bỏ trống hiện lỗi
✅ Upload CV: chỉ PDF/DOC/DOCX, max 10MB
✅ Upload file sai định dạng → "Chỉ chấp nhận PDF, DOC, DOCX"
✅ Submit thành công → redirect /ung-tuyen/thanh-cong
✅ Application lưu vào DB đúng data
```

### TC-05: Employer đăng ký/đăng nhập
```
✅ Đăng ký: email trùng → "Email đã tồn tại"
✅ Đăng ký thành công → Employer (PENDING) → hiện "Chờ duyệt"
✅ Login trước khi duyệt → "Tài khoản chưa được kích hoạt"
✅ Login sau khi duyệt → vào Dashboard thành công
✅ Login sai pass → "Email hoặc mật khẩu không đúng"
✅ Route protection: chưa login vào /employer/dashboard → redirect /employer/login
```

### TC-06: Employer đăng tin
```
✅ Required: Tiêu đề, Mô tả → bỏ trống hiện lỗi
✅ Hết quota → "Bạn đã hết lượt đăng tin. Vui lòng nâng gói."
✅ Submit → JobPosting (PENDING) → "Tin đang chờ duyệt"
✅ Danh sách tin: hiển thị đúng trạng thái (badge màu)
✅ Tin bị REJECTED → hiện lý do từ chối
```

### TC-07: Admin duyệt bài
```
✅ Danh sách PENDING hiển thị đúng
✅ Approve → tin chuyển APPROVED + set expiresAt
✅ Reject + lý do → employer thấy lý do
✅ Duyệt employer PENDING → ACTIVE
✅ Assign gói → Subscription created đúng
```

### TC-08: Import CV vào CRM
```
✅ Click Import → tạo Candidate với data từ Application (name, email, phone)
✅ CV file link sang Candidate.cvFileUrl
✅ Source tự động set "FDIWORK"
✅ Email trùng → link Candidate cũ, không tạo mới
✅ Application status → IMPORTED
```

---

## 7. 🧪 TEST CASES

### TC-SYS-01: Auth Middleware

```
Given: Người dùng chưa đăng nhập
When:  Truy cập /viec-lam
Then:  ✓ Hiển thị bình thường (public route)

Given: Employer chưa đăng nhập
When:  Truy cập /employer/dashboard
Then:  ✓ Redirect về /employer/login

Given: Employer đã đăng nhập
When:  Truy cập /candidates (CRM route)
Then:  ✓ Redirect về /login (không phải CRM user)

Given: CRM Admin đã đăng nhập
When:  Truy cập /moderation
Then:  ✓ Hiển thị bình thường
```

### TC-SYS-02: Quota Check

```
Given: Employer có gói Standard (quota 10, used 10)
When:  Tạo tin mới
Then:  ✓ Lỗi "Hết quota"
       ✓ Không tạo JobPosting
       ✓ Gợi ý nâng gói

Given: Employer có gói Standard (quota 10, used 9)
When:  Tạo tin mới thành công
Then:  ✓ jobsUsed = 10
       ✓ Hiện "Còn 0 tin đăng"
```

### TC-SYS-03: Auto Expire

```
Given: JobPosting đã APPROVED, expiresAt = hôm qua
When:  User xem trang /viec-lam
Then:  ✓ Tin KHÔNG hiển thị trong danh sách
       ✓ Truy cập URL trực tiếp → "Tin đã hết hạn"
```

---

## 8. 🎨 DESIGN TOKENS (FDIWork Public)

> 💡 Web public dùng **bảng màu khác CRM** để phân biệt. CRM = Indigo (nội bộ), FDIWork = Teal/Emerald (professional).

### Color Palette — FDIWork Public

| Name | Hex | Usage |
|------|-----|-------|
| Brand Primary | #0D9488 | Buttons, links, accent (Teal 600) |
| Brand Primary Hover | #0F766E | Button hover (Teal 700) |
| Brand Accent | #10B981 | CTA buttons, highlights (Emerald 500) |
| Brand Dark | #134E4A | Footer, dark sections (Teal 900) |
| Background | #FFFFFF | Page background |
| Surface | #F0FDFA | Cards, sections (Teal 50) |
| Text | #0F172A | Primary text (same as CRM) |
| Text Secondary | #64748B | Descriptions |

### Layout — FDIWork Public

| Element | Spec |
|---------|------|
| Header | Fixed top, height 64px, white bg, logo left, search center, CTA right |
| Main Content | Max-width 1280px, centered, padding 24px |
| Footer | Dark bg (#134E4A), 3 columns, contact + links + social |
| Job Card | 300px width, border, rounded-lg, shadow-sm, hover shadow-md |
| Company Card | 200px width, logo center, name below, badge for tier |

### Layout — Employer Portal

| Element | Spec |
|---------|------|
| Sidebar | 240px, same style as CRM but Teal theme |
| Header | Employer name + company, notification bell |
| Content | Same spacing/typography as CRM |

---

## 9. 📐 COMPONENT TREE

```
src/components/
├── public/                    # FDIWork public site
│   ├── PublicHeader.tsx        # Header + search + nav
│   ├── PublicFooter.tsx        # Footer 3 columns
│   ├── HeroSection.tsx         # Hero banner + search
│   ├── FeaturedJobs.tsx        # Grid 8 job cards
│   ├── TopEmployers.tsx        # Carousel logo VIP/Premium
│   ├── IndustryGrid.tsx        # Grid ngành nghề
│   ├── JobCard.tsx             # Card 1 job
│   ├── JobFilters.tsx          # Sidebar lọc (ngành, vực, lương)
│   ├── JobDetail.tsx           # Chi tiết job
│   ├── CompanyCard.tsx         # Card 1 company
│   ├── CompanyProfile.tsx      # Full profile cty
│   ├── ApplyForm.tsx           # Form nộ CV
│   └── Pagination.tsx          # Phân trang
│
├── employer/                   # Employer portal
│   ├── EmployerSidebar.tsx     # Sidebar navigation
│   ├── EmployerDashboard.tsx   # Stats cards + chart
│   ├── CompanyForm.tsx         # Upload/edit profile
│   ├── JobPostingForm.tsx      # Form đăng tin
│   ├── JobPostingList.tsx      # DS tin đã đăng
│   ├── ApplicantList.tsx       # DS ứng viên apply
│   └── SubscriptionCard.tsx    # Gói dịch vụ hiện tại
│
└── moderation/                 # CRM admin
    ├── ModerationList.tsx      # DS tin chờ duyệt
    ├── JobPostingPreview.tsx    # Preview nội dung tin
    ├── EmployerList.tsx        # DS employer
    ├── PackageManager.tsx      # Gán gói
    └── ImportButton.tsx        # Import CV vào CRM
```

---

## ➡️ TIẾP THEO:

```
1️⃣ Muốn xem mockup UI? /visualize
2️⃣ Bắt đầu code? /code phase-01  (Recommended)
3️⃣ Cần chỉnh sửa? Nói em biết
4️⃣ Lưu context? /save-brain
```

💡 **Gợi ý:** Design đã đủ chi tiết, bắt đầu `/code phase-01` (Database Schema) luôn!

---

*Tạo bởi AWF - Design Phase | 2026-03-21*
