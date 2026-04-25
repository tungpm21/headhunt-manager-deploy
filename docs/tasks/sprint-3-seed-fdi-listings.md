# Sprint 3 — Seed FDI Listings: Thêm FDI fields vào seed data

**Assigned to:** Codex  
**Branch:** master  
**Last updated:** 2026-04-21  
**Status:** Ready to execute

---

## 1. Project Context (đọc trước khi làm)

### Sản phẩm là gì

FDIWork là job board niche cho thị trường FDI tại Việt Nam. Khác với VietnamWorks/TopCV ở chỗ có các trường đặc thù FDI: khu công nghiệp KCN-level, ngôn ngữ + trình độ, visa support, ca làm việc.

**Chiến lược launch:** Admin seed thủ công 10+ FDI listings → dùng đó làm social proof → outreach employer.

Sprint 3 unblocks bước này: seed.ts đã có 22 job postings nhưng thiếu toàn bộ FDI fields. Task này thêm FDI fields vào seed data.

### Tech stack

- Next.js 15 App Router, React 19, Tailwind CSS v4
- Prisma 7 + PostgreSQL (Neon serverless)
- Auth: custom session

**Lưu ý quan trọng:** `npx prisma migrate dev` bị lỗi (shadow DB issue). Dùng `npx prisma db push` cho schema change. Seed chạy bằng `npx tsx prisma/seed.ts`.

### FDI fields trong schema (đã migrate, không cần sửa schema)

```prisma
industrialZone      String?
requiredLanguages   String[]  @default([])
languageProficiency String?
visaSupport         String?   // "YES" | "NO" | "NEGOTIABLE"
shiftType           String?   // "DAY" | "NIGHT" | "ROTATING"
```

### Valid values cho các fields

**industrialZone** — dùng các giá trị sau (hoặc null):
```
"KCN Yên Phong, Bắc Ninh"
"KCN Quế Võ, Bắc Ninh"
"KCN VSIP Bắc Ninh"
"KCN Thăng Long, Hà Nội"
"KCN Quang Minh, Vĩnh Phúc"
"KCN Đình Vũ, Hải Phòng"
"KCN Tràng Duệ, Hải Phòng"
"KCN Samsung, Thái Nguyên"
"KCN Đại Đồng, Bắc Giang"
"KCN Hòa Khánh, Đà Nẵng"
"KCN Amata, Đồng Nai"
"KCN Long Thành, Đồng Nai"
"KCN VSIP, Bình Dương"
"KCN Mỹ Phước, Bình Dương"
"KCN Long Hậu, Long An"
"Quận 7 / Tân Phú, TP.HCM"
```

**requiredLanguages** — mảng, dùng giá trị: `"Japanese"`, `"Korean"`, `"English"`, `"Chinese"`, `"German"`, `"French"` hoặc `[]`

**languageProficiency** — string hoặc null, dùng giá trị:
```
"Cơ bản (N4 / TOPIK 1)"
"Trung cấp (N3 / TOPIK 2)"
"Khá (N2 / TOPIK 3)"
"Thành thạo (N1 / TOPIK 4+)"
```
Hoặc `null` nếu không yêu cầu ngôn ngữ cụ thể.

**visaSupport:** `"YES"` | `"NO"` | `"NEGOTIABLE"` | `null`

**shiftType:** `"DAY"` | `"NIGHT"` | `"ROTATING"` | `null`

---

## 2. File cần sửa: `prisma/seed.ts`

**Chỉ sửa 1 file này. Không sửa file nào khác.**

### Vị trí cần sửa

File `prisma/seed.ts` có `prisma.jobPosting.createMany({ data: [...] })` tại khoảng line 139.

Mỗi job object trong array data cần thêm 5 FDI fields. **Thêm ngay sau field `quantity` hoặc `skills` của mỗi job.**

### Giá trị FDI cho từng job (theo slug)

Thêm đúng các giá trị này vào đúng job entry:

---

#### Samsung Electronics Vietnam (KCN Yên Phong, Bắc Ninh — Korean FDI)

