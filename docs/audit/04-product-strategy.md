# 📊 Headhunt Manager — Đánh Giá Định Hướng Sản Phẩm

> **Vai trò:** Product + Tech Advisor cho headhunt startup
> **Phương pháp:** Đánh giá codebase thực tế vs quy trình tuyển dụng headhunt thực tế
> **Business Context:** Founder có mạng lưới FDI lâu năm, chuyển từ cá nhân sang công ty. Mô hình hybrid: headhunt chủ động + bán slot đăng tin cho network.

---

## 0. Business Model: Hybrid Recruitment Firm

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEADHUNT MANAGER                             │
│                                                                 │
│   Revenue 1: HEADHUNT FEE (15-25% salary)                      │
│   ┌────────────────────────────┐                                │
│   │ CRM nội bộ                 │  ← ít deal, margin lớn        │
│   │ Candidate database         │  ← dựa trên uy tín cá nhân    │
│   │ Pipeline tracking          │  ← công cụ chính              │
│   └────────┬───────────────────┘                                │
│            │ feed ngược                                         │
│            ↕ CV database                                        │
│   ┌────────┴───────────────────┐                                │
│   │ FDIWork (Job Board)        │  ← recurring, ổn định          │
│   │ Posting slots cho FDI cos  │  ← value-add cho network       │
│   │ Public job listings        │  ← thu CV passive              │
│   └────────────────────────────┘                                │
│   Revenue 2: JOB POSTING SUBSCRIPTION                           │
│                                                                 │
│   Cùng 1 client network → 2 revenue streams                    │
└─────────────────────────────────────────────────────────────────┘
```

**Mô hình hybrid hợp lý** vì:
- Mạng lưới FDI **vừa là khách hàng headhunt VỪA là người mua slot** → cross-sell tự nhiên
- FDIWork **không cạnh tranh TopCV** — là value-added service cho network có sẵn
- CV thu từ FDIWork → **feed ngược database** cho headhunt sourcing
- Recurring revenue (subscription) bù đắp khi headhunt deal cycle dài

---

## 1. Hệ Thống Này Có Thực Sự Giúp Ích Không?

### 1.1 Tìm ứng viên nhanh hơn?

| Tiêu chí | Verdict | Phân tích |
|----------|---------|-----------|
| Search bằng tên/email/phone | ⚠️ Có nhưng chậm | ILIKE full scan, OK ở <10K records |
| Filter theo skills | ❌ Gần như vô dụng | Exact match — "Node.js" ≠ "NodeJS" ≠ "node" |
| Filter tổng hợp (level + location + salary) | ⚠️ Có nhưng rời rạc | Hoạt động nhưng hardcoded options |
| Match candidate ↔ job tự động | ❌ Không có | Không có scoring/suggestion |
| Tìm từ CV content | ❌ Không có | Chỉ lưu URL, không index nội dung |

**Kết luận: 3/10.** Search hiện tại **không nhanh hơn Excel** khi data >5K. Thiếu smart matching.

### 1.2 Quản lý mối quan hệ (CRM)?

| Tiêu chí | Verdict | Phân tích |
|----------|---------|-----------|
| Ghi chú trên candidate | ✅ Có | `CandidateNote` — basic nhưng hoạt động |
| Track nguồn ứng viên | ✅ Có | `CandidateSource` enum |
| Lịch sử liên hệ | ❌ Không có | Không log calls, emails, meetings |
| Reminder/follow-up | ❌ Không có | Không có task/reminder system |
| Relationship timeline | ❌ Không có | Không biết lần cuối contact là khi nào |
| Client relationship | ⚠️ Rất basic | Chỉ contacts list, không interaction log |

**Kết luận: 2/10.** Đây là **address book có ghi chú**, chưa phải CRM.

### 1.3 Đóng vị trí nhanh hơn (ATS)?

| Tiêu chí | Verdict | Phân tích |
|----------|---------|-----------|
| Pipeline stages | ✅ Có | 6 stages hoạt động |
| Interview scheduling | ⚠️ Basic | Chỉ date field, không calendar |
| Time-to-fill tracking | ❌ Không có | Không measure |
| Pipeline overview | ❌ Không có | Flat list, không kanban |
| Offer management | ❌ Không có | Không track negotiation |

**Kết luận: 4/10.** Pipeline basic cho 1-2 người, <10 jobs đồng thời.

### 1.4 Thu CV passive từ FDIWork?

| Tiêu chí | Verdict | Phân tích |
|----------|---------|-----------|
| Job posting public | ✅ Có | Đủ feature |
| Apply form | ✅ Có | CV upload + thông tin cơ bản |
| Employer self-service | ✅ Có | Register/login/posting |
| Subscription management | ✅ Có | Gói dịch vụ + quota |
| Application → CRM import | ⚠️ 1-way, manual | Admin phải import từng đơn |
| Job board ↔ CRM sync | ❌ Broken | 3 manual links cần admin thao tác |

**Kết luận: 6/10.** FDIWork khá hoàn chỉnh cho MVP. Vấn đề chính là **cầu nối với CRM đang gãy**.

---

## 2. Misalignment Chính: CRM Yếu Nhưng Là Core Revenue

### Phân bổ effort hiện tại vs nên làm

```
HIỆN TẠI                           NÊN LÀ
┌──────────────┬──────────────┐    ┌──────────────┬──────────────┐
│  CRM/ATS     │  FDIWork     │    │  CRM/ATS     │  FDIWork     │
│  ~55%        │  ~45%        │    │  ▓▓▓▓▓▓▓ 70% │  ░░░ 20%    │
│  Basic       │  Khá đầy đủ  │    │  Mạnh        │  Maintain    │
│  3/10 score  │  6/10 score  │    │              │              │
└──────────────┴──────────────┘    │  + Bridge Integration 10%   │
                                    └──────────────┴──────────────┘
