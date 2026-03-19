import { getAllTags } from "@/lib/tags";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Thêm ứng viên — Headhunt Manager",
};

export default async function NewCandidatePage() {
  const allTags = await getAllTags();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/candidates" className="flex items-center gap-1 hover:text-primary transition">
          <ChevronLeft className="h-4 w-4" />
          Ứng viên
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Thêm mới</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Thêm ứng viên mới</h1>
        <p className="mt-1 text-sm text-muted">Điền thông tin ứng viên vào form bên dưới.</p>
      </div>

      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <CandidateForm allTags={allTags} />
      </div>
    </div>
  );
}
