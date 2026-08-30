import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /flyer -> the static flyer (single source: public/flyer.html).
  async redirects() {
    return [{ source: "/flyer", destination: "/flyer.html", permanent: false }];
  },
};

export default nextConfig;
