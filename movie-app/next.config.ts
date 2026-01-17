import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Bypass Vercel image optimization limits - loads directly from TMDB CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
