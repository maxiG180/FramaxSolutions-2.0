import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images for better performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
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
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack configuration to suppress Supabase realtime warnings in Edge Runtime
  webpack: (config, { isServer, nextRuntime }) => {
    // Suppress false positive warnings about Node.js APIs in Supabase realtime
    // These APIs are not actually used in Edge Runtime contexts
    if (!config.ignoreWarnings) {
      config.ignoreWarnings = [];
    }
    config.ignoreWarnings.push({
      module: /node_modules\/@supabase\/(realtime-js|supabase-js)/,
      message: /.*process\.(versions|version).*/,
    });

    return config;
  },
};

export default nextConfig;
