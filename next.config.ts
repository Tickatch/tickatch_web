import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      // 플레이스홀더 이미지
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      // 파일 서버
      {
        protocol: "https",
        hostname: "www.pinjun.xyz",
      },
      {
        protocol: "https",
        hostname: "pinjun.xyz",
      },
    ],
  },
};

export default nextConfig;