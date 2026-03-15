# Phase 01: Setup & Foundation
Status: ⬜ Pending
Dependencies: Không

## Mục tiêu
Tạo project Next.js, cài đặt dependencies, thiết lập cấu trúc folder chuẩn.

## Tasks
1. [ ] Tạo Next.js project (App Router)
2. [ ] Install dependencies: Prisma, NextAuth, TailwindCSS, Lucide icons
3. [ ] Setup TypeScript + ESLint
4. [ ] Tạo folder structure chuẩn
5. [ ] Setup Git + initial commit
6. [ ] Tạo .env.example
7. [ ] Kiểm tra `npm run dev` chạy OK

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
