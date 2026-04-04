# PLAN: Global Search (Cmd+K) & Notification System

> Tìm kiếm nhanh mọi thứ từ 1 ô + nhắc nhở tự động cho team HR.

---

## Bối cảnh hiện tại

- Không có global search — mỗi page có filter riêng
- Không có notification bell — chỉ stat card "CV mới" trên dashboard
- Sidebar không có badge count

---

## Phase 1: Global Search — Command Palette (3-4h)

### Mục tiêu
Nhấn `Cmd+K` (Mac) hoặc `Ctrl+K` (Win) → mở search palette tìm mọi thứ.

### UI Component

#### [NEW] [components/global-search.tsx](file:///d:/MH/Headhunt_pj/src/components/global-search.tsx)
Client component, mount ở dashboard layout.

```
┌─ 🔍 Tìm ứng viên, khách hàng, job... ──────────┐
│                                                    │
│ [gõ: samsung]                                      │
│                                                    │
│ 👤 Ứng viên                                       │
│   Nguyễn Văn Hùng — Sr. Developer (Samsung)        │
│   Trần Thị Lan — QC Lead                           │
│                                                    │
│ 🏢 Khách hàng                                     │
│   Samsung Electronics Vietnam                       │
│                                                    │
│ 💼 Job Orders                                      │
│   Sr. Developer — Samsung (OPEN)                    │
│                                                    │
│ 📝 Bài đăng FDIWork                               │
│   Plant Manager — LG (APPROVED)                     │
│                                                    │
│ ESC để đóng · ↑↓ di chuyển · Enter để mở          │
└────────────────────────────────────────────────────┘
```

### Technical Design

**Keyboard shortcut handler:**
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(true);
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);
```

**Debounced search + server action:**
```typescript
// 300ms debounce, min 2 chars
const debouncedSearch = useDebouncedCallback(async (query: string) => {
  const results = await globalSearch(query);
  setResults(results);
}, 300);
```

### Data Layer

#### [NEW] [lib/global-search.ts](file:///d:/MH/Headhunt_pj/src/lib/global-search.ts)
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export type SearchResultItem = {
  type: 'candidate' | 'client' | 'job' | 'employer' | 'jobPosting';
  id: number;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  await requireAdmin();
  const q = query.trim();
  if (q.length < 2) return [];

  const [candidates, clients, jobs, employers] = await Promise.all([
    prisma.candidate.findMany({
      where: {
        isDeleted: false,
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, fullName: true, currentPosition: true, currentCompany: true },
      take: 5,
    }),
    prisma.client.findMany({
      where: {
        isDeleted: false,
        OR: [
          { companyName: { contains: q, mode: 'insensitive' } },
          { industry: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, companyName: true, industry: true },
      take: 3,
    }),
    prisma.jobOrder.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { client: { companyName: { contains: q, mode: 'insensitive' } } },
        ],
      },
      select: { id: true, title: true, status: true, client: { select: { companyName: true } } },
      take: 5,
    }),
    prisma.employer.findMany({
      where: {
        OR: [
          { companyName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, companyName: true, email: true },
      take: 3,
    }),
  ]);

  const results: SearchResultItem[] = [
    ...candidates.map(c => ({
      type: 'candidate' as const,
      id: c.id,
      title: c.fullName,
      subtitle: [c.currentPosition, c.currentCompany].filter(Boolean).join(' — '),
      href: `/candidates/${c.id}`,
    })),
    ...clients.map(c => ({
      type: 'client' as const,
      id: c.id,
      title: c.companyName,
      subtitle: c.industry ?? '',
      href: `/clients/${c.id}`,
    })),
    ...jobs.map(j => ({
      type: 'job' as const,
      id: j.id,
      title: j.title,
      subtitle: `${j.client.companyName} (${j.status})`,
      href: `/jobs/${j.id}`,
    })),
    ...employers.map(e => ({
      type: 'employer' as const,
      id: e.id,
      title: e.companyName,
      subtitle: e.email,
      href: `/employers/${e.id}`,
    })),
  ];

  return results;
}
```

### Integration

#### [MODIFY] [layout.tsx — dashboard](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/layout.tsx)
```tsx
import { GlobalSearch } from "@/components/global-search";
// Mount ở top-level, sau Sidebar
<GlobalSearch />
```

**Thêm trigger button ở header:**
```tsx
<button onClick={() => setSearchOpen(true)} className="...">
  <Search className="h-4 w-4" />
  <span>Tìm kiếm</span>
  <kbd>⌘K</kbd>
</button>
```

### Dependencies
```bash
npm install use-debounce
```

---

## Phase 2: Notification Bell (2-3h)

### Mục tiêu
Hiện badge count trên icon bell ở dashboard header.

### Data Layer

