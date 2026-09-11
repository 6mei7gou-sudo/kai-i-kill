/**
 * @jest-environment node
 */

/**
 * /api/cp・/api/games・/api/games/dispatch の回帰テスト（2026-09-11 レビュー F03 / F06）
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

const cpRoute = require('../../src/app/api/cp/route');
const gamesRoute = require('../../src/app/api/games/route');
const dispatchRoute = require('../../src/app/api/games/dispatch/route');

const asUser = (id) => mockAuth.mockResolvedValue({ userId: id });
const balanceOf = (db, uid) => db.find('account_cp', a => a.user_id === uid)?.balance;

function seed(extra = {}) {
    mockDb.current = createFakeSupabase({
        character_sheets: [
            { id: 'chr-1', user_id: 'player', character_name: '主人公', rank_tai: 'S' },
            { id: 'chr-2', user_id: 'other', character_name: '他人', rank_tai: 'D' },
        ],
        account_cp: [{ user_id: 'player', balance: 10 }],
        cp_transactions: [],
        mission_results: [], adv_completions: [], character_achievements: [], dispatch_quests: [],
        ...extra,
    });
    return mockDb.current;
}

beforeEach(() => { jest.clearAllMocks(); });

describe('F03 /api/cp POST', () => {
    test('一般ユーザーは自分に CP を加算できない（403）', async () => {
        const db = seed(); asUser('player');
        const res = await cpRoute.POST(jsonRequest('http://localhost/api/cp', 'POST', { amount: 1000000, source_type: 'admin' }));
        expect(res.status).toBe(403);
        expect(balanceOf(db, 'player')).toBe(10);
    });

    test('管理者は対象ユーザーを指定して調整できる', async () => {
        const db = seed(); asUser('admin-user-001');
        const res = await cpRoute.POST(jsonRequest('http://localhost/api/cp', 'POST', { target_user_id: 'player', amount: 5, description: '補填' }));
        expect(res.status).toBe(200);
        expect(balanceOf(db, 'player')).toBe(15);
        expect(db.find('cp_transactions', t => t.source_type === 'admin').source_id).toBe('admin-user-001');
    });
});

describe('F03 /api/games POST', () => {
    test('存在しないミッションは受け付けない', async () => {
        const db = seed(); asUser('player');
        const res = await gamesRoute.POST(jsonRequest('http://localhost/api/games', 'POST', {
            table: 'mission_results', data: { character_id: 'chr-1', mission_id: 'fake_s_rank', mission_name: '偽', difficulty: 'S', result: '勝利' },
        }));
        expect(res.status).toBe(400);
        expect(db.rows('mission_results')).toHaveLength(0);
        expect(balanceOf(db, 'player')).toBe(10);
    });

    test('難易度・報酬はサーバー定義から決まる（申告のSは無視）', async () => {
        const db = seed(); asUser('player');
        const res = await gamesRoute.POST(jsonRequest('http://localhost/api/games', 'POST', {
            table: 'mission_results', data: { character_id: 'chr-1', mission_id: 'mission_grade5_stray', difficulty: 'S', result: '勝利', achievements: [{ id: 'fake', name: '偽実績', type: 'mission' }] },
        }));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.data.difficulty).toBe('E');
        expect(body.cpAwarded).toBe(2);
        expect(balanceOf(db, 'player')).toBe(12);
        const achIds = db.rows('character_achievements').map(a => a.achievement_id);
        expect(achIds).not.toContain('fake');
        expect(achIds).toContain('first_victory');
    });

    test('他人のキャラクターの結果は保存できない', async () => {
        seed(); asUser('player');
        const res = await gamesRoute.POST(jsonRequest('http://localhost/api/games', 'POST', {
            table: 'mission_results', data: { character_id: 'chr-2', mission_id: 'mission_grade5_stray', result: '勝利' },
        }));
        expect(res.status).toBe(403);
    });

    test('ADV は定義のエンディングだけ受け付け、2回目は 409', async () => {
        const db = seed(); asUser('player');
        const payload = { table: 'adv_completions', data: { character_id: 'chr-1', scenario_id: 'scenario_alley_whisper', ending_id: 'true_end', ending_type: 'bad' } };
        const r1 = await gamesRoute.POST(jsonRequest('http://localhost/api/games', 'POST', payload));
        const b1 = await r1.json();
        expect(r1.status).toBe(200);
        expect(b1.data.ending_type).toBe('true');
        expect(b1.cpAwarded).toBe(8);
        const r2 = await gamesRoute.POST(jsonRequest('http://localhost/api/games', 'POST', payload));
        expect(r2.status).toBe(409);
        expect(balanceOf(db, 'player')).toBe(18);

        const r3 = await gamesRoute.POST(jsonRequest('http://localhost/api/games', 'POST', {
            table: 'adv_completions', data: { character_id: 'chr-1', scenario_id: 'scenario_alley_whisper', ending_id: 'nonexistent' },
        }));
        expect(r3.status).toBe(400);
    });

    test('GET は自分の記録のみ返す', async () => {
        seed({ mission_results: [{ id: 'm1', user_id: 'player' }, { id: 'm2', user_id: 'other' }] }); asUser('player');
        const res = await gamesRoute.GET(new Request('http://localhost/api/games?table=mission_results&user_id=other'));
        const body = await res.json();
        expect(body.data.map(r => r.id)).toEqual(['m1']);
    });
});

describe('F06 /api/games/dispatch', () => {
    const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

    test('存在しないクエストは開始できない', async () => {
        seed(); asUser('player');
        const res = await dispatchRoute.POST(jsonRequest('http://localhost/api/games/dispatch', 'POST', { character_id: 'chr-1', quest_id: 'nope', quest_name: 'x', duration_hours: 0 }));
        expect(res.status).toBe(400);
    });

    test('開始時の名称・所要時間はサーバー定義になる', async () => {
        seed(); asUser('player');
        const res = await dispatchRoute.POST(jsonRequest('http://localhost/api/games/dispatch', 'POST', { character_id: 'chr-1', quest_id: 'infiltration_long', quest_name: '偽', duration_hours: 0 }));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.data.duration_hours).toBe(12);
        expect(body.data.quest_name).toBe('長期潜入作戦');
    });

    test('所要時間が過ぎるまで完了できない', async () => {
        const db = seed({ dispatch_quests: [{ id: 'd1', user_id: 'player', character_id: 'chr-1', quest_id: 'infiltration_long', quest_name: '長期潜入作戦', duration_hours: 12, started_at: hoursAgo(1), completed_at: null }] });
        asUser('player');
        const res = await dispatchRoute.PATCH(jsonRequest('http://localhost/api/games/dispatch', 'PATCH', { dispatch_id: 'd1', result: '成功', rewards: {} }));
        expect(res.status).toBe(400);
        expect(db.find('dispatch_quests', d => d.id === 'd1').completed_at).toBeNull();
        expect(balanceOf(db, 'player')).toBe(10);
    });

    test('完了後は成否をサーバーが決め、報酬は1回だけ', async () => {
        const db = seed({ dispatch_quests: [{ id: 'd1', user_id: 'player', character_id: 'chr-1', quest_id: 'infiltration_long', quest_name: '長期潜入作戦', duration_hours: 12, started_at: hoursAgo(13), completed_at: null }] });
        asUser('player');
        const rnd = jest.spyOn(Math, 'random').mockReturnValue(0.01); // 成功
        const r1 = await dispatchRoute.PATCH(jsonRequest('http://localhost/api/games/dispatch', 'PATCH', { dispatch_id: 'd1', result: '失敗' }));
        const b1 = await r1.json();
        expect(r1.status).toBe(200);
        expect(b1.data.result).toBe('成功');
        expect(b1.cpAwarded).toBe(12);
        expect(balanceOf(db, 'player')).toBe(22);

        const r2 = await dispatchRoute.PATCH(jsonRequest('http://localhost/api/games/dispatch', 'PATCH', { dispatch_id: 'd1' }));
        expect(r2.status).toBe(409);
        const r3 = await dispatchRoute.PATCH(jsonRequest('http://localhost/api/games/dispatch', 'PATCH', { dispatch_id: 'd1' }));
        expect(r3.status).toBe(409);
        expect(balanceOf(db, 'player')).toBe(22);
        rnd.mockRestore();
    });

    test('他人の派遣は完了できない', async () => {
        seed({ dispatch_quests: [{ id: 'd2', user_id: 'other', character_id: 'chr-2', quest_id: 'patrol_city', quest_name: '市街巡回任務', duration_hours: 1, started_at: hoursAgo(2), completed_at: null }] });
        asUser('player');
        const res = await dispatchRoute.PATCH(jsonRequest('http://localhost/api/games/dispatch', 'PATCH', { dispatch_id: 'd2' }));
        expect(res.status).toBe(404);
    });
});
