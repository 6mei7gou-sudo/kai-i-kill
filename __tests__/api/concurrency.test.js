/**
 * @jest-environment node
 */

/**
 * 並行更新の回帰テスト（2026-09-11 レビュー F08）
 * 同じ元データを読んだ2つのリクエストのうち、成立するのは1つだけであること。
 * cp_adjust RPC が無い環境（比較更新フォールバック）と、ある環境の両方を検証する。
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

const levelup = require('../../src/app/api/games/levelup/route');
const spend = require('../../src/app/api/games/spend-status-point/route');
const { adjustCp, CpInsufficientError } = require('../../src/lib/cpService');

const asUser = (id) => mockAuth.mockResolvedValue({ userId: id });

function seed(withCpRpc) {
    mockDb.current = createFakeSupabase({
        character_sheets: [
            { id: 'chr-a', user_id: 'player', character_name: 'A', level: 1, is_official: false, status_points_used: 0, rank_tai: 'D' },
            { id: 'chr-b', user_id: 'player', character_name: 'B', level: 1, is_official: false, status_points_used: 0, rank_tai: 'D' },
            { id: 'chr-5', user_id: 'player', character_name: 'Lv5', level: 5, is_official: false, status_points_used: 0, rank_tai: 'D', rank_haya: 'D' },
        ],
        account_cp: [{ user_id: 'player', balance: 100 }],
        cp_transactions: [],
        serial_codes: [],
    }, { withCpRpc });
    return mockDb.current;
}

beforeEach(() => { jest.clearAllMocks(); });

describe.each([[false], [true]])('CP二重消費の防止（cp_adjust RPC あり=%s）', (withCpRpc) => {
    test('100CP で 100CP のレベルアップを2キャラ同時に行っても成立は1件', async () => {
        const db = seed(withCpRpc); asUser('player');
        const [r1, r2] = await Promise.all([
            levelup.POST(jsonRequest('http://localhost/api/games/levelup', 'POST', { character_id: 'chr-a', method: 'cp' })),
            levelup.POST(jsonRequest('http://localhost/api/games/levelup', 'POST', { character_id: 'chr-b', method: 'cp' })),
        ]);
        const statuses = [r1.status, r2.status].sort();
        expect(statuses).toEqual([200, 400]);
        expect(db.find('account_cp', a => a.user_id === 'player').balance).toBe(0);
        const leveled = db.rows('character_sheets').filter(c => c.level === 2);
        expect(leveled).toHaveLength(1);
        const spent = db.rows('cp_transactions').filter(t => t.amount < 0);
        expect(spent).toHaveLength(1);
    });

    test('adjustCp は残高を負にしない', async () => {
        const db = seed(withCpRpc);
        await expect(adjustCp(db, 'player', -101, 'gear_craft', 'x', 'test')).rejects.toBeInstanceOf(CpInsufficientError);
        expect(db.find('account_cp', a => a.user_id === 'player').balance).toBe(100);
    });
});

test('ステータスポイント1点で2能力を同時に上げても成立は1件', async () => {
    const db = seed(false); asUser('player');
    const [r1, r2] = await Promise.all([
        spend.POST(jsonRequest('http://localhost/api/games/spend-status-point', 'POST', { character_id: 'chr-5', attribute: 'tai' })),
        spend.POST(jsonRequest('http://localhost/api/games/spend-status-point', 'POST', { character_id: 'chr-5', attribute: 'haya' })),
    ]);
    expect([r1.status, r2.status].sort()).toEqual([200, 409]);
    const c = db.find('character_sheets', r => r.id === 'chr-5');
    expect(c.status_points_used).toBe(1);
    const raised = ['rank_tai', 'rank_haya'].filter(k => c[k] === 'C');
    expect(raised).toHaveLength(1);
});
