# Audit Report - 2026-04-29

## Summary

- Critical Issues: 0
- Warnings: 4
- Suggestions: 3

Scope: re-audit handoff for Company Workspace Rebuild Phase 1-3 after the previous 7/8 fixes. Checked the handoff report, migration, admin `/companies`, company portal auth/layout/stub routes, workspace actions, tracker, and verification commands.

## Resolution Update - 2026-04-29

Fixed after review:

- `src/lib/workspace-actions.ts`: `unlinkWorkspaceEmployer()` now clears `Employer.clientId` in the same transaction that detaches the workspace employer facet.
- `src/lib/company-portal-actions.ts`: `companyPortalLogin()` now uses the existing server-action rate limit helper with the same 5 attempts / 10 minutes policy as other login surfaces.
- `src/lib/company-portal-auth.ts`: `requireCompanyPortalSession()` now validates the portal user still belongs to the token workspace and refreshes role/email/capabilities from DB for the current request.
- `src/app/(company)/company/(portal)/layout.tsx`: layout now calls `requireCompanyPortalSession()` so the sidebar is rendered from a validated/refreshed session.

Verification after fixes:

```text
npx tsc --noEmit -> pass
npm run build -> pass
npx eslint src/lib/workspace-actions.ts src/lib/company-portal-actions.ts src/lib/company-portal-auth.ts "src/app/(company)/company/(portal)/layout.tsx" -> pass
```

## Warnings

1. `unlinkWorkspaceEmployer` still leaves legacy `Employer.clientId` behind
   - File: `src/lib/workspace-actions.ts:152`
   - Risk: When admin unlinks an Employer from a workspace that also had a Client, the new `CompanyWorkspace` mapping says the Employer is detached, but old CRM/employer flows can still read `Employer.clientId` and show it as linked. This is the same class of desync the previous audit tried to remove.
   - Fix: Wrap the unlink in a transaction and clear `Employer.clientId` for `workspace.employerId` before or after setting `CompanyWorkspace.employerId = null`.

2. Company Portal login has no rate limiting
   - File: `src/lib/company-portal-actions.ts:13`
   - Risk: `/company/login` is public and compares passwords without the rate-limit guard already used by CRM login and employer login. Attackers can brute-force a portal account much more cheaply than the other login surfaces.
   - Fix: Reuse `buildServerActionRateLimitKey()` and `checkRateLimit()` from `src/lib/rate-limit-redis.ts`, with the same 5 attempts / 10 minutes policy used by the other login actions.

3. Portal capabilities remain stale until JWT expiry
   - File: `src/lib/company-portal-auth.ts:61`
   - Risk: `requireCompanyPortalSession()` verifies that the workspace and user are active, but returns the capabilities embedded at login. If admin links/unlinks Employer or Client, the sidebar and capability checks can remain wrong for up to 1 day.
   - Fix: Rebuild capabilities from DB inside `requireCompanyPortalSession()` and return the refreshed session for the current request. A stronger version is a token version/session version field to force logout on sensitive workspace changes.

4. Portal layout uses a weaker session read than the pages
   - File: `src/app/(company)/company/(portal)/layout.tsx:10`
   - Risk: The current pages all call `requireCompanyPortalSession()`, so this is not an immediate data leak. But the layout renders sidebar from `getCompanyPortalSession()` first, which does not verify active workspace/user state and uses stale capabilities. Any future nested route that forgets the page-level guard can accidentally inherit a weaker auth boundary.
   - Fix: Use `requireCompanyPortalSession()` in the layout and pass that validated/refreshed session to the sidebar.

## Suggestions

1. Handoff references a missing Phase 4 plan file
   - File: `C:\Users\Admin\.gemini\antigravity\brain\96066f4e-8dc8-4012-b511-6582b25a9398\handoff_report.md.resolved`
   - Detail: Handoff says Phase 4 plan is `docs/company-workspace-rebuild-2026-04-28/04-applications-inbox-plan.md`, but the repo currently has `04-pipeline-ux-plan.md`.
   - Fix: Either create `04-applications-inbox-plan.md` as a focused Phase 4 plan or update handoff/tracker references to the existing `04-pipeline-ux-plan.md`.

2. New companies page adds lint warnings
   - File: `src/app/(dashboard)/companies/page.tsx:7`
   - Detail: `Users`, `Briefcase`, `Shield`, and `Search` are imported but unused.
   - Fix: Remove unused imports before merge. Not runtime-breaking, but it keeps the new phase from adding noise to an already failing lint baseline.

3. Build emits Postgres SSL mode warnings
   - Command: `npm run build`
   - Detail: `pg-connection-string` warns that `sslmode=prefer/require/verify-ca` semantics will change in the next major version.
   - Fix: Update the production DB URL to use `sslmode=verify-full` if the current stronger behavior is desired.

## Verification

```text
npx prisma validate -> pass
npx tsc --noEmit    -> pass
npm run build       -> pass
npm run lint        -> fail: 12 errors / 18 warnings
```

Lint status: most errors are legacy or outside the Company Workspace scope, but `src/app/(dashboard)/companies/page.tsx` adds 4 unused-import warnings.

## Conclusion

The previous P0 issues are fixed: admin `/companies` routes now require `requireAdmin()`, migration SQL exists, and portal 404 stubs exist. I would not start Phase 4 yet without fixing at least the incomplete legacy sync in `unlinkWorkspaceEmployer` and the missing rate limit on `/company/login`; both are small, high-value patches.
