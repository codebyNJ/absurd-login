import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve the static flyer at a clean /flyer endpoint (single source: public/flyer.html).
  async rewrites() {
    return [{ source: "/flyer", destination: "/flyer.html" }];
  },
};

export default nextConfig;
