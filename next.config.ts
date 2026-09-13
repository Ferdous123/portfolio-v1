import type { NextConfig } from "next";
import { privateCVs } from "./src/constants/private-cvs";

const nextConfig: NextConfig = {
  async headers() {
    return privateCVs.map((cv) => ({
      source: `/${cv.slug}`,
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        { key: "Cache-Control", value: "no-store" },
      ],
    }));
  },
};

export default nextConfig;
