# Prompt Chi Dao AI Agent — Sau Sprint 2

> PM su dung prompt nay de chi dao AI Agent. Copy block prompt ben duoi → paste vao chat moi.
> Ngay tao: 2026-04-03

---

## Tinh Hinh Hien Tai

Agent da hoan thanh Sprint 2 (5/5 tasks) VA tu y implement them nhieu feature bonus:
- Smart Dashboard (5 phases)
- Pipeline Upgrade (5 phases: kanban + email templates + quick actions)
- Global Search + Notification (4 phases: command palette, bell, badges, header trigger)
- Candidate Bulk Actions (4 phases: checkboxes, toolbar, quick view, duplicate detect)
- Dark Mode + Responsive (5 phases)

Cac feature bonus CHUA duoc PM review chi tiet.

---

## Prompt (Copy Tu Day)

```
Doc file `docs/PROJECT-TRACKER.md` de nam tinh hinh hien tai.
Doc file `docs/audit/README.md` de hieu rules va patterns.
Doc file `docs/audit/05-backend-code-audit.md` de hieu cac van de backend con ton dong.

## TINH HINH

Sprint 1 (Audit Fixes) va Sprint 2 (UX Recruiter) da hoan tat.
Ban cung da implement them cac feature bonus: smart dashboard, pipeline upgrade,
global search, bulk actions, dark mode. PM ghi nhan nhung CHUA review chi tiet.

## NHIEM VU SESSION NAY

### Phan 1: Cleanup & Fix Issues Tu Cac Sprint Truoc (lam TRUOC)

1. **Fix S2-2 chua clean:** Mo `src/components/candidates/candidate-filters.tsx`.
   Xoa cac hardcoded constants `LOCATIONS` va `INDUSTRIES` (khoang dong 14-15).
   Component da nhan `locations` va `industries` tu props — dung props, khong can fallback.

2. **Review + fix cac feature bonus da implement:**
   Kiem tra tung feature sau, dam bao KHONG co loi build, KHONG co dead code, va code follow patterns:
   - Smart dashboard components trong `src/components/dashboard/`
   - Global search trong `src/components/global-search.tsx` va `global-search-trigger.tsx`
   - Pipeline view switcher trong `src/components/jobs/pipeline-view-switcher.tsx`
   - Candidate bulk actions (checkboxes, toolbar, quick view, duplicate detect)
   
   Neu thay code chua clean hoac bug → fix.
   Neu thay code OK → bao cao "Da review, khong co issue."

3. **Chay kiem tra tong the:**
   - `npm run build` — phai pass
   - `npx prisma validate` — phai pass
   - Kiem tra khong co unused imports, dead code, hay console.log con sot

### Phan 2: Bat Dau Sprint 3 — Production Hardening (lam SAU khi Phan 1 xong)

Tham chieu: docs/audit/05-backend-code-audit.md — cac issue security can fix truoc khi deploy.

Thuc hien theo thu tu:

1. **S3-1: Redis Rate Limiting**
   - Cai dat `@upstash/ratelimit` va `@upstash/redis`
   - Tao file `src/lib/rate-limit-redis.ts` thay the `src/lib/rate-limit.ts`
   - Cap nhat cac cho dung rate limiting: `apply-cv/route.ts`, `public-apply-actions.ts`, `employer-actions.ts`
   - Fallback: neu khong co UPSTASH env vars → skip rate limit (dev mode)

2. **S3-2: File Upload Magic Bytes Validation**
   - Sua 3 upload endpoints: `apply-cv/route.ts`, `candidates/[id]/cv/route.ts`, `avatar/route.ts`
   - Them function `validateFileSignature(file)` kiem tra magic bytes:
     - PDF: 0x25504446 (%PDF)
     - DOC: 0xD0CF11E0
     - DOCX/ZIP: 0x504B0304 (PK)
     - JPG: 0xFFD8FF
     - PNG: 0x89504E47
     - WebP: offset 8 = "WEBP"
   - Reject file neu magic bytes khong khop MIME type

3. **S3-3: Employer JWT Hardening**
   - Sua `src/lib/employer-auth.ts`:
     - Giam `expirationTime` tu "7d" xuong "1d"
     - Trong `requireEmployerSession()`: sau khi verify JWT, query `employer.status`
     - Neu status !== "ACTIVE" → clear cookie + redirect /employer/login

4. **S3-4: Connection Pool — Neon Pooled URL**
   - Sua `src/lib/prisma.ts`:
     - Them env var `DATABASE_POOLER_URL` (Neon pooled connection URL)
     - Neu co pooler URL → dung no thay direct URL
     - Giu direct URL lam fallback cho dev

5. **S3-5: Error Tracking (Sentry)**
   - Cai `@sentry/nextjs`
   - Tao `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
   - Wrap `next.config.ts` voi `withSentryConfig`
   - DSN lay tu env var `SENTRY_DSN` (optional — khong co thi skip)

Sau moi issue:
- Cap nhat `docs/PROJECT-TRACKER.md` (danh dau [x], ghi ngay, them nhat ky)
- Chay `npm run build`

S3-6 (Deploy) va S3-7 (Seed data) se do PM thuc hien — KHONG lam 2 muc nay.

## RULES

- KHONG sua file trong src/app/(public)/, src/app/(employer)/, src/components/public/, src/components/employer/ tru khi fix bug
- Error messages tieng Viet
- Follow patterns trong ARCHITECTURE.md
- Cap nhat `docs/PROJECT-TRACKER.md` SAU MOI ISSUE
```

---

## Ghi Chu Cho PM

- **Phan 1** (~30 phut): cleanup truoc khi build len production
- **Phan 2** (~4-6 gio): 5 security/infra fixes tu audit
- **S3-6 va S3-7** (deploy + seed): nen lam thu cong, khong giao AI Agent
- Sau Sprint 3: chuyen sang Sprint 4 (Real Users) — onboard team dung thu
