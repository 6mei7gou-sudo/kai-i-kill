/**
 * @jest-environment node
 */

/**
 * 第2回セキュリティレビュー（2026-09-11）R2-01〜R2-07 の回帰テスト
 */
const { createFakeSupabase, jsonRequest } = require('../helpers/fakeSupabase');

const mockAuth = jest.fn();
const mockGetUser = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
    auth: () => mockAuth(),
    clerkClient: async () => ({ users: { getUser: (...a) => mockGetUser(...a) } }),
}));

const mockDb = { current: null };
jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: (...a) => mockDb.current.from(...a),
        rpc: (...a) => mockDb.current.rpc(...a),
    }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

const migrate = require('../../src/app/api/auth/migrate-from-dev/route');
const games = require('../../src/app/api/games/route');
const redeem = require('../../src/app/api/games/redeem/route');
const dispatch = require('../../src/app/api/games/dispatch/route');
const rooms = require('../../src/app/api/sns/chat/rooms/route');

const asUser = (id) => mockAuth.mockResolvedValue({ userId: id });

beforeEach(() => { jest.clearAllMocks(); });

describe('R2-01 / R2-04 Dev→Production 移行', () => {
    function seedMigration(opts = {}) {
        mockDb.current = createFakeSupabase({
            user_migration_map: [{ email: 'a@example.com', dev_user_id: 'old', migrated_at: null, migrated_to_user_id: null }],
            account_cp: [{ user_id: 'old', balance: 120 }],
            novels: [{ id: 'n1', user_id: 'old', title: '旧小説' }],
            sns_chat_rooms: [{ id: 'r1', created_by: 'old', name: '旧ルーム' }],
            character_sheets: [{ id: 'c1', user_id: 'old' }],
            sns_likes: [{ id: 'l-old', user_id: 'old', post_id: 'p1' }, { id: 'l-new', user_id: 'new', post_id: 'p1' }],
            reports: [{ id: 'rep1', reporter_user_id: 'old' }],
            ...opts,
        });
        mockGetUser.mockResolvedValue({ primaryEmailAddressId: 'e1', emailAddresses: [{ id: 'e1', emailAddress: 'a@example.com' }] });
        asUser('new');
        return mockDb.current;
    }

    test('小説・チャット作成者・通報者も新IDに付け替え、衝突する旧いいねは削除される', async () => {
        const db = seedMigration();
        const res = await migrate.POST();
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.migrated).toBe(true);
        expect(db.find('novels', n => n.id === 'n1').user_id).toBe('new');
        expect(db.find('sns_chat_rooms', r => r.id === 'r1').created_by).toBe('new');
        expect(db.find('reports', r => r.id === 'rep1').reporter_user_id).toBe('new');
        expect(db.rows('sns_likes').filter(l => l.post_id === 'p1')).toHaveLength(1);
        expect(db.find('account_cp', a => a.user_id === 'new').balance).toBe(120);
        expect(db.find('account_cp', a => a.user_id === 'old')).toBeNull();
        expect(db.find('user_migration_map', m => m.email === 'a@example.com').migrated_at).not.toBeNull();
    });

    test('移行先のCP保存に失敗したら旧残高を消さず、移行済みにもしない（再試行可能）', async () => {
        const db = seedMigration();
        db.errorHook = (table, op) => (table === 'account_cp' && op === 'upsert') ? { code: 'XX000', message: 'synthetic failure' } : null;
        const res = await migrate.POST();
        const body = await res.json();
        expect(res.status).toBe(500);
        expect(body.migrated).toBe(false);
        expect(db.find('account_cp', a => a.user_id === 'old').balance).toBe(120);
        expect(db.find('user_migration_map', m => m.email === 'a@example.com').migrated_at).toBeNull();

        // 再試行で完了する
        db.errorHook = null;
        const res2 = await migrate.POST();
        expect((await res2.json()).migrated).toBe(true);
        expect(db.find('account_cp', a => a.user_id === 'new').balance).toBe(120);
    });

    test('途中のテーブル更新が失敗しても移行済みにしない', async () => {
        const db = seedMigration();
        db.errorHook = (table, op) => (table === 'novels' && op === 'update') ? { code: 'XX000', message: 'boom' } : null;
        const res = await migrate.POST();
        expect(res.status).toBe(500);
        expect(db.find('user_migration_map', m => m.email === 'a@example.com').migrated_at).toBeNull();
        expect(db.find('account_cp', a => a.user_id === 'old').balance).toBe(120);
    });

    test('DB関数 migrate_user_data があればそれを使う', async () => {
        const calls = [];
        mockDb.current = createFakeSupabase({
            user_migration_map: [{ email: 'a@example.com', dev_user_id: 'old', migrated_at: null }],
        }, { rpc: { migrate_user_data: (db, args) => { calls.push(args); return { data: { novels: 1 }, error: null }; } } });
        mockGetUser.mockResolvedValue({ primaryEmailAddressId: 'e1', emailAddresses: [{ id: 'e1', emailAddress: 'a@example.com' }] });
        asUser('new');
        const res = await migrate.POST();
        const body = await res.json();
        expect(body.migrated).toBe(true);
        expect(calls[0]).toEqual({ p_old_user_id: 'old', p_new_user_id: 'new', p_email: 'a@example.com' });
        expect(body.details).toEqual({ novels: 1 });
    });
});

