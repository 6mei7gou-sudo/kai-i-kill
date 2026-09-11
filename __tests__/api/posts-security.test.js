/**
 * @jest-environment node
 */

/**
 * /api/posts のセキュリティ回帰テスト（2026-09-11 レビュー F02 / F05 / F07）
 * インメモリDBで実際のクエリ列を実行し、列制限・非公開保護・装備CPの先払いと返還上限を検証する。
 */
const { createFakeSupabase, jsonRequest } = require('../helpers/fakeSupabase');

const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({ auth: () => mockAuth() }));

const mockDb = { current: null };
jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: (...a) => mockDb.current.from(...a),
        rpc: (...a) => mockDb.current.rpc(...a),
    }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_ADMIN_USER_IDS = 'admin-user-001';

const { GET, POST, PATCH } = require('../../src/app/api/posts/route');

const asUser = (id) => mockAuth.mockResolvedValue({ userId: id });

function seed(extra = {}) {
    mockDb.current = createFakeSupabase({
        novels: [
            { id: 'nov-pub', user_id: 'owner', title: '公開小説', body: '本文A', visibility: '公開' },
            { id: 'nov-priv', user_id: 'owner', title: '非公開小説', body: '秘密の本文', visibility: '非公開' },
        ],
        character_sheets: [
            { id: 'chr-1', user_id: 'owner', character_name: '主人公', level: 3, is_official: false, approved_status: 'pending', visibility: '公開' },
        ],
        gear_posts: [],
        account_cp: [{ user_id: 'owner', balance: 10 }],
        cp_transactions: [],
        ...extra,
    });
    return mockDb.current;
}

beforeEach(() => { jest.clearAllMocks(); });

describe('F05 非公開小説の保護', () => {
    test('未認証の一覧は公開分のみ返す', async () => {
        seed(); asUser(null);
        const res = await GET(new Request('http://localhost/api/posts?table=novels'));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.data.map(n => n.id)).toEqual(['nov-pub']);
    });

    test('他人の user_id 指定でも非公開は返さない', async () => {
        seed(); asUser('stranger');
        const res = await GET(new Request('http://localhost/api/posts?table=novels&user_id=owner'));
        const body = await res.json();
        expect(body.data.map(n => n.id)).toEqual(['nov-pub']);
    });

    test('所有者は自分の非公開も一覧で取得できる', async () => {
        seed(); asUser('owner');
        const res = await GET(new Request('http://localhost/api/posts?table=novels&user_id=owner'));
        const body = await res.json();
        expect(body.data.map(n => n.id).sort()).toEqual(['nov-priv', 'nov-pub']);
    });

    test('IDを知っていても未認証・他人には非公開を返さない（404）', async () => {
        seed(); asUser(null);
        expect((await GET(new Request('http://localhost/api/posts?table=novels&id=nov-priv'))).status).toBe(404);
        asUser('stranger');
        expect((await GET(new Request('http://localhost/api/posts?table=novels&id=nov-priv'))).status).toBe(404);
    });

    test('所有者と管理者はIDで非公開を取得できる', async () => {
        seed(); asUser('owner');
        const r1 = await GET(new Request('http://localhost/api/posts?table=novels&id=nov-priv'));
        expect((await r1.json()).data.body).toBe('秘密の本文');
        asUser('admin-user-001');
        const r2 = await GET(new Request('http://localhost/api/posts?table=novels&id=nov-priv'));
        expect(r2.status).toBe(200);
    });
});

describe('F02 管理用列の書き換え防止', () => {
    test('一般ユーザーの POST で is_official / approved_status / level / user_id は無視される', async () => {
        const db = seed(); asUser('user-1');
        const res = await POST(jsonRequest('http://localhost/api/posts', 'POST', {
            table: 'character_sheets',
            data: { character_name: '偽公式', is_official: true, approved_status: 'approved', level: 20, status_points_used: 0, user_id: 'someone-else', approved_by: 'x' },
        }));
        expect(res.status).toBe(200);
        const row = db.find('character_sheets', r => r.character_name === '偽公式');
        expect(row.user_id).toBe('user-1');
        expect(row.is_official).toBe(false);
        expect(row.approved_status).toBe('pending');
        expect(row.level).toBe(1);
        expect(row.approved_by).toBeUndefined();
    });

    test('一般ユーザーの PATCH で level / user_id / approved_status は変わらない', async () => {
        const db = seed(); asUser('owner');
        const res = await PATCH(jsonRequest('http://localhost/api/posts', 'PATCH', {
            table: 'character_sheets', id: 'chr-1',
            data: { character_name: '改名', level: 20, user_id: 'other', approved_status: 'approved', is_official: true },
        }));
        expect(res.status).toBe(200);
        const row = db.find('character_sheets', r => r.id === 'chr-1');
        expect(row.character_name).toBe('改名');
        expect(row.level).toBe(3);
        expect(row.user_id).toBe('owner');
        expect(row.approved_status).toBe('pending');
        expect(row.is_official).toBe(false);
    });

    test('管理者は is_official を設定できるが approved_status は承認APIのみ', async () => {
        const db = seed(); asUser('admin-user-001');
        await PATCH(jsonRequest('http://localhost/api/posts', 'PATCH', {
            table: 'character_sheets', id: 'chr-1', data: { is_official: true, approved_status: 'approved' },
        }));
        const row = db.find('character_sheets', r => r.id === 'chr-1');
        expect(row.is_official).toBe(true);
        expect(row.approved_status).toBe('pending');
    });
});

