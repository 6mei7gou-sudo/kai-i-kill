/**
 * @jest-environment node
 */

/**
 * /api/posts ルートのユニットテスト
 *
 * Clerk認証とSupabaseをモック化し、
 * GET/POST/PATCH/DELETE それぞれの認証・権限・バリデーションを検証する。
 */

// ─── モック定義 ────────────────────────────────────────────

// Clerk auth() モック
const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
    auth: () => mockAuth(),
}));

// Supabase モック — チェインメソッド対応
const mockSupabaseFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: mockSupabaseFrom,
    }),
}));

// 環境変数
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_ADMIN_USER_IDS = 'admin-user-001';

// ─── テスト対象インポート ──────────────────────────────────
const { GET, POST, PATCH, DELETE } = require('../../src/app/api/posts/route');

// ─── ヘルパー ──────────────────────────────────────────────

// Request オブジェクトの簡易生成
function makeRequest(url, options = {}) {
    return new Request(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
}

// Supabase チェインメソッドのリセットとセットアップ
function setupSupabaseChain(returnData, returnError = null) {
    mockSingle.mockResolvedValue({ data: returnData, error: returnError });
    // order({...}) の戻り値としてもeqを参照できるようにする
    const orderResult = { data: Array.isArray(returnData) ? returnData : [returnData], error: returnError };
    mockOrder.mockReturnValue({ ...orderResult, eq: mockEq });
    mockEq.mockReturnValue({ select: mockSelect, single: mockSingle, eq: mockEq, then: (cb) => cb(orderResult) });
    // GETの場合: from(table).select('*').order(...) 又は .order(...).eq(...)
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, single: mockSingle });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockSupabaseFrom.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
    });
}

// ─── テスト ────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
});

describe('/api/posts GET', () => {
    test('不正なテーブル名 → 400エラー', async () => {
        const req = makeRequest('http://localhost/api/posts?table=invalid_table');
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.error).toBe('不正なテーブル名');
    });

    test('正常なテーブル名 → 投稿一覧を返す', async () => {
        const mockData = [{ id: '1', anomaly_name: 'テスト怪異' }];
        setupSupabaseChain(mockData);

        const req = makeRequest('http://localhost/api/posts?table=anomaly_drafts');
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.ok).toBe(true);
        expect(body.data).toEqual(mockData);
        expect(mockSupabaseFrom).toHaveBeenCalledWith('anomaly_drafts');
    });

    test('user_idフィルタが適用される', async () => {
        setupSupabaseChain([]);

        const req = makeRequest('http://localhost/api/posts?table=gear_posts&user_id=user-123');
        await GET(req);

        // eq が user_id で呼ばれることを確認
        expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });
});

describe('/api/posts POST', () => {
    test('未認証 → 401エラー', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const req = makeRequest('http://localhost/api/posts', {
            method: 'POST',
            body: JSON.stringify({ table: 'anomaly_drafts', data: {} }),
        });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.error).toBe('ログインが必要です');
    });

    test('不正なテーブル名 → 400エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'user-123' });

        const req = makeRequest('http://localhost/api/posts', {
            method: 'POST',
            body: JSON.stringify({ table: 'bad_table', data: {} }),
        });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.error).toBe('不正なテーブル名');
    });

    test('正常投稿 → user_idが自動セットされる', async () => {
        mockAuth.mockResolvedValue({ userId: 'user-123' });
        const inputData = { anomaly_name: '新しい怪異' };
        const resultData = { id: 'uuid-1', ...inputData, user_id: 'user-123' };
        setupSupabaseChain(resultData);

        const req = makeRequest('http://localhost/api/posts', {
            method: 'POST',
            body: JSON.stringify({ table: 'anomaly_drafts', data: inputData }),
        });
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.ok).toBe(true);
        // insert に user_id が含まれていることを確認
        expect(mockInsert).toHaveBeenCalledWith([
            expect.objectContaining({ user_id: 'user-123', anomaly_name: '新しい怪異' }),
        ]);
    });
});

describe('/api/posts PATCH', () => {
    test('未認証 → 401エラー', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const req = makeRequest('http://localhost/api/posts', {
            method: 'PATCH',
            body: JSON.stringify({ table: 'anomaly_drafts', id: 'uuid-1', data: {} }),
        });
        const res = await PATCH(req);

        expect(res.status).toBe(401);
    });

    test('他人の投稿 → 403エラー（非管理者）', async () => {
        mockAuth.mockResolvedValue({ userId: 'user-456' });
        // 所有権チェック用：既存レコードの user_id は別ユーザー
        setupSupabaseChain({ user_id: 'user-123' });

        const req = makeRequest('http://localhost/api/posts', {
            method: 'PATCH',
            body: JSON.stringify({ table: 'anomaly_drafts', id: 'uuid-1', data: { anomaly_name: '改名' } }),
        });
        const res = await PATCH(req);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.error).toBe('自分の投稿のみ編集できます');
    });

    test('管理者は他人の投稿も編集可能', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });
        setupSupabaseChain({ user_id: 'user-123' });

        const req = makeRequest('http://localhost/api/posts', {
            method: 'PATCH',
            body: JSON.stringify({ table: 'anomaly_drafts', id: 'uuid-1', data: { anomaly_name: '管理者による編集' } }),
        });
        const res = await PATCH(req);

        // 403にならないことを確認（updateが呼ばれる）
        expect(mockUpdate).toHaveBeenCalled();
    });
});

describe('/api/posts DELETE', () => {
    test('未認証 → 401エラー', async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const req = makeRequest('http://localhost/api/posts?table=anomaly_drafts&id=uuid-1', {
            method: 'DELETE',
        });
        const res = await DELETE(req);

        expect(res.status).toBe(401);
    });

    test('他人の投稿 → 403エラー', async () => {
        mockAuth.mockResolvedValue({ userId: 'user-456' });
        setupSupabaseChain({ user_id: 'user-123' });

        const req = makeRequest('http://localhost/api/posts?table=anomaly_drafts&id=uuid-1', {
            method: 'DELETE',
        });
        const res = await DELETE(req);

        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error).toBe('自分の投稿のみ削除できます');
    });
});
