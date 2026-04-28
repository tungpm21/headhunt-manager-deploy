# Company Workspace Rebuild Plan

Created: 2026-04-28  
Project: Headhunt Manager / FDIWork  
Planning source: `ag-brainstorm`, `ag-plan`, `ag-design`

## Purpose

This folder is the working plan for rebuilding the current Employer, CRM Client, partner portal, and recruitment pipeline logic into a clearer Company Workspace model.

The accepted product direction is:

- Merge the mental model of `Nha tuyen dung` and `Doanh nghiep doi tac` into one `Company Workspace`.
- Keep existing `Employer` and `Client` tables during migration, but make them roles/facets of a single workspace.
- Build one company portal. Tabs are shown by permission/capability.
- Make `Inbox + Preview Drawer` the default recruitment workflow. Kanban becomes a secondary view.
- Keep admin as the final authority for moderation, import, package, and sensitive approval flows.

## File Map

| File | Use |
| --- | --- |
| `00-master-plan.md` | Overall roadmap, phase order, dependency map, definition of done |
| `01-domain-model-plan.md` | Data model, migration, ownership, and permission design |
| `02-admin-crm-plan.md` | Admin CRM redesign: Companies, Account Mapping, approval flows |
| `03-company-portal-plan.md` | Partner/company login, layout, routes, role-based navigation |
| `04-pipeline-ux-plan.md` | Applications inbox, submissions inbox, preview drawer, Kanban fallback |
| `05-profile-builder-and-job-builder-plan.md` | Sync admin builder features into company portal safely |
| `06-migration-security-plan.md` | Migration, rollout, redirects, audit, privacy, access checks |
| `07-verification-rollout-plan.md` | Test matrix, manual QA, rollout gates |
| `TRACKER.md` | Task tracking source for this rebuild |
| `PROMPTS.md` | Prompts for each analysis, code, check, confirmation loop |

## Operating Loop

Every implementation session must follow this loop:

1. Read this `README.md`, then `TRACKER.md`.
2. Pick the next unchecked task from exactly one phase.
3. Read that phase file completely.
4. Run GitNexus impact analysis before editing any function, class, or method.
5. Implement only the selected task slice.
6. Run the checks listed in the phase file.
7. Update `TRACKER.md` with status, notes, and remaining risks.
8. If committing, run GitNexus `detect_changes` before commit.
9. Stop and ask for confirmation if the task changes public routes, auth scope, schema shape, or migration behavior beyond the plan.

## Tracking Checklist

- [x] Planning folder created.
- [x] Accepted direction recorded.
- [x] Phase files created.
- [x] Task tracker created.
- [x] Reusable prompts created.
- [ ] Phase 1 implementation started.
- [ ] First migration verified.

## Kickoff Prompt

```text
Start from docs/company-workspace-rebuild-2026-04-28/README.md.
Read TRACKER.md and pick the next unchecked task.
Open the matching phase file and follow its task checklist.
Use GitNexus impact analysis before editing code symbols.
After work, update TRACKER.md with status, verification, changed files, and remaining risk.
```

## Status Legend

- `[ ]` Not started
- `[~]` In progress or partial
- `[x]` Done and verified
- `[!]` Blocked or needs product decision

## Non-Negotiables

- Do not delete existing Employer or Client behavior in the first implementation phase.
- Do not expose CRM candidate data to a company unless the linked workspace and permissions allow it.
- Do not make drag-and-drop the only way to update pipeline state.
- Do not reuse the confusing inline `Link Client` dropdown as the final UX.
- All user-facing Vietnamese copy must be reviewed for encoding and readability before shipping.
