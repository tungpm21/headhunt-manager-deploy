import { prisma } from "@/lib/prisma";

const SUBSCRIPTION_SYNC_INTERVAL_MS = 60_000;

let lastSubscriptionSyncAt = 0;
let syncPromise: Promise<number> | null = null;

export async function expireSubscriptionsIfNeeded(
  force = false
): Promise<number> {
  const now = Date.now();

  if (!force && now - lastSubscriptionSyncAt < SUBSCRIPTION_SYNC_INTERVAL_MS) {
    return 0;
  }

  if (!syncPromise) {
    syncPromise = prisma.subscription
      .updateMany({
        where: {
          status: "ACTIVE",
          endDate: {
            lte: new Date(),
          },
        },
        data: {
          status: "EXPIRED",
        },
      })
      .then((result) => {
        lastSubscriptionSyncAt = Date.now();
        return result.count;
      })
      .finally(() => {
        syncPromise = null;
      });
  }

  return syncPromise;
}

