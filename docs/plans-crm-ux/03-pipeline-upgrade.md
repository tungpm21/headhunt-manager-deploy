# PLAN: Pipeline & Job Order UX Upgrade

> Nâng cấp trải nghiệm quản lý pipeline ứng viên trên trang Job Order detail.

---

## Bối cảnh hiện tại

Job Detail (`/jobs/[id]`) có:
- Left: `JobForm` (edit job info) — `bg-white` hardcoded
- Right: `JobPipeline` — list ứng viên theo stage, select dropdown đổi stage
- `PipelineDetailPanel` — expand để set interviewDate, result, notes
- `AssignCandidateModal` — search & assign candidate
- 7 stages: SOURCED → CONTACTED → SUBMITTED → INTERVIEW → OFFERED → PLACED + REJECTED/WITHDRAWN
- `bg-white` hardcoded (2 chỗ) — chưa theo design tokens

---

## Phase 1: Design Tokens Migration (30m)

### Mục tiêu
Chuyển tất cả `bg-white` hardcoded trong job pages sang `bg-surface`.

### File changes

#### [MODIFY] [jobs/[id]/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/jobs/[id]/page.tsx)
- Line 54: `bg-white` → `bg-surface`
- Line 61: `bg-white` → `bg-surface`

#### [MODIFY] [jobs/new/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/jobs/new/page.tsx)
- Line 38: `bg-white` → `bg-surface`

---

## Phase 2: Kanban Board View (4-5h)

### Mục tiêu
Thêm chế độ xem Kanban (cột theo stage) song song với list view hiện tại.

### UI Component

#### [NEW] [components/jobs/pipeline-kanban.tsx](file:///d:/MH/Headhunt_pj/src/components/jobs/pipeline-kanban.tsx)
Client component. Layout kiểu Trello:

```
┌─ SOURCED ──┐ ┌─ CONTACTED ┐ ┌─ INTERVIEW ┐ ┌─ OFFERED ──┐ ┌─ PLACED ───┐
│ ┌─────────┐│ │ ┌─────────┐│ │ ┌─────────┐│ │            │ │            │
│ │ Nguyễn  ││ │ │ Trần    ││ │ │ Lê Minh ││ │  Empty     │ │  Empty     │
│ │ Sr. Dev ││ │ │ QC Lead ││ │ │ 15/04   ││ │            │ │            │
│ │ ⭐⭐⭐  ││ │ │         ││ │ │ 🟡Chờ   ││ │            │ │            │
│ └─────────┘│ │ └─────────┘│ │ └─────────┘│ │            │ │            │
│ ┌─────────┐│ │            │ │            │ │            │ │            │
│ │ Phạm    ││ │            │ │            │ │            │ │            │
│ │ PM      ││ │            │ │            │ │            │ │            │
│ └─────────┘│ │            │ │            │ │            │ │            │
│ (2)        │ │ (1)        │ │ (1)        │ │ (0)        │ │ (0)        │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

**Drag-and-drop:**
- Sử dụng `@dnd-kit/core` + `@dnd-kit/sortable` (lightweight, React 18+ native)
- Drop card vào cột khác → gọi `updateCandidateStageAction(jcId, newStage)`
- Optimistic UI: card di chuyển ngay, revert nếu API fail

**Card content:**
- Candidate name + current position
- Interview date (if INTERVIEW stage)
- Result badge (PENDING/PASSED/FAILED)
- Click → expand `PipelineDetailPanel`

### View Toggle

#### [MODIFY] [jobs/[id]/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/jobs/[id]/page.tsx)
Thêm toggle button phía trên pipeline:
```tsx
<div className="flex gap-2">
  <button className={active === 'list' ? 'active' : ''}>
    <List className="h-4 w-4" /> List
  </button>
  <button className={active === 'kanban' ? 'active' : ''}>
    <Columns className="h-4 w-4" /> Kanban
  </button>
</div>
```

State lưu ở `localStorage('pipeline-view')` để nhớ preference.

### Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## Phase 3: Quick Stage Actions (1-2h)

### Mục tiêu
Thêm action buttons nhanh trực tiếp trên card pipeline thay vì chỉ có select dropdown.

### UI Changes

#### [MODIFY] [components/jobs/job-pipeline.tsx](file:///d:/MH/Headhunt_pj/src/components/jobs/job-pipeline.tsx)
Thêm "Next Stage" button:
```tsx
// Bên cạnh select dropdown, thêm nút mũi tên tiến 1 stage
<button onClick={() => advanceStage(jc.id, nextStage)}>
  <ChevronRight /> Chuyển → {NEXT_STAGE_LABEL}
