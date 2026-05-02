# Audit Report - 2026-05-02

## Summary
- Critical issues: 2
- Warnings: 7
- Suggestions: 4

Scope: full project health scan for Admin CRM, Company Portal, public FDIWork, auth/API, dependencies, migrations, build pipeline, and local runtime.

## Checks Run
- `npx prisma migrate status`: pass, database schema is up to date.
- `npx prisma validate`: pass, with Prisma preview feature warning.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass.
- `npm run lint`: fail with 9 errors and 12 warnings.
- `npm audit --json`: fail with 9 advisories, including 2 high severity.
- Production-mode smoke via `next start -p 3001`:
  - `/`: 200
  - `/api/admin/notifications`: 401 without session, expected.
  - `/api/company/notifications`: 307 without session, expected redirect behavior.
  - `/api/public/search-suggestions?q=samsung`: 200
- Dev-mode smoke via `next dev`: server starts, but first requests timed out while compiling instrumentation/API routes. Production start does not show this issue.
- Git state check: current branch `codex/admin-config-pagination-post-fields` is ahead of its remote by 4 commits; `origin/master` is behind local HEAD.

## Critical Issues

### 1. Candidate CV upload/delete route allows cross-candidate mutation
- File: `src/app/api/candidates/[id]/cv/route.ts`
- Lines: 25-78, 91-115
- Symptom: the API checks only that a user is logged in. It does not check whether the user is admin or has access to the candidate ID being modified.
- Impact: a CRM member who can guess a candidate ID can upload, replace, or delete another candidate's CV. This is a real IDOR-style authorization bug.
- Existing safer pattern: GitNexus found `ensureCandidateAccess` in `src/lib/candidate-detail-actions.ts`, which uses viewer scope and candidate access helpers.
- Treatment:
  - Replace raw `auth()` in this route with `requireViewerScope()` or equivalent API-safe auth.
  - Before reading/deleting/uploading CV, verify candidate access through `withCandidateAccess` or the same logic used by candidate detail server actions.
  - Return 403 when the candidate is outside the viewer's scope.
  - Add route-level tests or manual smoke with ADMIN and MEMBER sessions.

### 2. CRM login rate limit can be bypassed through the NextAuth callback
- File: `src/auth.ts`
- Lines: 19-39
- Symptom: UI login server action has Redis rate limit, but the actual `CredentialsProvider.authorize()` does not. A caller can post directly to the NextAuth credentials callback and bypass the server-action guard.
- Impact: brute-force risk for Admin CRM accounts is higher than Company Portal and Employer login, which already rate-limit at their action boundary.
- Treatment:
  - Put the rate-limit check inside `authorize()` or wrap the credentials callback path at the auth layer.
  - Key by IP + normalized email, same policy as `crm-login`.
  - Keep generic login failure messages.

## Warnings

### 3. Dependency audit has high severity advisories
- Command: `npm audit --json`
- Findings:
  - `next@16.2.2`: high severity DoS advisory for Server Components; fix target `next@16.2.4`.
  - `postcss` via Next: moderate; fixed by the same Next update.
  - `@xmldom/xmldom`: audit reports high advisory through `read-excel-file`; installed tree shows `0.8.13`, but audit still flags lock metadata/range. Refresh lock or upgrade `read-excel-file`.
  - `hono` / `@hono/node-server` via Prisma dev tooling: moderate.
  - `uuid` via Sentry webpack plugin: moderate; update `@sentry/nextjs`.
- Treatment:
  - Update patch-safe packages first: `next`, `eslint-config-next`, `@sentry/nextjs`, `@supabase/supabase-js`, `isomorphic-dompurify`, `zod`.
  - Re-run `npm audit`, `npm run build`, and smoke tests.
  - Do not blindly run `npm audit fix --force`; it suggests downgrading Prisma to 6.19.3.

### 4. Whole-repo lint is failing
- Command: `npm run lint`
- Errors include:
  - `prisma/seed-blog.ts`: explicit `any`.
  - `src/app/(dashboard)/employers/link-employer-form.tsx`: synchronous setState inside effect.
  - `src/components/clients/client-contacts.tsx`: explicit `any`.
  - `src/components/jobs/assign-candidate-modal.tsx`: synchronous setState inside effect.
  - `src/components/jobs/pipeline-view-switcher.tsx`: synchronous setState inside effect.
  - `src/components/theme-toggle.tsx`: synchronous setState inside effect.
  - `src/lib/prisma.ts`: explicit `any` and stale eslint-disable.
  - `src/types/client.ts`: empty interface.
- Impact: production build currently passes, but quality gate is not green. Future CI can fail if lint is enforced.
- Treatment: fix these in a separate cleanup commit; most are low-risk mechanical changes.

