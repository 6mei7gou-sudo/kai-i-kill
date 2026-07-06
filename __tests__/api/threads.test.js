/**
 * @jest-environment node
 */

/**
 * /api/sns/threads/[id] PATCH（スレッドタイトル編集）のユニットテスト
 *
 * 認証、バリデーション、所有権チェック（管理者例外）、
 * password_hash がレスポンスに含まれないことを検証する。
 */

// ─── モック定義 ────────────────────────────────────────────

const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
    auth: () => mockAuth(),
}));

const mockSupabaseFrom = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: mockSupabaseFrom,
    }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_ADMIN_USER_IDS = 'admin-user-001';

const { PATCH } = require('../../src/app/api/sns/threads/[id]/route');

function makeRequest(body) {
    return new Request('http://localhost/api/sns/threads/thread-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

const context = { params: Promise.resolve({ id: 'thread-1' }) };

// 所有権チェック（select）と更新（update）の両チェーンをセットアップ
function setupThreadChain({ ownerRow = { user_id: 'owner-user' }, fetchError = null, updatedRow = null } = {}) {
    const ownershipSingle = jest.fn().mockResolvedValue({ data: ownerRow, error: fetchError });
    const updateSingle = jest.fn().mockResolvedValue({ data: updatedRow, error: null });

    mockUpdate.mockReturnValue({
        eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({ single: updateSingle }),
        }),
    });

    mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({ single: ownershipSingle }),
        }),
        update: mockUpdate,
    });
}

// ─── テスト ────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
});

describe('/api/sns/threads/[id] PATCH', () => {
    test('未認証 → 401エラー', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const res = await PATCH(makeRequest({ title: '新タイトル' }), context);

        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toBe('ログインが必要です');
    });

    test('タイトルが空白のみ → 400エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'owner-user' });

        const res = await PATCH(makeRequest({ title: '   ' }), context);

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe('タイトルは必須です');
    });

    test('タイトルが201文字 → 400エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'owner-user' });

        const res = await PATCH(makeRequest({ title: 'あ'.repeat(201) }), context);

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe('タイトルは200文字以内です');
    });

    test('スレッドが存在しない → 404エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'owner-user' });
        setupThreadChain({ ownerRow: null, fetchError: { message: 'not found' } });

        const res = await PATCH(makeRequest({ title: '新タイトル' }), context);

        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error).toBe('スレッドが見つかりません');
    });

    test('他人のスレッド・非管理者 → 403エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'other-user' });
        setupThreadChain({ ownerRow: { user_id: 'owner-user' } });

        const res = await PATCH(makeRequest({ title: '新タイトル' }), context);

        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toBe('スレッド主のみ編集できます');
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    test('所有者 → 200・update に title と updated_at・password_hash は返さない', async () => {
        mockAuth.mockResolvedValue({ userId: 'owner-user' });
        setupThreadChain({
            ownerRow: { user_id: 'owner-user' },
            updatedRow: {
                id: 'thread-1',
                title: '新タイトル',
                user_id: 'owner-user',
                password_hash: 'secret-hash',
                updated_at: '2026-07-07T00:00:00.000Z',
            },
        });

        const res = await PATCH(makeRequest({ title: '  新タイトル  ' }), context);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.ok).toBe(true);
        expect(body.data.title).toBe('新タイトル');
        expect(body.data.password_hash).toBeUndefined();

        // trim 済みタイトルと updated_at を含む update が呼ばれる
        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ title: '新タイトル' })
        );
        const updateArg = mockUpdate.mock.calls[0][0];
        expect(updateArg.updated_at).not.toBeNull();
    });

    test('管理者は他人のスレッドも編集できる → 200', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });
        setupThreadChain({
            ownerRow: { user_id: 'owner-user' },
            updatedRow: { id: 'thread-1', title: '管理者編集', user_id: 'owner-user' },
        });

        const res = await PATCH(makeRequest({ title: '管理者編集' }), context);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data.title).toBe('管理者編集');
    });
});
