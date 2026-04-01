---
trigger: always_on
---

# Headhunt Manager — Workspace Rules

> Project-specific rules for AI agents working on this codebase.
> These rules SUPPLEMENT (not replace) the global GEMINI.md rules.

---

## 🚀 SESSION START PROTOCOL

**When starting a new session, read files in this order:**

```
1. ARCHITECTURE.md     → System overview (route groups, auth, DB)
2. CODEBASE.md         → File → function map (find where things are)
3. .brain/handover.md  → Current state & what to do next
4. .brain/session.json → Recent changes & pending tasks
```

> ⚠️ Do NOT scan src/ files one by one. Use CODEBASE.md to find the right file first.

---

## 📐 CODE CONVENTIONS

### Server Actions (`src/lib/*-actions.ts`)
```typescript
// ✅ ALWAYS follow this pattern:
export async function createXAction(formData: FormData)
  : Promise<{ error?: string; success?: boolean; id?: number }>

// ✅ ALWAYS:
// 1. Get userId: const userId = await getCurrentUserId()
// 2. Parse FormData → typed input object
// 3. Validate required fields (return {error} if invalid)
// 4. Call data layer function (never write Prisma queries here)
// 5. revalidatePath() after mutation
// 6. Return {success: true} or {error: "Vietnamese error message"}

// ❌ NEVER:
// - Throw errors to client (always return {error})
// - Write Prisma queries directly in actions (use data layer)
// - Skip revalidatePath() after mutations
```

### Data Layer (`src/lib/candidates.ts`, `clients.ts`, `jobs.ts`)
```typescript
// ✅ Pure Prisma queries — no auth, no FormData, no revalidation
// ✅ Accept typed input objects (from types/)
// ✅ Return Prisma types directly
```

### Components
```
✅ Place in domain folder: src/components/{candidates,clients,jobs,public,employer}/
✅ One component per file
✅ Use Lucide React for icons
✅ Error messages in Vietnamese
❌ Do NOT create components in src/app/ — only page.tsx and layout.tsx there
```

### Types (`src/types/`)
```
✅ Enums match Prisma schema exactly
✅ Input types defined here, NOT in action files
✅ Re-export everything from types/index.ts
```

---

## 🗄️ DATABASE RULES

### When modifying schema:
```
1. Edit prisma/schema.prisma
2. Run: npx prisma migrate dev --name <descriptive_name>
3. Update prisma/seed.ts if new tables/fields need seed data
4. Update src/types/ to match new enums/fields
5. Update CODEBASE.md (run: npx tsx scripts/gen-codebase-map.ts)
6. Update ARCHITECTURE.md if new models or relationships
```

### Prisma conventions:
```
✅ Use native PostgreSQL String[] for simple lists (skills, industries)
✅ Use @relation with named relations when model has 2+ relations to same target
✅ Soft delete for Client (isDeleted flag), hard delete for others
✅ @@unique constraints for junction tables (e.g., jobOrderId_candidateId)
```

---

## 🌐 ROUTING RULES

### Vietnamese slug convention for public pages:
| Vietnamese | English equivalent |
|------------|-------------------|
| `/viec-lam` | /jobs |
| `/cong-ty` | /companies |
| `/ung-tuyen` | /apply |

### Auth boundaries:
```
(public)    → No auth. Read-only public data.
(auth)      → Login only. Redirect if already logged in.
(dashboard) → NextAuth required. CRM admin only.
(employer)  → Custom JWT required. Employer portal only.
```

---

## 📝 DOCS MAINTENANCE

### When adding/removing/renaming files:
```
1. Update CODEBASE.md (or run auto-gen script)
2. If new route group or model: update ARCHITECTURE.md
3. If significant feature: update CHANGELOG.md
4. At end of session: update .brain/session.json with what was done
```

### When completing a major milestone:
```
1. Update .brain/handover.md with current state
2. Update docs/README.md status table if needed
3. Update relevant plan.md status in plans/
```

---

## 🎨 UI CONVENTIONS

### FDIWork Public Pages:
```
✅ Fonts: Poppins (headings) + Open Sans (body)
✅ Colors: Use CSS variables from globals.css (--fdiwork-*)
✅ Layout: PublicHeader + content + PublicFooter
```

### CRM Dashboard:
```
✅ Font: Inter
✅ Layout: Sidebar + main content
✅ Tables: Custom tables (no external table library)
✅ Icons: Lucide React exclusively
```
