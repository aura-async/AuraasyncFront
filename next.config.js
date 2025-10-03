/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization
  output: "standalone",

  // Image optimization
  images: {
    // Next.js 15: images.domains is deprecated; use remotePatterns
    remotePatterns: [
      {
        protocol: "https",
        hostname: "auraasync.com",
      },
      {
        protocol: "https",
        hostname: "www.auraasync.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for SEO and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            // 👇 This fixes the Firebase popup issue
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: "/analysis-flow",
        destination: "/analysis-v2/force",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Compiler options
  compiler: {
    // removeConsole: process.env.NODE_ENV === 'production',
    removeConsole: false,
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    externalDir: true,
  },

  reactStrictMode: true,
};

module.exports = nextConfig;