**slug: `ky-su-san-xuat-samsung`** (Kỹ sư sản xuất)
```ts
industrialZone: "KCN Yên Phong, Bắc Ninh",
requiredLanguages: ["Korean"],
languageProficiency: "Trung cấp (N3 / TOPIK 2)",
visaSupport: "NEGOTIABLE",
shiftType: "ROTATING",
```

**slug: `truong-phong-nhan-su-samsung`** (Trưởng phòng Nhân sự)
```ts
industrialZone: "KCN Yên Phong, Bắc Ninh",
requiredLanguages: ["Korean"],
languageProficiency: "Trung cấp (N3 / TOPIK 2)",
visaSupport: "YES",
shiftType: "DAY",
```

**slug: `ky-su-qa-qc-samsung`** (Kỹ sư QA/QC)
```ts
industrialZone: "KCN Yên Phong, Bắc Ninh",
requiredLanguages: [],
languageProficiency: null,
visaSupport: "NO",
shiftType: "ROTATING",
```

**slug: `it-support-samsung`** (IT Support)
```ts
industrialZone: "KCN Yên Phong, Bắc Ninh",
requiredLanguages: ["English"],
languageProficiency: "Cơ bản (N4 / TOPIK 1)",
visaSupport: "NO",
shiftType: "DAY",
```

**slug: `phien-dich-tieng-han-samsung`** (Phiên dịch tiếng Hàn)
```ts
industrialZone: "KCN Yên Phong, Bắc Ninh",
requiredLanguages: ["Korean"],
languageProficiency: "Thành thạo (N1 / TOPIK 4+)",
visaSupport: "YES",
shiftType: "DAY",
```

---

#### Canon Vietnam (KCN Quế Võ, Bắc Ninh — Japanese FDI)

**slug: `ke-toan-tong-hop-canon`** (Kế toán tổng hợp)
```ts
industrialZone: "KCN Quế Võ, Bắc Ninh",
requiredLanguages: ["Japanese"],
languageProficiency: "Trung cấp (N3 / TOPIK 2)",
visaSupport: "NO",
shiftType: "DAY",
```

**slug: `phien-dich-tieng-nhat-canon`** (Phiên dịch tiếng Nhật)
```ts
industrialZone: "KCN Quế Võ, Bắc Ninh",
requiredLanguages: ["Japanese"],
languageProficiency: "Khá (N2 / TOPIK 3)",
visaSupport: "YES",
shiftType: "DAY",
```

**slug: `ky-su-bao-tri-canon`** (Kỹ sư bảo trì)
```ts
industrialZone: "KCN Quế Võ, Bắc Ninh",
requiredLanguages: ["Japanese"],
languageProficiency: "Cơ bản (N4 / TOPIK 1)",
visaSupport: "NO",
shiftType: "ROTATING",
```

---

#### Toyota Motor Vietnam (Vĩnh Phúc — Japanese FDI)

**slug: `ky-su-o-to-toyota`** (Kỹ sư ô tô)
```ts
industrialZone: "KCN Quang Minh, Vĩnh Phúc",
requiredLanguages: ["Japanese"],
languageProficiency: "Trung cấp (N3 / TOPIK 2)",
visaSupport: "YES",
shiftType: "DAY",
```

**slug: `marketing-toyota`** (Chuyên viên Marketing)
```ts
industrialZone: null,
requiredLanguages: ["English"],
languageProficiency: "Khá (N2 / TOPIK 3)",
visaSupport: "NO",
shiftType: "DAY",
```

**slug: `truong-ca-san-xuat-toyota`** (Trưởng ca sản xuất)
```ts
industrialZone: "KCN Quang Minh, Vĩnh Phúc",
requiredLanguages: [],
languageProficiency: null,
visaSupport: "NO",
shiftType: "ROTATING",
```

---

#### LG Electronics Vietnam (KCN Tràng Duệ, Hải Phòng — Korean FDI)

