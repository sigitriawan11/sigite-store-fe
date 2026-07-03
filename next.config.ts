import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_PUBLIC_* are read from the environment (Vercel/local .env). Fall back to
  // localhost for local dev so no hardcoded value overrides the deployed config.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:5000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        // Backend hosted on Render serves banner/icon images over HTTPS.
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;