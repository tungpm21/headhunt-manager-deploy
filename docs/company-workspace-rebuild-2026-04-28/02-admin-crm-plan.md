# 02. Admin CRM Plan

## Goal

Replace the confusing split between `Nha tuyen dung` and `Doanh nghiep doi tac` with an admin-facing Company Workspace experience.

Admins should not need to guess whether a company lives under Employer or Client. They should open one company record and see all linked business state.

## Routes

Add or evolve these admin routes:

- `/companies`: master company list.
- `/companies/[id]`: company detail.
- `/companies/[id]/mapping`: account mapping wizard or tab.
- `/companies/[id]/portal-users`: portal user management tab or nested route.

Keep existing routes during migration:

- `/employers`
- `/employers/[id]`
- `/clients`
- `/clients/[id]`

Existing pages should link to the new company workspace detail when a workspace exists.

## Company List

The list should show:

- Company name.
- Workspace status.
- Facet badges: `FDI Employer`, `CRM Client`, `Portal Enabled`, `Portal Disabled`, `Needs Link`.
- Employer status if present.
- Client status if present.
- Active subscription if present.
- Open job orders count.
- Active public job postings count.
- Latest application/submission activity.

Filters:

- All.
- FDI Employer.
- CRM Client.
- Both.
- Portal Enabled.
- Needs Mapping.
- Suspended.

## Company Detail Tabs

Tabs should be stable and predictable:

- Overview: identity, badges, quick stats, warnings.
- Account Mapping: Employer, Client, portal, duplicate candidates for linking.
- Public Profile: admin builder and public preview link.
- Job Postings: FDIWork public jobs.
- Applications: public FDIWork applications.
- Job Orders: CRM job orders.
- Submissions: CRM candidates sent to client.
- Portal Users: company-side login users.
- Billing: subscription and revenue summary.
- Activity: audit log entries related to the workspace.

Hide empty tabs only if the company has no matching facet and admin is not in setup mode. In setup mode, show disabled tabs with setup CTA.

## Account Mapping Wizard

Replace the current inline `Link Client` dropdown with a clear mapping card.

States:

- Employer-only: show option to link existing CRM Client or create CRM Client from Employer.
- Client-only: show option to link existing Employer or create portal/employer account.
- Linked: show Employer and Client summary, with unlink guarded by confirmation.
- Conflict: show if selected Client already maps to another Employer or vice versa.
- Duplicate candidates: show likely matches by normalized company name, website, email domain, and phone.

Actions:

- Link existing Employer to Client.
- Create Employer from Client.
- Create Client from Employer.
- Enable company portal.
- Disable company portal.
- Unlink with confirmation.

Every mapping action must write an ActivityLog event.

## Tasks

- [ ] Add `/companies` list route backed by `CompanyWorkspace`.
- [ ] Add workspace detail shell and tabs.
- [ ] Add Account Mapping card/wizard.
- [ ] Add duplicate detection query for likely Employer/Client matches.
- [ ] Add server actions for link, unlink, create missing side, enable/disable portal.
- [ ] Add ActivityLog records for all mapping actions.
- [ ] Add links from old Employer and Client detail pages to workspace detail.
- [ ] Keep old pages functional until rollout is complete.

## Acceptance Criteria

- Admin can find Samsung/Nestle-like companies from one list even if they are Employer-only, Client-only, or linked.
- Admin can understand current mapping without reading database IDs.
- Admin can enable portal for a CRM-only client.
- Admin cannot accidentally link a Client already owned by another Employer.
- Mapping changes revalidate relevant admin and public pages.

## Phase Prompt

```text
Implement Phase 2 from docs/company-workspace-rebuild-2026-04-28/02-admin-crm-plan.md.
Read the domain model helpers first.
Use GitNexus impact analysis before editing admin actions, route components, or shared data access helpers.
Build the admin company list and mapping workflow; do not build the company portal yet.
Preserve existing /employers and /clients pages.
Run lint/type checks and update TRACKER.md.
```
