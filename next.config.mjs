/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // transpilePackages: ["@privy-io/react-auth"],
  webpack: (config) => {
    // Option 1: Disable managedPaths completely (recommended for simplicity)
    config.snapshot = {
      ...(config.snapshot ?? {}),
      managedPaths: [],
    };
    
    // Option 2: Use specific exclusions (uncomment if you prefer this approach)
    // config.snapshot = {
    //   ...(config.snapshot ?? {}),
    //   managedPaths: [
    //     /^(.+?[\\/]node_modules[\\/](?!(@privy-io[\\/]wagmi-connector|@next|@swc|@emotion|@nodelib|@jridgewell|@tabler|@alloc))(@.+?[\\/])?.+?)[\\/]/,
    //   ],
    // };
    
    return config;
  },

};

export default nextConfig;
