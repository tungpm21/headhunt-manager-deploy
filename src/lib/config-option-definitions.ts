export const OPTION_GROUPS = {
  industry: "industry",
  location: "location",
  workType: "workType",
  industrialZone: "industrialZone",
  requiredLanguage: "requiredLanguage",
  languageProficiency: "languageProficiency",
  shiftType: "shiftType",
  companySize: "companySize",
  candidateStatus: "candidateStatus",
  candidateSource: "candidateSource",
  candidateSeniority: "candidateSeniority",
  clientStatus: "clientStatus",
  jobStatus: "jobStatus",
  jobPriority: "jobPriority",
  feeType: "feeType",
  employerStatus: "employerStatus",
  jobPostingStatus: "jobPostingStatus",
  subscriptionTier: "subscriptionTier",
  subscriptionStatus: "subscriptionStatus",
  applicationStatus: "applicationStatus",
} as const;

export type OptionGroupKey =
  (typeof OPTION_GROUPS)[keyof typeof OPTION_GROUPS];

export type OptionValueType = "STRING" | "ENUM";

export type DefaultOptionItem = {
  value: string;
  label: string;
  aliases?: string[];
  description?: string;
  isActive?: boolean;
  showInPublic?: boolean;
  isSystem?: boolean;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
};

export type OptionSetDefinition = {
  key: OptionGroupKey;
  label: string;
  description: string;
  valueType: OptionValueType;
  allowCustomValues: boolean;
  isSystem: boolean;
  sortOrder: number;
  items: DefaultOptionItem[];
};

const industries: DefaultOptionItem[] = [
  { value: "electronics-semiconductor", label: "Điện tử / Bán dẫn", aliases: ["Điện tử / Bán dẫn"], showInPublic: true },
  { value: "mechanical-manufacturing", label: "Cơ khí / Gia công", aliases: ["Cơ khí / Gia công", "Kỹ thuật / Sản xuất"], showInPublic: true },
  { value: "textile-garment", label: "Dệt may", aliases: ["Dệt may"], showInPublic: true },
  { value: "automotive-parts", label: "Ô tô / Linh kiện", aliases: ["Ô tô / Linh kiện"], showInPublic: true },
  { value: "food-beverage", label: "Thực phẩm / Đồ uống", aliases: ["Thực phẩm / Đồ uống"], showInPublic: true },
  { value: "logistics-warehouse", label: "Logistics / Kho vận", aliases: ["Logistics / Kho vận"], showInPublic: true },
  { value: "chemical-plastics", label: "Hóa chất / Nhựa", aliases: ["Hóa chất / Nhựa"], showInPublic: true },
  { value: "it-software", label: "CNTT / Phần mềm", aliases: ["CNTT / Phần mềm", "IT / Phần mềm"], showInPublic: true },
  { value: "construction", label: "Xây dựng", aliases: ["Xây dựng"], showInPublic: true },
  { value: "finance-banking", label: "Tài chính / Ngân hàng", aliases: ["Tài chính / Ngân hàng"] },
  { value: "marketing-media", label: "Marketing / Truyền thông", aliases: ["Marketing / Truyền thông"] },
  { value: "sales-business", label: "Kinh doanh / Sales", aliases: ["Kinh doanh / Sales"] },
  { value: "human-resources", label: "Nhân sự", aliases: ["Nhân sự"] },
  { value: "administration", label: "Hành chính", aliases: ["Hành chính"] },
  { value: "other", label: "Khác", aliases: ["Khác"], showInPublic: true },
];

const locations: DefaultOptionItem[] = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "TP.HCM",
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
  "Cần Thơ",
  "Khác",
].map((label, index) => ({
  value: label === "TP.HCM" ? "tp-hcm" : label,
  label,
  aliases: [label],
  showInPublic: index < 13,
}));

const workTypes: DefaultOptionItem[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Hybrid",
].map((label) => ({ value: label, label, aliases: [label], showInPublic: true }));

const industrialZones: DefaultOptionItem[] = [
  ["KCN Yên Phong, Bắc Ninh", "Miền Bắc"],
  ["KCN Quế Võ, Bắc Ninh", "Miền Bắc"],
  ["KCN VSIP Bắc Ninh", "Miền Bắc"],
  ["KCN Thăng Long, Hà Nội", "Miền Bắc"],
  ["KCN Quang Minh, Vĩnh Phúc", "Miền Bắc"],
  ["KCN Đình Vũ, Hải Phòng", "Miền Bắc"],
  ["KCN Tràng Duệ, Hải Phòng", "Miền Bắc"],
  ["KCN Samsung, Thái Nguyên", "Miền Bắc"],
  ["KCN Đại Đồng, Bắc Giang", "Miền Bắc"],
  ["KCN Hòa Khánh, Đà Nẵng", "Miền Trung"],
  ["KCN Điện Nam - Điện Ngọc, Quảng Nam", "Miền Trung"],
  ["KCN Amata, Đồng Nai", "Miền Nam"],
  ["KCN Long Thành, Đồng Nai", "Miền Nam"],
  ["KCN VSIP, Bình Dương", "Miền Nam"],
  ["KCN Mỹ Phước, Bình Dương", "Miền Nam"],
  ["KCN Long Hậu, Long An", "Miền Nam"],
  ["Quận 7 / Tân Phú, TP.HCM", "Miền Nam"],
].map(([label, region]) => ({
  value: label,
  label,
  aliases: [label],
  showInPublic: true,
  metadata: { region },
}));

