import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "pharma-shop.tn",
      },
      {
        protocol: "https",
        hostname: "www.maparatunisie.tn",
      },
    ],
  },
};

export default nextConfig;