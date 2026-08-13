import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ship/ui", "@ship/utils"],
};

export default nextConfig;
