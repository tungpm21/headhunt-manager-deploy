"use client";

import { useState, useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "@prisma/client";
import { updateCandidateAction } from "@/lib/actions";
import { TagSelector } from "@/components/candidates/tag-selector";
import { AvatarUpload } from "@/components/candidates/avatar-upload";
import { CandidateWithRelations } from "@/types/candidate";
import { Loader2, Save, Pencil, X } from "lucide-react";

type ActionState = { error?: string; success?: boolean } | undefined;

const LOCATIONS = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Khác"];
const INDUSTRIES = [
  "IT / Phần mềm", "Tài chính / Ngân hàng", "Marketing / Truyền thông",
  "Kỹ thuật / Sản xuất", "Kinh doanh / Sales", "Nhân sự", "Hành chính", "Khác",
];

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

interface EditCandidateFormProps {
  candidate: CandidateWithRelations;
  allTags: Tag[];
}

export function EditCandidateForm({ candidate, allTags }: EditCandidateFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    candidate.tags.map((ct) => ct.tag.id)
  );

  const selectedTagIdsRef = useRef<number[]>(selectedTagIds);
  selectedTagIdsRef.current = selectedTagIds;

  async function handleUpdate(_prev: ActionState, fd: FormData): Promise<ActionState> {
    selectedTagIdsRef.current.forEach((id) => fd.append("tagIds", String(id)));
    return updateCandidateAction(candidate.id, _prev, fd);
  }

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(handleUpdate, undefined);

  return (
    <div>
      {/* Edit toggle */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setIsEditing((v) => !v)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
            isEditing
              ? "border-border text-muted hover:bg-surface"
              : "border-primary text-primary hover:bg-primary/5"
          }`}
        >
          {isEditing ? <><X className="h-4 w-4" /> Hủy chỉnh sửa</> : <><Pencil className="h-4 w-4" /> Chỉnh sửa</>}
        </button>
      </div>

      {state?.error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <form key={String(candidate.updatedAt)} action={isEditing ? formAction : undefined} onSubmit={(e) => {
        if (!isEditing) return;
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value.trim();
        const phone = (e.currentTarget.elements.namedItem('phone') as HTMLInputElement)?.value.trim();
        if (!email && !phone) {
          e.preventDefault();
          alert("Vui lòng nhập Email HOẶC Số điện thoại.");
        }
      }} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex justify-center mb-6">
          <AvatarUpload currentAvatarUrl={candidate.avatarUrl} disabled={!isEditing} />
        </div>

        {/* Basic Info */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wide">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Họ và tên *</label>
              <input name="fullName" type="text" defaultValue={candidate.fullName} required disabled={!isEditing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Số điện thoại *</label>
              <input name="phone" type="tel" defaultValue={candidate.phone ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Email *</label>
              <input name="email" type="email" defaultValue={candidate.email ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
               <p className="text-xs text-muted mb-2 italic">* Cần nhập ít nhất Số điện thoại HOẶC Email</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Ngày sinh</label>
              <input name="dateOfBirth" type="date" defaultValue={candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().split("T")[0] : ""} disabled={!isEditing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Giới tính</label>
              <select name="gender" defaultValue={candidate.gender ?? ""} disabled={!isEditing} className={inputCls}>
                <option value="">Chọn...</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Khu vực *</label>
              <select name="location" defaultValue={candidate.location ?? ""} required disabled={!isEditing} className={inputCls}>
                <option value="">Chọn...</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-muted">Địa chỉ</label>
              <input name="address" type="text" defaultValue={candidate.address ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Career */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wide">Nghề nghiệp</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Vị trí hiện tại</label>
              <input name="currentPosition" type="text" defaultValue={candidate.currentPosition ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Công ty hiện tại</label>
              <input name="currentCompany" type="text" defaultValue={candidate.currentCompany ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Ngành nghề *</label>
              <select name="industry" defaultValue={candidate.industry ?? ""} required disabled={!isEditing} className={inputCls}>
                <option value="">Chọn...</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Năm kinh nghiệm</label>
              <input name="yearsOfExp" type="number" min={0} defaultValue={candidate.yearsOfExp ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Lương hiện tại (tr)</label>
              <input name="currentSalary" type="number" min={0} defaultValue={candidate.currentSalary ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Lương kỳ vọng (tr)</label>
              <input name="expectedSalary" type="number" min={0} defaultValue={candidate.expectedSalary ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Status & Source */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wide">Trạng thái & Nguồn</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Trạng thái *</label>
              <select name="status" defaultValue={candidate.status} required disabled={!isEditing} className={inputCls}>
                <option value="AVAILABLE">Sẵn sàng</option>
                <option value="EMPLOYED">Đã có việc</option>
                <option value="INTERVIEWING">Đang phỏng vấn</option>
                <option value="BLACKLIST">Blacklist</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Nguồn</label>
              <select name="source" defaultValue={candidate.source ?? ""} disabled={!isEditing} className={inputCls}>
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
              <label className="mb-1 block text-xs font-medium text-muted">Chi tiết nguồn</label>
              <input name="sourceDetail" type="text" defaultValue={candidate.sourceDetail ?? ""} disabled={!isEditing} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Tags */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted uppercase tracking-wide">Tags</h3>
          {isEditing ? (
            <TagSelector allTags={allTags} selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {candidate.tags.length === 0 ? (
                <p className="text-sm text-muted">Chưa có tags nào.</p>
              ) : (
                candidate.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="inline-block rounded-full px-3 py-1 text-sm font-medium border"
                    style={{ borderColor: tag.color + "40", color: tag.color, backgroundColor: tag.color + "10" }}
                  >
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          )}
        </section>

        {/* Save button */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-surface transition">
              Hủy
            </button>
            <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition">
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</> : <><Save className="h-4 w-4" /> Lưu thay đổi</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
