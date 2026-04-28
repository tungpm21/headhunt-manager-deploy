import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, PencilLine } from "lucide-react";
import { getEmployerById } from "@/lib/moderation-actions";
import {
  normalizeCompanyCapabilities,
  normalizeCompanyTheme,
  normalizeContentBlocks,
} from "@/lib/content-blocks";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { getOptionsForSelect, resolveConfigOptionValue } from "@/lib/config-options";
import { EmployerEditForm } from "./employer-edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  SUSPENDED: { label: "Bị khóa", className: "bg-red-100 text-red-700" },
};

export default async function EmployerEditPage({ params }: PageProps) {
  const resolvedParams = await params;
  const employerId = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(employerId)) {
    notFound();
  }

  const employer = await getEmployerById(employerId);

  if (!employer) {
    notFound();
  }

  const [industryOptions, companySizeOptions, locationOptions, industrialZoneOptions] = await Promise.all([
    getOptionsForSelect(OPTION_GROUPS.industry, { currentValue: employer.industry }),
    getOptionsForSelect(OPTION_GROUPS.companySize, { currentValue: employer.companySize }),
    getOptionsForSelect(OPTION_GROUPS.location, { currentValue: employer.location }),
    getOptionsForSelect(OPTION_GROUPS.industrialZone, { currentValue: employer.industrialZone }),
  ]);
  const [selectedIndustryValue, selectedLocationValue, selectedIndustrialZoneValue] = await Promise.all([
    resolveConfigOptionValue(OPTION_GROUPS.industry, employer.industry),
    resolveConfigOptionValue(OPTION_GROUPS.location, employer.location),
    resolveConfigOptionValue(OPTION_GROUPS.industrialZone, employer.industrialZone),
  ]);

  const statusConfig = STATUS_CONFIG[employer.status] ?? {
    label: employer.status,
    className: "bg-gray-100 text-gray-600",
  };

  const serializedEmployer = {
    id: employer.id,
    email: employer.email,
    companyName: employer.companyName,
    logo: employer.logo,
    coverImage: employer.coverImage,
    description: employer.description,
    industry: selectedIndustryValue ?? employer.industry,
    companySize: employer.companySize,
    address: employer.address,
    location: selectedLocationValue ?? employer.location,
    industrialZone: selectedIndustrialZoneValue ?? employer.industrialZone,
    website: employer.website,
    phone: employer.phone,
    status: employer.status,
    slug: employer.slug,
    updatedAt: employer.updatedAt.toISOString(),
    coverPositionX: employer.coverPositionX ?? 50,
    coverPositionY: employer.coverPositionY ?? 50,
    coverZoom: employer.coverZoom ?? 100,
    profileConfig: employer.profileConfig
      ? {
          theme: normalizeCompanyTheme(employer.profileConfig.theme),
          capabilities: normalizeCompanyCapabilities(employer.profileConfig.capabilities),
          sections: normalizeContentBlocks(employer.profileConfig.sections),
          primaryVideoUrl: employer.profileConfig.primaryVideoUrl,
        }
      : null,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link
          href={`/employers/${employer.id}`}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Chi tiết employer
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground truncate">Chỉnh sửa công ty</span>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PencilLine className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  Chỉnh sửa trang công ty
                </h1>
                <p className="text-sm text-muted mt-1">
                  Cập nhật thông tin hiển thị trên FDIWork public cho {employer.companyName}.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted">
                <Building2 className="h-3.5 w-3.5" />
                {employer.companyName}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <EmployerEditForm
        employer={serializedEmployer}
        industryOptions={industryOptions}
        companySizeOptions={companySizeOptions}
        locationOptions={locationOptions}
        industrialZoneOptions={industrialZoneOptions}
      />
    </div>
  );
}
