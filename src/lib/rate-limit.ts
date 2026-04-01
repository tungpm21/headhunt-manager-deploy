import { headers } from "next/headers";

type HeaderStore = {
  get(name: string): string | null;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, RateLimitEntry>;
};

function getStore() {
  if (!globalForRateLimit.__rateLimitStore) {
    globalForRateLimit.__rateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalForRateLimit.__rateLimitStore;
}

export function extractClientIp(headerStore: HeaderStore): string {
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = headerStore.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function buildRateLimitKey(
  prefix: string,
  headerStore: HeaderStore,
  identity?: string
): string {
  const ip = extractClientIp(headerStore);
  const normalizedIdentity = identity?.trim().toLowerCase();

  return [prefix, ip, normalizedIdentity].filter(Boolean).join(":");
}

export async function buildServerActionRateLimitKey(
  prefix: string,
  identity?: string
): Promise<string> {
  const headerStore = await headers();
  return buildRateLimitKey(prefix, headerStore, identity);
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const store = getStore();

  for (const [entryKey, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(entryKey);
    }
  }

  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000)
      ),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}
