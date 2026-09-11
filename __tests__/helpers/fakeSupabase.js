/**
 * テスト用のインメモリ Supabase クライアント（supabase-js のクエリビルダーの最小互換）
 *
 * 対応：from / select / insert / update / delete / upsert / eq / neq / is / in / gt / gte / lt / lte /
 *       like / order / limit / single / maybeSingle / rpc
 * 目的：APIルートを実際のクエリ列で動かし、認可・列制限・CP台帳・条件付き更新の挙動を検証する。
 */
const { randomUUID } = require('crypto');

function clone(v) {
    return v === undefined ? undefined : JSON.parse(JSON.stringify(v));
}

function likeToRegex(pattern) {
    const esc = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
    return new RegExp(`^${esc}$`);
}

class FakeQuery {
    constructor(db, table) {
        this.db = db;
        this.table = table;
        this.op = 'select';
        this.filters = [];
        this.orders = [];
        this.limitN = null;
        this.mode = 'many';
        this.columns = null;
        this.payload = null;
        this.upsertOpts = null;
        this.wantReturn = false;
    }

    // ── 操作 ──
    select(cols) {
        if (this.op === 'select') this.columns = cols || '*';
        else { this.wantReturn = true; this.columns = cols || '*'; }
        return this;
    }
    insert(rows) { this.op = 'insert'; this.payload = Array.isArray(rows) ? rows : [rows]; return this; }
    upsert(rows, opts = {}) { this.op = 'upsert'; this.payload = Array.isArray(rows) ? rows : [rows]; this.upsertOpts = opts; return this; }
    update(values) { this.op = 'update'; this.payload = values; return this; }
    delete() { this.op = 'delete'; return this; }

    // ── フィルタ ──
    eq(col, val) { this.filters.push(r => val !== null && val !== undefined && r[col] === val); return this; }
    neq(col, val) { this.filters.push(r => r[col] !== val); return this; }
    is(col, val) { this.filters.push(r => (val === null ? (r[col] === null || r[col] === undefined) : r[col] === val)); return this; }
    in(col, arr) { this.filters.push(r => (arr || []).includes(r[col])); return this; }
    gt(col, val) { this.filters.push(r => r[col] > val); return this; }
    gte(col, val) { this.filters.push(r => r[col] >= val); return this; }
    lt(col, val) { this.filters.push(r => r[col] < val); return this; }
    lte(col, val) { this.filters.push(r => r[col] <= val); return this; }
    like(col, pattern) { const re = likeToRegex(pattern); this.filters.push(r => re.test(String(r[col] ?? ''))); return this; }
    order(col, { ascending = true } = {}) { this.orders.push({ col, ascending }); return this; }
    limit(n) { this.limitN = n; return this; }
    single() { this.mode = 'single'; return this; }
    maybeSingle() { this.mode = 'maybe'; return this; }

    // ── 実行 ──
    then(resolve, reject) {
        let result;
        try { result = this._run(); } catch (err) { return Promise.reject(err).then(resolve, reject); }
        return Promise.resolve(result).then(resolve, reject);
    }

    _rows() { return this.db.tables[this.table] || (this.db.tables[this.table] = []); }
    _schema() { return this.db.schema[this.table] || {}; }
    _match(row) { return this.filters.every(f => f(row)); }

    _project(row) {
        if (!this.columns || this.columns === '*') return clone(row);
        const out = {};
        for (const c of this.columns.split(',').map(s => s.trim()).filter(Boolean)) out[c] = clone(row[c]);
        return out;
    }

