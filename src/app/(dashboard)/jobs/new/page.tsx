import { Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { JobForm } from "@/components/jobs/job-form";
import { getAllClients } from "@/lib/clients";

export const metadata = {
  title: "Tạo Yêu Cầu Tuyển Dụng Mới — Headhunt Manager",
};

export default async function NewJobPage() {
  const clients = await getAllClients();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Quay lại danh sách
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tạo Yêu Cầu Tuyển Dụng (Job Order)</h1>
            <p className="mt-1 text-sm text-muted">
              Mở mới một vị trí đang cần tuyển dụng cho khách hàng của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6 sm:p-8">
        <JobForm clients={clients} />
      </div>
    </div>
  );
}
