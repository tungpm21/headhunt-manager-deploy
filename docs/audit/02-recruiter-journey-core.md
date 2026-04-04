# 🎯 Headhunt Manager — Mô Phỏng Hành Trình Recruiter

> **Kịch bản:** Recruiter nhận yêu cầu tuyển **Senior Backend Developer (Node.js, $2000/tháng ~45 triệu VNĐ)** cho client ABC Corp. Database hiện có hàng ngàn candidates.

---

## Phase 1: Tạo Job Order Mới

### Flow thực tế

```
/jobs → "Tạo Job Mới" → /jobs/new → JobForm → createJobAction → redirect /jobs/{id}
```

**Recruiter thao tác:**
1. Click **"Tạo Job Mới"** từ danh sách hoặc Dashboard
2. Điền form [job-form.tsx](file:///d:/MH/Headhunt_pj/src/components/jobs/job-form.tsx):
   - Vị trí: "Senior Backend Developer"
   - Client: chọn từ dropdown (load tất cả clients via `getAllClients()`)
   - Lương: 35-45 Tr/tháng
   - Số lượng: 1
   - Trạng thái: OPEN
   - Hạn chót: 30 ngày

### ⚠️ Pain Points — Phase 1

| # | Vấn đề | Mức độ | Chi tiết |
|---|--------|--------|----------|
| **P1** | **Không có trường Skills** | 🔴 Critical | Form hoàn toàn **không có input cho `requiredSkills`**. Schema có `JobOrder.requiredSkills String[]` nhưng form không render field này. Recruiter không thể ghi "Node.js, TypeScript, PostgreSQL" vào job. |
| **P2** | **Không có trường Industry / Location** | 🔴 Critical | Schema có `JobOrder.industry` và `JobOrder.location` nhưng **form không có 2 input này**. Không thể filter jobs theo ngành/khu vực sau đó. |
| **P3** | **Client dropdown load tất cả** | 🟡 Medium | `getAllClients()` trả về toàn bộ clients không phân trang. 500+ clients → dropdown dài, không có search. |
| **P4** | **Không có assigned recruiter** | 🟠 High | Schema có `JobOrder.assignedToId` nhưng form **không cho chọn ai phụ trách**, luôn để null. |

**Kết quả:** Job được tạo thiếu skills, industry, location, assigned recruiter — **4 trường quan trọng nhất để matching candidates đều trống**.

---

## Phase 2: Tìm Ứng Viên Phù Hợp

### Flow thực tế

```
/candidates → CandidateFiltersPanel → getCandidates(filters) → CandidateTable
```

**Recruiter cần tìm:** "Senior, biết Node.js, TP.HCM, lương kỳ vọng < 45 triệu"

### Bước 2a: Dùng bộ lọc

Recruiter mở `/candidates`, click **"Bộ lọc"** → panel filter mở ra:

```
Filter hiện có:          | Điều recruiter cần:
─────────────────────────┼──────────────────────
✅ Cấp bậc → SENIOR      | ✅ Có
✅ Khu vực → TP.HCM       | ⚠️ Hardcoded 5 options
⚠️ Kỹ năng → "Node.js"   | ⚠️ Free text, không autocomplete
✅ Lương tối đa → 45      | ✅ Có
✅ Ngành nghề → IT/PM      | ⚠️ Hardcoded 8 options
✅ Ngôn ngữ               | ✅ Có 6 options
✅ Tags                    | ✅ Có
❌ Số năm kinh nghiệm     | ❌ KHÔNG có filter
❌ Đang ở job nào chưa     | ❌ KHÔNG có
❌ Source (LinkedIn/TopCV)  | ❌ KHÔNG có
```

### ⚠️ Pain Points — Phase 2

| # | Vấn đề | Mức độ | Chi tiết |
|---|--------|--------|----------|
| **P5** | **Skills filter là free text** | 🟠 High | Recruiter phải tự gõ "Node.js" hy vọng khớp exact với `String[]` trong DB. Nếu candidate được nhập "NodeJS" hoặc "node.js" → **không tìm thấy** (dùng `hasSome` exact match). |
| **P6** | **Industry/Location hardcoded** | 🟠 High | Chỉ 5 locations, 8 industries hardcoded trong [candidate-filters.tsx:L13-L17](file:///d:/MH/Headhunt_pj/src/components/candidates/candidate-filters.tsx#L13-L17). Nếu data trong DB là "Công nghệ thông tin" nhưng filter là "IT / Phần mềm" → **không khớp** vì dùng `contains`. |
| **P7** | **Search debounce quá ngắn** | 🔵 Low | 300ms cho search text — mỗi ký tự trigger 1 full page navigation `router.push()` → full SSR re-render. |
| **P8** | **Không có sort** | 🟠 High | Candidate table không có header sorting. Không thể sort theo "lương kỳ vọng cao→thấp", "mới nhất", hay "năm KN". Luôn sort `createdAt desc`. |
| **P9** | **Không có column Skills** | 🟠 High | Table [candidate-table.tsx](file:///d:/MH/Headhunt_pj/src/components/candidates/candidate-table.tsx#L40-L49) hiện 7 cột: Ứng viên, Liên hệ, Vị trí/Ngành, Lương, Tags, Trạng thái — **không có cột Skills**. Recruiter phải click vào từng profile để xem skills. |
| **P10** | **Không có checkbox / bulk actions** | 🟠 High | Muốn gán 5 candidates vào job → phải làm từng người một qua Assign Modal (Phase 3). |

### Truy vấn thực tế khi filter Senior + Node.js + TP.HCM

```sql
-- Query Prisma generate ra:
SELECT * FROM "Candidate"
WHERE "isDeleted" = false
  AND "level" = 'SENIOR'
  AND "location" ILIKE '%TP.HCM%'        -- index help
  AND "skills" @> ARRAY['Node.js']        -- hasSome = full scan nếu không có GIN
ORDER BY "createdAt" DESC
LIMIT 20 OFFSET 0;

-- Performance tại các mốc:
-- 10K candidates:  ~80ms   ✅ OK
-- 50K candidates:  ~400ms  ⚠️ Noticeable
-- 100K candidates: ~1.2s   🔴 Unacceptable
-- 1M candidates:   timeout 🔴 Broken
```

---

## Phase 3: Gán Ứng Viên Vào Pipeline

### Flow thực tế

```
/jobs/{id} → "Ứng viên mới" button → AssignCandidateModal → search → assign
```

**Recruiter tìm được 5 candidates phù hợp ở Phase 2, giờ muốn gán vào job.**

### Bước 3a: Mở Job Detail, click "Ứng viên mới"

Modal popup hiện ra với ô search:

```
┌───────────────────────────────────┐
│  Gán ứng viên vào Job             │
│  ┌─────────────────────────────┐  │
│  │ 🔍 Tìm theo tên, email, SĐT│  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─ Nguyễn Văn A ──────── [Gán]  │
│  │  Backend Dev - ABC Corp       │
│  ├─ Trần Thị B ──────── [Gán]   │
│  │  Chưa cập nhật ngành nghề    │
│  └───────────────────────────────│
│             (max 10 results)      │
└───────────────────────────────────┘
```

### ⚠️ Pain Points — Phase 3

| # | Vấn đề | Mức độ | Chi tiết |
|---|--------|--------|----------|
| **P11** | **Assign modal chỉ search name/phone/email** | 🔴 Critical | [searchAvailableCandidates](file:///d:/MH/Headhunt_pj/src/lib/jobs.ts#L96-L112) chỉ filter theo `fullName`, `phone`, `email`. **Không filter theo skills, level, industry, salary**. Recruiter tìm "Senior Node.js" → phải nhớ tên cụ thể. |
| **P12** | **Max 10 kết quả, không phân trang** | 🟠 High | `take: 10` cố định — nếu tìm "Nguyễn" trả 10 đầu tiên alphabetical, có thể thiếu người cần. Không có nút "xem thêm". |
| **P13** | **Không hiện skills/level trong kết quả** | 🟠 High | Modal kết quả chỉ hiện: tên, currentPosition, currentCompany, industry. **Không hiện skills, level, salary** → recruiter không biết người đó có phù hợp không. |
| **P14** | **Assign từng người một** | 🟠 High | Mỗi lần click "Gán" = 1 server action call. Gán 5 người = 5 calls + 5 revalidation. Không có batch assign. |
| **P15** | **Không link ngược từ candidate → job** | 🟡 Medium | Ở trang `/candidates/{id}` **không thấy candidate đang ở job nào**. Phải vào từng job để kiểm tra. |

### So sánh: Quy trình thực tế vs Kỳ vọng

```
THỰC TẾ (Headhunt Manager):
  1. Filter candidates ở /candidates (8 filters)
  2. Mở từng candidate profile để check skills ← lặp N lần
  3. Nhớ tên candidates phù hợp
  4. Quay lại /jobs/{id}
  5. Mở Assign Modal
  6. Gõ từng tên, gán từng người

KỲ VỌNG (recruiter chuyên nghiệp):
  1. Mở job detail → click "Tìm ứng viên phù hợp"
  2. System auto-filter candidates match skills + salary + level
  3. Tick checkbox 5 người → "Gán tất cả"
  4. Done
```

**Thời gian thao tác:** ~15 phút (thực tế) vs ~2 phút (kỳ vọng) cho 5 candidates.

---

## Phase 4: Track Pipeline & Follow-up

### Flow thực tế

```
/jobs/{id} → JobPipeline component → flat list grouped by stage
```

**Recruiter muốn:** di chuyển candidates qua các stage, đặt lịch phỏng vấn, ghi feedback.

### UI Pipeline hiện tại

```
Pipeline Ứng viên (5 hồ sơ)            [+ Ứng viên mới]
┌───────────────────────────────────────────────────────┐
│ Nguyễn Văn A                [SOURCED ▼] [▼] [🗑️]     │
│ Backend Dev - ABC Corp  SENIOR  PV: 15/04/2026       │
├───────────────────────────────────────────────────────┤
│ Trần Thị B                  [INTERVIEW ▼] [▼] [🗑️]   │
│ Fullstack - XYZ  MID-LEVEL                           │
│ ┌─ Detail Panel (expanded) ──────────────────────┐   │
│ │ Ngày PV: [____]  Kết quả: [Đang xử lý ▼]     │   │
│ │ Ghi chú: [_________________________________]   │   │
│ │                              [Lưu thay đổi]   │   │
│ └────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────┤
│ Lê Văn C                    [CONTACTED ▼] [▼] [🗑️]   │
│ Chưa rõ VP                                           │
└───────────────────────────────────────────────────────┘
```

### ⚠️ Pain Points — Phase 4

| # | Vấn đề | Mức độ | Chi tiết |
|---|--------|--------|----------|
| **P16** | **Không có Kanban view** | 🟠 High | Pipeline là **flat list** với dropdown chọn stage. Recruiter không thể nhìn tổng quan bao nhiêu người ở mỗi stage. Không drag-and-drop. |
| **P17** | **Không có stage history** | 🔴 Critical | Khi chuyển stage SOURCED → CONTACTED → INTERVIEW, **không lưu lại timeline**. Không biết ai chuyển, khi nào. Nếu cần report cho manager: "UV này ở stage INTERVIEW bao lâu rồi?" → không trả lời được. |
| **P18** | **Stage change không confirm** | 🟡 Medium | Thay đổi dropdown stage → gọi server action ngay lập tức, không hỏi confirm. Mis-click = sai stage, không undo. |
| **P19** | **Detail panel phải mở từng người** | 🟡 Medium | Chỉ expand 1 candidate tại 1 thời điểm (`expanded` state = single ID). Muốn so sánh notes 2 candidates → không thể. |
| **P20** | **Remove candidate = hard delete** | 🟠 High | Click 🗑️ → `prisma.jobCandidate.delete()` → **xóa vĩnh viễn** record khỏi pipeline. Không soft delete, không archive. Lỡ tay xóa = mất toàn bộ notes, interview date, stage history. |

---

## Phase 5: Báo Cáo & Review (Không tồn tại)

### ⚠️ Critical Missing Features

| Tính năng | Trạng thái | Ảnh hưởng |
|-----------|-----------|-----------|
| **Pipeline summary per job** | ❌ | Không biết: 3 sourced, 2 interview, 1 offer |
| **Recruiter performance report** | ❌ | Không biết: Recruiter A đã fill bao nhiêu job |
| **Time-to-fill tracking** | ❌ | Không biết: Job mở bao lâu mới filled |
| **Client activity report** | ❌ | Không biết: Client nào đang active, revenue bao nhiêu |
| **Candidate pipeline across jobs** | ❌ | Không biết: UV này đang ở bao nhiêu pipeline đồng thời |
| **Email/notification to candidate** | ❌ | Không tự động gửi email interview, offer |
| **Calendar integration** | ❌ | Interview date chỉ là text, không sync Google/Outlook |
| **CV preview inline** | ❌ | Phải download CV để xem, không preview trong app |
| **Duplicate candidate detection** | ❌ | Import 2 lần = 2 records, không cảnh báo trùng |

---

## Tổng Hợp: Bảng Gap Analysis

```
Giai đoạn           Friction   Severity   Root Cause
─────────────────────────────────────────────────────
Tạo Job              ████░░     HIGH      Form thiếu 4 fields quan trọng
Tìm Ứng Viên         █████░     CRITICAL  ILIKE search + hardcoded filters
Gán vào Pipeline      ██████     CRITICAL  Modal search quá basic, no batch
Track Pipeline        ████░░     HIGH      Flat list, no history, no kanban
Báo cáo               ██████     CRITICAL  Hoàn toàn không có
```

---

## 3 Kịch Bản Khiến Recruiter Bỏ Hệ Thống

### 1. "Tôi tìm không ra người"
> Recruiter tìm "Senior Node.js TP.HCM" → hệ thống trả 0 kết quả vì candidate được nhập "NodeJS" (không space, không dấu chấm). Skills search là exact match trên `String[]` → **false negative hàng loạt**. Recruiter kết luận "database trống" → quay lại dùng Excel.

### 2. "Tôi phải click quá nhiều"
> Tìm 5 ứng viên: vào /candidates filter → mở profile 1 check skills → back → mở profile 2 → ... → nhớ tên → vào /jobs/{id} → modal → gõ tên → gán → gõ tên → gán (×5). **15+ phút** cho việc lẽ ra mất 2 phút. Sau 3 jobs, recruiter chán → bỏ hệ thống.

### 3. "Manager hỏi báo cáo, tôi không trả lời được"
> "Tuần rồi tuyển được bao nhiêu người?" — không có report. "Job này mở bao lâu rồi?" — phải tính tay từ `createdAt`. "Ứng viên này interview kết quả thế nào?" — feedback chỉ là free text, không structured. Manager mất tin tưởng → yêu cầu chuyển sang tool khác.

---

## Đề Xuất Ưu Tiên (Từ Góc Nhìn Recruiter)

| Ưu tiên | Fix | Impact | Effort |
|---------|-----|--------|--------|
| 🔴 1 | **Thêm industry/location/skills/assignee vào job form** | Mở khóa matching feature | 2h |
| 🔴 2 | **Normalize skills** — lowercase + trim khi lưu, fuzzy match khi search | Fix false negatives | 4h |
| 🔴 3 | **Nâng assign modal** — thêm filter skills/level/salary, show skills chips, batch assign | Giảm 70% thao tác | 1-2 ngày |
| 🟠 4 | **Thêm skills column vào candidate table** | Recruiter scan nhanh | 1h |
| 🟠 5 | **Kanban view cho pipeline** | Nhìn tổng quan stage | 2-3 ngày |
| 🟠 6 | **Stage transition history** — `StageLog(from, to, by, at)` | Audit + reporting | 1 ngày |
| 🟡 7 | **Sort candidate table** — theo lương, ngày tạo, năm KN | UX cơ bản | 4h |
| 🟡 8 | **Dynamic industry/location** — query distinct từ DB thay vì hardcode | Data consistency | 2h |

> [!CAUTION]
> Fix #1 và #2 cần làm **trước tiên** — nếu không, toàn bộ candidate matching workflow bị broken từ gốc. Job tạo ra không có skills/industry → không thể auto-suggest candidates → recruiter phải search thủ công → hệ thống vô nghĩa.
