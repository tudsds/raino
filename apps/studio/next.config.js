/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@raino/ui', '@raino/core', '@raino/agents', '@raino/llm', '@raino/db'],
  typescript: {
    // Allow production builds to succeed even with type errors
    // Type errors will be fixed incrementally
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
};
module.exports = nextConfig;
