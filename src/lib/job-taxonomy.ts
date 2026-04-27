import {
  OPTION_GROUPS,
  OPTION_SET_DEFINITIONS,
  type DefaultOptionItem,
  type OptionGroupKey,
} from "@/lib/config-option-definitions";

function defaultItems(setKey: OptionGroupKey): DefaultOptionItem[] {
  return OPTION_SET_DEFINITIONS.find((set) => set.key === setKey)?.items ?? [];
}

export const JOB_INDUSTRIES = defaultItems(OPTION_GROUPS.industry).map(
  (item) => item.label
);

export const JOB_POSITIONS = [
  "Nhân viên",
  "Chuyên viên",
  "Trưởng nhóm",
  "Trưởng phòng",
  "Phó giám đốc",
  "Giám đốc",
  "Quản lý",
  "Thực tập sinh",
];

export const JOB_LOCATIONS = defaultItems(OPTION_GROUPS.location).map(
  (item) => item.label
);

export const JOB_WORK_TYPES = defaultItems(OPTION_GROUPS.workType).map(
  (item) => item.value
);

export const INDUSTRIAL_ZONE_GROUPS = Object.values(
  defaultItems(OPTION_GROUPS.industrialZone).reduce<
    Record<string, { group: string; zones: string[] }>
  >((groups, item) => {
    const region =
      typeof item.metadata?.region === "string" ? item.metadata.region : "Khác";
    groups[region] ??= { group: region, zones: [] };
    groups[region].zones.push(item.value);
    return groups;
  }, {})
);

export const REQUIRED_LANGUAGE_OPTIONS = defaultItems(
  OPTION_GROUPS.requiredLanguage
).map((item) => ({
  value: item.value,
  label: item.label,
}));

export const LANGUAGE_PROFICIENCY_LEVELS = defaultItems(
  OPTION_GROUPS.languageProficiency
).map((item) => item.value);

export const SHIFT_TYPE_OPTIONS = [
  { value: "", label: "Không chỉ định" },
  ...defaultItems(OPTION_GROUPS.shiftType).map((item) => ({
    value: item.value,
    label: item.label,
  })),
];