</button>
```

Logic `getNextStage`:
```
SOURCED → CONTACTED → SUBMITTED → INTERVIEW → OFFERED → PLACED
```

Thêm reject/withdraw shortcuts:
```tsx
<button className="text-danger" onClick={() => updateStage(jc.id, 'REJECTED')}>
  <XCircle /> Từ chối
</button>
```

---

## Phase 4: Email Template Integration (2-3h)

### Mục tiêu
Khi chuyển stage, gợi ý email template phù hợp (copy to clipboard hoặc mở mail client).

### Data

#### [NEW] [lib/email-templates.ts](file:///d:/MH/Headhunt_pj/src/lib/email-templates.ts)
```typescript
export const EMAIL_TEMPLATES: Record<string, {
  subject: string;
  body: (data: { candidateName: string; jobTitle: string; companyName: string; interviewDate?: string }) => string;
}> = {
  CONTACTED: {
    subject: "Cơ hội việc làm tại {{companyName}} - {{jobTitle}}",
    body: (d) => `Chào ${d.candidateName},\n\nChúng tôi có vị trí ${d.jobTitle} tại ${d.companyName}...`,
  },
  INTERVIEW: {
    subject: "Lịch phỏng vấn — {{jobTitle}} tại {{companyName}}",
    body: (d) => `Chào ${d.candidateName},\n\nBạn được mời phỏng vấn vào ngày ${d.interviewDate}...`,
  },
  OFFERED: {
    subject: "Thư mời nhận việc — {{companyName}}",
    body: (d) => `Chào ${d.candidateName},\n\nChúc mừng! ${d.companyName} muốn mời bạn...`,
  },
  REJECTED: {
    subject: "Kết quả ứng tuyển — {{companyName}}",
    body: (d) => `Chào ${d.candidateName},\n\nCảm ơn bạn đã quan tâm vị trí ${d.jobTitle}...`,
  },
};
```

### UI

#### [NEW] [components/jobs/email-template-modal.tsx](file:///d:/MH/Headhunt_pj/src/components/jobs/email-template-modal.tsx)
Modal hiện khi chuyển stage:
```
┌─ 📧 Gửi email cho Nguyễn Văn Hùng ──┐
│                                        │
│ Subject: Lịch phỏng vấn — Plant...    │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Chào Nguyễn Văn Hùng,            │ │
│ │                                    │ │
│ │ Bạn được mời phỏng vấn vào ngày  │ │
│ │ 15/04/2026 cho vị trí...         │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [📋 Copy] [📧 Mở Mail Client] [Bỏ qua]│
└────────────────────────────────────────┘
```

- "Copy" → `navigator.clipboard.writeText()`
- "Mở Mail Client" → `window.open('mailto:...')`
- "Bỏ qua" → close modal, chỉ chuyển stage

---

## Phase 5: Job Info Panel Redesign (1h)

### Mục tiêu
Chuyển `JobForm` từ dạng form (luôn edit mode) sang dạng read-only card + nút Edit.

### UI Changes

#### [NEW] [components/jobs/job-info-card.tsx](file:///d:/MH/Headhunt_pj/src/components/jobs/job-info-card.tsx)
```
┌─ Thông tin vị trí ───────────────────┐
│ Senior Developer         🟢 OPEN     │
│                                       │
│ 🏢 Samsung Electronics Vietnam       │
│ 📍 KCN Yên Phong, Bắc Ninh          │
│ 💰 $2,000 - $3,000                   │
│ 👥 3 người | 🔴 HIGH priority        │
│ ⏰ Deadline: 15/04/2026              │
│                                       │
│ Skills: Java React SQL               │
│                                       │
│ [✏️ Chỉnh sửa]                       │
└───────────────────────────────────────┘
```

Click "Chỉnh sửa" → toggle sang `JobForm` hiện tại.

---

## Effort

| Phase | Nội dung | Thời gian |
|-------|----------|-----------|
| 1 | Design tokens migration | 30m |
| 2 | Kanban board + drag-and-drop | 4-5h |
| 3 | Quick stage actions | 1-2h |
| 4 | Email template integration | 2-3h |
| 5 | Job info card redesign | 1h |
| **Tổng** | | **9-12h** |

## Dependencies
```
@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Schema Changes
**KHÔNG CẦN** — tất cả data đã có trong JobCandidate model.

## Verification
- [ ] Kanban board hiện đúng card theo cột stage
- [ ] Drag card giữa cột → gọi API đổi stage thành công
- [ ] Quick action "Chuyển →" advance đúng stage
- [ ] Email template modal hiện khi chuyển stage CONTACTED/INTERVIEW/OFFERED/REJECTED
- [ ] Copy/mailto hoạt động đúng
- [ ] View toggle list ↔ kanban persist qua localStorage
- [ ] Tất cả `bg-white` → `bg-surface` trong job pages
- [ ] `npm run build` pass
