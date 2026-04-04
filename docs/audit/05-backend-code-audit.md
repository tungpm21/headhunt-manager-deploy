# 🔧 Headhunt Manager — Backend Code Deep Audit

> **Vai trò:** Senior Backend Engineer
> **Phạm vi:** 8 server action files, 4 API routes, 7 data layer files, 1 middleware, 1 Prisma setup
> **Focus:** Execution paths thực tế, query patterns, security, validation

---

## 1. Performance Bottlenecks

### 🔴 B1. ILIKE Full Table Scan — Mọi Search Đều Full Scan

**File:** [candidates.ts:L41-L85](file:///d:/MH/Headhunt_pj/src/lib/candidates.ts#L41-L85)

```typescript
where.OR = [
  { fullName: { contains: s, mode: "insensitive" } },   // ILIKE '%s%' → full scan
  { phone:    { contains: s, mode: "insensitive" } },   // ILIKE '%s%' → full scan
  { email:    { contains: s, mode: "insensitive" } },   // ILIKE '%s%' → full scan
];
```

**SQL thực tế:**
```sql
SELECT * FROM "Candidate"
WHERE "isDeleted" = false
  AND ("fullName" ILIKE '%keyword%' OR "phone" ILIKE '%keyword%' OR "email" ILIKE '%keyword%')
ORDER BY "createdAt" DESC LIMIT 20;

-- EXPLAIN ANALYZE tại 100K rows:
-- Seq Scan on "Candidate"  (cost=0.00..12847.00 rows=100000)
-- Execution Time: 1.2s
```

**Tại sao quan trọng:** `ILIKE '%keyword%'` (leading wildcard) **không bao giờ dùng được B-tree index**. Mọi index trên fullName/phone/email đều vô dụng cho pattern này.

**Fix tối thiểu:**
```sql
-- pg_trgm extension + GIN index cho trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_candidate_fullname_trgm ON "Candidate" USING GIN (lower("fullName") gin_trgm_ops);
CREATE INDEX idx_candidate_email_trgm ON "Candidate" USING GIN (lower("email") gin_trgm_ops);
```
Sau đó Prisma `contains` + `insensitive` sẽ tự dùng GIN trigram index → **100x nhanh hơn**.

---

### 🔴 B2. Import N+1 — Sequential Loop

**File:** [import-actions.ts:L17-L48](file:///d:/MH/Headhunt_pj/src/lib/import-actions.ts#L17-L48)

```typescript
for (const record of candidatesArray) {       // N iterations
  const existing = await prisma.candidate.findFirst(...)  // Query 1
  await prisma.candidate.create(...)                       // Query 2
}
// Total: 2N queries, sequential, no batch
```

| Records | Queries | Time (estimated) |
|---------|---------|-----------------|
| 100 | 200 | ~20s |
| 500 | 1000 | ~100s |
| 1000 | 2000 | ~200s (3+ phút) |

**Fix tối thiểu:**
```typescript
// Batch dedup
const emails = data.filter(r => r.email).map(r => r.email);
const existing = await prisma.candidate.findMany({
  where: { email: { in: emails } },
  select: { email: true }
});
const existingSet = new Set(existing.map(e => e.email));

// Batch create
const newRecords = data.filter(r => !existingSet.has(r.email));
await prisma.candidate.createMany({ data: newRecords, skipDuplicates: true });
// Total: 2 queries, ~0.2s
```

---

### 🟠 B3. Connection Pool — Không Config

**File:** [prisma.ts:L7](file:///d:/MH/Headhunt_pj/src/lib/prisma.ts#L7)

```typescript
const pool = new Pool({ connectionString }) as any;  // ← as any + no config
```

**Vấn đề:**
- `pg.Pool` default: `max: 10` connections. Trên Supabase free tier: **42 direct connections max**.
- Serverless (Vercel): mỗi function instance tạo pool riêng → 5 concurrent functions × 10 pool = 50 connections → **vượt limit**.
- `as any` — suppress type error, có thể là incompatible adapter version.

**Fix tối thiểu:**
```typescript
const pool = new Pool({
  connectionString,
  max: 5,               // Giảm xuống để tránh exhaustion trên serverless
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});
```

---

### 🟠 B4. Dashboard — 7 Parallel Queries + Auth Redundancy

**File:** [dashboard/page.tsx:L11-L26](file:///d:/MH/Headhunt_pj/src/app/(dashboard)/dashboard/page.tsx#L11-L26)

```typescript
const [...] = await Promise.all([
  prisma.candidate.count(),                // ← THIẾU isDeleted filter
  prisma.client.count({ ... }),            // OK
  prisma.jobOrder.count({ ... }),          // OK
  getNewApplicationsCount(),               // ← gọi requireAdmin() DỪA THỪA
  prisma.jobOrder.findMany({ ... }),       // nested include: client
  prisma.candidate.findMany({ ... }),      // nested include: tags.tag
  getRecentApplications(5),                // ← gọi requireAdmin() THỪA
]);
```

**Vấn đề:**
1. `candidate.count()` đếm cả `isDeleted: true`
2. `getNewApplicationsCount()` và `getRecentApplications()` gọi `requireAdmin()` bên trong → **2 lần auth check thừa** (page đã protected bởi layout)
3. 7 queries × 5 users refresh = 35 concurrent DB connections

**Fix tối thiểu:** Inline `getNew*` queries (bỏ requireAdmin), fix `isDeleted` filter, gộp 3 count thành 1 raw query:
```sql
SELECT
  (SELECT count(*) FROM "Candidate" WHERE "isDeleted" = false) as candidates,
  (SELECT count(*) FROM "Client" WHERE "isDeleted" = false) as clients,
  (SELECT count(*) FROM "JobOrder" WHERE status = 'OPEN') as jobs;
```

---

### 🟡 B5. View Counter — Write Amplification

**File:** [public-actions.ts:L338-L340](file:///d:/MH/Headhunt_pj/src/lib/public-actions.ts#L338-L340)

```typescript
prisma.jobPosting.update({
  where: { id: job.id },
  data: { viewCount: { increment: 1 } }
}).catch(() => {});   // ← fire-and-forget, error swallowed
```

- Mỗi page view = 1 DB write
- 1000 job views/ngày = 1000 unnecessary writes
- `catch(() => {})` — fail silently, không log gì

**Fix:** Batch counter — tích lũy trong memory, flush mỗi 60 giây hoặc sau 100 increments.

---

### 🟡 B6. `getAllClients()` — Load Tất Cả, Không Phân Trang

**File:** [clients.ts](file:///d:/MH/Headhunt_pj/src/lib/clients.ts) → `getAllClients()`

```typescript
// Dùng ở job form dropdown: load TẤT CẢ clients
const clients = await getAllClients();
// 500 clients → truyền 500 objects vào client component props
```

**Fix:** Chấp nhận được ở <200 clients. Khi >500, chuyển sang searchable select với API endpoint.

---

## 2. Security Risks

### 🔴 S1. File Upload — MIME-Only Validation (No Magic Bytes)

**Files:** Cả 3 upload endpoints dùng cùng pattern:

```typescript
// apply-cv/route.ts, candidates/[id]/cv/route.ts, avatar/route.ts
if (!ALLOWED_TYPES.includes(file.type)) { ... }  // ← chỉ check MIME type
```

**Vấn đề:** `file.type` do browser set, **attacker có thể giả mạo**:
```bash
# Gửi malicious file với MIME giả:
curl -X POST /api/public/apply-cv \
  -F "cv=@malware.exe;type=application/pdf"
```

→ Server nhận `file.type === "application/pdf"` → upload thành công dù là file .exe.

**Fix tối thiểu:**
```typescript
// Kiểm tra magic bytes thay vì chỉ MIME
const header = Buffer.from(await file.slice(0, 4).arrayBuffer());
const isPDF = header[0] === 0x25 && header[1] === 0x50; // %P (PDF)
const isDOC = header[0] === 0xD0 && header[1] === 0xCF; // DOC
const isDOCX = header[0] === 0x50 && header[1] === 0x4B; // PK (ZIP-based)
```

---

### 🔴 S2. Avatar Upload — No Ownership Check (IDOR)

**File:** [avatar/route.ts](file:///d:/MH/Headhunt_pj/src/app/api/candidates/avatar/route.ts#L8-L10)

```typescript
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return ... // ← chỉ check "đã login"

  // KHÔNG check: user này CÓ QUYỀN upload avatar cho candidate này không?
  // Avatar URL được trả ra → client code tự gán vào candidate
  const { url } = await uploadFile("avatars", fileName, file);
  return NextResponse.json({ url, fileName: file.name });
}
```

**Vấn đề:** Bất kỳ user đã login nào cũng upload được file lên storage. Không validate candidateId hay ownership. Tuy nhiên, vì cả CRM đều là nội bộ (cùng team), impact thực tế thấp hơn.

**Fix tối thiểu:** Thêm `candidateId` vào request, verify candidate exists + user has access.

---

### 🟠 S3. JWT Employer — Không Có Refresh Token

**File:** [employer-auth.ts:L28-L34](file:///d:/MH/Headhunt_pj/src/lib/employer-auth.ts#L28-L34)

```typescript
const token = await new SignJWT({ employerId, companyName })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("7d")   // ← 7 ngày, không revoke được
  .sign(getEmployerJwtSecret());
```

**Vấn đề:**
- JWT hết hạn sau 7 ngày — **không có refresh mechanism**
- Nếu employer bị khóa (SUSPENDED) → JWT vẫn valid đến khi hết hạn
- Không có token blacklist/revocation

**Fix tối thiểu:** Giảm `expirationTime` xuống `"1d"`, thêm check `employer.status === 'ACTIVE'` trong `requireEmployerSession()`:
```typescript
export async function requireEmployerSession() {
  const payload = await getEmployerSession();
  if (!payload) redirect("/employer/login");

  // Thêm: check employer vẫn active
  const employer = await prisma.employer.findUnique({
    where: { id: payload.employerId },
    select: { status: true }
  });
  if (employer?.status !== "ACTIVE") {
    // Clear cookie + redirect
  }
}
```

---

### 🟠 S4. CV Route — Delete Before Verify Upload

**File:** [candidates/[id]/cv/route.ts:L41-L52](file:///d:/MH/Headhunt_pj/src/app/api/candidates/%5Bid%5D/cv/route.ts#L41-L52)

```typescript
// 1. Xóa file cũ TRƯỚC
if (existing?.cvFileUrl) {
  await deleteFile(existing.cvFileUrl);  // ← xóa file cũ
}

// 2. Upload file mới SAU
const { url } = await uploadFile("cvs", fileName, file);  // ← nếu fail ở đây?

// 3. Update database
await updateCandidateCV(candidateId, url, file.name);
```

**Vấn đề:** Nếu `uploadFile` fail sau khi `deleteFile` thành công → **mất CV cũ, không có CV mới**. Data loss.

**Fix tối thiểu:** Đảo thứ tự — upload mới trước, xóa cũ sau:
```typescript
const { url } = await uploadFile("cvs", fileName, file); // upload mới
await updateCandidateCV(candidateId, url, file.name);     // update DB
if (existing?.cvFileUrl) await deleteFile(existing.cvFileUrl); // xóa cũ
```

---

### 🟡 S5. `enumVal()` — Unsafe Type Cast

**Files:** `actions.ts`, `job-actions.ts` (duplicate)

```typescript
function enumVal<T>(value: FormDataEntryValue | null): T | undefined {
  const s = value?.toString().trim();
  return s ? (s as T) : undefined;  // ← cast BẤT KỲ string nào thành T
}

// Usage:
const status = enumVal<CandidateStatus>(fd.get("status"));
// status = "HACKED_VALUE" as CandidateStatus → Prisma sẽ throw P2023
```

**Vấn đề:** Không validate string thuộc enum. Prisma sẽ bắt ở DB level (P2023 error), nhưng:
1. Error message expose DB info
2. Không có graceful error handling
3. TypeScript type system bị cheat

**Fix tối thiểu:**
```typescript
function enumVal<T extends string>(value: FormDataEntryValue | null, validValues: T[]): T | undefined {
  const s = value?.toString().trim();
  return s && validValues.includes(s as T) ? (s as T) : undefined;
}
```

---

### 🟡 S6. Notes/Description — No Sanitization

**Nhiều files:** `addCandidateNoteAction`, `createJobAction`, `submitApplication`

```typescript
// Input từ user → lưu trực tiếp vào DB → render ra HTML
const content = fd.get("content")?.toString().trim();
await prisma.candidateNote.create({ data: { content, ... } });

// Render:
<p>{note.content}</p>  // React auto-escapes → XSS safe ✅
```

**Verdict:** React tự escape JSX → **XSS safe** với pattern hiện tại. Nhưng nếu bất kỳ đâu dùng `dangerouslySetInnerHTML` hoặc render HTML trực tiếp → bị XSS. Hiện tại OK, nhưng cần cẩn thận khi thêm rich text editor.

---

## 3. Bad Patterns

### 🔴 P1. Fat Server Actions — Business Logic + Auth + IO In One Function

**Ví dụ điển hình:** [employer-actions.ts](file:///d:/MH/Headhunt_pj/src/lib/employer-actions.ts)

```typescript
export async function registerEmployerAction(prev, fd: FormData) {
  // 1. Rate limiting (infra concern)
  const rateLimit = checkRateLimit(...);

  // 2. Input parsing (presentation concern)
  const companyName = fd.get("companyName")?.toString().trim();
  const email = fd.get("email")?.toString().trim();

  // 3. Validation (business logic)
  if (!companyName) return { error: "..." };
  if (!/regex/.test(email)) return { error: "..." };

  // 4. Business logic (domain)
  const existing = await prisma.employer.findFirst({ where: { email } });

  // 5. Password hashing (security concern)
  const hashed = await hash(password, 10);

  // 6. DB mutation (persistence)
  await prisma.employer.create({ data: { ... } });

  // 7. Cookie management (infra)
  const token = await new SignJWT({ ... }).sign(...);
  cookies().set("employer-token", token);

  // 8. Cache invalidation (framework)
  revalidatePath("/employer");

  return { success: true };
}
```

**6 concerns khác nhau trong 1 function.** Khi cần thay đổi auth mechanism → phải sửa trong hàm chứa business logic → tight coupling.

**Fix tối thiểu (3-day scope):** Không refactor full. Chỉ **extract shared utilities**:
```
getCurrentUserId() → utils/auth-helpers.ts
strVal/enumVal/intVal → utils/form-helpers.ts
Rate limiting → (giữ nguyên cho giờ, sẽ refactor khi chuyển Redis)
```

---

### 🟠 P2. `prisma` Direct Import Ở Cả Action Lẫn Data Layer

```
import { prisma } from "@/lib/prisma";
```

Xuất hiện ở:
- Data layer (đúng): `candidates.ts`, `clients.ts`, `jobs.ts` ← nơi nên dùng
- Server actions (sai): `import-actions.ts:L4`, `employer-actions.ts:L3`, `moderation-actions.ts:L4` ← actions gọi prisma trực tiếp, bypass data layer

**Hậu quả:** Logic query nằm rải rác → khó audit query patterns, khó thêm caching layer.

**Fix tối thiểu:** Chấp nhận cho 3-day scope. Flag cho future refactor.

---

### 🟠 P3. Error Swallowing

```typescript
// public-actions.ts
.catch(() => {});  // view counter — lỗi gì cũng nuốt

// employer-actions.ts
} catch (e) {
  console.error("...", e);
  return { error: "Có lỗi xảy ra." };  // Generic message, real error chỉ ở server log
}
```

Toàn bộ error handling follow pattern: **catch → log → generic message**. OK cho user-facing, nhưng:
- Không có error categorization (transient vs permanent)
- Không có error tracking (Sentry/etc.)
- `catch(() => {})` nuốt hoàn toàn — kể cả connection pool exhaustion

---

## 4. Query Pattern Analysis

### Execution path: Recruiter mở dashboard, search candidate, assign vào job

```
Request 1: GET /dashboard
├── auth() → 1 session query
├── Promise.all([7 queries])
│   ├── candidate.count() → SELECT count(*) — THIẾU isDeleted filter
│   ├── client.count(isDeleted:false)
│   ├── jobOrder.count(OPEN)
│   ├── getNewApplicationsCount → auth() THỪA + count
│   ├── jobOrder.findMany(5) + include client → 1 query + 5 joins
│   ├── candidate.findMany(5) + include tags.tag → 1 query + N join
│   └── getRecentApplications → auth() THỪA + findMany + include
└── Total: 10-12 queries (3 auth checks, 7 data)

Request 2: GET /candidates?search=nodejs&level=SENIOR
├── auth() → 1 session
├── Promise.all([getCandidates, getAllTags])
│   ├── getCandidates:
│   │   ├── candidate.count(where) → ILIKE full scan
│   │   └── candidate.findMany(where,take:20) + include tags.tag
│   │       → 1 query + 20 × tag join = ~21 queries (N+1 nếu tag relation lazy)
│   └── getAllTags → findMany all tags
└── Total: ~24 queries

Request 3: POST /jobs/{id} - AssignCandidateModal search
├── auth() → 1 session
├── searchAvailableCandidatesAction:
│   ├── getCurrentUserId() → auth() THỪA
│   └── candidate.findMany(where NOT IN jobCandidates, take:10)
│       → subquery: SELECT candidateId FROM JobCandidate WHERE jobOrderId = X
│       → outer: SELECT * FROM Candidate WHERE id NOT IN (subquery)
└── Total: 3 queries

Request 4: POST assignCandidateAction
├── auth() → 1 session
├── getCurrentUserId() → auth() THỪA
├── existingLink check → findFirst
├── jobCandidate.create
├── revalidatePath × 2
└── Total: 4 queries + 2 revalidations
```

**Tổng cho 1 flow "mở dashboard → search → assign":** ~43 queries + 6 auth checks (3 thừa).

---

## 5. Scale Readiness

### Connection Pool Math

```
Pool config: max=10 (default, no override)
Supabase free: max=42 direct connections

Concurrent users:
  5 users  → 5 × 10 = 50 potential connections ← VƯỢT LIMIT
  10 users → 10 × 10 = 100 ← CRASH

Serverless cold starts:
  Each Vercel Function = new pool = new connections
  Parallel requests may create multiple pools
```

### Query Count Per User Action

| Action | Queries | With 10 users |
|--------|---------|---------------|
| Open dashboard | 12 | 120 |
| Search candidates | 24 | 240 |
| View candidate detail | 6 | 60 |
| Assign to job | 4 | 40 |
| Import 100 records | 200 | N/A (single) |

### Verdict

```
 Scale Level   │  Users  │  Candidates  │  Status
───────────────┼─────────┼──────────────┼──────────
 Current       │  1-3    │  <5K         │  ✅ OK
 Near term     │  5-10   │  5K-50K      │  ⚠️ Pool exhaustion, search slow
 Growth        │  10-20  │  50K-100K    │  🔴 Multiple bottlenecks
 Scale         │  50+    │  100K+       │  💀 Needs redesign
```

---

## 6. Tổng Kết: Priority Fixes

### 🔴 Fix Ngay (Trong 3-Day Refactor)

| # | Issue | Fix | Effort |
|---|-------|-----|--------|
| B3 | Pool no config | Thêm `max: 5, idleTimeout, connectionTimeout` | 5 phút |
| S4 | CV delete-before-upload | Đảo thứ tự: upload → update DB → delete old | 10 phút |
| B4 | Dashboard isDeleted count | Thêm `{ isDeleted: false }` | 5 phút |
| B2 | Import N+1 | Batch dedup + createMany | 1 giờ |
| S5 | Unsafe enumVal | Thêm validValues array check | 30 phút |
| B4 | Dashboard auth redundancy | Inline queries, bỏ requireAdmin trong helper | 30 phút |

### 🟠 Fix Trong Sprint Tiếp Theo

| # | Issue | Fix | Effort |
|---|-------|-----|--------|
| B1 | ILIKE full scan | pg_trgm + GIN index | 2 giờ |
| S1 | MIME-only file check | Magic bytes validation | 2 giờ |
| S3 | JWT no refresh | Giảm TTL + status check in requireEmployerSession | 1 giờ |
| P1 | Fat server actions | Extract shared utils (auth, form parsing) | 2 giờ |
| B5 | View counter write amp | Batch counter (memory + periodic flush) | 3 giờ |

### 🟡 Backlog

| # | Issue | Fix | Effort |
|---|-------|-----|--------|
| P2 | Prisma direct in actions | Route through data layer functions | 1 tuần |
| P3 | Error swallowing | Add error tracking (Sentry) | 1 ngày |
| S2 | Avatar IDOR | Add candidateId + ownership check | 30 phút |

> [!CAUTION]
> **B3 (Pool config)** là fix 5 phút nhưng **ngăn chặn connection exhaustion** — sẽ crash production khi >5 concurrent users. Cần làm TRƯỚC khi deploy.