function enumItem(value: string, label: string, sortOrder = 0): DefaultOptionItem {
  return {
    value,
    label,
    aliases: [value, label],
    isSystem: true,
    sortOrder,
  };
}

export const OPTION_SET_DEFINITIONS: OptionSetDefinition[] = [
  {
    key: OPTION_GROUPS.industry,
    label: "Ngành nghề",
    description: "Ngành dùng chung cho candidate, client, job, employer và public filters.",
    valueType: "STRING",
    allowCustomValues: true,
    isSystem: false,
    sortOrder: 10,
    items: industries,
  },
  {
    key: OPTION_GROUPS.location,
    label: "Địa điểm",
    description: "Địa điểm làm việc và địa bàn tuyển dụng.",
    valueType: "STRING",
    allowCustomValues: true,
    isSystem: false,
    sortOrder: 20,
    items: locations,
  },
  {
    key: OPTION_GROUPS.workType,
    label: "Hình thức làm việc",
    description: "Work type cho tin tuyển dụng public và employer portal.",
    valueType: "STRING",
    allowCustomValues: true,
    isSystem: false,
    sortOrder: 30,
    items: workTypes,
  },
  {
    key: OPTION_GROUPS.industrialZone,
    label: "Khu công nghiệp",
    description: "KCN/địa bàn FDI nổi bật.",
    valueType: "STRING",
    allowCustomValues: true,
    isSystem: false,
    sortOrder: 40,
    items: industrialZones,
  },
  {
    key: OPTION_GROUPS.requiredLanguage,
    label: "Ngôn ngữ",
    description: "Ngôn ngữ yêu cầu trong tin tuyển dụng.",
    valueType: "STRING",
    allowCustomValues: true,
    isSystem: false,
    sortOrder: 50,
    items: [
      { value: "none", label: "Không yêu cầu", showInPublic: true },
      { value: "Japanese", label: "Tiếng Nhật", aliases: ["Japanese", "Tiếng Nhật"], showInPublic: true },
      { value: "Korean", label: "Tiếng Hàn", aliases: ["Korean", "Tiếng Hàn"], showInPublic: true },
      { value: "English", label: "Tiếng Anh", aliases: ["English", "Tiếng Anh"], showInPublic: true },
      { value: "Chinese", label: "Tiếng Trung", aliases: ["Chinese", "Tiếng Trung"], showInPublic: true },
      { value: "German", label: "Tiếng Đức", aliases: ["German", "Tiếng Đức"], showInPublic: true },
      { value: "French", label: "Tiếng Pháp", aliases: ["French", "Tiếng Pháp"], showInPublic: true },
    ],
  },
  {
    key: OPTION_GROUPS.languageProficiency,
    label: "Trình độ ngôn ngữ",
    description: "Mức trình độ ngoại ngữ cho tin tuyển dụng.",
    valueType: "STRING",
    allowCustomValues: true,
    isSystem: false,
    sortOrder: 60,
    items: [
      "Cơ bản (N4 / TOPIK 1)",
      "Trung cấp (N3 / TOPIK 2)",
      "Khá (N2 / TOPIK 3)",
      "Thành thạo (N1 / TOPIK 4+)",
    ].map((label) => ({ value: label, label, aliases: [label] })),
  },
  {
    key: OPTION_GROUPS.shiftType,
    label: "Ca làm",
    description: "Ca làm việc trong tin tuyển dụng.",
    valueType: "STRING",
    allowCustomValues: true,
    isSystem: false,
    sortOrder: 70,
    items: [
      { value: "DAY", label: "Ca ngày", aliases: ["DAY", "Ca ngày"], showInPublic: true },
      { value: "NIGHT", label: "Ca đêm", aliases: ["NIGHT", "Ca đêm"], showInPublic: true },
      { value: "ROTATING", label: "Xoay ca", aliases: ["ROTATING", "Xoay ca"], showInPublic: true },
    ],
  },
  {
    key: OPTION_GROUPS.companySize,
    label: "Quy mô công ty",
    description: "Enum CompanySize; admin chỉ đổi label/thứ tự/visibility.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 90,
    items: [
      enumItem("SMALL", "Nhỏ (< 50 nhân viên)", 10),
      enumItem("MEDIUM", "Vừa (50 - 200 nhân viên)", 20),
      enumItem("LARGE", "Lớn (200 - 1000 nhân viên)", 30),
      enumItem("ENTERPRISE", "Tập đoàn (> 1000 nhân viên)", 40),
    ],
  },
  {
    key: OPTION_GROUPS.candidateStatus,
    label: "Trạng thái ứng viên",
    description: "Enum CandidateStatus.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 100,
    items: [
      enumItem("AVAILABLE", "Sẵn sàng"),
      enumItem("EMPLOYED", "Đã có việc"),
      enumItem("INTERVIEWING", "Đang phỏng vấn"),
      enumItem("BLACKLIST", "Blacklist"),
    ],
  },
  {
    key: OPTION_GROUPS.candidateSource,
    label: "Nguồn ứng viên",
    description: "Enum CandidateSource.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 110,
    items: ["LINKEDIN", "TOPCV", "REFERRAL", "FACEBOOK", "VIETNAMWORKS", "FDIWORK", "OTHER"].map((value) =>
      enumItem(value, value === "REFERRAL" ? "Giới thiệu" : value)
    ),
  },
  {
    key: OPTION_GROUPS.candidateSeniority,
    label: "Cấp bậc ứng viên",
    description: "Enum CandidateSeniority.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 120,
    items: [
      enumItem("INTERN", "Intern"),
      enumItem("JUNIOR", "Junior"),
      enumItem("MID_LEVEL", "Mid-level"),
      enumItem("SENIOR", "Senior"),
      enumItem("LEAD", "Lead"),
      enumItem("MANAGER", "Manager"),
      enumItem("DIRECTOR", "Director"),
    ],
  },
  {
    key: OPTION_GROUPS.clientStatus,
    label: "Trạng thái client",
    description: "Enum ClientStatus.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 130,
    items: [
      enumItem("ACTIVE", "Hoạt động"),
      enumItem("INACTIVE", "Tạm ngưng"),
      enumItem("BLACKLISTED", "Blacklisted"),
    ],
  },
  {
    key: OPTION_GROUPS.jobStatus,
    label: "Trạng thái job order",
    description: "Enum JobStatus.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 140,
    items: [
      enumItem("OPEN", "Đang tuyển"),
      enumItem("PAUSED", "Tạm dừng"),
      enumItem("FILLED", "Đã tuyển xong"),
      enumItem("CANCELLED", "Đã hủy"),
    ],
  },
  {
    key: OPTION_GROUPS.jobPriority,
    label: "Mức ưu tiên job",
    description: "Enum JobPriority.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 150,
    items: [
      enumItem("LOW", "Ưu tiên thấp"),
      enumItem("MEDIUM", "Ưu tiên vừa"),
      enumItem("HIGH", "Ưu tiên cao"),
      enumItem("URGENT", "Khẩn cấp"),
    ],
  },
  {
    key: OPTION_GROUPS.feeType,
    label: "Hình thức phí",
    description: "Enum FeeType.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 160,
    items: [
      enumItem("PERCENTAGE", "% Lương gộp/năm"),
      enumItem("FIXED", "Giá cố định"),
    ],
  },
  {
    key: OPTION_GROUPS.employerStatus,
    label: "Trạng thái employer",
    description: "Enum EmployerStatus.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 170,
    items: [
      enumItem("PENDING", "Chờ duyệt"),
      enumItem("ACTIVE", "Đang hoạt động"),
      enumItem("SUSPENDED", "Tạm khóa"),
    ],
  },
  {
    key: OPTION_GROUPS.jobPostingStatus,
    label: "Trạng thái tin tuyển dụng",
    description: "Enum JobPostingStatus.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 180,
    items: [
      enumItem("DRAFT", "Nháp"),
      enumItem("PENDING", "Chờ duyệt"),
      enumItem("APPROVED", "Đã duyệt"),
      enumItem("REJECTED", "Từ chối"),
      enumItem("EXPIRED", "Hết hạn"),
      enumItem("PAUSED", "Tạm ẩn"),
    ],
  },
  {
    key: OPTION_GROUPS.subscriptionTier,
    label: "Gói hiển thị",
    description: "Enum SubscriptionTier và label gói mua hiển thị.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 190,
    items: [
      enumItem("BASIC", "Basic"),
      enumItem("STANDARD", "Standard"),
      enumItem("PREMIUM", "Premium"),
      enumItem("VIP", "VIP"),
    ],
  },
  {
    key: OPTION_GROUPS.subscriptionStatus,
    label: "Trạng thái subscription",
    description: "Enum SubscriptionStatus.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 200,
    items: [
      enumItem("ACTIVE", "Đang hoạt động"),
      enumItem("EXPIRED", "Hết hạn"),
      enumItem("CANCELLED", "Đã hủy"),
    ],
  },
  {
    key: OPTION_GROUPS.applicationStatus,
    label: "Trạng thái application",
    description: "Enum ApplicationStatus.",
    valueType: "ENUM",
    allowCustomValues: false,
    isSystem: true,
    sortOrder: 210,
    items: [
      enumItem("NEW", "Mới nộp"),
      enumItem("REVIEWED", "Đã xem"),
      enumItem("SHORTLISTED", "Shortlisted"),
      enumItem("REJECTED", "Từ chối"),
      enumItem("IMPORTED", "Đã import CRM"),
    ],
  },
];
