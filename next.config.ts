import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Webpack instead of Turbopack
  // For Next.js 16+, Turbopack is default. To use Webpack, downgrade to Next.js 15
  // or wait for the feature to be properly implemented.
  // For now, we'll use the default (Turbopack) but with patched Prisma files.
};

export default nextConfig;
