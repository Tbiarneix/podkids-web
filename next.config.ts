import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise l'URL locale du proxy avec (n')importe quel query string
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
