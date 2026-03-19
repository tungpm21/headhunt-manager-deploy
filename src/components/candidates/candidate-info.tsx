import { Candidate } from "@prisma/client";
import { Mail, Phone, Calendar, MapPin, Building2, Briefcase, DollarSign, Award } from "lucide-react";

interface CandidateInfoProps {
  candidate: Candidate;
}

export function CandidateInfo({ candidate }: CandidateInfoProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getGenderText = (gender: string | null) => {
    switch (gender) {
      case "MALE": return "Nam";
      case "FEMALE": return "Nữ";
      case "OTHER": return "Khác";
      default: return "Không khả dụng";
    }
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string | null }) => (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0 last:pb-0">
      <Icon className="h-4 w-4 text-muted mt-0.5" />
      <div className="flex-1">
        <p className="text-xs text-muted font-medium mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* THÔNG TIN CÁ NHÂN */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/10 font-semibold text-sm">
          Thông tin liên hệ
        </div>
        <div className="p-5 flex flex-col items-center border-b border-border/50">
          {candidate.avatarUrl ? (
            <img 
              src={candidate.avatarUrl} 
              alt={candidate.fullName} 
              className="h-20 w-20 rounded-full object-cover mb-3 shadow-inner border-2 border-primary/20"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-3 shadow-inner">
              {getInitials(candidate.fullName)}
            </div>
          )}
          <h2 className="text-lg font-bold text-foreground text-center">{candidate.fullName}</h2>
          <span className="text-xs font-medium px-2.5 py-1 bg-surface border border-border rounded-full text-muted-foreground mt-2">
            Nguồn: {candidate.source || "Tự nhiên"}
          </span>
        </div>
        <div className="p-5 space-y-1">
          <InfoRow icon={Phone} label="Số điện thoại" value={candidate.phone} />
          <InfoRow icon={Mail} label="Email" value={candidate.email} />
          <InfoRow icon={Calendar} label="Ngày sinh & Giới tính" value={
            `${candidate.dateOfBirth ? candidate.dateOfBirth.toLocaleDateString('vi-VN') : '—'} • ${getGenderText(candidate.gender)}`
          } />
          <InfoRow icon={MapPin} label="Khu vực & Địa chỉ" value={
            `${candidate.location || '—'} ${candidate.address ? `(${candidate.address})` : ''}`
          } />
        </div>
      </div>

      {/* NGHỀ NGHIỆP */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/10 font-semibold text-sm">
          Nghề nghiệp
        </div>
        <div className="p-5 space-y-1">
          <InfoRow icon={Briefcase} label="Vị trí hiện tại" value={candidate.currentPosition} />
          <InfoRow icon={Building2} label="Công ty" value={candidate.currentCompany} />
          <InfoRow icon={Award} label="Ngành nghề & Kinh nghiệm" value={
            `${candidate.industry || '—'} • ${candidate.yearsOfExp || 0} năm`
          } />
          <InfoRow icon={DollarSign} label="Mức lương" value={
            `Hiện tại: ${candidate.currentSalary ? `${candidate.currentSalary} triệu` : '—'} / Mong muốn: ${candidate.expectedSalary ? `${candidate.expectedSalary} triệu` : '—'}`
          } />
        </div>
      </div>
    </div>
  );
}
