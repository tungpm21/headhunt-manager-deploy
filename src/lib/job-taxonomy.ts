export const JOB_INDUSTRIES = [
  "Điện tử / Bán dẫn",
  "Cơ khí / Gia công",
  "Dệt may",
  "Ô tô / Linh kiện",
  "Thực phẩm / Đồ uống",
  "Logistics / Kho vận",
  "Hóa chất / Nhựa",
  "CNTT / Phần mềm",
  "Xây dựng",
  "Khác",
] as const;

export const JOB_POSITIONS = [
  "Nhân viên",
  "Chuyên viên",
  "Trưởng nhóm",
  "Trưởng phòng",
  "Phó giám đốc",
  "Giám đốc",
  "Quản lý",
  "Thực tập sinh",
] as const;

export const JOB_LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Bắc Ninh",
  "Bắc Giang",
  "Bình Dương",
  "Đồng Nai",
  "Long An",
  "Hưng Yên",
  "Vĩnh Phúc",
  "Thái Nguyên",
  "Khác",
] as const;

export const JOB_WORK_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Hybrid",
] as const;

export const INDUSTRIAL_ZONE_GROUPS = [
  {
    group: "Miền Bắc",
    zones: [
      "KCN Yên Phong, Bắc Ninh",
      "KCN Quế Võ, Bắc Ninh",
      "KCN VSIP Bắc Ninh",
      "KCN Thăng Long, Hà Nội",
      "KCN Quang Minh, Vĩnh Phúc",
      "KCN Đình Vũ, Hải Phòng",
      "KCN Tràng Duệ, Hải Phòng",
      "KCN Samsung, Thái Nguyên",
      "KCN Đại Đồng, Bắc Giang",
    ],
  },
  {
    group: "Miền Trung",
    zones: [
      "KCN Hòa Khánh, Đà Nẵng",
      "KCN Điện Nam - Điện Ngọc, Quảng Nam",
    ],
  },
  {
    group: "Miền Nam",
    zones: [
      "KCN Amata, Đồng Nai",
      "KCN Long Thành, Đồng Nai",
      "KCN VSIP, Bình Dương",
      "KCN Mỹ Phước, Bình Dương",
      "KCN Long Hậu, Long An",
      "Quận 7 / Tân Phú, TP.HCM",
    ],
  },
] as const;

export const REQUIRED_LANGUAGE_OPTIONS = [
  { value: "none", label: "Không yêu cầu" },
  { value: "Japanese", label: "Tiếng Nhật" },
  { value: "Korean", label: "Tiếng Hàn" },
  { value: "English", label: "Tiếng Anh" },
  { value: "Chinese", label: "Tiếng Trung" },
  { value: "German", label: "Tiếng Đức" },
  { value: "French", label: "Tiếng Pháp" },
] as const;

export const LANGUAGE_PROFICIENCY_LEVELS = [
  "Cơ bản (N4 / TOPIK 1)",
  "Trung cấp (N3 / TOPIK 2)",
  "Khá (N2 / TOPIK 3)",
  "Thành thạo (N1 / TOPIK 4+)",
] as const;

export const SHIFT_TYPE_OPTIONS = [
  { value: "", label: "Không chỉ định" },
  { value: "DAY", label: "Ca ngày" },
  { value: "NIGHT", label: "Ca đêm" },
  { value: "ROTATING", label: "Xoay ca" },
] as const;
