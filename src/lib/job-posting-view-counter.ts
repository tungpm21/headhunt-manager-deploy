import { prisma } from "@/lib/prisma";

const VIEW_FLUSH_INTERVAL_MS = 30_000;
const VIEW_FLUSH_THRESHOLD = 20;

const viewBuffer = new Map<number, number>();

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushPromise: Promise<void> | null = null;

function getBufferedViewTotal() {
  let total = 0;

  for (const count of viewBuffer.values()) {
    total += count;
  }

  return total;
}

function scheduleFlush() {
  if (flushTimer) {
    return;
  }

  flushTimer = setTimeout(() => {
    void flushJobPostingViews();
  }, VIEW_FLUSH_INTERVAL_MS);
}

function requeueFailedEntries(entries: Array<[number, number]>) {
  for (const [jobPostingId, count] of entries) {
    viewBuffer.set(jobPostingId, (viewBuffer.get(jobPostingId) ?? 0) + count);
  }
}

export function incrementJobPostingView(jobPostingId: number) {
  if (jobPostingId <= 0) {
    return;
  }

  viewBuffer.set(jobPostingId, (viewBuffer.get(jobPostingId) ?? 0) + 1);

  if (getBufferedViewTotal() >= VIEW_FLUSH_THRESHOLD) {
    void flushJobPostingViews();
    return;
  }

  scheduleFlush();
}

export async function flushJobPostingViews() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (flushPromise) {
    return flushPromise;
  }

  const pendingEntries = Array.from(viewBuffer.entries());

  if (pendingEntries.length === 0) {
    return;
  }

  viewBuffer.clear();

  flushPromise = (async () => {
    try {
      await Promise.all(
        pendingEntries.map(([jobPostingId, count]) =>
          prisma.jobPosting.update({
            where: { id: jobPostingId },
            data: { viewCount: { increment: count } },
          })
        )
      );
    } catch (error) {
      requeueFailedEntries(pendingEntries);
      console.error("flushJobPostingViews error:", error);
      scheduleFlush();
    } finally {
      flushPromise = null;
    }
  })();

  return flushPromise;
}
