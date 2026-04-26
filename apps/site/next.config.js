const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@raino/ui', '@raino/core'],
};

module.exports = withNextIntl(nextConfig);
