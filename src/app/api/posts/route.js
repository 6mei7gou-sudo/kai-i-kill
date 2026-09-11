// 投稿API — サーバーサイドでClerk認証を検証してSupabaseに書き込む
//
// セキュリティ方針（2026-09-11 レビュー F02 / F05 / F07 対応）
// - 管理用・進行用の列（user_id / is_official / approved_* / level / status_points_used / active_title）は
//   本APIでは書き換えない。承認は /api/approve、成長は /api/games/* が担う
// - 非公開（novels: 非公開）の行は所有者と管理者にしか返さない。限定（限定）は一覧に出さないが、IDを知っていれば閲覧できる
// - 装備（gear_posts）のCPはサーバーで再計算し、投稿前に残高から引き落とす。残高不足なら投稿しない。
//   編集時の返還は、台帳上その装備に実際に支払われている額を上限とする
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseServer as supabase, ADMIN_IDS } from '@/lib/supabaseServer';
import { awardCp, deductCp, adjustCp, calcBackgroundCpBonus, getNetPaidForSource, CpInsufficientError } from '@/lib/cpService';
import { calcGearCost } from '@/lib/gearCost';

const VALID_TABLES = ['anomaly_drafts', 'gear_posts', 'character_sheets', 'novels'];

// 本APIから書き換えられない列（作成時はDB既定値、変更は専用APIのみ）
const PROTECTED_COLUMNS = [
    'id', 'user_id', 'created_at', 'updated_at',
    'is_official', 'approved_status', 'approved_at', 'approved_by',
    'level', 'status_points_used', 'active_title',
];
// 管理者だけが本APIから設定できる列
const ADMIN_ONLY_COLUMNS = ['is_official'];
// gear_posts でサーバーが計算する列
const GEAR_COMPUTED_COLUMNS = ['total_cp', 'base_cp', 'option_count', 'options'];

// 一覧・詳細で「公開」以外を隠す値（テーブルごと）
const PRIVATE_VISIBILITY = { novels: ['非公開'] };   // 所有者・管理者のみ閲覧可
const UNLISTED_VISIBILITY = { anomaly_drafts: ['限定'], gear_posts: ['限定'], character_sheets: ['限定'] }; // 一覧に出さない

function isAdminUser(userId) {
    return !!userId && ADMIN_IDS.includes(userId);
}

async function getViewerId() {
    try {
        const session = await auth();
        return session?.userId || null;
    } catch (_) {
        return null;
    }
}

/** 入力データから保護列を取り除く */
function sanitizeInput(data, { admin = false } = {}) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const clean = {};
    for (const [key, value] of Object.entries(data)) {
        if (PROTECTED_COLUMNS.includes(key) && !(admin && ADMIN_ONLY_COLUMNS.includes(key))) continue;
        clean[key] = value;
    }
    return clean;
}

/** gear_posts のコスト列をサーバー計算値で上書きする */
function applyGearCost(payload, merged) {
    const cost = calcGearCost(merged);
    for (const col of GEAR_COMPUTED_COLUMNS) delete payload[col];
    payload.total_cp = cost.totalCp;
    payload.base_cp = cost.baseCp;
    payload.option_count = cost.optionCount;
    payload.options = cost.options;
    return cost;
}

function cpErrorResponse(err) {
    if (err instanceof CpInsufficientError) {
        return NextResponse.json({ error: err.message, balance: err.balance, required: err.required }, { status: 400 });
    }
    return null;
}

