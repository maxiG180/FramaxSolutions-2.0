import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Remove X-Powered-By header (minor security + saves bytes)
  poweredByHeader: false,

  // Optimize images for better performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
  },

  // Enable compression for static files
  compress: true,

  // Compiler optimizations
  compiler: {
    // Remove console logs in production (keep error and warn)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize package imports to reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Webpack configuration to suppress Supabase realtime warnings in Edge Runtime
  webpack: (config) => {
    if (!config.ignoreWarnings) {
      config.ignoreWarnings = [];
    }
    config.ignoreWarnings.push({
      module: /node_modules\/@supabase\/(realtime-js|supabase-js)/,
      message: /.*process\.(versions|version).*/,
    });
    return config;
  },

  async headers() {
    return [
      // Cache Next.js static assets aggressively (they're fingerprinted)
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache public images/logos for 30 days
      {
        source: '/logos/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      // Security + CSP for all routes
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://a.plerdy.com https://accounts.google.com https://www.google.com https://maps.googleapis.com; connect-src 'self' https://va.vercel-scripts.com https://a.plerdy.com https://maps.googleapis.com https://vitals.vercel-insights.com https://speed-insights.vercel.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
