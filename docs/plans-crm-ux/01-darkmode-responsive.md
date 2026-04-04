# PLAN: Dark Mode Consistency & Mobile Responsive

> Hoàn thiện design token migration và responsive layout toàn bộ CRM.

---

## Bối cảnh hiện tại

**Dark mode status:**
- ✅ Dashboard: đã dùng design tokens (`bg-surface`, `text-foreground`, `text-muted`)
- ✅ Employers: đã dùng design tokens
- ✅ Moderation/Applications: đã dùng design tokens
- ❌ Jobs: `bg-white` hardcoded (3 chỗ)
- ❌ Clients: `bg-white` hardcoded (3 chỗ)
- ❌ Dashboard welcome banner: `bg-white/20`, `bg-gray-50` (2 chỗ)

**Responsive status:**
- Sidebar: `hidden md:flex` — ẩn hoàn toàn trên mobile, không có hamburger menu
- Tables: Không có horizontal scroll hoặc card layout cho mobile
- Forms: Phần lớn đã responsive (grid cols-1 → cols-2)

---

## Phase 1: `bg-white` → `bg-surface` Migration (30m)

### Mục tiêu
Thay toàn bộ `bg-white` hardcoded trong dashboard pages.

### File Changes (8 chỗ, 5 files)

#### [MODIFY] [jobs/[id]/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/jobs/[id]/page.tsx)
```diff
- <div className="rounded-xl border border-border bg-white shadow-sm p-6">
+ <div className="rounded-xl border border-border bg-surface shadow-sm p-6">
```
Line 54 và Line 61: `bg-white` → `bg-surface`

#### [MODIFY] [jobs/new/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/jobs/new/page.tsx)
```diff
- <div className="rounded-xl border border-border bg-white shadow-sm p-6 sm:p-8">
+ <div className="rounded-xl border border-border bg-surface shadow-sm p-6 sm:p-8">
```
Line 38: `bg-white` → `bg-surface`

#### [MODIFY] [clients/new/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/clients/new/page.tsx)
```diff
- <div className="rounded-xl border border-border bg-white shadow-sm p-6 sm:p-8">
+ <div className="rounded-xl border border-border bg-surface shadow-sm p-6 sm:p-8">
```
Line 35: `bg-white` → `bg-surface`

#### [MODIFY] [clients/[id]/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/clients/[id]/page.tsx)
```diff
- bg-white
+ bg-surface
```
Line 53 và Line 60: `bg-white` → `bg-surface`

#### [MODIFY] [dashboard/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/dashboard/page.tsx)
```diff
- <Link href="/import" className="... bg-white/20 hover:bg-white/30 ...">
+ <Link href="/import" className="... bg-white/20 hover:bg-white/30 ...">
```
> Giữ nguyên — `bg-white/20` trên gradient banner là intentional (white opacity trên nền xanh).

```diff
- <Link href="/jobs/new" className="... bg-white text-primary hover:bg-gray-50 ...">
+ <Link href="/jobs/new" className="... bg-white text-primary hover:bg-white/90 ...">
```
Line 42: `hover:bg-gray-50` → `hover:bg-white/90` (subtle, vẫn đúng trên cả light/dark).

### Cách rà soát
```bash
grep -rn "bg-white" src/app/\(dashboard\)/ --include="*.tsx" | grep -v "bg-white/"
```
Kết quả phải = 0 (ngoại trừ `bg-white/20` trên banner).

---

## Phase 2: Mobile Sidebar — Hamburger Menu (2-3h)

### Mục tiêu
Trên mobile (< md), hiện hamburger button → slide-in sidebar overlay.

### UI Component

#### [NEW] [components/mobile-sidebar.tsx](file:///d:/MH/Headhunt_pj/src/components/mobile-sidebar.tsx)
Client component:
```tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";

export function MobileSidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on navigation
  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <>
      {/* Hamburger trigger — visible only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 rounded-lg bg-surface border border-border p-2 shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay + Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden animate-in slide-in-from-left duration-200">
            <Sidebar isAdmin={isAdmin} />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-border/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </>
  );
}
```

### Integration

#### [MODIFY] [layout.tsx — dashboard](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/layout.tsx)
```tsx
import { MobileSidebar } from "@/components/mobile-sidebar";

// Thêm bên cạnh desktop Sidebar
<MobileSidebar isAdmin={session.user.role === "ADMIN"} />
<Sidebar isAdmin={session.user.role === "ADMIN"} />
```

