// ステータスポイント消費API — 5レベルごとに獲得するポイントで能力値ランクを1段階上げる
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 7属性のフィールド名
const VALID_ATTRS = ['tai', 'haya', 'shiki', 'han', 'shiya', 'jutsu', 'kon'];

// ランクの順序（D が一番低く、S が最高）
const RANK_ORDER = ['D', 'C', 'B', 'A', 'S'];

// レベルから利用可能ポイント数を算出（5レベルごとに1ポイント）
function calcAvailablePoints(level) {
    return Math.floor((level || 1) / 5);
}

// POST: ステータスポイントを消費して能力値ランクを1段階上げる
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { character_id, attribute } = body;
        // attribute: 'tai' | 'haya' | 'shiki' | 'han' | 'shiya' | 'jutsu' | 'kon'

        if (!character_id || !attribute) {
            return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 });
        }

        if (!VALID_ATTRS.includes(attribute)) {
            return NextResponse.json({ error: '不正な能力値です' }, { status: 400 });
        }

        const rankField = `rank_${attribute}`;

        // キャラクター取得
        const { data: char, error: charErr } = await supabase
            .from('character_sheets')
            .select(`id, user_id, character_name, level, status_points_used, ${rankField}`)
            .eq('id', character_id)
            .single();

        if (charErr || !char) {
            return NextResponse.json({ error: 'キャラクターが見つかりません' }, { status: 404 });
        }

        // 所有権チェック
        if (char.user_id !== userId) {
            return NextResponse.json({ error: '自分のキャラクターのみ操作できます' }, { status: 403 });
        }

        // 残高チェック
        const available = calcAvailablePoints(char.level) - (char.status_points_used || 0);
        if (available <= 0) {
            return NextResponse.json({ error: '利用可能なステータスポイントがありません' }, { status: 400 });
        }

        // ランク上限チェック
        const currentRank = char[rankField] || 'D';
        const currentIdx = RANK_ORDER.indexOf(currentRank);
        if (currentIdx === -1) {
            return NextResponse.json({ error: '現在のランクが不正です' }, { status: 500 });
        }
        if (currentIdx >= RANK_ORDER.length - 1) {
            return NextResponse.json({ error: 'すでに最大ランク(S)に達しています' }, { status: 400 });
        }

        const newRank = RANK_ORDER[currentIdx + 1];
        const newUsed = (char.status_points_used || 0) + 1;

        // 更新
        const { data: updated, error: updateErr } = await supabase
            .from('character_sheets')
            .update({
                [rankField]: newRank,
                status_points_used: newUsed,
                updated_at: new Date().toISOString(),
            })
            .eq('id', character_id)
            .select()
            .single();

        if (updateErr) throw updateErr;

        return NextResponse.json({
            ok: true,
            data: updated,
            attribute,
            from: currentRank,
            to: newRank,
            remaining: calcAvailablePoints(char.level) - newUsed,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