// GET: 投稿一覧取得（table と user_id でフィルタ可）／ id 指定で単一取得
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const table = searchParams.get('table');
        const userId = searchParams.get('user_id');
        const id = searchParams.get('id');
        const linkedGearId = searchParams.get('linked_gear_id');

        if (!VALID_TABLES.includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }

        const viewerId = await getViewerId();
        const admin = isAdminUser(viewerId);

        // 単一取得：非公開は所有者・管理者のみ
        if (id) {
            const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
            if (error) throw error;
            if (!data) return NextResponse.json({ error: '見つかりません' }, { status: 404 });
            const isOwner = !!viewerId && data.user_id === viewerId;
            const privateValues = PRIVATE_VISIBILITY[table] || [];
            if (privateValues.includes(data.visibility) && !isOwner && !admin) {
                return NextResponse.json({ error: '見つかりません' }, { status: 404 });
            }
            return NextResponse.json({ ok: true, data });
        }

        // 一覧：自分の投稿か管理者なら全件。それ以外は「公開」のみ
        const ownList = !!userId && userId === viewerId;
        let query = supabase.from(table).select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        if (linkedGearId && table === 'character_sheets') query = query.eq('linked_gear_id', linkedGearId);
        if (!ownList && !admin) query = query.eq('visibility', '公開');

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: 新規投稿
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { table, data } = body;

        if (!VALID_TABLES.includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }

        const admin = isAdminUser(userId);
        const clean = sanitizeInput(data, { admin });
        if (!clean) {
            return NextResponse.json({ error: 'data はオブジェクトが必要です' }, { status: 400 });
        }

        const payload = { ...clean, user_id: userId };

        // 武器投稿：コストをサーバー計算し、投稿前に残高から引き落とす（管理者は免除）
        let cpDeducted = 0;
        let gearId = null;
        if (table === 'gear_posts') {
            const cost = applyGearCost(payload, clean);
            gearId = randomUUID();
            payload.id = gearId;
            if (cost.totalCp > 0 && !admin) {
                try {
                    await deductCp(supabase, userId, cost.totalCp, gearId,
                        `装備「${payload.gear_name || ''}」の製作（${cost.totalCp}CP）`);
                    cpDeducted = cost.totalCp;
                } catch (err) {
                    const res = cpErrorResponse(err);
                    if (res) return res;
                    throw err;
                }
            }
        }

        const { data: result, error } = await supabase
            .from(table)
            .insert([payload])
            .select()
            .single();

        if (error) {
            // 引き落とし後に投稿へ失敗した場合は返還する
            if (cpDeducted > 0) {
                try {
                    await adjustCp(supabase, userId, cpDeducted, 'gear_craft', gearId, '装備投稿の失敗による返還');
                } catch (_) { /* 返還失敗は握りつぶさずログのみ */ console.error('CP返還に失敗:', gearId); }
            }
            throw error;
        }

        // キャラ作成時：背景×装備分類のCP補正をアカウントに付与
        let cpAwarded = 0;
        if (table === 'character_sheets') {
            try {
                const bonus = calcBackgroundCpBonus(clean.background, clean.equipment_type);
                if (bonus > 0) {
                    await awardCp(supabase, userId, bonus, 'initial', result.id,
                        `キャラ「${clean.character_name}」作成ボーナス（背景「${clean.background}」+${bonus}CP）`);
                    cpAwarded = bonus;
                }
            } catch (_) { /* CP付与失敗はキャラ作成に影響させない */ }
        }

        return NextResponse.json({ ok: true, data: result, cpAwarded, cpDeducted });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: 編集（自分の投稿のみ。管理者は全件）
export async function PATCH(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { table, id, data } = body;

        if (!VALID_TABLES.includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }
        if (!id) {
            return NextResponse.json({ error: 'id は必須です' }, { status: 400 });
        }

        const admin = isAdminUser(userId);
        const clean = sanitizeInput(data, { admin });
        if (!clean) {
            return NextResponse.json({ error: 'data はオブジェクトが必要です' }, { status: 400 });
        }

        // 所有権チェック（gear_posts はコスト再計算のため全列を取得）
        const selectCols = table === 'gear_posts' ? '*' : 'user_id';
        const { data: existing, error: fetchError } = await supabase
            .from(table).select(selectCols).eq('id', id).single();
        if (fetchError) throw fetchError;
        if (existing.user_id !== userId && !admin) {
            return NextResponse.json({ error: '自分の投稿のみ編集できます' }, { status: 403 });
        }

        const payload = { ...clean, updated_at: new Date().toISOString() };

        // 武器編集：コスト差分を先に引き落とす（増額）／更新後に返還（減額。支払い済み額が上限）
        let cpDelta = 0;
        let deductedNow = 0;
        let refundPlanned = 0;
        if (table === 'gear_posts') {
            const merged = { ...existing, ...clean };
            const cost = applyGearCost(payload, merged);
            const oldCp = existing.total_cp || 0;
            const diff = cost.totalCp - oldCp;
            if (diff > 0 && !admin) {
                try {
                    await deductCp(supabase, userId, diff, id,
                        `装備「${merged.gear_name || ''}」の改修（+${diff}CP）`);
                    deductedNow = diff;
                    cpDelta = diff;
                } catch (err) {
                    const res = cpErrorResponse(err);
                    if (res) return res;
                    throw err;
                }
            } else if (diff < 0 && !admin) {
                const netPaid = await getNetPaidForSource(supabase, userId, id);
                refundPlanned = Math.min(-diff, netPaid);
            }
        }

        const { data: result, error } = await supabase
            .from(table)
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (deductedNow > 0) {
                try {
                    await adjustCp(supabase, userId, deductedNow, 'gear_craft', id, '装備更新の失敗による返還');
                } catch (_) { console.error('CP返還に失敗:', id); }
            }
            throw error;
        }

        if (refundPlanned > 0) {
            try {
                await awardCp(supabase, userId, refundPlanned, 'gear_craft', id,
                    `装備「${result.gear_name || ''}」の改修による返還（${refundPlanned}CP）`);
                cpDelta = -refundPlanned;
            } catch (_) { /* 返還失敗は更新に影響させない */ }
        }

        return NextResponse.json({ ok: true, data: result, cpDelta });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: 削除（自分の投稿のみ。管理者は全件）
export async function DELETE(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const table = searchParams.get('table');
        const id = searchParams.get('id');

        if (!VALID_TABLES.includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }
        if (!id) {
            return NextResponse.json({ error: 'id は必須です' }, { status: 400 });
        }

        // 所有権チェック
        const { data: existing, error: fetchError } = await supabase
            .from(table).select('user_id').eq('id', id).single();
        if (fetchError) throw fetchError;
        if (existing.user_id !== userId && !isAdminUser(userId)) {
            return NextResponse.json({ error: '自分の投稿のみ削除できます' }, { status: 403 });
        }

        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
