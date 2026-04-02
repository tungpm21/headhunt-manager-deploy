"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createJobAction, updateJobAction } from "@/lib/job-actions";
import { Save, Loader2, Briefcase, Building2, Banknote } from "lucide-react";
import { JobOrderWithRelations } from "@/types/job";

type ActionState = { error?: string; success?: boolean; id?: number } | undefined;

interface JobFormProps {
  initialData?: JobOrderWithRelations | null;
  clients: { id: number; companyName: string }[];
}

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}{required && <span className="text-danger ml-1">*</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export function JobForm({ initialData, clients }: JobFormProps) {
  const router = useRouter();

  async function handleAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
    if (initialData?.id) {
      const res = await updateJobAction(initialData.id, _prev, fd);
      return { ...res, id: initialData.id };
    }
    return createJobAction(_prev, fd);
  }

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(handleAction, undefined);

  // Redirect on success
  useEffect(() => {
    if (state?.success && state.id) {
      router.push(`/jobs/${state.id}`);
    }
  }, [state?.success, state?.id, router]);

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      {/* Thông tin Căng bản */}
      <section>
        <h2 className="flex items-center gap-2 mb-4 text-base font-semibold text-foreground border-b border-border pb-2">
          <Briefcase className="h-5 w-5 text-muted" /> Tổng quan
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="title" required>Vị trí tuyển dụng</FieldLabel>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={initialData?.title || ""}
              placeholder="VD: Senior Frontend Developer, HR Manager..."
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="clientId" required>Doanh nghiệp (Client)</FieldLabel>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Building2 className="h-4 w-4 text-muted" />
              </div>
              <select
                id="clientId"
                name="clientId"
                required
                defaultValue={initialData?.clientId || ""}
                className={`${inputCls} pl-10`}
              >
                <option value="">Chọn khách hàng...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
            {clients.length === 0 && (
              <p className="mt-1 text-xs text-danger">Bạn cần tạo Doanh nghiệp trước khi tạo Job Order.</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="description">Mô tả tóm tắt (JD)</FieldLabel>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialData?.description || ""}
              placeholder="Yêu cầu công việc, phúc lợi rút gọn..."
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Thông số chi tiết */}
      <section>
        <h2 className="flex items-center gap-2 mb-4 text-base font-semibold text-foreground border-b border-border pb-2">
          <Banknote className="h-5 w-5 text-muted" /> Chế độ & Yêu cầu
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <FieldLabel htmlFor="salaryMin">Lương tối thiểu (Tr/tháng)</FieldLabel>
            <input
              id="salaryMin"
              name="salaryMin"
              type="number"
              step="0.1"
              defaultValue={initialData?.salaryMin || ""}
              placeholder="VD: 15"
              className={inputCls}
            />
          </div>
          <div>
            <FieldLabel htmlFor="salaryMax">Lương tối đa (Tr/tháng)</FieldLabel>
            <input
              id="salaryMax"
              name="salaryMax"
              type="number"
              step="0.1"
              defaultValue={initialData?.salaryMax || ""}
              placeholder="VD: 30"
              className={inputCls}
            />
          </div>
          <div>
            <FieldLabel htmlFor="quantity">Số lượng cần tuyển</FieldLabel>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue={initialData?.quantity || 1}
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel htmlFor="status" required>Trạng thái</FieldLabel>
            <select id="status" name="status" defaultValue={initialData?.status || "OPEN"} className={inputCls}>
              <option value="OPEN">Đang tuyển (OPEN)</option>
              <option value="PAUSED">Tạm dừng (PAUSED)</option>
              <option value="FILLED">Đã tuyển (FILLED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="deadline">Hạn chót</FieldLabel>
            <input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ""}
              className={inputCls}
            />
          </div>
          <div>
            <FieldLabel htmlFor="feeType">Hình thức Phí dịch vụ</FieldLabel>
            <select id="feeType" name="feeType" defaultValue={initialData?.feeType || ""} className={inputCls}>
              <option value="">Chưa chọn...</option>
              <option value="PERCENTAGE">% Lương gộp/năm</option>
              <option value="FIXED">Giá cố định</option>
            </select>
          </div>
          <div className="sm:col-span-2 xl:col-span-3">
            <FieldLabel htmlFor="fee">Phí dịch vụ (% hoặc VNĐ)</FieldLabel>
            <input
              id="fee"
              name="fee"
              type="number"
              step="0.1"
              defaultValue={initialData?.fee || ""}
              placeholder="VD: 15 (nghĩa là 15%) hoặc 20000000 (nghĩa là 20 triệu)"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Ghi chú nội bộ */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground border-b border-border pb-2">
          Ghi chú quản lý
        </h2>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initialData?.notes || ""}
          placeholder="Lưu ý về vòng phỏng vấn, process offer làm việc với HR bên Khách hàng..."
          className={inputCls}
        />
      </section>

      {/* Submit */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
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
            <><Save className="h-4 w-4" /> Lưu Yêu Cầu Tuyển Dụng</>
          )}
        </button>
      </div>
    </form>
  );
}