**slug: `ky-su-embedded-lg`** (Embedded Software Engineer)
```ts
industrialZone: "KCN Tràng Duệ, Hải Phòng",
requiredLanguages: ["English"],
languageProficiency: "Cơ bản (N4 / TOPIK 1)",
visaSupport: "NO",
shiftType: "DAY",
```

**slug: `supply-chain-lg`** (Supply Chain)
```ts
industrialZone: "KCN Tràng Duệ, Hải Phòng",
requiredLanguages: ["English"],
languageProficiency: "Cơ bản (N4 / TOPIK 1)",
visaSupport: "NO",
shiftType: "DAY",
```

**slug: `giam-doc-nha-may-lg`** (Giám đốc nhà máy)
```ts
industrialZone: "KCN Tràng Duệ, Hải Phòng",
requiredLanguages: ["Korean"],
languageProficiency: "Khá (N2 / TOPIK 3)",
visaSupport: "YES",
shiftType: "DAY",
```

---

#### Bosch Vietnam (Quận 7, TP.HCM — German/English FDI)

**slug: `java-engineer-bosch`** (Java Software Engineer)
```ts
industrialZone: "Quận 7 / Tân Phú, TP.HCM",
requiredLanguages: ["English"],
languageProficiency: "Khá (N2 / TOPIK 3)",
visaSupport: "NO",
shiftType: "DAY",
```

**slug: `hse-bosch`** (HSE Specialist)
```ts
industrialZone: null,
requiredLanguages: ["English"],
languageProficiency: "Cơ bản (N4 / TOPIK 1)",
visaSupport: "NO",
shiftType: "DAY",
```

---

#### Nestlé Vietnam (TP.HCM — FMCG)

**slug: `brand-manager-nescafe-nestle`** (Brand Manager NESCAFÉ)
```ts
industrialZone: null,
requiredLanguages: ["English"],
languageProficiency: "Thành thạo (N1 / TOPIK 4+)",
visaSupport: "NO",
shiftType: "DAY",
```

**slug: `qc-factory-nestle`** (Kỹ sư QC nhà máy)
```ts
industrialZone: "KCN Amata, Đồng Nai",
requiredLanguages: ["English"],
languageProficiency: "Cơ bản (N4 / TOPIK 1)",
visaSupport: "NO",
shiftType: "DAY",
```

---

#### Intel Products Vietnam (Khu CNC, TP.HCM — High-Tech FDI)

**slug: `test-engineer-intel`** (Semiconductor Test Engineer)
```ts
industrialZone: null,
requiredLanguages: ["English"],
languageProficiency: "Thành thạo (N1 / TOPIK 4+)",
visaSupport: "YES",
shiftType: "DAY",
```

**slug: `devops-sre-intel`** (DevOps / SRE)
```ts
industrialZone: null,
requiredLanguages: ["English"],
languageProficiency: "Thành thạo (N1 / TOPIK 4+)",
visaSupport: "NO",
shiftType: "DAY",
```

---

#### Panasonic Vietnam (KCN Thăng Long II, Hưng Yên — Japanese FDI)

**slug: `r-and-d-panasonic`** (Kỹ sư R&D Điện tử)
```ts
industrialZone: "KCN Thăng Long, Hà Nội",
requiredLanguages: ["Japanese"],
languageProficiency: "Trung cấp (N3 / TOPIK 2)",
visaSupport: "YES",
shiftType: "DAY",
```

**slug: `xnk-panasonic`** (Nhân viên XNK)
```ts
industrialZone: "KCN Thăng Long, Hà Nội",
requiredLanguages: ["Japanese"],
languageProficiency: "Cơ bản (N4 / TOPIK 1)",
visaSupport: "NO",
shiftType: "DAY",
```

---

### Ví dụ về job entry TRƯỚC và SAU khi sửa

