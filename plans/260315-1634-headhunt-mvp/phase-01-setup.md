# Phase 01: Setup & Foundation
Status: ✅ Complete
Dependencies: Không

## Mục tiêu
Tạo project Next.js, cài đặt dependencies, thiết lập cấu trúc folder chuẩn.

## Tasks
1. [x] Tạo Next.js project (App Router)
2. [x] Install dependencies: Prisma, NextAuth, TailwindCSS, Lucide icons
3. [x] Setup TypeScript + ESLint
4. [x] Tạo folder structure chuẩn
5. [x] Setup Git + initial commit
6. [x] Tạo .env.example
7. [x] Kiểm tra `npm run dev` chạy OK

## Folder Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login pages
│   ├── (dashboard)/        # Main app pages
│   │   ├── candidates/     # Ứng viên
│   │   ├── clients/        # Khách hàng
│   │   ├── jobs/           # Job orders
│   │   └── page.tsx        # Dashboard home
│   ├── api/                # API routes
│   └── layout.tsx
├── components/             # Shared UI components
├── lib/                    # Utilities, DB client
├── prisma/                 # Database schema
└── uploads/                # CV files storage
```

## Output
- Project chạy được (`npm run dev`)
- Cấu trúc folder sạch
- Git initialized

---
Next Phase: Phase 02 - Database & Auth