```

**Vấn đề:** Phần kiếm tiền nhiều nhất (headhunt fee = 15-25% salary) dựa vào CRM **đang yếu nhất** (3/10). Phần kiếm tiền ít hơn (posting slots) dựa vào FDIWork **lại đầy đủ hơn** (6/10).

---

## 3. Cầu Nối CRM ↔ FDIWork Đang Gãy

Đây là vấn đề lớn nhất của mô hình hybrid:

```
Hiện tại: 3 manual links
─────────────────────────────────────────────────
Client (CRM)     ←── admin link thủ công ──→  Employer (FDIWork)
JobOrder (CRM)   ←── admin link thủ công ──→  JobPosting (FDIWork)
Candidate (CRM)  ←── admin import thủ công ──  Application (FDIWork)

Cần có: Auto-sync
─────────────────────────────────────────────────
Client tạo CRM   → auto-create Employer on FDIWork
JobOrder "Publish"→ auto-create JobPosting
Application apply → auto-import vào JobOrder pipeline
```

**Hậu quả khi thiếu bridge:** Với 50+ clients active, recruiter phải link thủ công → dễ sót → 2 thế giới dữ liệu rời rạc → mất kiểm soát.

---

## 4. Top 5 Must-Have Features Đang Thiếu

### #1. 🔗 CRM ↔ FDIWork Bridge (Hybrid Core)

**Hiện trạng:** 3 manual links, 2 data islands.

**Cần có:**
- CRM → FDIWork: "Đăng lên FDIWork" button trên JobOrder → auto-create JobPosting
- FDIWork → CRM: Application mới → auto-import vào pipeline của JobOrder tương ứng
- 2-way sync: Job close ở CRM → auto unpublish trên FDIWork

**Effort:** 1-2 tuần | **ROI:** Hybrid model hoạt động tự động thay vì thủ công

---

### #2. 🧠 Smart Candidate Matching

**Hiện trạng:** Recruiter search thủ công, nhớ tên, gán từng người.

**Cần có:**
- Mở Job Order → auto-suggest top candidates match skills + level + salary
- Scoring: exact skill match (10pt), partial (5pt), location (3pt), salary fit (5pt)
- 1-click shortlist → batch assign vào pipeline

**Effort:** 1-2 tuần | **ROI:** Giảm 70% thời gian sourcing per job

---

### #3. 📧 Activity Timeline + Touchpoint Tracking

**Hiện trạng:** Chỉ notes thủ công. Không biết lần cuối contact UV khi nào.

**Cần có:**
- `ActivityLog`: CALL | EMAIL | MEETING | NOTE | STATUS_CHANGE
- Timeline trên candidate detail — overview toàn bộ interaction
- Reminder/follow-up: "Gọi lại sau 3 ngày"

**Effort:** 1-2 tuần | **ROI:** Address book → CRM thực sự

---

### #4. 📊 Pipeline Analytics + Revenue Dashboard

**Hiện trạng:** Dashboard chỉ có 4 count cards. Zero metrics.

**Cần có:**
- Per-job: time-in-stage, conversion rate, time-to-fill
- Per-recruiter: placements/month, pipeline velocity
- Revenue: fee per placement, monthly revenue, **posting subscription revenue**
- Pipeline funnel: sourced → placed conversion

**Effort:** 2-3 tuần | **ROI:** Data-driven business decisions

---

### #5. 🔗 Candidate ↔ Job Cross-Reference

**Hiện trạng:** Candidate detail không hiện đang ở job nào.

**Cần có:**
- Candidate profile: "Pipeline hiện tại" — list tất cả jobs + stage
- Job detail: "Candidates phù hợp" panel
- Prevent duplicate: cảnh báo UV ở quá nhiều pipelines

**Effort:** 3-5 ngày | **ROI:** Unblock ATS workflow

---

## 5. Tính Năng Hành Động

### ✅ FDIWork: Đã Đủ Feature — Chuyển Sang Maintain

| Component | Trạng thái | Hành động |
|-----------|-----------|-----------|
| Employer register/login/posting | ✅ Đủ | **Maintain** — fix bugs only |
| Public job listing + apply | ✅ Đủ | **Maintain** |
| Subscription/packages | ✅ Đủ | **Maintain** |
| Company profiles | ✅ Đủ | **Maintain** |
| Moderation workflow | ✅ Đủ | **Maintain** |

> FDIWork **không cần feature mới** — cần fix integration bridge.

### 🔴 CRM/ATS: Cần Đầu Tư Mạnh

| Component | Trạng thái | Hành động |
|-----------|-----------|-----------|
| Candidate search/matching | ❌ Yếu | **Build** — smart matching |
| Relationship tracking | ❌ Thiếu | **Build** — activity timeline |
| Pipeline analytics | ❌ Thiếu | **Build** — metrics + funnel |
| Candidate ↔ Job cross-ref | ❌ Broken | **Fix** — include jobLinks |
| Revenue tracking | ❌ Thiếu | **Build** — headhunt fees + subscription |

### 🟠 Bridge: Cần Build Mới

| Component | Trạng thái | Hành động |
|-----------|-----------|-----------|
| Client ↔ Employer sync | ❌ Manual | **Build** — auto-link/create |
| JobOrder → JobPosting publish | ❌ Manual | **Build** — 1-click publish |
| Application → Pipeline auto-import | ❌ Manual | **Build** — auto-assign |

---

## 6. Roadmap Đề Xuất (Phiên Bản Hybrid)

### Giai đoạn 1: Fix Core CRM + Bridge (3-4 tuần)

```
Mục tiêu: CRM hoạt động tốt + FDIWork tự động sync

