"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "@prisma/client";
import { createCandidateAction, updateCandidateAction } from "@/lib/actions";
import { TagSelector } from "@/components/candidates/tag-selector";
import { AvatarUpload } from "@/components/candidates/avatar-upload";
import { Save, Loader2, Upload, FileText, X, Download } from "lucide-react";

type ActionState = { error?: string; success?: boolean; id?: number } | undefined;

interface CandidateFormProps {
  allTags: Tag[];
  initialData?: any;
}

const LOCATIONS = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Khác"];
const INDUSTRIES = [
  "IT / Phần mềm", "Tài chính / Ngân hàng", "Marketing / Truyền thông",
  "Kỹ thuật / Sản xuất", "Kinh doanh / Sales", "Nhân sự", "Hành chính", "Khác",
];

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}{required && <span className="text-danger ml-1">*</span>}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export function CandidateForm({ allTags, initialData }: CandidateFormProps) {
  const router = useRouter();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initialData?.tags?.map((t: any) => t.tagId) || []
  );
  const [cvFile, setCvFile] = useState<File | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const selectedTagIdsRef = useRef<number[]>([]);
  selectedTagIdsRef.current = selectedTagIds;

  async function handleAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
    selectedTagIdsRef.current.forEach((id) => fd.append("tagIds", String(id)));
    if (initialData?.id) {
      const res = await updateCandidateAction(initialData.id, _prev, fd);
      return { ...res, id: initialData.id };
    }
    return createCandidateAction(_prev, fd);
  }

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(handleAction, undefined);

  // Redirect on success & auto-upload CV
  useEffect(() => {
    if (state?.success && state.id) {
      const candidateId = state.id;
      if (cvFile) {
        const fd = new FormData();
        fd.append("cv", cvFile);
        fetch(`/api/candidates/${candidateId}/cv`, { method: "POST", body: fd })
          .then(() => router.push(`/candidates/${candidateId}`))
          .catch(() => router.push(`/candidates/${candidateId}`));
      } else {
        router.push(`/candidates/${candidateId}`);
      }
    }
  }, [state?.success, state?.id, router, cvFile]);

  return (
    <form action={formAction} onSubmit={(e) => {
      const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value.trim();
      const phone = (e.currentTarget.elements.namedItem('phone') as HTMLInputElement)?.value.trim();
      if (!email && !phone) {
        e.preventDefault();
        alert("Vui lòng nhập Email HOẶC Số điện thoại.");
      }
    }} className="space-y-8">
      {state?.error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      {/* Avatar Upload */}
      <div className="flex justify-center mb-6">
        <AvatarUpload disabled={isPending} />
      </div>

      {/* Section: Thông tin cơ bản */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground border-b border-border pb-2">
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <FieldLabel htmlFor="fullName" required>Họ và tên</FieldLabel>
            <input id="fullName" name="fullName" type="text" required defaultValue={initialData?.fullName} placeholder="Nguyễn Văn A" className={inputCls} />
          </div>
          <div>
            <FieldLabel htmlFor="phone" required>Số điện thoại</FieldLabel>
            <input id="phone" name="phone" type="tel" defaultValue={initialData?.phone || ""} placeholder="0901234567" className={inputCls} />
          </div>
          <div>
            <FieldLabel htmlFor="email" required>Email</FieldLabel>
            <input id="email" name="email" type="email" defaultValue={initialData?.email || ""} placeholder="email@example.com" className={inputCls} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
             <p className="text-xs text-muted mb-2 italic">* Cần nhập ít nhất Số điện thoại HOẶC Email</p>
          </div>
          <div>
            <FieldLabel htmlFor="dateOfBirth">Ngày sinh</FieldLabel>
            <input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : ""} className={inputCls} />
          </div>
          <div>
            <FieldLabel htmlFor="gender">Giới tính</FieldLabel>
            <select id="gender" name="gender" defaultValue={initialData?.gender || ""} className={inputCls}>
              <option value="">Chọn...</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="location" required>Khu vực</FieldLabel>
            <select id="location" name="location" required defaultValue={initialData?.location || ""} className={inputCls}>
              <option value="">Chọn...</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <FieldLabel htmlFor="address">Địa chỉ</FieldLabel>
            <input id="address" name="address" type="text" defaultValue={initialData?.address || ""} placeholder="Số nhà, đường, phường..." className={inputCls} />
          </div>
        </div>
      </section>

      {/* Section: Nghề nghiệp */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground border-b border-border pb-2">
          Nghề nghiệp
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <FieldLabel htmlFor="currentPosition">Vị trí hiện tại</FieldLabel>
            <input id="currentPosition" name="currentPosition" type="text" defaultValue={initialData?.currentPosition || ""} placeholder="Senior Developer" className={inputCls} />
          </div>
          <div>
            <FieldLabel htmlFor="currentCompany">Công ty hiện tại</FieldLabel>
            <input id="currentCompany" name="currentCompany" type="text" defaultValue={initialData?.currentCompany || ""} placeholder="ABC Company" className={inputCls} />
          </div>
          <div>
            <FieldLabel htmlFor="industry" required>Ngành nghề</FieldLabel>
            <select id="industry" name="industry" required defaultValue={initialData?.industry || ""} className={inputCls}>
              <option value="">Chọn...</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="yearsOfExp">Số năm kinh nghiệm</FieldLabel>
            <input id="yearsOfExp" name="yearsOfExp" type="number" min={0} max={50} defaultValue={initialData?.yearsOfExp || ""} placeholder="3" className={inputCls} />
          </div>
          <div>
            <FieldLabel htmlFor="currentSalary">Lương hiện tại (tr/tháng)</FieldLabel>
            <input id="currentSalary" name="currentSalary" type="number" min={0} defaultValue={initialData?.currentSalary || ""} placeholder="20" className={inputCls} />
          </div>
          <div>
            <FieldLabel htmlFor="expectedSalary">Lương kỳ vọng (tr/tháng)</FieldLabel>
            <input id="expectedSalary" name="expectedSalary" type="number" min={0} defaultValue={initialData?.expectedSalary || ""} placeholder="30" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Section: Trạng thái & Nguồn */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground border-b border-border pb-2">
          Trạng thái & Nguồn
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <FieldLabel htmlFor="status" required>Trạng thái</FieldLabel>
            <select id="status" name="status" required defaultValue={initialData?.status || "AVAILABLE"} className={inputCls}>
              <option value="AVAILABLE">Sẵn sàng</option>
              <option value="EMPLOYED">Đã có việc</option>
              <option value="INTERVIEWING">Đang phỏng vấn</option>
              <option value="BLACKLIST">Blacklist</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="source">Nguồn</FieldLabel>
            <select id="source" name="source" defaultValue={initialData?.source || ""} className={inputCls}>
              <option value="">Chọn...</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="TOPCV">TopCV</option>
              <option value="REFERRAL">Giới thiệu</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="VIETNAMWORKS">VietnamWorks</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="sourceDetail">Chi tiết nguồn</FieldLabel>
            <input id="sourceDetail" name="sourceDetail" type="text" defaultValue={initialData?.sourceDetail || ""} placeholder="VD: Link LinkedIn, tên người giới thiệu..." className={inputCls} />
          </div>
        </div>
      </section>

      {/* Section: Tags */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground border-b border-border pb-2">Tags</h2>
        <TagSelector allTags={allTags} selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />
      </section>

      {/* Section: CV / Hồ sơ */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground border-b border-border pb-2">
          CV / Hồ sơ
        </h2>

        {/* Show current CV if editing and has one */}
        {initialData?.cvFileUrl && initialData?.cvFileName && !cvFile && (
          <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 px-4 py-3 mb-3">
            <FileText className="h-8 w-8 text-success flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{initialData.cvFileName}</p>
              <p className="text-xs text-muted mt-0.5">CV hiện tại</p>
            </div>
            <a
              href={initialData.cvFileUrl}
              download={initialData.cvFileName}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition"
            >
              <Download className="h-3.5 w-3.5" />
              Tải
            </a>
          </div>
        )}

        {/* Selected new file preview */}
        {cvFile && (
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 mb-3">
            <FileText className="h-8 w-8 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{cvFile.name}</p>
              <p className="text-xs text-muted mt-0.5">
                {(cvFile.size / 1024 / 1024).toFixed(1)} MB • {initialData?.cvFileUrl ? "Thay thế CV cũ" : "Sẽ upload khi lưu"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setCvFile(null); if (cvInputRef.current) cvInputRef.current.value = ""; }}
              className="text-muted hover:text-danger transition"
              title="Bỏ chọn file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload zone */}
        <div
          onClick={() => cvInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-surface/50 p-6 text-center cursor-pointer transition"
        >
          <Upload className="h-7 w-7 text-muted/50" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {cvFile || initialData?.cvFileUrl ? "Chọn file khác" : "Chọn file CV"}
            </p>
            <p className="text-xs text-muted mt-1">PDF, Word (.doc, .docx) • Tối đa 10MB</p>
          </div>
          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
                if (!allowed.includes(file.type)) {
                  alert("Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)");
                  return;
                }
                if (file.size > 10 * 1024 * 1024) {
                  alert("File quá lớn. Tối đa 10MB.");
                  return;
                }
                setCvFile(file);
              }
            }}
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition"
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
          ) : (
            <><Save className="h-4 w-4" /> Lưu ứng viên</>
          )}
        </button>
      </div>
    </form>
  );
}
