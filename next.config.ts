import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
      // 실제 서비스 이미지 서버 (추후 추가)
      // {
      //   protocol: "https",
      //   hostname: "your-image-server.com",
      // },
    ],
  },
};

export default nextConfig;