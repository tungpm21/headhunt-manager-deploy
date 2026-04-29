# Admin CRM UI Audit - 2026-04-29

## Scope

Audit Admin CRM after Company Workspace consolidation across desktop and mobile:

- Dashboard shell and sidebar
- `/companies` list and filters
- Legacy company redirects already landing on `/companies`
- Core CRM routes: `/dashboard`, `/candidates`, `/jobs`, `/submissions`, `/import`, `/moderation`, `/moderation/applications`, `/packages`, `/settings/options`, `/blog`

## Findings

### P1 - `/jobs` caused page-level horizontal overflow

The Job Orders table could expand the dashboard flex child beyond the viewport at 1440px. The table had an internal horizontal scroll wrapper, but the dashboard content pane did not opt into shrinking with `min-w-0`, so the child min-content width leaked to the document.

Fix:

- Add `min-w-0` to the Admin CRM content flex pane.
- Add `min-w-0` to the `<main>` scroll container.

### P2 - Company Workspace labels were too technical for managers

The Admin CRM merge correctly used `/companies`, but the visible UI still mixed English product/internal terms:

- Sidebar: `Company Workspace`
- Filters: `All`, `Employer`, `Client`, `Both`, `Unlinked`
- Portal filters: `All portal`, `Portal on`, `Portal off`

Fix:

- Sidebar primary module label changed to `Công ty`.
- `/companies` heading changed to `Công ty` with a small `Company Workspace` technical badge.
- Filters changed to manager-facing Vietnamese labels while preserving query values and backend filters.

## Verification

Commands:

- `GitNexus impact DashboardLayout` -> LOW
- `GitNexus impact CompaniesPage` -> LOW
- `GitNexus impact Sidebar` -> LOW
- `npx tsc --noEmit` -> pass
- `npx eslint "src/app/(dashboard)/layout.tsx" "src/components/sidebar.tsx" "src/app/(dashboard)/companies/page.tsx"` -> pass
- `npm run build` -> pass with existing Postgres SSL mode warning
- Playwright desktop smoke at 1440x900 -> pass
- Playwright mobile smoke at 390x844 -> pass

Routes checked:

- `/dashboard`
- `/candidates`
- `/companies`
- `/companies?role=employer`
- `/companies?role=client`
- `/jobs`
- `/submissions`
- `/import`
- `/moderation`
- `/moderation/applications`
- `/packages`
- `/settings/options`
- `/blog`

## Residual Notes

- Existing DB connection emits a Postgres SSL mode warning during build. This is unrelated to UI and already existed.
- This pass intentionally avoids redesigning every CRM page. It fixes confirmed layout regressions and the most confusing Company Workspace labels without changing data flow or route contracts.
