import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllTags } from "@/lib/tags";
import { getCandidateById } from "@/lib/candidates";
import { CandidateInfo } from "@/components/candidates/candidate-info";
import { CandidateTags } from "@/components/candidates/candidate-tags";
import { CandidateNotes } from "@/components/candidates/candidate-notes";
import { CandidateHeaderActions } from "@/components/candidates/candidate-header-actions";
import { CandidateDetailTabs } from "@/components/candidates/candidate-detail-tabs";
import { CvViewer } from "@/components/candidates/cv-viewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const candidateId = parseInt(resolvedParams.id, 10);

  if (isNaN(candidateId)) {
    notFound();
  }

  const [candidate, allTags] = await Promise.all([
    getCandidateById(candidateId),
    getAllTags(),
  ]);

  if (!candidate) {
    notFound();
  }

  const previewCvUrl =
    candidate.cvFiles.find((cv) => cv.isPrimary)?.fileUrl ??
    candidate.cvFileUrl;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/candidates"
            className="p-2 -ml-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {candidate.fullName}
              <span className="text-xs font-medium px-2.5 py-1 bg-surface border border-border rounded-full text-muted-foreground whitespace-nowrap">
                #{candidate.id}
              </span>
            </h1>
            <p className="text-sm text-muted mt-1">
              Đã tạo ngày {candidate.createdAt.toLocaleDateString("vi-VN")} bởi {candidate.createdBy?.name || "Hệ thống"}
            </p>
          </div>
        </div>

        <CandidateHeaderActions
          candidateId={candidate.id}
          currentStatus={candidate.status}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 lg:h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2">
          <CandidateInfo candidate={candidate} />

          <CandidateDetailTabs
            candidateId={candidate.id}
            cvFiles={candidate.cvFiles}
            languages={candidate.languages}
            workHistory={candidate.workHistory}
          />

          <CandidateTags
            candidateId={candidate.id}
            currentTags={candidate.tags}
            allTags={allTags}
          />

          <CandidateNotes
            candidateId={candidate.id}
            notes={candidate.notes}
          />
        </div>

        <div className="lg:h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-1">
          <CvViewer cvUrl={previewCvUrl} />
        </div>
      </div>
    </div>
  );
}
