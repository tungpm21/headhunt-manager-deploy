import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, ExternalLink } from "lucide-react";
import { ContentBlocksRenderer } from "@/components/content/ContentBlocksRenderer";
import {
    DEFAULT_COMPANY_THEME,
    normalizeCompanyTheme,
} from "@/lib/content-blocks";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

type PageProps = {
    params: Promise<{ id: string; draftId: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringOrNull(value: unknown) {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || null;
}

export default async function CompanyProfileDraftPreviewPage({ params }: PageProps) {
    await requireAdmin();

    const { id, draftId } = await params;
    const workspaceId = Number(id);
    const profileDraftId = Number(draftId);

    if (!Number.isInteger(workspaceId) || !Number.isInteger(profileDraftId)) {
        notFound();
    }

    const draft = await prisma.companyProfileDraft.findFirst({
        where: {
            id: profileDraftId,
            workspaceId,
        },
        include: {
            workspace: {
                select: {
                    id: true,
                    displayName: true,
                    employer: {
                        select: {
                            slug: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    if (!draft) notFound();

    const payload = isRecord(draft.payload) ? draft.payload : {};
    const profileConfig = isRecord(payload.profileConfig) ? payload.profileConfig : {};
    const theme = normalizeCompanyTheme(profileConfig.theme ?? DEFAULT_COMPANY_THEME);
    const companyName = stringOrNull(payload.companyName) ?? draft.workspace.displayName;
    const description = stringOrNull(payload.description);
    const logo = stringOrNull(payload.logo);
    const coverImage = stringOrNull(payload.coverImage);
    const website = stringOrNull(payload.website);
    const location = stringOrNull(payload.location);
    const industry = stringOrNull(payload.industry);
    const sections = profileConfig.sections ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <Link
                    href={`/companies/${workspaceId}?tab=profile-drafts`}
                    className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại duyệt hồ sơ
                </Link>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Draft preview - chưa publish
                </span>
            </div>

            <article
                className="overflow-hidden rounded-2xl border border-border shadow-sm"
                style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
            >
                <section
                    className="relative min-h-[320px] border-b"
                    style={{ borderColor: theme.borderColor }}
                >
                    {coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={coverImage}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                            }}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="relative flex min-h-[320px] items-end p-8">
                        <div className="max-w-3xl text-white">
                            <div className="mb-5 flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-white">
                                    {logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={logo} alt={companyName} className="h-full w-full object-contain p-2" />
                                    ) : (
                                        <Building2 className="h-9 w-9 text-slate-700" />
                                    )}
                                </div>
                                <div>
                                    {industry && <p className="text-sm font-semibold text-white/80">{industry}</p>}
                                    <h1 className="text-4xl font-bold">{companyName}</h1>
                                </div>
                            </div>
                            {description && <p className="max-w-2xl text-base leading-7 text-white/90">{description}</p>}
                            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/80">
                                {location && <span>{location}</span>}
                                {website && (
                                    <span className="inline-flex items-center gap-1">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        {website}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="p-6 lg:p-8">
                    <ContentBlocksRenderer
                        blocks={sections}
                        fallbackMarkdown={description}
                        theme={theme}
                    />
                </section>
            </article>
        </div>
    );
}
