/**
 * Backfill script: Create CompanyWorkspace rows from existing Employer and Client data.
 *
 * Rules:
 *  1. Employer with clientId → 1 workspace linking both
 *  2. Employer without clientId → 1 workspace, employerId only
 *  3. Client without linked employer → 1 workspace, clientId only
 *  4. Slug from employer.slug or slugified companyName + "-client-{id}" fallback
 *  5. portalEnabled = true for ACTIVE employers, false for CRM-only clients
 *
 * Usage: npx tsx scripts/backfill-workspaces.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() ||
    process.env.DATABASE_URL?.trim();

if (!connectionString) {
    console.error("DATABASE_URL or DATABASE_POOLER_URL must be set.");
    process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString }) as any;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 80);
}

async function main() {
    console.log("🚀 Starting workspace backfill...\n");

    // Track used slugs to avoid conflicts
    const usedSlugs = new Set<string>();
    const existingWorkspaces = await prisma.companyWorkspace.findMany({
        select: { slug: true, employerId: true, clientId: true },
    });
    for (const ws of existingWorkspaces) {
        usedSlugs.add(ws.slug);
    }
    const existingEmployerIds = new Set(existingWorkspaces.filter(w => w.employerId).map(w => w.employerId!));
    const existingClientIds = new Set(existingWorkspaces.filter(w => w.clientId).map(w => w.clientId!));

    function uniqueSlug(base: string, suffix: string): string {
        let slug = base;
        if (usedSlugs.has(slug)) slug = `${base}-${suffix}`;
        let i = 2;
        while (usedSlugs.has(slug)) {
            slug = `${base}-${suffix}-${i++}`;
        }
        usedSlugs.add(slug);
        return slug;
    }

    // Step 1: All employers
    const employers = await prisma.employer.findMany({
        select: {
            id: true,
            companyName: true,
            email: true,
            password: true,
            slug: true,
            status: true,
            clientId: true,
        },
    });

    let created = 0;
    let skipped = 0;
    let portalUsersCreated = 0;

    async function ensurePortalOwner(input: {
        workspaceId: number;
        email: string;
        password: string;
        name: string;
    }) {
        const existing = await prisma.companyPortalUser.findUnique({
            where: {
                workspaceId_email: {
                    workspaceId: input.workspaceId,
                    email: input.email,
                },
            },
            select: { id: true },
        });

        if (existing) return false;

        await prisma.companyPortalUser.create({
            data: {
                workspaceId: input.workspaceId,
                email: input.email,
                password: input.password,
                name: input.name,
                role: "OWNER",
                isActive: true,
            },
        });

        portalUsersCreated++;
        return true;
    }

    for (const emp of employers) {
        if (existingEmployerIds.has(emp.id)) {
            const workspace = await prisma.companyWorkspace.findUnique({
                where: { employerId: emp.id },
                select: { id: true },
            });

            if (workspace) {
                const userCreated = await ensurePortalOwner({
                    workspaceId: workspace.id,
                    email: emp.email,
                    password: emp.password,
                    name: emp.companyName,
                });
                if (userCreated) {
                    console.log(`  Portal owner created for Employer #${emp.id} "${emp.email}"`);
                }
            }

            skipped++;
            continue;
        }

        const slug = uniqueSlug(emp.slug || slugify(emp.companyName), `employer-${emp.id}`);
        const portalEnabled = emp.status === "ACTIVE";

        // If employer has clientId, also mark that client as covered
        if (emp.clientId) {
            existingClientIds.add(emp.clientId);
        }

        const workspace = await prisma.companyWorkspace.create({
            data: {
                displayName: emp.companyName,
                slug,
                status: "ACTIVE",
                portalEnabled,
                employerId: emp.id,
                clientId: emp.clientId,
            },
        });
        await ensurePortalOwner({
            workspaceId: workspace.id,
            email: emp.email,
            password: emp.password,
            name: emp.companyName,
        });
        created++;
        console.log(`  ✅ Employer #${emp.id} "${emp.companyName}" → workspace "${slug}"${emp.clientId ? ` (linked client #${emp.clientId})` : ""}`);
    }

    // Step 2: Clients that have no workspace yet (not linked to any employer)
    const orphanClients = await prisma.client.findMany({
        where: {
            isDeleted: false,
            id: { notIn: [...existingClientIds] },
        },
        select: { id: true, companyName: true },
    });

    for (const client of orphanClients) {
        const slug = uniqueSlug(slugify(client.companyName), `client-${client.id}`);

        await prisma.companyWorkspace.create({
            data: {
                displayName: client.companyName,
                slug,
                status: "ACTIVE",
                portalEnabled: false,
                clientId: client.id,
            },
        });
        created++;
        console.log(`  ✅ Client #${client.id} "${client.companyName}" → workspace "${slug}" (CRM only)`);
    }

    console.log(`\n📊 Results: ${created} created, ${skipped} skipped (already existed)`);

    console.log(`Portal owners created: ${portalUsersCreated}`);

    // Verify
    const totalWorkspaces = await prisma.companyWorkspace.count();
    const totalEmployers = await prisma.employer.count();
    const totalClients = await prisma.client.count({ where: { isDeleted: false } });
    console.log(`\n📈 Totals: ${totalWorkspaces} workspaces | ${totalEmployers} employers | ${totalClients} active clients`);
}

main()
    .catch((e) => {
        console.error("❌ Backfill failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