describe('F07 装備CPの先払いと返還上限', () => {
    const gear = { gear_name: '試作銃', weapon_type: '射撃型', manufacturer: '汎用品', category: '武装型', options: [{ name: '出力増幅', cp: 0 }] };
    // スペック：武装 5 × 汎用品 1.0 = 5CP、出力増幅 = 2CP → 合計 7CP（クライアント申告は無視）

    test('残高不足なら投稿されず 400', async () => {
        const db = seed({ account_cp: [{ user_id: 'poor', balance: 3 }] }); asUser('poor');
        const res = await POST(jsonRequest('http://localhost/api/posts', 'POST', { table: 'gear_posts', data: { ...gear, total_cp: 0 } }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/CP不足/);
        expect(db.rows('gear_posts')).toHaveLength(0);
        expect(db.find('account_cp', a => a.user_id === 'poor').balance).toBe(3);
    });

    test('残高があれば投稿前にサーバー計算のコストを引き落とす', async () => {
        const db = seed(); asUser('owner');
        const res = await POST(jsonRequest('http://localhost/api/posts', 'POST', { table: 'gear_posts', data: { ...gear, total_cp: 1, base_cp: 0 } }));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.cpDeducted).toBe(7);
        expect(body.data.total_cp).toBe(7);
        expect(body.data.base_cp).toBe(5);
        expect(db.find('account_cp', a => a.user_id === 'owner').balance).toBe(3);
        const tx = db.find('cp_transactions', t => t.source_type === 'gear_craft');
        expect(tx.amount).toBe(-7);
        expect(tx.source_id).toBe(body.data.id);
    });

    test('未払いの旧装備のコストを0に編集しても返還されない', async () => {
        const db = seed({
            gear_posts: [{ id: 'gear-legacy', user_id: 'owner', gear_name: '未払い装備', weapon_type: '射撃型', manufacturer: '汎用品', category: '武装型', options: [{ name: 'ルール干渉型魔導具', cp: 4 }], total_cp: 1000 }],
            account_cp: [{ user_id: 'owner', balance: 10 }],
        }); asUser('owner');
        const res = await PATCH(jsonRequest('http://localhost/api/posts', 'PATCH', { table: 'gear_posts', id: 'gear-legacy', data: { options: [], total_cp: 0 } }));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.cpDelta).toBe(0);
        expect(db.find('account_cp', a => a.user_id === 'owner').balance).toBe(10);
    });

    test('支払い済みの装備は支払額を上限に返還される', async () => {
        const db = seed({
            gear_posts: [{ id: 'gear-paid', user_id: 'owner', gear_name: '支払済', weapon_type: '射撃型', manufacturer: '汎用品', category: '武装型', options: [{ name: '出力増幅', cp: 2 }], total_cp: 7 }],
            account_cp: [{ user_id: 'owner', balance: 3 }],
            cp_transactions: [{ id: 't1', user_id: 'owner', amount: -7, balance_after: 3, source_type: 'gear_craft', source_id: 'gear-paid' }],
        }); asUser('owner');
        const res = await PATCH(jsonRequest('http://localhost/api/posts', 'PATCH', { table: 'gear_posts', id: 'gear-paid', data: { options: [] } }));
        const body = await res.json();
        expect(body.cpDelta).toBe(-2);
        expect(db.find('account_cp', a => a.user_id === 'owner').balance).toBe(5);
    });

    test('増額の編集は残高不足なら更新しない', async () => {
        const db = seed({
            gear_posts: [{ id: 'gear-1', user_id: 'owner', gear_name: '基本', weapon_type: '射撃型', manufacturer: '汎用品', category: '武装型', options: [], total_cp: 5 }],
            account_cp: [{ user_id: 'owner', balance: 1 }],
        }); asUser('owner');
        const res = await PATCH(jsonRequest('http://localhost/api/posts', 'PATCH', { table: 'gear_posts', id: 'gear-1', data: { options: [{ name: 'ルール干渉型魔導具' }] } }));
        expect(res.status).toBe(400);
        expect(db.find('gear_posts', g => g.id === 'gear-1').options).toEqual([]);
    });
});