    _finish(rows) {
        const data = rows.map(r => this._project(r));
        if (this.mode === 'single') {
            if (data.length !== 1) {
                return { data: null, error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' } };
            }
            return { data: data[0], error: null };
        }
        if (this.mode === 'maybe') {
            if (data.length > 1) return { data: null, error: { code: 'PGRST116', message: 'multiple rows returned' } };
            return { data: data[0] ?? null, error: null };
        }
        return { data, error: null };
    }

    _checkUnique(row, ignoreRow = null) {
        const { unique = [] } = this._schema();
        for (const cols of unique) {
            const dup = this._rows().find(r => r !== ignoreRow && cols.every(c => r[c] === row[c] && row[c] !== undefined && row[c] !== null));
            if (dup) return { code: '23505', message: `duplicate key value violates unique constraint (${cols.join(',')})` };
        }
        return null;
    }

    _applyDefaults(row) {
        const { defaults = {} } = this._schema();
        const out = { ...row };
        if (!out.id) out.id = randomUUID();
        if (!out.created_at) out.created_at = new Date().toISOString();
        for (const [k, v] of Object.entries(defaults)) {
            if (out[k] === undefined) out[k] = typeof v === 'function' ? v() : clone(v);
        }
        return out;
    }

    _run() {
        this.db.log.push({ table: this.table, op: this.op, payload: clone(this.payload) });
        const rows = this._rows();

        if (this.op === 'select') {
            let hit = rows.filter(r => this._match(r));
            for (const o of [...this.orders].reverse()) {
                hit = [...hit].sort((a, b) => {
                    const x = a[o.col], y = b[o.col];
                    if (x === y) return 0;
                    const cmp = x > y ? 1 : -1;
                    return o.ascending ? cmp : -cmp;
                });
            }
            if (this.limitN != null) hit = hit.slice(0, this.limitN);
            return this._finish(hit);
        }

        if (this.op === 'insert') {
            const inserted = [];
            for (const raw of this.payload) {
                const row = this._applyDefaults(raw);
                const err = this._checkUnique(row);
                if (err) return { data: null, error: err };
                rows.push(row);
                inserted.push(row);
            }
            return this.wantReturn ? this._finish(inserted) : { data: null, error: null };
        }

        if (this.op === 'upsert') {
            const conflictCols = (this.upsertOpts.onConflict || 'id').split(',').map(s => s.trim());
            const out = [];
            for (const raw of this.payload) {
                const existing = rows.find(r => conflictCols.every(c => r[c] === raw[c]));
                if (existing) {
                    if (this.upsertOpts.ignoreDuplicates) continue;
                    Object.assign(existing, clone(raw));
                    out.push(existing);
                } else {
                    const row = this._applyDefaults(raw);
                    rows.push(row);
                    out.push(row);
                }
            }
            return this.wantReturn ? this._finish(out) : { data: null, error: null };
        }

        if (this.op === 'update') {
            const hit = rows.filter(r => this._match(r));
            for (const r of hit) {
                const next = { ...r, ...clone(this.payload) };
                const err = this._checkUnique(next, r);
                if (err) return { data: null, error: err };
                Object.assign(r, clone(this.payload));
            }
            return this.wantReturn ? this._finish(hit) : { data: null, error: null };
        }

        if (this.op === 'delete') {
            const hit = rows.filter(r => this._match(r));
            this.db.tables[this.table] = rows.filter(r => !hit.includes(r));
            return this.wantReturn ? this._finish(hit) : { data: null, error: null };
        }

        throw new Error(`unsupported op ${this.op}`);
    }
}

/**
 * @param {Record<string, object[]>} tables 初期データ
 * @param {object} [options]
 * @param {Record<string, {unique?: string[][], defaults?: object}>} [options.schema]
 * @param {boolean} [options.withCpRpc] cp_adjust RPC を有効にする（false なら PGRST202 で「未適用」を再現）
 */
function createFakeSupabase(tables = {}, options = {}) {
    const db = {
        tables: Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, clone(v)])),
        schema: {
            sns_likes: { unique: [['user_id', 'post_id']] },
            account_cp: { unique: [['user_id']] },
            adv_completions: { unique: [['user_id', 'character_id', 'scenario_id']] },
            character_achievements: { unique: [['character_id', 'achievement_id']] },
            dispatch_quests: { defaults: { started_at: () => new Date().toISOString() } },
            character_sheets: { defaults: { level: 1, status_points_used: 0, visibility: '公開', is_official: false, approved_status: 'pending' } },
            gear_posts: { defaults: { visibility: '公開', total_cp: 0, is_official: false, approved_status: 'pending' } },
            novels: { defaults: { visibility: '公開', is_official: false, approved_status: 'pending' } },
            anomaly_drafts: { defaults: { visibility: '公開', is_official: false, approved_status: 'pending' } },
            ...(options.schema || {}),
        },
        log: [],
        from(table) { return new FakeQuery(db, table); },
        rpc(name, args) {
            if (name === 'cp_adjust' && options.withCpRpc) {
                return Promise.resolve(cpAdjustRpc(db, args));
            }
            return Promise.resolve({ data: null, error: { code: 'PGRST202', message: `Could not find the function public.${name}` } });
        },
        rows(table) { return db.tables[table] || []; },
        find(table, pred) { return (db.tables[table] || []).find(pred) || null; },
    };
    return db;
}

// DB関数 cp_adjust() のインメモリ再現（同期的に残高更新＋履歴挿入）
function cpAdjustRpc(db, { p_user_id, p_amount, p_source_type, p_source_id, p_description }) {
    const accounts = db.tables.account_cp || (db.tables.account_cp = []);
    const txs = db.tables.cp_transactions || (db.tables.cp_transactions = []);
    let acc = accounts.find(a => a.user_id === p_user_id);
    if (!acc) {
        acc = { user_id: p_user_id, balance: 10, created_at: new Date().toISOString() };
        accounts.push(acc);
        txs.push({ id: randomUUID(), user_id: p_user_id, amount: 10, balance_after: 10, source_type: 'initial', description: '初期CP付与', created_at: new Date().toISOString() });
    }
    if (acc.balance + p_amount < 0) {
        return { data: null, error: { code: 'P0001', message: 'CP_INSUFFICIENT' } };
    }
    acc.balance += p_amount;
    txs.push({ id: randomUUID(), user_id: p_user_id, amount: p_amount, balance_after: acc.balance, source_type: p_source_type, source_id: p_source_id, description: p_description, created_at: new Date().toISOString() });
    return { data: acc.balance, error: null };
}

/** JSON リクエストの簡易生成 */
function jsonRequest(url, method, body) {
    return new Request(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

module.exports = { createFakeSupabase, jsonRequest };
