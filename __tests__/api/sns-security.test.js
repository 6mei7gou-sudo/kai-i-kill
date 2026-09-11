/**
 * @jest-environment node
 */

/**
 * SNS API の回帰テスト（2026-09-11 レビュー F04 / F09 / F10）
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

const like = require('../../src/app/api/sns/like/route');
const threads = require('../../src/app/api/sns/threads/route');
const threadDetail = require('../../src/app/api/sns/threads/[id]/route');
const { createHash } = require('crypto');

const asUser = (id) => mockAuth.mockResolvedValue({ userId: id });
const sha = (s) => createHash('sha256').update(s).digest('hex');

function seed() {
    mockDb.current = createFakeSupabase({
        sns_posts: [{ id: 'post-1', user_id: 'author', content: 'hello', like_count: 0, reply_count: 0 }],
        sns_likes: [],
        sns_threads: [
            { id: 'th-open', user_id: 'a', title: '公開スレ', content: '誰でも読める本文', password_mode: 'none', password_hash: null, is_pinned: false, last_replied_at: '2026-09-01T00:00:00.000Z' },
            { id: 'th-entry', user_id: 'a', title: '入場制限スレ', content: '合言葉を知る者だけの本文', password_mode: 'entry', password_hash: sha('secret'), is_pinned: false, last_replied_at: '2026-09-02T00:00:00.000Z' },
        ],
        sns_thread_replies: [{ id: 'r1', thread_id: 'th-entry', user_id: 'a', content: '秘密の返信' }],
    });
    return mockDb.current;
}

beforeEach(() => { jest.clearAllMocks(); });

describe('F09 / F10 いいね', () => {
    test('本文の user_id は無視され、認証ユーザーのいいねだけが作られる', async () => {
        const db = seed(); asUser('me');
        const res = await like.POST(jsonRequest('http://localhost/api/sns/like', 'POST', { post_id: 'post-1', user_id: 'victim' }));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.liked).toBe(true);
        expect(db.rows('sns_likes').map(l => l.user_id)).toEqual(['me']);
    });

    test('通常のいいね→解除が 500 にならずトグルする', async () => {
        const db = seed(); asUser('me');
        const r1 = await like.POST(jsonRequest('http://localhost/api/sns/like', 'POST', { post_id: 'post-1' }));
        expect(r1.status).toBe(200);
        expect((await r1.json()).liked).toBe(true);
        const r2 = await like.POST(jsonRequest('http://localhost/api/sns/like', 'POST', { post_id: 'post-1' }));
        expect(r2.status).toBe(200);
        expect((await r2.json()).liked).toBe(false);
        expect(db.rows('sns_likes')).toHaveLength(0);
    });

    test('他人のいいねは解除できない', async () => {
        const db = seed();
        db.tables.sns_likes.push({ id: 'l-victim', user_id: 'victim', post_id: 'post-1' });
        asUser('me');
        await like.POST(jsonRequest('http://localhost/api/sns/like', 'POST', { post_id: 'post-1', user_id: 'victim' }));
        expect(db.find('sns_likes', l => l.user_id === 'victim')).not.toBeNull();
    });
});

describe('F04 入場制限スレッドの本文', () => {
    test('一覧は entry スレッドの content を返さず password_hash も含まない', async () => {
        seed(); asUser(null);
        const res = await threads.GET(new Request('http://localhost/api/sns/threads'));
        const body = await res.json();
        expect(res.status).toBe(200);
        const entry = body.data.find(t => t.id === 'th-entry');
        const open = body.data.find(t => t.id === 'th-open');
        expect(entry.content).toBeNull();
        expect(entry.locked).toBe(true);
        expect(open.content).toBe('誰でも読める本文');
        for (const t of body.data) expect(t.password_hash).toBeUndefined();
    });

    test('詳細はパスワード一致時のみ本文と返信を返す', async () => {
        seed();
        const ctx = { params: Promise.resolve({ id: 'th-entry' }) };
        const r1 = await threadDetail.GET(new Request('http://localhost/api/sns/threads/th-entry'), ctx);
        const b1 = await r1.json();
        expect(b1.data.locked).toBe(true);
        expect(b1.data.thread.content).toBeNull();
        expect(b1.data.replies).toEqual([]);

        const r2 = await threadDetail.GET(new Request('http://localhost/api/sns/threads/th-entry?password=secret'), ctx);
        const b2 = await r2.json();
        expect(b2.data.locked).toBe(false);
        expect(b2.data.thread.content).toBe('合言葉を知る者だけの本文');
        expect(b2.data.replies).toHaveLength(1);
        expect(b2.data.thread.password_hash).toBeUndefined();
    });
});
