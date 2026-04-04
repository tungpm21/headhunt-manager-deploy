// Sentry instrumentation — only active when SENTRY_DSN is set.
// Without DSN, these functions are no-ops (no Sentry packages loaded).

export async function register() {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  // Dynamic imports — only resolved at runtime when DSN exists
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
      enabled: true,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
      enabled: true,
    });
  }
}

export async function onRequestError(...args: unknown[]) {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(
    ...(args as Parameters<typeof Sentry.captureRequestError>)
  );
}
