# Prompts for Rebuild Work Loops

Use these prompts when starting separate analysis, design, code, check, or confirmation sessions.

## Tracking Tasks

- [x] Analysis prompt created.
- [x] Code prompt created.
- [x] Design review prompt created.
- [x] Check plan prompt created.
- [x] Confirmation prompt created.
- [x] Migration prompt created.
- [x] UI smoke prompt created.
- [x] Git safety prompt created.
- [ ] Add new prompts here when a phase introduces a repeated workflow.

## 1. Analysis Prompt

```text
Read docs/company-workspace-rebuild-2026-04-28/README.md, TRACKER.md, and the selected phase file.
Explore the current code with GitNexus query/context and targeted file reads.
Do not edit files yet.
Identify the exact symbols/routes/actions/components that need changes.
For each function/class/method likely to be edited, run GitNexus impact analysis and summarize blast radius.
Return:
- current implementation summary
- proposed smallest implementation slice
- impacted files/symbols
- risks
- verification commands
```

## 2. Code Prompt

```text
Implement only the selected task from TRACKER.md.
Before editing any function/class/method, confirm GitNexus impact analysis was run for that symbol.
Do not refactor unrelated files.
Preserve existing Employer and Client behavior unless the selected task explicitly changes it.
Use shared access helpers for workspace-scoped data.
After implementation, run relevant checks.
Update TRACKER.md with task status, verification, changed files, and remaining risk.
```

## 3. Design Review Prompt

```text
Review the UI/UX for the selected Company Workspace phase.
Use docs/company-workspace-rebuild-2026-04-28/README.md and the relevant phase file as requirements.
Check:
- user goal is clear
- labels distinguish public company page, CRM client, and portal access
- dense admin screens are scannable
- drag-and-drop is not mandatory
- mobile fallback exists
- empty/loading/error states are useful
Return prioritized issues with file/line references where possible.
```

## 4. Check Plan Prompt

```text
Check the completed implementation against the selected phase plan.
Read the phase file and TRACKER.md.
Compare actual changes to:
- tasks
- acceptance criteria
- security rules
- verification plan
Run relevant checks or explain why a check was not run.
Return:
- pass/fail by acceptance criterion
- bugs or gaps
- recommended next task
Do not mark TRACKER.md done unless the checks pass or Product explicitly waives them.
```

## 5. Confirmation Prompt

```text
Before moving to the next phase, summarize:
- what was completed
- what files changed
- what checks passed
- what risks remain
- what task is next in TRACKER.md
Ask Product for confirmation only if:
- schema or auth scope changed beyond plan
- public route behavior changed
- old Employer/Client behavior will be removed
- migration or data backfill has production risk
Otherwise proceed to the next unchecked task.
```

## 6. Migration Prompt

```text
Prepare the migration for the Company Workspace rebuild.
Read 01-domain-model-plan.md and 06-migration-security-plan.md.
Inspect current Prisma schema and existing relations.
Design an additive migration only.
Create or update backfill logic.
Verify:
- existing Employer rows map to workspace
- existing Client rows map to workspace
- linked Employer.clientId pairs map to one workspace
- old pages still load
Document rollback notes in TRACKER.md.
```

## 7. UI Smoke Prompt

```text
Run a browser smoke test for the selected portal/admin UI task.
Check desktop and narrow viewport.
Verify:
- no unreadable Vietnamese encoding
- no layout overlap
- tables/lists remain usable
- preview drawer opens and closes
- forbidden state is handled
- empty/loading/error states are present
Attach screenshot paths if generated.
Update TRACKER.md with results.
```

## 8. Git Safety Prompt

```text
Before commit:
Run git status.
Separate unrelated dirty files from current task files.
Run GitNexus detect_changes for all unstaged/staged changes.
Confirm changed symbols and affected flows match the selected task.
Run final checks.
Only then stage the intended files.
```
