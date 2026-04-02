"use client";

import { useState, type ComponentType } from "react";
import {
  Briefcase,
  Building2,
  CalendarClock,
  FileText,
  MapPin,
  Pencil,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { JobForm } from "@/components/jobs/job-form";
import { SerializedJobOrderWithRelations } from "@/types/job";

const statusMap = {
  OPEN: {
    label: "Đang tuyển",
    className: "bg-success/10 text-success",
  },
  PAUSED: {
    label: "Tạm dừng",
    className: "bg-warning/10 text-warning",
  },
  FILLED: {
    label: "Đã tuyển xong",
    className: "bg-primary/10 text-primary",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-danger/10 text-danger",
  },
} as const;

const priorityMap = {
  LOW: {
    label: "Ưu tiên thấp",
    className: "bg-muted/20 text-muted",
  },
  MEDIUM: {
    label: "Ưu tiên vừa",
    className: "bg-primary/10 text-primary",
  },
  HIGH: {
    label: "Ưu tiên cao",
    className: "bg-warning/10 text-warning",
  },
  URGENT: {
    label: "Khẩn cấp",
    className: "bg-danger/10 text-danger",
  },
} as const;

function formatMoney(value: number | null | undefined) {
  if (value == null) {
    return null;
  }

  return `${value.toLocaleString("vi-VN")} triệu/tháng`;
}

function formatSalaryRange(job: SerializedJobOrderWithRelations) {
  const salaryMin = formatMoney(job.salaryMin);
  const salaryMax = formatMoney(job.salaryMax);

  if (salaryMin && salaryMax) {
    return `${salaryMin} - ${salaryMax}`;
  }

  return salaryMin || salaryMax || "Chưa cập nhật mức lương";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function JobInfoCard({
  job,
  clients,
}: {
  job: SerializedJobOrderWithRelations;
  clients: { id: number; companyName: string }[];
}) {
  const [isEditing, setIsEditing] = useState(false);

  const statusMeta = statusMap[job.status];
  const priorityMeta = priorityMap[job.priority];
  const skillList =
    job.requiredSkills.length > 0 ? job.requiredSkills : ["Chưa cập nhật kỹ năng"];

  if (isEditing) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Chỉnh sửa yêu cầu tuyển dụng
            </h2>
            <p className="mt-1 text-sm text-muted">
              Cập nhật thông tin job order và lưu thay đổi ngay trên trang này.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
          >
            Đóng
          </button>
        </div>

        <JobForm
          initialData={job}
          clients={clients}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{job.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${priorityMeta.className}`}
                >
                  {priorityMeta.label}
                </span>
              </div>
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-muted">
            {job.description || "Chưa cập nhật mô tả tóm tắt cho job order này."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Pencil className="h-4 w-4" />
          Chỉnh sửa
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoItem
          icon={Building2}
          label="Doanh nghiệp"
          value={job.client.companyName}
        />
        <InfoItem
          icon={MapPin}
          label="Khu vực"
          value={job.location || "Chưa cập nhật địa điểm"}
        />
        <InfoItem
          icon={Wallet}
          label="Mức lương"
          value={formatSalaryRange(job)}
        />
        <InfoItem
          icon={Users}
          label="Số lượng tuyển"
          value={`${job.quantity} vị trí`}
        />
        <InfoItem
          icon={CalendarClock}
          label="Deadline"
          value={formatDate(job.deadline)}
        />
        <InfoItem
          icon={Target}
          label="Ngành nghề"
          value={job.industry || "Chưa cập nhật ngành nghề"}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-background px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-semibold text-foreground">Kỹ năng yêu cầu</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {skillList.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background px-4 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-semibold text-foreground">Ghi chú nội bộ</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {job.notes || "Chưa có ghi chú nội bộ cho job order này."}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
