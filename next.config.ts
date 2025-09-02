import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/image-proxy",
      },
      {
        pathname: "/api/image-proxy/**",
      },
      {
        pathname: "/images/**",
      },
      {
        pathname: "/avatar/**",
      },
      {
        pathname: "/icons/**",
      },
    ],
  },
};

export default nextConfig;
