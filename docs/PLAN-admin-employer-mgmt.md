# PLAN: Admin Employer & Job Posting Management

> Xây dựng giao diện quản trị cho Nhà tuyển dụng, Bài đăng tuyển, và Trang công ty trên FDIWork.

---

## Bối cảnh

Hiện tại admin CRM có:
- ✅ **Quản lý Nhà tuyển dụng** (`/employers`) — danh sách, duyệt/khóa, Link Client
- ✅ **Duyệt bài đăng** (`/moderation`) — approve/reject job postings
- ✅ **Applications** (`/moderation/applications`) — import CV vào CRM
- ✅ **Trang công ty public** (`/cong-ty/[slug]`) — hiện info + job listings

**Đang thiếu:**
1. Application & Moderation không link sang bài đăng trên FDIWork
2. Không có trang chi tiết employer (xem bài đăng, gói dịch vụ, chỉnh info)
3. Không có giao diện admin chỉnh sửa trang công ty hiển thị trên web
4. "Link Client" không rõ mục đích (cần tooltip/documentation tốt hơn)

---

## Phase 1: Quick Links — FDIWork Integration (1-2h)

### Mục tiêu
Thêm link xem bài đăng trên FDIWork từ Application table, Moderation page, và Employers page.

### File changes

#### [MODIFY] [application-table.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/moderation/applications/application-table.tsx)
- Cột "Vị trí ứng tuyển" → link clickable đến `/viec-lam/[slug]`
- Panel detail: thêm nút "🔗 Xem trên FDIWork" dẫn ra public page

#### [MODIFY] [moderation-actions.ts](file:///d:/MH/Headhunt_pj/src/lib/moderation-actions.ts)
- `getApplicationsForImport`: thêm `jobPosting.slug` vào select
- `getPendingJobPostings`: thêm `slug` vào select

#### [MODIFY] [moderation/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/moderation/page.tsx)
- Mỗi job card → thêm nút "Xem trên FDIWork" link đến `/viec-lam/[slug]`
- Thêm badge hiện lượt xem (`viewCount`) và lượt apply (`applyCount`)

#### [MODIFY] [employers/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/employers/page.tsx)
- Cột "Công ty" → thêm link icon 🌐 "Xem trang công ty" → `/cong-ty/[slug]`
- Thêm `slug` vào `getEmployers` select
- Tooltip cho "Link Client" giải thích mục đích

---

## Phase 2: Employer Detail Page (3-4h)

### Mục tiêu
Trang chi tiết `/employers/[id]` hiển thị toàn bộ thông tin employer với 3 tab.

### File changes

#### [NEW] [employers/[id]/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/employers/[id]/page.tsx)
Server component. Layout 2 phần:

**Header:**
- Logo + Tên công ty + Ngành + Địa chỉ
- Badge trạng thái (Hoạt động/Chờ duyệt/Bị khóa)
- Quick actions: Khóa/Mở khóa, Xem trang công ty (link ngoài)

**3 Tabs (client component):**

| Tab | Nội dung |
|-----|----------|
| **Bài đăng** | Bảng tất cả job postings (title, trạng thái, lượt xem, lượt apply, ngày đăng). Mỗi row có link "Xem trên FDIWork" |
| **Gói dịch vụ** | Thông tin subscription: tier, quota used/total, ngày hết hạn, lịch sử |
| **Thông tin** | Hiển thị company info dạng form readonly. Nút "Chỉnh sửa" (Phase 3) |

#### [NEW] [employer-detail-tabs.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/employers/[id]/employer-detail-tabs.tsx)
Client component quản lý tab state.

#### [MODIFY] [moderation-actions.ts](file:///d:/MH/Headhunt_pj/src/lib/moderation-actions.ts)
- Thêm `getEmployerById(id)` — trả về full employer data + jobPostings + subscription + client link
- Thêm `getEmployerJobPostings(employerId, page)` — job postings list cho tab

