import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's filesystem root to THIS project (pilar-frontend).
  // Without this, the stray lockfile in the monorepo parent makes Turbopack
  // treat the whole repo as root and scan/watch pilar-backend + extra
  // node_modules — the main cause of the CPU 99% / out-of-memory crash.
  // It also permanently silences the "multiple lockfiles detected" warning.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
