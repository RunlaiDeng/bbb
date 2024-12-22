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
    unoptimized: true,
  },
  webpack: (config) => {
    // ...
    config.externals["@solana/web3.js"] = "commonjs @solana/web3.js";
    return config;
  },
};

module.exports = nextConfig;
