import path from "node:path";
import type { NextConfig } from "next";

const distDir = process.env.NEXT_DIST_DIR ?? ".next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  distDir,
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
