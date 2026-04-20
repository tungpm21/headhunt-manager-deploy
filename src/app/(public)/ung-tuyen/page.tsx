import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ApplyForm } from "@/components/public/ApplyForm";
import { LogoImage } from "@/components/public/LogoImage";

export const metadata = {
  title: "Ứng tuyển",
  description: "Nộp hồ sơ ứng tuyển việc làm tại FDIWork",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const jobId = params.job ? Number(params.job) : null;

  if (!jobId) notFound();

  // Fetch job info for display
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      employer: {
        select: { companyName: true, logo: true, slug: true },
      },
    },
  });

  if (!job || job.status !== "APPROVED") notFound();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-fdi-text-secondary)]">
            <Link
              href={`/viec-lam/${job.slug}`}
              className="flex items-center gap-1 hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--color-fdi-primary)] to-[var(--color-fdi-accent)] px-6 sm:px-8 py-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center">
                <LogoImage
                  src={job.employer.logo}
                  alt={job.employer.companyName}
                  className="h-full w-full object-contain rounded-lg p-1"
                  iconSize="h-5 w-5 text-white"
                />
              </div>
              <div>
                <p className="text-white/80 text-xs">{job.employer.companyName}</p>
              </div>
            </div>
            <h1
              className="text-lg sm:text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ứng tuyển: {job.title}
            </h1>
          </div>

          {/* Form */}
          <div className="px-6 sm:px-8 py-6">
            <Suspense>
              <ApplyForm
                jobId={job.id}
                jobTitle={job.title}
                companyName={job.employer.companyName}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
