# Headhunt Manager (FDIWork)

Hệ thống quản lý hồ sơ ứng viên (ATS) & Job Board công khai cho FDIWork.

## Status

| Module | Trạng thái |
|--------|:----------:|
| CRM Dashboard | ✅ MVP Done |
| FDIWork Public Website | 🟡 5/8 phases done |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TailwindCSS v4
- **Database:** PostgreSQL + Prisma 7.5
- **Auth:** NextAuth v5 (CRM) + Custom JWT (Employer)
- **Storage:** Vercel Blob
- **Deploy:** Vercel

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma migrate dev
npx prisma db seed

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

## Documentation

| File | Mục đích |
|------|----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System overview, auth flows, DB schema |
| [CODEBASE.md](CODEBASE.md) | File → function map (AI-queryable) |
| [docs/README.md](docs/README.md) | Documentation index |
| [CHANGELOG.md](CHANGELOG.md) | Lịch sử thay đổi |

## Project Structure

```
src/
├── app/
│   ├── (auth)/       → Login
│   ├── (dashboard)/  → CRM internal
│   ├── (employer)/   → Employer portal
│   ├── (public)/     → FDIWork public
│   └── api/          → REST endpoints
├── components/       → UI components by domain
├── lib/              → Server actions + data layer
└── types/            → TypeScript types & enums
```
