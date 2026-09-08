import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://image.tmdb.org https://images.unsplash.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-src 'self' https://vidlink.pro https://*.vidlink.pro https://www.vidking.net https://vidking.net https://*.vidking.net https://www.youtube.com https://youtube.com;
  connect-src 'self' https://api.themoviedb.org https://image.tmdb.org https://vidsrc.cc https://torrentio.strem.fun;
  media-src 'self' blob: https:;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
    webpackMemoryOptimizations: true,
  },
  images: {
    unoptimized: true, // Bypass image optimization limits - loads directly from TMDB CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
};

export default nextConfig;