### 5. Local `next dev` route compilation times out
- Symptom: `next dev` starts, but requests to `/` and API routes timed out while compiling instrumentation/API routes. The log also says "Slow filesystem detected".
- Impact: local debugging is unreliable; developers may think features are broken when dev compiler is just stuck.
- Treatment:
  - Prefer testing with `npm run build` + `next start` for smoke until this is fixed.
  - Investigate `.next/dev` on Windows, antivirus scanning, and Turbopack instrumentation compile cost.
  - Consider testing `next dev --webpack` or moving workspace to a faster/local path if needed.

### 6. Production deploy drift: latest notification code is not on `origin/master`
- Evidence:
  - Local HEAD: `ca8f7af Add hybrid notification events`
  - `origin/master`: `a1e0aa0 Polish company profile approvals and display policy`
  - Current branch ahead of remote by 4 commits.
- Impact: local DB has the `NotificationEvent` migration applied, but production code deployed from `master` may not include the new notification event APIs/UI yet.
- Treatment:
  - Decide whether to push/merge the current branch into `master`.
  - Before pushing, isolate unrelated dirty files and run the same verification checklist.

### 7. Rate limiter fails open when Redis is missing or errors
- File: `src/lib/rate-limit-redis.ts`
- Lines: 123-148
- Symptom: if Upstash env vars are missing or Redis errors, rate limiting returns `allowed: true`.
- Impact: good for availability, weaker for auth and public upload abuse protection.
- Treatment:
  - For login/upload routes, consider fail-closed or degraded in-memory fallback in production.
  - At minimum, add production alerting when Redis rate limit is disabled.

### 8. Prisma and PostgreSQL SSL warnings
- File: `prisma/schema.prisma`
- Lines: 5-8
- Symptom: `previewFeatures = ["driverAdapters"]` is deprecated.
- Build warning: `pg` reports future SSL mode semantics changes.
- Impact: not broken today, but future upgrades may change behavior.
- Treatment:
  - Remove deprecated Prisma preview feature if no longer needed.
  - Set database connection string to explicit `sslmode=verify-full` if current behavior is desired.

### 9. Several modules are too large and high-risk to keep growing
- Examples:
  - `src/app/(dashboard)/companies/[id]/page.tsx`: 1509 lines.
  - `src/lib/public-actions.ts`: 1092 lines.
  - `src/components/employer/EmployerPipelineBoard.tsx`: 978 lines.
  - `src/lib/employer-actions.ts`: 975 lines.
  - `src/app/(dashboard)/dashboard/page.tsx`: 886 lines.
- Impact: each future feature risks regressions because UI, data fetching, actions, and rendering are tightly packed.
- Treatment: refactor by ownership slices only when touching those areas; do not do one giant rewrite.

## Suggestions

### 10. Worktree has many local artifacts and session files
- Current dirty/untracked files include `.brain/*`, `.playwright-mcp/`, many audit screenshots, `background-pattern/`, `logo-fdiwork.png`, and helper scripts.
- Impact: high risk of accidental noisy commits.
- Treatment:
  - Keep release commits explicit with `git add <file list>`.
  - Add a local cleanup convention or ignore pattern for audit screenshots if they are not intended assets.

### 11. Script and seed files print demo credentials
- File: `prisma/seed.ts`
- Symptom: demo login credentials are printed during seed.
- Impact: acceptable for local demo, risky if seed output is copied into shared logs.
- Treatment: keep demo credentials only in local docs or guard seed output by environment.

### 12. Raw SQL usage appears parameterized
- Files: `src/lib/config-options.ts`, `src/lib/employers.ts`, `src/lib/public-actions.ts`
- Finding: current raw SQL uses `Prisma.sql` and `Prisma.join`, not unsafe raw string interpolation.
- Treatment: keep this pattern; avoid `$queryRawUnsafe` and `$executeRawUnsafe`.

### 13. Public runtime smoke is basically healthy in production mode
- `next start` smoke showed homepage and public search API working.
- Admin notification endpoint returns unauthorized without session.
- Company notification endpoint redirects without session.
- Treatment: add authenticated browser smoke later for Admin CRM and Company Portal if the user wants a UX-level audit.

## Recommended Fix Order
1. Fix candidate CV route authorization.
2. Move CRM login rate limiting into the actual NextAuth credentials authorize path.
3. Patch Next.js/dependency advisories without force-downgrading Prisma.
4. Fix lint errors until `npm run lint` passes.
5. Decide branch/deploy strategy for the notification commit and push/merge only intended files.
6. Investigate slow local `next dev` separately from production behavior.
7. Refactor oversized files opportunistically when touching their feature areas.

## Next Steps
- Option A: fix the two critical security issues first.
- Option B: patch dependencies first, then security fixes.
- Option C: clean lint/build gate first.
- Recommended: Option A, then dependency patch, then lint cleanup.
