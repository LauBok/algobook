import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Help resolve dynamic imports
      canvas: './empty-module.js',
    },
  },
  webpack: (config, { isServer }) => {
    // Handle dynamic imports and Node.js modules in client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Ignore canvas and other problematic modules that Pyodide might try to import
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });

    return config;
  },
};

export default nextConfig;
