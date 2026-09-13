import type { NextConfig } from "next";
import { privateCVs } from "./src/constants/private-cvs";

const nextConfig: NextConfig = {
  async headers() {
    const noindex = [
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [
      ...privateCVs.map((cv) => ({ source: `/${cv.slug}`, headers: noindex })),
      { source: "/cv/:path*", headers: noindex },
    ];
  },
};

export default nextConfig;