describe('R2-02 実績テーブルへの直接書き込み', () => {
    test('/api/games POST は character_achievements を受け付けない', async () => {
        mockDb.current = createFakeSupabase({ character_sheets: [{ id: 'chr-b', user_id: 'B' }], character_achievements: [] });
        asUser('A');
        const res = await games.POST(jsonRequest('http://localhost/api/games', 'POST', {
            table: 'character_achievements', data: { character_id: 'chr-b', achievement_id: 'title_pioneer', achievement_name: '偽', achievement_type: 'special' },
        }));
        expect(res.status).toBe(400);
        expect(mockDb.current.rows('character_achievements')).toHaveLength(0);
    });
});

describe('R2-05 シリアルコードの露出', () => {
    test('引換後の source_id に生コードを含めない', async () => {
        const db = createFakeSupabase({
            serial_codes: [{ id: 'sc-1', code: 'SECRET-CODE', achievement_id: 't1', achievement_name: '称号', achievement_type: 'special', max_uses: 5, current_uses: 0 }],
            character_sheets: [{ id: 'chr-1', user_id: 'me' }],
            character_achievements: [],
        });
        mockDb.current = db; asUser('me');
        const res = await redeem.POST(jsonRequest('http://localhost/api/games/redeem', 'POST', { code: 'secret-code', character_id: 'chr-1' }));
        expect(res.status).toBe(200);
        const ach = db.rows('character_achievements')[0];
        expect(ach.source_id).toBe('serial:sc-1');
        expect(JSON.stringify(ach)).not.toContain('SECRET-CODE');
        expect(db.find('serial_codes', s => s.id === 'sc-1').current_uses).toBe(1);
    });
});

describe('R2-06 派遣実績の保存エラー', () => {
    test('CHECK制約違反は応答の achievementErrors に現れる', async () => {
        const db = createFakeSupabase({
            character_sheets: [{ id: 'chr-1', user_id: 'me', rank_tai: 'S' }],
            dispatch_quests: [{ id: 'd1', user_id: 'me', character_id: 'chr-1', quest_id: 'patrol_city', quest_name: '市街巡回任務', duration_hours: 1, started_at: new Date(Date.now() - 2 * 3600e3).toISOString(), completed_at: null }],
            character_achievements: [], account_cp: [{ user_id: 'me', balance: 0 }], cp_transactions: [],
        });
        db.errorHook = (table, op) => (table === 'character_achievements' && op === 'upsert') ? { code: '23514', message: 'violates check constraint "character_achievements_achievement_type_check"' } : null;
        mockDb.current = db; asUser('me');
        const rnd = jest.spyOn(Math, 'random').mockReturnValue(0.01);
        const res = await dispatch.PATCH(jsonRequest('http://localhost/api/games/dispatch', 'PATCH', { dispatch_id: 'd1' }));
        const body = await res.json();
        rnd.mockRestore();
        expect(res.status).toBe(200);
        expect(body.achievementErrors).toHaveLength(1);
        expect(body.achievementErrors[0].id).toBe('dispatch_patrol');
    });
});

describe('R2-07 チャットルーム作成', () => {
    test('作成者メンバーに display_name を保存する', async () => {
        const db = createFakeSupabase({ sns_chat_rooms: [], sns_chat_members: [] });
        mockDb.current = db; asUser('me');
        const res = await rooms.POST(jsonRequest('http://localhost/api/sns/chat/rooms', 'POST', { name: '作戦室', layer: 'hunter', display_name: 'ハンターA' }));
        expect(res.status).toBe(200);
        const member = db.rows('sns_chat_members')[0];
        expect(member.user_id).toBe('me');
        expect(member.display_name).toBe('ハンターA');
    });

    test('メンバー登録に失敗したらルームを残さない', async () => {
        const db = createFakeSupabase({ sns_chat_rooms: [], sns_chat_members: [] });
        db.errorHook = (table, op) => (table === 'sns_chat_members' && op === 'insert') ? { code: '23502', message: 'null value in column "display_name"' } : null;
        mockDb.current = db; asUser('me');
        const res = await rooms.POST(jsonRequest('http://localhost/api/sns/chat/rooms', 'POST', { name: '作戦室', layer: 'hunter' }));
        expect(res.status).toBe(500);
        expect(db.rows('sns_chat_rooms')).toHaveLength(0);
    });
});
