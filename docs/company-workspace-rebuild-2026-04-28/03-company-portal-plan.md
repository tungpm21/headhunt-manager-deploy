# 03. Company Portal Plan

## Goal

Create one login and management portal for both public FDIWork employers and CRM partner companies.

The portal should feel like one product:

- A company that only posts jobs sees job posting/application/profile/billing tools.
- A CRM partner sees job orders/submissions/feedback tools.
- A company that has both sees both sets of tools.

## Routes

New canonical routes:

- `/company/login`
- `/company/dashboard`
- `/company/job-postings`
- `/company/applications`
- `/company/job-orders`
- `/company/submissions`
- `/company/profile`
- `/company/users`
- `/company/billing`

Compatibility:

- `/employer/login` redirects or aliases to `/company/login` after portal auth is ready.
- `/employer/dashboard` redirects or aliases to `/company/dashboard`.
- Existing public routes `/cong-ty/[slug]` and `/viec-lam/[slug]` remain unchanged.

## Auth and Session

Use a workspace-scoped session payload:

```ts
type CompanyPortalSession = {
  portalUserId: number;
  workspaceId: number;
  email: string;
  role: "OWNER" | "MEMBER" | "VIEWER";
  capabilities: {
    employer: boolean;
    client: boolean;
    billing: boolean;
    manageUsers: boolean;
  };
};
```

The session must never authorize access by trusting client-submitted workspace IDs alone.

## Navigation Rules

Show tabs based on workspace facets:

| Tab | Requires |
| --- | --- |
| Dashboard | Any active workspace |
| Job Postings | Linked Employer |
| Applications | Linked Employer |
| Job Orders | Linked Client |
| Submissions | Linked Client |
| Profile | Linked Employer or portal profile capability |
| Users | Owner role |
| Billing | Linked Employer with subscription |

If a tab is hidden due to missing capability, direct navigation must still return not found or forbidden.

## Dashboard

Dashboard should show:

- Company identity and portal status.
- Pending applications count if Employer facet exists.
- Open job postings count if Employer facet exists.
- Open job orders count if Client facet exists.
- Submissions waiting for feedback if Client facet exists.
- Quick actions based on role.

## Tasks

- [ ] Add company portal auth helpers and cookie handling.
- [ ] Add `/company/login` using `CompanyPortalUser`.
- [ ] Add portal layout with capability-aware navigation.
- [ ] Add dashboard route.
- [ ] Add redirects or compatibility wrappers for `/employer/*`.
- [ ] Add portal user management for admin-created company users.
- [ ] Add session tests for active, inactive, suspended, and cross-workspace cases.

## Acceptance Criteria

- A CRM-only Client can have a portal user and log in.
- An existing Employer can still log in after compatibility routing.
- A portal user only sees tabs allowed by workspace facets and role.
- Direct URL access cannot bypass hidden navigation.
- Suspended workspace or inactive portal user cannot access portal data.

## Phase Prompt

```text
Implement Phase 3 from docs/company-workspace-rebuild-2026-04-28/03-company-portal-plan.md.
Use the workspace and portal user models from Phase 1.
Before editing auth helpers, middleware, layout, or server actions, run GitNexus impact analysis.
Build login, session, layout, and dashboard only.
Do not move applications/submissions UX into the portal until Phase 4/5.
Run auth tests, lint/type checks, and update TRACKER.md.
```
