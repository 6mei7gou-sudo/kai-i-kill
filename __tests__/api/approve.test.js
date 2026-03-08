/**
 * @jest-environment node
 */

/**
 * /api/approve ルートのユニットテスト
 *
 * 管理者権限チェック、ステータスバリデーション、
 * 承認時のメタデータ（approved_at, approved_by）設定を検証する。
 */

// ─── モック定義 ────────────────────────────────────────────

const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
    auth: () => mockAuth(),
}));

const mockSupabaseFrom = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: mockSupabaseFrom,
    }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_ADMIN_USER_IDS = 'admin-user-001,admin-user-002';

const { PATCH } = require('../../src/app/api/approve/route');

function makeRequest(body) {
    return new Request('http://localhost/api/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

function setupSupabaseChain(returnData, returnError = null) {
    mockSingle.mockResolvedValue({ data: returnData, error: returnError });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelect, single: mockSingle });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockSupabaseFrom.mockReturnValue({ update: mockUpdate });
}

// ─── テスト ────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
});

describe('/api/approve PATCH', () => {
    test('未認証 → 401エラー', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const res = await PATCH(makeRequest({
            table: 'anomaly_drafts', id: 'uuid-1', status: 'approved',
        }));

        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toBe('ログインが必要です');
    });

    test('非管理者 → 403エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'regular-user' });

        const res = await PATCH(makeRequest({
            table: 'anomaly_drafts', id: 'uuid-1', status: 'approved',
        }));

        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toBe('管理者権限が必要です');
    });

    test('不正なテーブル名 → 400エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });

        const res = await PATCH(makeRequest({
            table: 'invalid_table', id: 'uuid-1', status: 'approved',
        }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe('不正なテーブル名');
    });

    test('不正なステータス → 400エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });

        const res = await PATCH(makeRequest({
            table: 'anomaly_drafts', id: 'uuid-1', status: 'invalid_status',
        }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe('不正なステータス');
    });

    test('承認 → approved_at と approved_by がセットされる', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });
        setupSupabaseChain({ id: 'uuid-1', approved_status: 'approved' });

        const res = await PATCH(makeRequest({
            table: 'anomaly_drafts', id: 'uuid-1', status: 'approved',
        }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.ok).toBe(true);

        // update に approved_at と approved_by が含まれることを確認
        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                approved_status: 'approved',
                approved_by: 'admin-user-001',
            })
        );
        // approved_at は ISO文字列（null ではない）
        const updateArg = mockUpdate.mock.calls[0][0];
        expect(updateArg.approved_at).not.toBeNull();
    });

    test('pending に戻す → approved_at と approved_by が null になる', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-002' });
        setupSupabaseChain({ id: 'uuid-1', approved_status: 'pending' });

        await PATCH(makeRequest({
            table: 'gear_posts', id: 'uuid-1', status: 'pending',
        }));

        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                approved_status: 'pending',
                approved_at: null,
                approved_by: null,
            })
        );
    });
});
