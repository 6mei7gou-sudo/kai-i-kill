/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages用の静的エクスポート設定
  output: 'export',
  // GitHub Pagesではリポジトリ名がサブパスになる
  // 例: https://username.github.io/kai-i-kill/
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true, // 静的エクスポートでは画像最適化を無効にする
  },
  // トレイリングスラッシュを有効にしてGitHub Pagesの互換性を確保
  trailingSlash: true,
};

export default nextConfig;
