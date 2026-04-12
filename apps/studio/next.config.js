/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@raino/ui', '@raino/core', '@raino/agents', '@raino/llm', '@raino/db'],
};

module.exports = nextConfig;
