/**
 * @jest-environment node
 */

/**
 * /api/official-characters ルートのユニットテスト
 *
 * 公開一覧の published フィルタ、管理者専用操作（?all=1 / POST / PATCH / DELETE）の
 * 認証・認可・バリデーションを検証する。
 */

// ─── モック定義 ────────────────────────────────────────────

const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
    auth: () => mockAuth(),
}));

const mockSupabaseFrom = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: mockSupabaseFrom,
    }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_ADMIN_USER_IDS = 'admin-user-001';

const { GET, POST, PATCH, DELETE } = require('../../src/app/api/official-characters/route');

function makeRequest(url, options = {}) {
    return new Request(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
}

// SELECT チェーン: select → order → order → (eq) → resolve
function setupSelectChain(rows = []) {
    const result = { data: rows, error: null };
    const mockEq = jest.fn().mockResolvedValue(result);
    const thenable = {
        eq: mockEq,
        then: (cb) => Promise.resolve(result).then(cb),
    };
    const mockOrder2 = jest.fn().mockReturnValue(thenable);
    const mockOrder1 = jest.fn().mockReturnValue({ order: mockOrder2 });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder1 });
    mockSupabaseFrom.mockReturnValue({ select: mockSelect });
    return { mockEq };
}

function setupWriteChain(returnRow = { id: 'oc-1' }) {
    const single = jest.fn().mockResolvedValue({ data: returnRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    mockInsert.mockReturnValue({ select });
    mockUpdate.mockReturnValue({ eq: jest.fn().mockReturnValue({ select }) });
    mockDelete.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    mockSupabaseFrom.mockReturnValue({ insert: mockInsert, update: mockUpdate, delete: mockDelete });
}

// ─── テスト ────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
});

describe('/api/official-characters GET', () => {
    test('公開一覧 → published=true でフィルタされる', async () => {
        const { mockEq } = setupSelectChain([{ id: 'oc-1', name: '御柱' }]);

        const res = await GET(makeRequest('http://localhost/api/official-characters'));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data).toHaveLength(1);
        expect(mockEq).toHaveBeenCalledWith('published', true);
    });

    test('?all=1 未認証 → 401', async () => {
        mockAuth.mockResolvedValue({ userId: null });
        setupSelectChain([]);

        const res = await GET(makeRequest('http://localhost/api/official-characters?all=1'));

        expect(res.status).toBe(401);
    });

    test('?all=1 非管理者 → 403', async () => {
        mockAuth.mockResolvedValue({ userId: 'regular-user' });
        setupSelectChain([]);

        const res = await GET(makeRequest('http://localhost/api/official-characters?all=1'));

        expect(res.status).toBe(403);
    });

    test('?all=1 管理者 → 200・published フィルタなし', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });
        const { mockEq } = setupSelectChain([{ id: 'oc-1' }, { id: 'oc-2' }]);

        const res = await GET(makeRequest('http://localhost/api/official-characters?all=1'));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data).toHaveLength(2);
        expect(mockEq).not.toHaveBeenCalled();
    });
});

describe('/api/official-characters POST', () => {
    test('非管理者 → 403', async () => {
        mockAuth.mockResolvedValue({ userId: 'regular-user' });

        const res = await POST(makeRequest('http://localhost/api/official-characters', {
            method: 'POST', body: JSON.stringify({ name: '御柱' }),
        }));

        expect(res.status).toBe(403);
    });

    test('name 空 → 400', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });

        const res = await POST(makeRequest('http://localhost/api/official-characters', {
            method: 'POST', body: JSON.stringify({ name: '  ' }),
        }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe('名前は必須です');
    });

    test('管理者 → 201・insert 引数を検証', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });
        setupWriteChain({ id: 'oc-1', name: '御柱' });

        const res = await POST(makeRequest('http://localhost/api/official-characters', {
            method: 'POST',
            body: JSON.stringify({ name: '御柱', title: '第一柱', display_order: '3', published: true }),
        }));

        expect(res.status).toBe(201);
        expect(mockInsert).toHaveBeenCalledWith(
            expect.objectContaining({ name: '御柱', title: '第一柱', display_order: 3, published: true })
        );
    });
});

describe('/api/official-characters PATCH', () => {
    test('id なし → 400', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });

        const res = await PATCH(makeRequest('http://localhost/api/official-characters', {
            method: 'PATCH', body: JSON.stringify({ name: '御柱' }),
        }));

        expect(res.status).toBe(400);
    });

    test('非管理者 → 403', async () => {
        mockAuth.mockResolvedValue({ userId: 'regular-user' });

        const res = await PATCH(makeRequest('http://localhost/api/official-characters', {
            method: 'PATCH', body: JSON.stringify({ id: 'oc-1', name: '御柱' }),
        }));

        expect(res.status).toBe(403);
    });

    test('管理者 → 200・updated_at が付与される', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });
        setupWriteChain({ id: 'oc-1', name: '改名後' });

        const res = await PATCH(makeRequest('http://localhost/api/official-characters', {
            method: 'PATCH',
            body: JSON.stringify({ id: 'oc-1', name: '改名後', published: false }),
        }));

        expect(res.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ name: '改名後', published: false })
        );
        const updateArg = mockUpdate.mock.calls[0][0];
        expect(updateArg.updated_at).not.toBeNull();
    });
});

describe('/api/official-characters DELETE', () => {
    test('非管理者 → 403', async () => {
        mockAuth.mockResolvedValue({ userId: 'regular-user' });

        const res = await DELETE(makeRequest('http://localhost/api/official-characters?id=oc-1', { method: 'DELETE' }));

        expect(res.status).toBe(403);
    });

    test('id なし → 400', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });

        const res = await DELETE(makeRequest('http://localhost/api/official-characters', { method: 'DELETE' }));

        expect(res.status).toBe(400);
    });

    test('管理者 → 200', async () => {
        mockAuth.mockResolvedValue({ userId: 'admin-user-001' });
        setupWriteChain();

        const res = await DELETE(makeRequest('http://localhost/api/official-characters?id=oc-1', { method: 'DELETE' }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
    });
});