#### [MODIFY] [employers/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/employers/page.tsx)
- Tên công ty → link clickable đến `/employers/[id]`

---

## Phase 3: Company Page Editor (2-3h)

### Mục tiêu
Form admin chỉnh sửa thông tin công ty hiển thị trên FDIWork public.

### File changes

#### [NEW] [employers/[id]/edit/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/employers/[id]/edit/page.tsx)
Form chỉnh sửa employer info:

| Field | Type | Ghi chú |
|-------|------|---------|
| `companyName` | text | Tên hiển thị |
| `description` | textarea | Mô tả công ty (hiện trên `/cong-ty/[slug]`) |
| `logo` | file upload | Upload logo (lưu storage) |
| `industry` | text | Ngành nghề |
| `companySize` | select | Quy mô (enum CompanySize) |
| `address` | text | Địa chỉ |
| `website` | text | URL website |
| `phone` | text | SĐT |

Preview button → mở tab mới `/cong-ty/[slug]` để xem kết quả.

#### [NEW] [employer-edit-form.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/employers/[id]/edit/employer-edit-form.tsx)
Client component form với validation.

#### [MODIFY] [moderation-actions.ts](file:///d:/MH/Headhunt_pj/src/lib/moderation-actions.ts)
- Thêm `updateEmployerInfo(employerId, data)` — server action update employer fields
- File validation cho logo upload (max 2MB, JPG/PNG/WebP)

---

## Phase 4: UX Polish (1h)

### Mục tiêu
Cải thiện UX các page đã có.

### File changes

#### [MODIFY] [employers/page.tsx](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/employers/page.tsx)
- Di chuyển "Link Client" vào trang chi tiết employer (tab Thông tin) → bảng danh sách gọn hơn
- Thay bằng hiện tên Client đã link (nếu có) hoặc "—"
- Tooltip giải thích: "Liên kết với Khách hàng trong CRM để track hợp đồng headhunt"

#### [MODIFY] [sidebar.tsx](file:///d:/MH/Headhunt_pj/src/components/sidebar.tsx)
- Rename menu "Duyệt bài đăng" → "Bài đăng" (vì giờ admin có thể xem tất cả, không chỉ duyệt)

---

## Tổng hợp effort

| Phase | Thời gian | Độ ưu tiên |
|-------|-----------|------------|
| 1. Quick Links | 1-2h | 🔴 Cao — fix ngay |
| 2. Employer Detail | 3-4h | 🟡 Trung bình |
| 3. Company Editor | 2-3h | 🟡 Trung bình |
| 4. UX Polish | 1h | 🟢 Thấp |
| **Tổng** | **7-10h** | |

---

## Schema Changes
**KHÔNG CẦN** — tất cả fields đã có sẵn trong `Employer` model (description, logo, industry, companySize, etc.). Chỉ cần build UI + server actions.

---

## Verification Plan

### Sau Phase 1
- [ ] Click tên job trong Application table → mở `/viec-lam/[slug]` đúng
- [ ] Moderation page có nút "Xem trên FDIWork" hoạt động
- [ ] Employers page có icon link công ty → `/cong-ty/[slug]`

### Sau Phase 2
- [ ] Click tên employer → mở `/employers/[id]` detail page
- [ ] Tab "Bài đăng" hiện danh sách jobs + link FDIWork
- [ ] Tab "Gói dịch vụ" hiện đúng tier, quota, expiry
- [ ] Tab "Thông tin" hiện đúng company info

### Sau Phase 3
- [ ] Form edit → lưu thành công → reload thấy data mới
- [ ] Upload logo → hiện trên `/cong-ty/[slug]`
- [ ] "Preview" button → mở đúng trang công ty public

### Sau Phase 4
- [ ] Bảng Nhà tuyển dụng gọn hơn (không còn Link Client inline)
- [ ] `npm run build` pass, không TypeScript errors
