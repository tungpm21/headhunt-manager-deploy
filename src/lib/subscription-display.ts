export const SUBSCRIPTION_TIER_PRIORITY: Record<string, number> = {
  VIP: 0,
  PREMIUM: 1,
  STANDARD: 2,
  BASIC: 3,
};

export type SubscriptionDisplayPolicy = {
  tier: string;
  label: string;
  rankLabel: string;
  logoDefault: boolean;
  bannerDefault: boolean;
  homepagePriority: number;
  summary: string;
};

const FALLBACK_POLICY: SubscriptionDisplayPolicy = {
  tier: "BASIC",
  label: "Basic",
  rankLabel: "Priority 4",
  logoDefault: false,
  bannerDefault: false,
  homepagePriority: 3,
  summary: "Core posting quota, no featured media by default.",
};

export const SUBSCRIPTION_DISPLAY_POLICIES: Record<string, SubscriptionDisplayPolicy> = {
  BASIC: FALLBACK_POLICY,
  STANDARD: {
    tier: "STANDARD",
    label: "Standard",
    rankLabel: "Priority 3",
    logoDefault: true,
    bannerDefault: false,
    homepagePriority: 2,
    summary: "Logo visibility and normal public listing priority.",
  },
  PREMIUM: {
    tier: "PREMIUM",
    label: "Premium",
    rankLabel: "Priority 2",
    logoDefault: true,
    bannerDefault: false,
    homepagePriority: 1,
    summary: "Logo visibility with higher public listing priority.",
  },
  VIP: {
    tier: "VIP",
    label: "VIP",
    rankLabel: "Priority 1",
    logoDefault: true,
    bannerDefault: true,
    homepagePriority: 0,
    summary: "Top priority plus homepage banner eligibility.",
  },
};

export function getSubscriptionTierRank(tier?: string | null) {
  return tier ? SUBSCRIPTION_TIER_PRIORITY[tier] ?? 4 : 4;
}

export function getSubscriptionDisplayPolicy(tier?: string | null) {
  return tier ? SUBSCRIPTION_DISPLAY_POLICIES[tier] ?? FALLBACK_POLICY : FALLBACK_POLICY;
}

export function compareSubscriptionDisplayPriority<
  T extends {
    companyName?: string | null;
    subscription?: { tier?: string | null } | null;
    _count?: { jobPostings?: number | null } | null;
  },
>(a: T, b: T) {
  const tierDiff =
    getSubscriptionTierRank(a.subscription?.tier) -
    getSubscriptionTierRank(b.subscription?.tier);
  if (tierDiff !== 0) return tierDiff;

  const jobsDiff = (b._count?.jobPostings ?? 0) - (a._count?.jobPostings ?? 0);
  if (jobsDiff !== 0) return jobsDiff;

  return (a.companyName ?? "").localeCompare(b.companyName ?? "");
}
