import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Code2,
  DollarSign,
  Layers,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

interface CandidateInfoProps {
  candidate: {
    avatarUrl: string | null;
    fullName: string;
    source: string | null;
    phone: string | null;
    email: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    location: string | null;
    address: string | null;
    currentPosition: string | null;
    currentCompany: string | null;
    industry: string | null;
    yearsOfExp: number | null;
    currentSalary: number | null;
    expectedSalary: number | null;
    level: string | null;
    skills: string[];
  };
}

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value?: string | null;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 border-b border-border/50 py-2 last:border-0 last:pb-0">
      <Icon className="mt-0.5 h-4 w-4 text-muted" />
      <div className="flex-1">
        <p className="mb-0.5 text-xs font-medium text-muted">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || "-"}</p>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGenderText(gender: string | null) {
  switch (gender) {
    case "MALE":
      return "Nam";
    case "FEMALE":
      return "Nữ";
    case "OTHER":
      return "Khác";
    default:
      return "Không khả dụng";
  }
}

function getLevelText(level: string | null) {
  const map: Record<string, string> = {
    INTERN: "Intern",
    JUNIOR: "Junior",
    MID_LEVEL: "Mid-level",
    SENIOR: "Senior",
    LEAD: "Lead",
    MANAGER: "Manager",
    DIRECTOR: "Director",
  };

  return level ? map[level] || level : null;
}

export function CandidateInfo({ candidate }: CandidateInfoProps) {
  const birthAndGender = `${candidate.dateOfBirth ? candidate.dateOfBirth.toLocaleDateString("vi-VN") : "-"} • ${getGenderText(candidate.gender)}`;
  const locationAndAddress = `${candidate.location || "-"}${candidate.address ? ` (${candidate.address})` : ""}`;
  const industryAndExperience = `${candidate.industry || "-"} • ${candidate.yearsOfExp || 0} năm`;
  const salarySummary = `Hiện tại: ${candidate.currentSalary ? `${candidate.currentSalary} triệu` : "-"} / Mong muốn: ${candidate.expectedSalary ? `${candidate.expectedSalary} triệu` : "-"}`;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border bg-muted/10 p-4 text-sm font-semibold">
          Thông tin liên hệ
        </div>
        <div className="flex flex-col items-center border-b border-border/50 p-5">
          {candidate.avatarUrl ? (
            <>
              {/* Avatar URLs are user-provided and not constrained to a Next image allowlist. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={candidate.avatarUrl}
                alt={candidate.fullName}
                className="mb-3 h-20 w-20 rounded-full border-2 border-primary/20 object-cover shadow-inner"
              />
            </>
          ) : (
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary shadow-inner">
              {getInitials(candidate.fullName)}
            </div>
          )}
          <h2 className="text-center text-lg font-bold text-foreground">
            {candidate.fullName}
          </h2>
          <span className="mt-2 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Nguồn: {candidate.source || "Tự nhiên"}
          </span>
        </div>
        <div className="space-y-1 p-5">
          <InfoRow icon={Phone} label="Số điện thoại" value={candidate.phone} />
          <InfoRow icon={Mail} label="Email" value={candidate.email} />
          <InfoRow icon={Calendar} label="Ngày sinh và giới tính" value={birthAndGender} />
          <InfoRow icon={MapPin} label="Khu vực và địa chỉ" value={locationAndAddress} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border bg-muted/10 p-4 text-sm font-semibold">
          Nghề nghiệp
        </div>
        <div className="space-y-1 p-5">
          <InfoRow icon={Briefcase} label="Vị trí hiện tại" value={candidate.currentPosition} />
          <InfoRow icon={Building2} label="Công ty" value={candidate.currentCompany} />
          <InfoRow icon={Award} label="Ngành nghề và kinh nghiệm" value={industryAndExperience} />
          <InfoRow icon={DollarSign} label="Mức lương" value={salarySummary} />

          {candidate.level ? (
            <div className="flex items-start gap-3 border-b border-border/50 py-2">
              <Layers className="mt-0.5 h-4 w-4 text-muted" />
              <div className="flex-1">
                <p className="mb-1 text-xs font-medium text-muted">Cấp bậc</p>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {getLevelText(candidate.level)}
                </span>
              </div>
            </div>
          ) : null}

          {candidate.skills.length > 0 ? (
            <div className="flex items-start gap-3 py-2">
              <Code2 className="mt-0.5 h-4 w-4 text-muted" />
              <div className="flex-1">
                <p className="mb-2 text-xs font-medium text-muted">Kỹ năng</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
