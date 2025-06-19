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
  webpack: (config, { isServer, webpack }) => {
    // Handle Solana web3.js externals
    config.externals["@solana/web3.js"] = "commonjs @solana/web3.js";
    
    // Fix web worker compilation issues
    if (!isServer) {
      // Exclude worker files from Terser minification
      config.optimization.minimizer = config.optimization.minimizer.map(plugin => {
        if (plugin.constructor.name === 'TerserPlugin') {
          plugin.options.exclude = /\.worker\.js$|HeartbeatWorker|worker/i;
          plugin.options.terserOptions = {
            ...plugin.options.terserOptions,
            // Don't parse worker files as modules
            parse: {
              ...plugin.options.terserOptions?.parse,
            },
            compress: {
              ...plugin.options.terserOptions?.compress,
              // Don't compress worker files
              drop_console: false,
            },
          };
        }
        return plugin;
      });
      
      // Handle worker files specifically
      config.module.rules.push({
        test: /HeartbeatWorker\.js$/,
        use: 'null-loader'
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;
