import { notFound } from "next/navigation";
import { requireViewerScope } from "@/lib/authz";
import { getCandidateById } from "@/lib/candidates";
import { getAllTags } from "@/lib/tags";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCandidatePage({ params }: PageProps) {
  const scope = await requireViewerScope();
  const resolvedParams = await params;
  const candidateId = parseInt(resolvedParams.id, 10);

  if (isNaN(candidateId)) {
    notFound();
  }

  const [candidate, allTags] = await Promise.all([
    getCandidateById(candidateId, scope),
    getAllTags()
  ]);

  if (!candidate) {
    notFound();
  }

  const formCandidate = {
    ...candidate,
    tags: candidate.tags.map((tag) => ({ tagId: tag.tag.id })),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link 
          href={`/candidates/${candidateId}`}
          className="p-2 -ml-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
          title="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sửa thông tin Ứng viên</h1>
          <p className="text-sm text-muted mt-1">
            Cập nhật hồ sơ của {candidate.fullName}
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <CandidateForm allTags={allTags} initialData={formCandidate} />
      </div>
    </div>
  );
}
