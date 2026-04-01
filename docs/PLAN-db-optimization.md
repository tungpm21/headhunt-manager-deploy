# 📋 PLAN: Update & Tối ưu Database — Headhunt Manager

> **Ngày tạo:** 2026-04-01
> **Dựa trên:** [DB Consultation](./crm/db_consultation_2026-04-01.md)
> **Mục tiêu:** Mở rộng DB để quản lý CV, ngôn ngữ, kinh nghiệm làm việc — thay thế Excel

---

## 🎯 Tổng quan

Thêm 3 bảng mới vào schema hiện tại để giải quyết các hạn chế lớn nhất khi chuyển từ Excel sang CRM:

| Bảng | Giải quyết | Ưu tiên |
|------|-----------|---------|
| `CandidateCV` | Lưu nhiều CV / ứng viên, không mất bản cũ | 🔴 P0 |
| `CandidateLanguage` | Lọc nhanh theo ngoại ngữ cho FDI jobs | 🔴 P0 |
| `WorkExperience` | Xem career path mà không cần mở CV | 🟡 P1 |

**Nguyên tắc:** Không phá dữ liệu cũ. Tất cả là additive.

---

## Phase 1: Database Schema (Prisma Migration)

### Task 1.1: Thêm 3 models mới vào `prisma/schema.prisma`

```prisma
model CandidateCV {
  id           Int       @id @default(autoincrement())
  fileUrl      String
  fileName     String
  label        String?   // "CV gốc", "CV English", "CV format ABC Corp"
  isPrimary    Boolean   @default(false)
  uploadedAt   DateTime  @default(now())

  candidate    Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  candidateId  Int
  uploadedBy   User      @relation("CVUploadedBy", fields: [uploadedById], references: [id])
  uploadedById Int

  @@index([candidateId])
}

model CandidateLanguage {
  id           Int       @id @default(autoincrement())
  language     String    // "Tiếng Nhật", "Tiếng Anh", "Tiếng Hàn"
  level        String?   // "N2", "IELTS 7.0", "Giao tiếp cơ bản"
  certificate  String?   // "JLPT N2", "TOEIC 800"

  candidate    Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  candidateId  Int

  @@index([candidateId])
  @@index([language])
}

model WorkExperience {
  id          Int       @id @default(autoincrement())
  companyName String
  position    String
  startDate   DateTime?
  endDate     DateTime? // null = đang làm
  isCurrent   Boolean   @default(false)
  notes       String?

  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  candidateId Int

  @@index([candidateId])
}
```

### Task 1.2: Cập nhật model `Candidate` — thêm relations

```diff
 model Candidate {
   // ... existing fields ...
   jobLinks     JobCandidate[]
   applications Application[]
+  cvFiles      CandidateCV[]
+  languages    CandidateLanguage[]
+  workHistory  WorkExperience[]
 }
```

### Task 1.3: Cập nhật model `User` — thêm relation

```diff
 model User {
   // ... existing relations ...
   candidateNotes    CandidateNote[]
+  uploadedCVs       CandidateCV[]     @relation("CVUploadedBy")
 }
```

### Task 1.4: Chạy migration

```bash
npx prisma migrate dev --name add-cv-language-experience
```

### Task 1.5: Migrate dữ liệu CV cũ

Viết script `prisma/migrations/migrate-cv-data.ts`:
- Quét tất cả `Candidate` có `cvFileUrl` không null
- Tạo record `CandidateCV` tương ứng với `isPrimary = true`
- Giữ nguyên `cvFileUrl` trên `Candidate` (backward compat)

---

## Phase 2: Data Layer (Prisma Queries)

### Task 2.1: Tạo file `src/lib/candidate-cv.ts`

| Function | Mô tả |
|----------|--------|
| `getCVsByCandidate(candidateId)` | Lấy danh sách CV, sắp xếp primary trước |
| `addCandidateCV(data)` | Upload CV mới |
| `setPrimaryCV(cvId, candidateId)` | Đặt CV làm mặc định |
| `deleteCandidateCV(cvId)` | Xóa CV (kèm xóa file storage) |

### Task 2.2: Tạo file `src/lib/candidate-language.ts`

| Function | Mô tả |
|----------|--------|
| `getLanguagesByCandidate(candidateId)` | Lấy danh sách ngôn ngữ |
| `addLanguage(data)` | Thêm ngôn ngữ |
| `updateLanguage(id, data)` | Sửa |
| `deleteLanguage(id)` | Xóa |

### Task 2.3: Tạo file `src/lib/work-experience.ts`

| Function | Mô tả |
|----------|--------|
| `getExperiencesByCandidate(candidateId)` | Lấy danh sách, sắp xếp mới nhất trước |
| `addExperience(data)` | Thêm kinh nghiệm |
| `updateExperience(id, data)` | Sửa |
| `deleteExperience(id)` | Xóa |

### Task 2.4: Cập nhật `src/lib/candidates.ts`

- Thêm `cvFiles`, `languages`, `workHistory` vào `CANDIDATE_DETAIL_INCLUDE`
- Thêm filter theo language vào `buildWhere()`

---

## Phase 3: Server Actions

### Task 3.1: Tạo `src/lib/candidate-detail-actions.ts`

Actions gom chung cho CV, Language, WorkExperience:

| Action | Input | Mô tả |
|--------|-------|--------|
| `addCandidateCVAction(formData)` | file + label + candidateId | Upload CV mới |
| `setPrimaryCVAction(formData)` | cvId, candidateId | Đặt CV mặc định |
| `deleteCVAction(formData)` | cvId | Xóa CV |
| `addLanguageAction(formData)` | language, level, certificate, candidateId | Thêm ngôn ngữ |
| `updateLanguageAction(formData)` | id, language, level, certificate | Sửa |
| `deleteLanguageAction(formData)` | id | Xóa |
| `addExperienceAction(formData)` | companyName, position, dates, candidateId | Thêm kinh nghiệm |
| `updateExperienceAction(formData)` | id, data | Sửa |
| `deleteExperienceAction(formData)` | id | Xóa |

---

## Phase 4: Types

### Task 4.1: Tạo types mới

Thêm vào `src/types/candidate.ts`:

```typescript
// CandidateCV
export interface CandidateCVInput {
  candidateId: number;
  fileUrl: string;
  fileName: string;
  label?: string;
}

// CandidateLanguage
export interface CandidateLanguageInput {
  candidateId: number;
  language: string;
  level?: string;
  certificate?: string;
}

// WorkExperience
export interface WorkExperienceInput {
  candidateId: number;
  companyName: string;
  position: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
  notes?: string;
}
```

### Task 4.2: Cập nhật `CandidateWithRelations`

```diff
 export type CandidateWithRelations = Candidate & {
   tags: { tag: Tag }[];
   notes: (CandidateNote & { createdBy: Pick<User, "id" | "name"> })[];
   createdBy: Pick<User, "id" | "name">;
+  cvFiles: CandidateCV[];
+  languages: CandidateLanguage[];
+  workHistory: WorkExperience[];
 };
```

---

## Phase 5: UI Components

### Task 5.1: `src/components/candidates/cv-list.tsx`

- Hiển thị danh sách CV với badge "Primary"
- Nút Upload CV mới (với label)
- Nút đặt Primary / Xóa cho mỗi CV
- Nút Download/View

### Task 5.2: `src/components/candidates/language-list.tsx`

- Danh sách ngôn ngữ dạng tag/chip
- Inline form thêm nhanh: [Ngôn ngữ] [Trình độ] [Chứng chỉ] [+ Thêm]
- Nút sửa/xóa cho mỗi entry

### Task 5.3: `src/components/candidates/work-history.tsx`

- Timeline dọc hiển thị kinh nghiệm
- Badge "Đang làm" cho job hiện tại
- Inline form thêm/sửa

### Task 5.4: Cập nhật trang chi tiết ứng viên

File: `src/app/(dashboard)/candidates/[id]/page.tsx`

Thêm 3 sections/tabs mới vào trang chi tiết:
- **Tab CV:** Component `cv-list.tsx`
- **Tab Ngôn ngữ:** Component `language-list.tsx`
- **Tab Kinh nghiệm:** Component `work-history.tsx`

### Task 5.5: Cập nhật Candidate Filters

File: `src/components/candidates/candidate-filters.tsx`

- Thêm dropdown filter theo ngôn ngữ: "Tiếng Nhật", "Tiếng Anh", "Tiếng Hàn"...

---

## Phase 6: Seed Data

### Task 6.1: Cập nhật `prisma/seed.ts`

Thêm demo data cho 3 bảng mới dựa trên 8 candidates hiện có:

- **CV:** Mỗi UV có 1-2 CV (gốc + English)
- **Language:** UV FDI có tiếng Nhật/Hàn/Anh
- **WorkExperience:** 1-3 entries/UV

---

## Phase 7: Cập nhật Docs

### Task 7.1: Update `ARCHITECTURE.md`
- Thêm 3 models mới vào sơ đồ
- Thêm vào bảng Core CRM Models

### Task 7.2: Regenerate `CODEBASE.md`
```bash
npx tsx scripts/gen-codebase-map.ts
```

### Task 7.3: Update `.brain/brain.json`
- Cập nhật `database_schema` với 3 tables mới

---

## 📊 Ước lượng

| Phase | Thời gian | Độ phức tạp |
|-------|-----------|-------------|
| Phase 1: Schema + Migration | 15 phút | Thấp |
| Phase 2: Data Layer | 20 phút | Thấp |
| Phase 3: Server Actions | 25 phút | Trung bình |
| Phase 4: Types | 10 phút | Thấp |
| Phase 5: UI Components | 45 phút | Trung bình |
| Phase 6: Seed Data | 15 phút | Thấp |
| Phase 7: Docs | 10 phút | Thấp |
| **Tổng** | **~2.5 giờ** | |

---

## ✅ Verification Plan

### Build Check
```bash
npm run build
```
Phải pass không lỗi.

### Migration Check
```bash
npx prisma migrate deploy
```
Migration phải apply thành công trên DB.

### Seed Check
```bash
npx prisma db seed
```
Seed data mới phải tạo được records trong 3 bảng mới.

### Manual Verification (Cần anh kiểm tra)
1. Mở trang chi tiết 1 ứng viên → thấy tab CV, Ngôn ngữ, Kinh nghiệm
2. Upload 1 CV mới → label "CV Tiếng Anh" → thấy trong danh sách
3. Đặt CV mới làm Primary → badge Primary chuyển sang CV mới
4. Thêm ngôn ngữ "Tiếng Nhật - N2 - JLPT" → hiển thị đúng
5. Thêm 1 kinh nghiệm → hiển thị trên timeline
6. Filter ứng viên theo ngôn ngữ → kết quả chính xác

---

## ⏭️ Sau khi xong plan này

Có thể mở rộng thêm (nếu cần):
- Import Excel có mapping cho Language & WorkExperience
- Export hồ sơ UV ra PDF (kèm CV + kinh nghiệm + ngôn ngữ)
- Integration: FDIWork Application → auto-fill language từ CV

---

*Tạo bởi AWF - Plan Phase | 2026-04-01*
