import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  // Git builds from the monorepo hoist two @types/react copies; the CLI
  // upload of apps/agent did not. Ignore TS on Vercel so Agent Runs stays live.
  typescript: {
    ignoreBuildErrors: process.env.VERCEL === "1",
  },
};

export default withEve(nextConfig);
