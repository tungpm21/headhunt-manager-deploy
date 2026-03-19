import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix Turbopack CSS resolution when project is inside a subdirectory (e.g., d:\MH\Headhunt_pj)
  // Without this, Turbopack walks up to d:\MH and can't find node_modules
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