[ ] Candidate ↔ Job cross-reference (3-5 ngày)
[ ] Fix skills normalization + GIN index (1 ngày)
[ ] Job form: thêm skills/industry/location/assignee (2 giờ)
[ ] Application → Pipeline auto-import when JobOrder linked (3 ngày)
[ ] "Đăng lên FDIWork" button on JobOrder (3 ngày)
[ ] Smart matching/suggestion cho assign modal (1 tuần)
```

### Giai đoạn 2: CRM Thật Sự (3-4 tuần)

```
Mục tiêu: Recruiter THÍCH dùng hơn Notion/Excel

[ ] Activity timeline + audit log (1-2 tuần)
[ ] Revenue tracking: headhunt fees + subscription (1 tuần)
[ ] Reminder/follow-up system (1 tuần)
[ ] Kanban pipeline view (3-5 ngày)
```

### Giai đoạn 3: Analytics + Scale (khi có traction)

```
[ ] Pipeline analytics + KPI dashboard (2-3 tuần)
[ ] Full-text search (tsvector/Meilisearch) (1 tuần)
[ ] Email integration (tracked emails) (2 tuần)
[ ] Team RBAC (ownership, visibility scope) (2 tuần)
[ ] Mobile PWA optimization (1-2 tuần)
```

---

## Tóm Tắt

> **Mô hình hybrid đúng hướng.** FDIWork đã đủ feature cho MVP — freeze, chỉ maintain. CRM core đang yếu nhất (3/10) nhưng là nơi kiếm tiền nhiều nhất — **đầu tư 70% effort vào đây**. Cầu nối CRM ↔ FDIWork đang gãy hoàn toàn — **fix bridge là ưu tiên #1** để hybrid model hoạt động tự động.
