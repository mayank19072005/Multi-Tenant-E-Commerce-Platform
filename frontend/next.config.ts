import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-ignore
    turbopack: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