**TRƯỚC:**
```ts
{
  title: "Kỹ sư sản xuất (Production Engineer)", slug: "ky-su-san-xuat-samsung", employerId: samsung.id,
  description: "...",
  requirements: "...",
  benefits: "...",
  salaryMin: 18, salaryMax: 30, salaryDisplay: "18 - 30 triệu",
  industry: "Sản xuất", position: "Nhân viên", location: "Bắc Ninh",
  workType: "Full-time", quantity: 5, skills: "Sản xuất, QC, Lean, 5S, AutoCAD, Tiếng Hàn",
  status: "APPROVED", publishedAt: pub(3), expiresAt: exp(40), viewCount: 234, applyCount: 12
},
```

**SAU:**
```ts
{
  title: "Kỹ sư sản xuất (Production Engineer)", slug: "ky-su-san-xuat-samsung", employerId: samsung.id,
  description: "...",
  requirements: "...",
  benefits: "...",
  salaryMin: 18, salaryMax: 30, salaryDisplay: "18 - 30 triệu",
  industry: "Sản xuất", position: "Nhân viên", location: "Bắc Ninh",
  workType: "Full-time", quantity: 5, skills: "Sản xuất, QC, Lean, 5S, AutoCAD, Tiếng Hàn",
  status: "APPROVED", publishedAt: pub(3), expiresAt: exp(40), viewCount: 234, applyCount: 12,
  industrialZone: "KCN Yên Phong, Bắc Ninh",
  requiredLanguages: ["Korean"],
  languageProficiency: "Trung cấp (N3 / TOPIK 2)",
  visaSupport: "NEGOTIABLE",
  shiftType: "ROTATING",
},
```

**Lưu ý:** Thêm FDI fields ở cuối mỗi job object (sau `applyCount` hoặc `viewCount`), trước dấu `}`.

---

## 3. Sau khi sửa: chạy seed

```bash
cd d:/MH/Headhunt_pj
npx tsx prisma/seed.ts
```

Output mong đợi:
```
🌱 Start seeding...
✅ User: Admin Manager
✅ User: Nguyễn Thị Lan
✅ User: Trần Văn Minh
📦 Seeding Employers...
✅ Created 8 employers
💎 Seeding Subscriptions...
✅ Created 8 subscriptions
📋 Seeding Job Postings...
✅ Created 22 approved job postings
...
🎉 Seeding finished!
```

Nếu seed lỗi TypeScript, kiểm tra:
- `requiredLanguages: []` (array rỗng, không phải null)
- `languageProficiency: null` (null cho job không yêu cầu proficiency)
- Tất cả 22 job entries đều có đủ 5 FDI fields

---

## 4. Verification

Sau khi seed xong, kiểm tra:

### Tsc pass
```bash
npx tsc --noEmit
```

### Kiểm tra DB trực tiếp
```bash
npx prisma studio
```
Mở bảng `JobPosting`, filter `status = APPROVED`, confirm các cột FDI có dữ liệu.

### Kiểm tra trang web
- Mở `/viec-lam` → sidebar filter "Ngôn ngữ yêu cầu" phải hiện Japanese, Korean, English
- Mở `/viec-lam` → sidebar "Khu công nghiệp" phải hiện các KCN
- Mở job detail `/viec-lam/ky-su-san-xuat-samsung` → phải có FDI badge row (🌐 Tiếng Hàn, 🏭 KCN Yên Phong, 🕐 Xoay ca)
- Mở job detail `/viec-lam/truong-phong-nhan-su-samsung` → phải có badge "✅ Hỗ trợ visa"

---

## 5. Commit

```bash
git add prisma/seed.ts
git commit -m "feat: add FDI fields to all seed job postings (Sprint 3)"
```

---

## 6. Files KHÔNG được sửa

| File | Lý do |
|------|-------|
| `prisma/schema.prisma` | Schema đã done Sprint 1 |
| `src/lib/admin-job-posting-actions.ts` | Done Sprint 2 |
| `src/app/(dashboard)/moderation/**` | Done Sprint 2 |
| `src/lib/public-actions.ts` | Done Sprint 2 |
| `src/app/(public)/viec-lam/[slug]/page.tsx` | Done Sprint 2 |
| Bất kỳ file nào khác | Sprint 3 chỉ là 1 file: `prisma/seed.ts` |
