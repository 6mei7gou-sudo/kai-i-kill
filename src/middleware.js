// Clerkミドルウェア — 認証ルートの制御
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 保護が必要なルート（投稿作成・編集ページ）
const isProtectedRoute = createRouteMatcher([
    '/create/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Next.js内部ファイルと静的ファイルを除外
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // APIルートは常に適用
        '/(api|trpc)(.*)',
    ],
};
