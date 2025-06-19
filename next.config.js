/** @type {import('next').NextConfig} */
const isMobile = process.env.NEXT_PUBLIC_IS_MOBILE === "true";

const nextConfig = {
  ...(isMobile ? { output: "export" } : {}),
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    ...(isMobile ? { unoptimized: true } : {}),
  },
  webpack: (config, { isServer }) => {
    // Fix for module import/export issues in workers
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Ignore problematic worker files during build
    config.ignoreWarnings = [
      { module: /HeartbeatWorker/ },
      { message: /Failed to parse source map/ },
    ];

    config.externals["@solana/web3.js"] = "commonjs @solana/web3.js";
    return config;
  },
  transpilePackages: ['@vercel/analytics'],
};

module.exports = nextConfig;
