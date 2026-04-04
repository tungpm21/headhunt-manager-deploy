"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Briefcase, Banknote } from "lucide-react";
import { ClientSelect } from "@/components/clients/client-select";
import { createJobAction, updateJobAction } from "@/lib/job-actions";
import { ClientSelectOption } from "@/types/client";
import {
  JobOrderWithRelations,
  SerializedJobOrderWithRelations,
} from "@/types/job";

type ActionState = { error?: string; success?: boolean; id?: number } | undefined;

interface JobFormProps {
  initialData?: JobOrderWithRelations | SerializedJobOrderWithRelations | null;
  initialClients: ClientSelectOption[];
  users: { id: number; name: string }[];
  onCancel?: () => void;
  onSuccess?: () => void;
}

const INDUSTRIES = [
  "IT / Phan mem",
  "Tai chinh / Ngan hang",
  "Marketing / Truyen thong",
  "Ky thuat / San xuat",
  "Kinh doanh / Sales",
  "Nhan su",
  "Hanh chinh",
  "Khac",
];

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-foreground"
    >
      {children}
      {required ? <span className="ml-1 text-danger">*</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export function JobForm({
  initialData,
  initialClients,
  users,
  onCancel,
  onSuccess,
}: JobFormProps) {
  const router = useRouter();

  async function handleAction(
    _prev: ActionState,
    fd: FormData
  ): Promise<ActionState> {
    if (initialData?.id) {
      const result = await updateJobAction(initialData.id, _prev, fd);
      return { ...result, id: initialData.id };
    }

    return createJobAction(_prev, fd);
  }

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    handleAction,
    undefined
  );

  useEffect(() => {
    if (!state?.success || !state.id) {
      return;
    }

    if (initialData?.id) {
      onSuccess?.();
      router.refresh();
      return;
    }

    router.push(`/jobs/${state.id}`);
  }, [initialData?.id, onSuccess, router, state?.id, state?.success]);

  return (
    <form action={formAction} className="space-y-8">
      {state?.error ? (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      ) : null}

      <section>
        <h2 className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-base font-semibold text-foreground">
          <Briefcase className="h-5 w-5 text-muted" />
          Tong quan
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="title" required>
              Vi tri tuyen dung
            </FieldLabel>
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
            <FieldLabel htmlFor="clientId" required>
              Doanh nghiep (Client)
            </FieldLabel>
            <ClientSelect
              name="clientId"
              required
              defaultValue={initialData?.clientId ?? null}
              defaultLabel={initialData?.client?.companyName ?? null}
              initialOptions={initialClients}
            />
            {initialClients.length === 0 ? (
              <p className="mt-1 text-xs text-danger">
                Ban can tao doanh nghiep truoc khi tao Job Order.
              </p>
            ) : null}
          </div>

          <div>
            <FieldLabel htmlFor="industry">Nganh nghe</FieldLabel>
            <select
              id="industry"
              name="industry"
              defaultValue={initialData?.industry || ""}
              className={inputCls}
            >
              <option value="">Chon nganh nghe...</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="location">Khu vuc</FieldLabel>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={initialData?.location || ""}
              placeholder="TP.HCM, Ha Noi..."
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="requiredSkills">Ky nang yeu cau</FieldLabel>
            <input
              id="requiredSkills"
              name="requiredSkills"
              type="text"
              defaultValue={initialData?.requiredSkills?.join(", ") || ""}
              placeholder="Node.js, TypeScript, PostgreSQL..."
              className={inputCls}
            />
            <p className="mt-1.5 text-xs text-muted">
              Phan cach bang dau phay de dung cho tim kiem va goi y gan ung vien.
            </p>
          </div>

          <div className="sm:col-span-2">
            <FieldLabel htmlFor="description">Mo ta tom tat (JD)</FieldLabel>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialData?.description || ""}
              placeholder="Yeu cau cong viec, phuc loi rut gon..."
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-base font-semibold text-foreground">
          <Banknote className="h-5 w-5 text-muted" />
          Che do va yeu cau
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <FieldLabel htmlFor="salaryMin">Luong toi thieu (Tr/thang)</FieldLabel>
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
            <FieldLabel htmlFor="salaryMax">Luong toi da (Tr/thang)</FieldLabel>
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
            <FieldLabel htmlFor="quantity">So luong can tuyen</FieldLabel>
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
            <FieldLabel htmlFor="assignedToId">Recruiter phu trach</FieldLabel>
            <select
              id="assignedToId"
              name="assignedToId"
              defaultValue={initialData?.assignedToId || ""}
              className={inputCls}
            >
              <option value="">Chua phan cong...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="status" required>
              Trang thai
            </FieldLabel>
            <select
              id="status"
              name="status"
              defaultValue={initialData?.status || "OPEN"}
              className={inputCls}
            >
              <option value="OPEN">Dang tuyen (OPEN)</option>
              <option value="PAUSED">Tam dung (PAUSED)</option>
              <option value="FILLED">Da tuyen (FILLED)</option>
              <option value="CANCELLED">Da huy (CANCELLED)</option>
            </select>
          </div>

          <div>
            <FieldLabel htmlFor="deadline">Han chot</FieldLabel>
            <input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={
                initialData?.deadline
                  ? new Date(initialData.deadline).toISOString().split("T")[0]
                  : ""
              }
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel htmlFor="feeType">Hinh thuc phi dich vu</FieldLabel>
            <select
              id="feeType"
              name="feeType"
              defaultValue={initialData?.feeType || ""}
              className={inputCls}
            >
              <option value="">Chua chon...</option>
              <option value="PERCENTAGE">% Luong gop/nam</option>
              <option value="FIXED">Gia co dinh</option>
            </select>
          </div>

          <div className="sm:col-span-2 xl:col-span-3">
            <FieldLabel htmlFor="fee">Phi dich vu (% hoac VND)</FieldLabel>
            <input
              id="fee"
              name="fee"
              type="number"
              step="0.1"
              defaultValue={initialData?.fee || ""}
              placeholder="VD: 15 hoac 20000000"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 border-b border-border pb-2 text-base font-semibold text-foreground">
          Ghi chu quan ly
        </h2>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initialData?.notes || ""}
          placeholder="Luu y ve phong van, process offer voi HR ben khach hang..."
          className={inputCls}
        />
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel();
              return;
            }

            router.back();
          }}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
        >
          Huy
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Dang luu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Luu Yeu Cau Tuyen Dung
            </>
          )}
        </button>
      </div>
    </form>
  );
}
