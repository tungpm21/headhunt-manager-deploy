"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientAction, updateClientAction } from "@/lib/client-actions";
import { Save, Loader2, Building2 } from "lucide-react";
import type { OptionChoice } from "@/lib/config-options";
import { ClientWithRelations } from "@/types/client";

type ActionState = { error?: string; success?: boolean; id?: number } | undefined;

interface ClientFormProps {
  initialData?: ClientWithRelations | null;
  industryOptions: OptionChoice[];
  companySizeOptions: OptionChoice[];
  locationOptions: OptionChoice[];
  industrialZoneOptions: OptionChoice[];
  statusOptions: OptionChoice[];
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

export function ClientForm({
  initialData,
  industryOptions,
  companySizeOptions,
  locationOptions,
  industrialZoneOptions,
  statusOptions,
}: ClientFormProps) {
  const router = useRouter();

  async function handleAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
    if (initialData?.id) {
      const res = await updateClientAction(initialData.id, _prev, fd);
      return { ...res, id: initialData.id };
    }
    return createClientAction(_prev, fd);
  }

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(handleAction, undefined);

  // Redirect on success
  useEffect(() => {
    if (state?.success && state.id) {
      router.push(`/clients/${state.id}`);
    }
  }, [state?.success, state?.id, router]);

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      {/* Thông tin chính */}
      <section>
        <h2 className="flex items-center gap-2 mb-4 text-base font-semibold text-foreground border-b border-border pb-2">
          <Building2 className="h-5 w-5 text-muted" /> Thông tin doanh nghiệp
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="companyName" required>Tên công ty</FieldLabel>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              defaultValue={initialData?.companyName || ""}
              placeholder="VD: Công ty Cổ phần Công nghệ ABC..."
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel htmlFor="industry">Ngành nghề</FieldLabel>
            <select
              id="industry"
              name="industry"
              defaultValue={initialData?.industry || ""}
              className={inputCls}
            >
              <option value="">Chọn lĩnh vực...</option>
              {industryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="companySize">Quy mô nhân sự</FieldLabel>
            <select
              id="companySize"
              name="companySize"
              defaultValue={initialData?.companySize || ""}
              className={inputCls}
            >
              <option value="">Chọn quy mô...</option>
              {companySizeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="status">Trạng thái quan hệ</FieldLabel>
            <select
              id="status"
              name="status"
              defaultValue={initialData?.status || "ACTIVE"}
              className={inputCls}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="location">Khu vực</FieldLabel>
            <select
              id="location"
              name="location"
              defaultValue={initialData?.location || ""}
              className={inputCls}
            >
              <option value="">Chọn khu vực...</option>
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="industrialZone">Khu công nghiệp</FieldLabel>
            <select
              id="industrialZone"
              name="industrialZone"
              defaultValue={initialData?.industrialZone || ""}
              className={inputCls}
            >
              <option value="">Chọn KCN...</option>
              {industrialZoneOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="address">Địa chỉ trụ sở</FieldLabel>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={initialData?.address || ""}
              placeholder="Số nhà, đường, toà nhà, Phường/Quận, Thành phố..."
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={initialData?.website || ""}
              placeholder="https://example.com"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted">Bắt buộc bao gồm http:// hoặc https://</p>
          </div>

          <div className="mt-4 sm:col-span-2">
            <FieldLabel htmlFor="notes">Ghi chú chung</FieldLabel>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={initialData?.notes || ""}
              placeholder="Văn hóa công ty, quy trình tuyển dụng, các lưu ý đặc biệt khi tư vấn cho khách hàng này..."
              className={inputCls}
            />
          </div>
        </div>
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
            <><Save className="h-4 w-4" /> Lưu thông tin DN</>
          )}
        </button>
      </div>
    </form>
  );
}
