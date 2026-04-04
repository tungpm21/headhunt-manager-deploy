# PLAN: Smart Dashboard — Action-Oriented Overview

> Nâng cấp dashboard từ "hiện số" → "gợi ý hành động" cho team HR/Headhunt.

---

## Bối cảnh hiện tại

Dashboard (`/dashboard`) hiện có:
- 4 stat cards: Tổng ứng viên, Doanh nghiệp KH, Job đang mở, CV mới (FDIWork)
- 3 list widgets: Job gần đây, Ứng viên mới, Applications mới
- Welcome banner với 2 quick action buttons

**Thiếu:** Pipeline summary, deadline alerts, activity feed, KPI metrics.

---

## Phase 1: Pipeline Summary Widget (2-3h)

### Mục tiêu
Hiển thị biểu đồ bar ngang pipeline stages: bao nhiêu UV ở mỗi stage trên tất cả Job đang mở.

### Data Layer

#### [MODIFY] [dashboard/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/dashboard/page.tsx)
Thêm query vào `Promise.all`:
```typescript
// Pipeline stage counts across all OPEN jobs
prisma.jobCandidate.groupBy({
  by: ['stage'],
  _count: { id: true },
  where: { jobOrder: { status: 'OPEN' } },
})
```

### UI Component

#### [NEW] [components/dashboard/pipeline-summary.tsx](file:///d:/MH/Headhunt_pj/src/components/dashboard/pipeline-summary.tsx)
Client component, nhận `stageData: { stage: string; count: number }[]`.

Layout:
```
┌─ Pipeline Overview ──────────────────┐
│ SOURCED     ████████████████  12      │
│ CONTACTED   ██████████        8       │
│ SUBMITTED   ██████            5       │
│ INTERVIEW   ████              3       │
│ OFFERED     ██                2       │
│ PLACED      █                 1       │
│                                       │
│ Tổng: 31 ứng viên đang trong pipeline │
└───────────────────────────────────────┘
```

- Bar width = `(count / max) * 100%`
- Mỗi stage dùng màu riêng theo `STAGE_COLOR_MAP`
- Click vào stage → filter `/jobs?stage=INTERVIEW`

---

## Phase 2: Deadline Alerts Widget (1-2h)

### Mục tiêu
Hiện danh sách job/subscription sắp hết hạn để HR không bỏ lỡ.

### Data Layer

#### [MODIFY] [dashboard/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/dashboard/page.tsx)
Thêm 2 queries:
```typescript
// Jobs sắp deadline (trong 7 ngày tới)
prisma.jobOrder.findMany({
  where: {
    status: 'OPEN',
    deadline: { gte: new Date(), lte: addDays(new Date(), 7) },
  },
  select: { id: true, title: true, deadline: true, client: { select: { companyName: true } } },
  orderBy: { deadline: 'asc' },
  take: 5,
})

// Subscriptions sắp hết hạn (trong 14 ngày)
prisma.subscription.findMany({
  where: {
    status: 'ACTIVE',
    endDate: { gte: new Date(), lte: addDays(new Date(), 14) },
  },
  select: { id: true, tier: true, endDate: true, employer: { select: { companyName: true } } },
  orderBy: { endDate: 'asc' },
  take: 5,
})
```

### UI Component

#### [NEW] [components/dashboard/deadline-alerts.tsx](file:///d:/MH/Headhunt_pj/src/components/dashboard/deadline-alerts.tsx)
```
┌─ ⚠️ Cần chú ý ──────────────────────┐
│ 🔴 2 ngày nữa  Sr. Developer (Samsung)│
│ 🟡 5 ngày nữa  Plant Manager (LG)     │
│ 🟠 12 ngày  Gói VIP Samsung hết hạn   │
└───────────────────────────────────────┘
```

- ≤ 2 ngày: badge 🔴, ≤ 5 ngày: 🟡, ≤ 14 ngày: 🟠
- Mỗi item link tới job detail hoặc employer detail
- Empty state: "✅ Không có deadline nào sắp tới"

---

## Phase 3: Activity Feed (2-3h)

### Mục tiêu
Timeline hoạt động gần đây trên hệ thống.

### Data Model

Hiện tại **KHÔNG CÓ** bảng Activity Log. Có 2 lựa chọn:

