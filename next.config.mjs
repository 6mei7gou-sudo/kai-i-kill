/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercelデプロイ — 静的エクスポートは不要
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async redirects() {
    return [
      // ドメイン集約：vercel.app と www は kai-i-kill.com にリダイレクト
      // （Clerk Production の許可ドメインは kai-i-kill.com のみ）
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'kai-i-kill.vercel.app' }],
        destination: 'https://kai-i-kill.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.kai-i-kill.com' }],
        destination: 'https://kai-i-kill.com/:path*',
        permanent: true,
      },
      // TRPG詳細ルールはWebから引き上げ、簡略ガイド（/quickstart/）に集約
      { source: '/rules', destination: '/quickstart/', permanent: true },
      { source: '/rules/:path*', destination: '/quickstart/', permanent: true },
    ];
  },
};

export default nextConfig;
