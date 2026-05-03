/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercelデプロイ — 静的エクスポートは不要
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async redirects() {
    return [
      // TRPG詳細ルールはWebから引き上げ、簡略ガイド（/quickstart/）に集約
      { source: '/rules', destination: '/quickstart/', permanent: true },
      { source: '/rules/:path*', destination: '/quickstart/', permanent: true },
    ];
  },
};

export default nextConfig;