#### [NEW] [lib/notifications.ts](file:///d:/MH/Headhunt_pj/src/lib/notifications.ts)
```typescript
"use server";

export type NotificationCounts = {
  newApplications: number;   // Applications status = NEW
  pendingJobs: number;       // JobPosting status = PENDING (cần duyệt)
  pendingEmployers: number;  // Employer status = PENDING (cần duyệt)
  expiringJobs: number;      // JobOrder deadline trong 3 ngày
};

export async function getNotificationCounts(): Promise<NotificationCounts> {
  await requireAdmin();
  const threeDaysLater = addDays(new Date(), 3);

  const [newApplications, pendingJobs, pendingEmployers, expiringJobs] = await Promise.all([
    prisma.application.count({ where: { status: 'NEW' } }),
    prisma.jobPosting.count({ where: { status: 'PENDING' } }),
    prisma.employer.count({ where: { status: 'PENDING' } }),
    prisma.jobOrder.count({
      where: { status: 'OPEN', deadline: { gte: new Date(), lte: threeDaysLater } },
    }),
  ]);

  return { newApplications, pendingJobs, pendingEmployers, expiringJobs };
}
```

### UI Component

#### [NEW] [components/notification-bell.tsx](file:///d:/MH/Headhunt_pj/src/components/notification-bell.tsx)
```
┌─ 🔔 ──────────────────────────────┐
│                                     │
│  3 CV mới chờ import    → /apps     │
│  2 tin chờ duyệt       → /moderate │
│  1 employer chờ duyệt  → /employer │
│  1 job sắp hết hạn     → /jobs     │
│                                     │
└─────────────────────────────────────┘
```

- Badge đỏ hiện tổng count (sum of all)
- Click → dropdown với chi tiết
- Mỗi item link tới page tương ứng
- Count = 0 → "Không có gì mới 🎉"

### Integration

#### [MODIFY] [layout.tsx — dashboard](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/layout.tsx)
Thêm `<NotificationBell counts={counts} />` bên cạnh ThemeToggle ở header.
`counts` được fetch ở server layout rồi pass xuống.

---

## Phase 3: Sidebar Badge Counts (1h)

### Mục tiêu
Hiện badge nhỏ bên cạnh menu items trong sidebar.

### UI Changes

#### [MODIFY] [components/sidebar.tsx](file:///d:/MH/Headhunt_pj/src/components/sidebar.tsx)
Thêm `badgeCount` vào nav items:
```typescript
const fdiworkNav = [
  { name: "Bài đăng", href: "/moderation", icon: ShieldCheck, badgeKey: "pendingJobs" },
  { name: "Applications", href: "/moderation/applications", icon: FileDown, badgeKey: "newApplications" },
  { name: "Nhà tuyển dụng", href: "/employers", icon: UserCog, badgeKey: "pendingEmployers" },
  { name: "Gói dịch vụ", href: "/packages", icon: Package },
];
```

Badge rendering:
```tsx
{item.badgeCount > 0 && (
  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
    {item.badgeCount}
  </span>
)}
```

### Data Flow
Dashboard layout (server) → fetch `getNotificationCounts()` → pass counts props xuống `<Sidebar counts={counts} />`.

---

## Phase 4: Search Header Integration (30m)

### Mục tiêu
Thêm search bar nhỏ ở dashboard header (bên cạnh ThemeToggle và Bell).

### UI

#### [MODIFY] [layout.tsx — dashboard](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/layout.tsx)
Header bar:
```
┌──────────────────────────────────────────────────────────┐
│ [☰ Menu]  [🔍 Tìm kiếm... ⌘K]           [🔔(5)] [🌙] │
└──────────────────────────────────────────────────────────┘
```

Search input chỉ là trigger — click vào → mở `GlobalSearch` modal.

---

## Effort

| Phase | Nội dung | Thời gian |
|-------|----------|-----------|
| 1 | Global Search (Cmd+K) | 3-4h |
| 2 | Notification bell + dropdown | 2-3h |
| 3 | Sidebar badge counts | 1h |
| 4 | Header search trigger | 30m |
| **Tổng** | | **7-9h** |

## Dependencies
```
use-debounce (npm)
```

## Schema Changes
**KHÔNG CẦN** — tất cả dùng count/search queries trên data hiện có.

## Verification
- [ ] Cmd+K / Ctrl+K mở search palette
- [ ] Search "samsung" → hiện candidates + clients + jobs + employers match
- [ ] ↑↓ keyboard navigation trong search results
- [ ] Enter → navigate đúng href
- [ ] ESC đóng palette
- [ ] Bell badge hiện đúng total count
- [ ] Bell dropdown hiện 4 categories với count
- [ ] Click item → navigate đúng page
- [ ] Sidebar badges hiện đúng cho Bài đăng, Applications, NTD
- [ ] Badge ẩn khi count = 0
- [ ] `npm run build` pass