#### [MODIFY] [components/sidebar.tsx](file:///d:/MH/Headhunt_pj/src/components/sidebar.tsx)
Sửa class để mobile sidebar cũng dùng được:
```diff
- <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r ... md:flex">
+ <aside className="sticky top-0 flex h-screen w-64 flex-col border-r ...">
```
> MobileSidebar sẽ wrap Sidebar component, tuỳ platform hiện/ẩn qua CSS.

---

## Phase 3: Responsive Tables (2h)

### Mục tiêu
Tables trên mobile: horizontal scroll + ẩn cột ít quan trọng.

### Strategy

**Option A — Horizontal scroll (simple, recommended):**
Tất cả tables đã wrap trong `<div className="overflow-x-auto">` → already works.
Cần thêm: `min-w-` cho table để đảm bảo cột không bị ép quá hẹp.

```tsx
<table className="w-full min-w-[800px] text-sm">
```

**Option B — Responsive hide (bổ sung):**
Ẩn cột ít quan trọng trên mobile:
```tsx
<th className="hidden lg:table-cell">Email</th>
<th className="hidden xl:table-cell">Ngày tạo</th>
```

### File changes

#### [MODIFY] Candidates table
```diff
- <table className="w-full text-sm">
+ <table className="w-full min-w-[900px] text-sm">
```
Ẩn cột: Email, Location, Tags trên mobile:
```tsx
<th className="hidden lg:table-cell">Email</th>
```

#### [MODIFY] Employers table
```diff
- <table className="w-full text-sm">
+ <table className="w-full min-w-[800px] text-sm">
```
Ẩn cột: Email, Ngày tạo trên mobile.

#### [MODIFY] Jobs table
Tương tự — `min-w-[700px]`, ẩn cột Priority, Deadline.

---

## Phase 4: Mobile-Friendly Forms (1h)

### Mục tiêu
Đảm bảo forms (candidate, client, job) không bị overflow trên mobile.

### Checklist

| Form | File | Status |
|------|------|--------|
| CandidateForm | components/candidates/candidate-form.tsx | ✅ Đã dùng `grid-cols-1 sm:grid-cols-2` |
| ClientForm | components/clients/client-form.tsx | Cần check |
| JobForm | components/jobs/job-form.tsx | Cần check |
| EmployerEditForm | employers/[id]/edit/employer-edit-form.tsx | ✅ Đã responsive |

### Actions
- Scan tất cả forms, đảm bảo `grid-cols-1` default, `sm:grid-cols-2` breakpoint
- Input fields: `w-full` (already done by `inputClassName` pattern)
- Buttons: `flex-wrap` cho button groups

---

## Phase 5: Content Padding cho Mobile (30m)

### Mục tiêu
Trang main content cần padding để không sát mép trên mobile.

### Changes

#### [MODIFY] [layout.tsx — dashboard](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/layout.tsx)
```diff
- <main className="flex-1 overflow-y-auto p-6 sm:p-8">
+ <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-14 md:pt-6">
```
- `p-4` nhỏ hơn trên mobile
- `pt-14` thêm space cho hamburger button trên mobile
- `md:pt-6` reset khi desktop (hamburger ẩn)

---

## Effort

| Phase | Nội dung | Thời gian |
|-------|----------|-----------|
| 1 | `bg-white` → `bg-surface` migration | 30m |
| 2 | Mobile sidebar (hamburger menu) | 2-3h |
| 3 | Responsive tables | 2h |
| 4 | Mobile-friendly forms check | 1h |
| 5 | Content padding | 30m |
| **Tổng** | | **6-7h** |

## Dependencies
**KHÔNG CẦN** — pure CSS + component restructuring.

## Schema Changes
**KHÔNG CẦN**

## Verification
- [ ] Toggle dark mode: tất cả pages không còn `bg-white` lạc lõng (trắng sáng trên nền tối)
- [ ] `grep -rn "bg-white" src/app/(dashboard)/ --include="*.tsx"` → chỉ còn banner white overlay
- [ ] Mobile (< 768px): hamburger button hiện, click → slide-in sidebar
- [ ] Click nav item → navigate + sidebar tự đóng
- [ ] Click overlay → sidebar đóng
- [ ] Tables: scroll ngang mượt trên mobile, không bị overflow ra khỏi viewport
- [ ] Forms: không bị ép hẹp, fields stack vertical trên mobile
- [ ] Padding: content không sát mép trái/phải trên mobile
- [ ] `npm run build` pass
