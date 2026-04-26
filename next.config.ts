import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const sentryEnabled = Boolean(process.env.SENTRY_DSN);

const nextConfig: NextConfig = {
  // Fix Turbopack CSS resolution when project is inside a subdirectory (e.g., d:\MH\Headhunt_pj)
  // Without this, Turbopack walks up to d:\MH and can't find node_modules
  outputFileTracingRoot: path.join(__dirname),
  devIndicators: false,
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN ?? "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
    ],
  },
};

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: !process.env.CI,
      disableLogger: true,
    })
  : nextConfig;