**Option A — Aggregate từ data hiện có (recommended cho MVP):**
```typescript
// Lấy 10 hoạt động gần nhất từ nhiều nguồn
const activities = await Promise.all([
  // Ứng viên mới tạo
  prisma.candidate.findMany({ take: 3, orderBy: { createdAt: 'desc' }, select: { fullName: true, createdAt: true } }),
  // Application mới
  prisma.application.findMany({ take: 3, orderBy: { createdAt: 'desc' }, select: { applicantName: true, createdAt: true, jobPosting: { select: { title: true } } } }),
  // Pipeline stage changes (dùng updatedAt)
  prisma.jobCandidate.findMany({ take: 3, orderBy: { updatedAt: 'desc' }, select: { stage: true, updatedAt: true, candidate: { select: { fullName: true } }, jobOrder: { select: { title: true } } } }),
]);
// Merge + sort by timestamp
```

**Option B — Tạo bảng ActivityLog (cho tương lai):**
```prisma
model ActivityLog {
  id        Int      @id @default(autoincrement())
  type      String   // CANDIDATE_CREATED, APPLICATION_RECEIVED, STAGE_CHANGED, JOB_APPROVED
  message   String
  userId    Int?
  entityId  Int?
  entityType String? // Candidate, Application, JobCandidate
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id])
}
```

> **Khuyên dùng Option A** trước. Chuyển sang Option B khi cần audit trail đầy đủ.

### UI Component

#### [NEW] [components/dashboard/activity-feed.tsx](file:///d:/MH/Headhunt_pj/src/components/dashboard/activity-feed.tsx)
```
┌─ Hoạt động gần đây ─────────────────┐
│ 👤 Nguyễn Văn Hùng apply Plant Mgr   │
│    5 phút trước                       │
│ 📋 Trần Minh → stage INTERVIEW       │
│    2 giờ trước                        │
│ ✅ Admin duyệt tin Samsung - QC Lead  │
│    hôm qua                            │
└───────────────────────────────────────┘
```

---

## Phase 4: KPI Cards nâng cấp (1h)

### Mục tiêu
Thêm chỉ số đo hiệu quả cạnh stat cards hiện tại (row 2).

### Data Layer

```typescript
// Placement rate: PLACED / total CLOSED jobs
const placedCount = await prisma.jobCandidate.count({ where: { stage: 'PLACED' } });
const closedJobCount = await prisma.jobOrder.count({ where: { status: { in: ['FILLED', 'CANCELLED'] } } });

// Avg time to fill: avg(updatedAt - createdAt) cho candidates PLACED
// → Cần raw query hoặc tính client-side từ findMany
```

### UI

#### [MODIFY] [dashboard/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/dashboard/page.tsx)
Thêm 1 row mới dưới stat cards:
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ ✅ 15    │ │ 📊 68%   │ │ ⏱️ 23 ngày│
│ Placements│ │ Fill Rate│ │ Avg Fill │
│ tháng này │ │ 3 tháng  │ │ Time     │
└──────────┘ └──────────┘ └──────────┘
```

---

## Phase 5: Dashboard Layout Reorganization (1h)

### Mục tiêu
Sắp xếp lại layout cho hợp lý hơn.

### Layout mới

```
┌─────────────────────────────────────────┐
│ Welcome Banner + Quick Actions          │
├──────────┬──────────┬──────────┬────────┤
│ Ứng viên │ KH       │ Job mở   │ CV mới │
├──────────┴──────────┴──────────┴────────┤
│ Placement │ Fill Rate  │ Avg Fill Time  │
├────────────────────┬────────────────────┤
│ Pipeline Summary   │ ⚠️ Deadline Alerts│
│ (bar chart)        │ (+ Activity Feed) │
├──────────┬─────────┴────────┬───────────┤
│ Job gần  │ Ứng viên mới     │ CV FDIWork│
│ đây      │                  │ mới       │
└──────────┴──────────────────┴───────────┘
```

---

## Effort

| Phase | Nội dung | Thời gian |
|-------|----------|-----------|
| 1 | Pipeline Summary widget | 2-3h |
| 2 | Deadline Alerts | 1-2h |
| 3 | Activity Feed (Option A) | 2-3h |
| 4 | KPI Cards | 1h |
| 5 | Layout reorganization | 1h |
| **Tổng** | | **7-10h** |

## Schema Changes
- Phase 1-4: **KHÔNG CẦN** (dùng aggregation queries)
- Phase 3 Option B (tương lai): thêm `ActivityLog` model

## Verification
- [ ] Pipeline chart hiện đúng số UV theo stage
- [ ] Click stage → navigate đúng
- [ ] Deadline alerts chỉ hiện job OPEN có deadline trong 7 ngày
- [ ] Activity feed merge đúng timeline
- [ ] KPI cards hiện đúng tỷ lệ
- [ ] `npm run build` pass
