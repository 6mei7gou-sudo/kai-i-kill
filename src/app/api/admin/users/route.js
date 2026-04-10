// 管理者専用：ClerkユーザーIDからプロフィール情報を一括取得
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

export async function GET(request) {
    try {
        const { userId } = await auth();
        if (!userId || !ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const idsParam = searchParams.get('ids');
        if (!idsParam) {
            return NextResponse.json({ error: 'ids パラメータが必要です' }, { status: 400 });
        }

        const idArray = idsParam.split(',').filter(Boolean).slice(0, 100);
        if (idArray.length === 0) {
            return NextResponse.json({ ok: true, users: {} });
        }

        const clerk = await clerkClient();
        const { data: clerkUsers } = await clerk.users.getUserList({
            userId: idArray,
            limit: 100,
        });

        // IDをキーにしたマップに変換
        const users = {};
        const foundIds = new Set();

        for (const u of clerkUsers) {
            foundIds.add(u.id);
            const primaryEmail = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId);
            users[u.id] = {
                username: u.username,
                firstName: u.firstName,
                lastName: u.lastName,
                imageUrl: u.imageUrl,
                email: primaryEmail?.emailAddress || null,
                lastSignInAt: u.lastSignInAt,
            };
        }

        // リクエストされたがClerkに存在しないIDは削除済みとしてマーク
        for (const id of idArray) {
            if (!foundIds.has(id)) {
                users[id] = { deleted: true };
            }
        }

        return NextResponse.json({ ok: true, users });
    } catch (err) {
        console.error('Clerk user fetch error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
