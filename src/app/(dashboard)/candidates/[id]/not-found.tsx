import Link from "next/link";
import { UserX } from "lucide-react";

export default function CandidateNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-surface p-6 rounded-full border border-border mb-6">
        <UserX className="h-12 w-12 text-muted" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Không tìm thấy ứng viên
      </h2>
      <p className="text-muted max-w-md mb-8">
        Ứng viên này có thể đã bị xóa hoặc đường dẫn không hợp lệ. Vui lòng kiểm tra lại.
      </p>
      <Link
        href="/candidates"
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition"
      >
        Trở về danh sách
      </Link>
    </div>
  );
}
