import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type HeaderStore = {
  get(name: string): string | null;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitRedis?: Redis;
  __rateLimiters?: Map<string, Ratelimit>;
};

function isRedisRateLimitEnabled() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function formatWindow(windowMs: number) {
  const seconds = Math.max(1, Math.ceil(windowMs / 1000));

  if (seconds % 86400 === 0) {
    return `${seconds / 86400} d` as const;
  }

  if (seconds % 3600 === 0) {
    return `${seconds / 3600} h` as const;
  }

  if (seconds % 60 === 0) {
    return `${seconds / 60} m` as const;
  }

  return `${seconds} s` as const;
}

function getRedisClient() {
  if (!isRedisRateLimitEnabled()) {
    return null;
  }

  if (!globalForRateLimit.__rateLimitRedis) {
    globalForRateLimit.__rateLimitRedis = Redis.fromEnv();
  }

  return globalForRateLimit.__rateLimitRedis;
}

function getRateLimiter(limit: number, windowMs: number) {
  const redis = getRedisClient();

  if (!redis) {
    return null;
  }

  if (!globalForRateLimit.__rateLimiters) {
    globalForRateLimit.__rateLimiters = new Map();
  }

  const cacheKey = `${limit}:${windowMs}`;
  const existing = globalForRateLimit.__rateLimiters.get(cacheKey);

  if (existing) {
    return existing;
  }

  const rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, formatWindow(windowMs)),
    analytics: false,
    prefix: "headhunt-manager:ratelimit",
  });

  globalForRateLimit.__rateLimiters.set(cacheKey, rateLimiter);
  return rateLimiter;
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

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const rateLimiter = getRateLimiter(limit, windowMs);

  if (!rateLimiter) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  try {
    const result = await rateLimiter.limit(key);

    return {
      allowed: result.success,
      retryAfterSeconds: result.success
        ? 0
        : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error("Redis rate limit error:", error);

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }
}
