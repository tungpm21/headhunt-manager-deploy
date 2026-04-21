import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getJobPostingDetail } from "@/lib/employer-actions";
import { EditJobPostingForm } from "./EditJobPostingForm";

export default async function EditJobPostingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = Number.parseInt(id, 10);

  if (Number.isNaN(jobId)) {
    notFound();
  }

  const job = await getJobPostingDetail(jobId);

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/employer/job-postings/${job.id}`}
          className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa tin tuyển dụng</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Cập nhật nội dung tin để phản ánh đúng nhu cầu tuyển dụng hiện tại.
          </p>
        </div>
      </div>

      <EditJobPostingForm job={job} />
    </div>
  );
}
