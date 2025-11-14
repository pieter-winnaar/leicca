const webpack = require('webpack');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: true,
  transpilePackages: [
    '@design-system-demo/design-system',
    '@design-system-demo/blockchain-infrastructure',
    '@design-system-demo/sdk-integration',
  ],
  // Expose env vars to Server Actions
  env: {
    MINTBLUE_SDK_TOKEN: process.env.MINTBLUE_SDK_TOKEN,
  },
  webpack: (config, { isServer }) => {
    // For SERVER side: externalize @mintblue/sdk to prevent webpack bundling
    // This allows it to use Node.js native modules directly
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@mintblue/sdk');
    }

    // ONLY provide Buffer polyfill for CLIENT side
    // Server side uses Node.js native Buffer
    if (!isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );

      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
    }

    return config;
  },
};

module.exports = nextConfig;
