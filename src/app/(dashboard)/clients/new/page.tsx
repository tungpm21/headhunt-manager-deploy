import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClientForm } from "@/components/clients/client-form";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { getOptionsForSelect } from "@/lib/config-options";

export const metadata = {
  title: "Thêm Doanh Nghiệp Mới — Headhunt Manager",
};

export default async function NewClientPage() {
  const [industryOptions, companySizeOptions, statusOptions] = await Promise.all([
    getOptionsForSelect(OPTION_GROUPS.industry),
    getOptionsForSelect(OPTION_GROUPS.companySize),
    getOptionsForSelect(OPTION_GROUPS.clientStatus),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Quay lại danh sách
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thêm Khách hàng Doanh Nghiệp</h1>
            <p className="mt-1 text-sm text-muted">
              Tạo hồ sơ đối tác doanh nghiệp để liên kết với các Job Orders tương lai.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-surface shadow-sm p-6 sm:p-8">
        <ClientForm
          industryOptions={industryOptions}
          companySizeOptions={companySizeOptions}
          statusOptions={statusOptions}
        />
      </div>
    </div>
  );
}
