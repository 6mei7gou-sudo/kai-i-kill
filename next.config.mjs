/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercelデプロイ — 静的エクスポートは不要
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
