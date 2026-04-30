import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // CDN cho icon Google trong login/signup form
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      // Thêm hostname của backend/CDN avatar tại đây
    ],
  },
};

export default nextConfig;
