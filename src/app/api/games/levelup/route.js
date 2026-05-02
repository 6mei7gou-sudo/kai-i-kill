// レベルアップAPI — CP消費 / シリアルコード / 公式キャラ（無制限）
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deductCp } from '@/lib/cpService';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// レベルごとの必要CP（現在のレベル → 次のレベルに上がるためのコスト）
const LEVELUP_CP_TABLE = {
    1: 100,    // Lv1→2
    2: 150,    // Lv2→3
    3: 250,    // Lv3→4
    4: 400,    // Lv4→5
    5: 500,    // Lv5→6
    6: 600,    // Lv6→7
    7: 700,    // Lv7→8
    8: 800,    // Lv8→9
    9: 900,    // Lv9→10
    10: 1000,  // Lv10→11
    11: 1100,  // Lv11→12
    12: 1200,  // Lv12→13
    13: 1300,  // Lv13→14
    14: 1400,  // Lv14→15
    15: 1500,  // Lv15→16
    16: 1600,  // Lv16→17
    17: 1700,  // Lv17→18
    18: 1800,  // Lv18→19
    19: 1900,  // Lv19→20
};
const PL_MAX_LEVEL = 5;
const OFFICIAL_MAX_LEVEL = 20;

// POST: レベルアップ
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { character_id, method, code } = body;
        // method: 'cp' | 'serial' | 'official'

        if (!character_id || !method) {
            return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 });
        }

        // キャラクター取得
        const { data: char, error: charErr } = await supabase
            .from('character_sheets')
            .select('id, user_id, character_name, level, is_official')
            .eq('id', character_id)
            .single();

        if (charErr || !char) {
            return NextResponse.json({ error: 'キャラクターが見つかりません' }, { status: 404 });
        }

        // 所有権チェック
        if (char.user_id !== userId) {
            return NextResponse.json({ error: '自分のキャラクターのみレベルアップできます' }, { status: 403 });
        }

        const currentLevel = char.level || 1;
        const maxLevel = char.is_official ? OFFICIAL_MAX_LEVEL : PL_MAX_LEVEL;

        // 上限チェック
        if (currentLevel >= maxLevel) {
            return NextResponse.json({ error: `最大レベル（Lv${maxLevel}）に達しています` }, { status: 400 });
        }

        const newLevel = currentLevel + 1;

        // === 方法別の処理 ===

        if (method === 'official') {
            // 公式キャラ：無条件でレベルアップ
            if (!char.is_official) {
                return NextResponse.json({ error: '公式キャラクターではありません' }, { status: 403 });
            }
        } else if (method === 'cp') {
            // CP消費でレベルアップ（レベルごとにコストが増加）
            const cost = LEVELUP_CP_TABLE[currentLevel];
            if (!cost) {
                return NextResponse.json({ error: `Lv${currentLevel}からのCP消費レベルアップはできません` }, { status: 400 });
            }
            try {
                await deductCp(supabase, userId, cost, character_id,
                    `「${char.character_name}」レベルアップ（Lv${currentLevel}→${newLevel}、${cost}CP）`);
            } catch (err) {
                return NextResponse.json({ error: err.message }, { status: 400 });
            }
        } else if (method === 'serial') {
            // シリアルコードでレベルアップ
            if (!code) {
                return NextResponse.json({ error: 'シリアルコードが必要です' }, { status: 400 });
            }

            const upperCode = code.trim().toUpperCase();

            // コード検証
            const { data: serial, error: serialErr } = await supabase
                .from('serial_codes')
                .select('*')
                .eq('code', upperCode)
                .eq('achievement_type', 'levelup')
                .maybeSingle();

            if (serialErr || !serial) {
                return NextResponse.json({ error: 'レベルアップ用のシリアルコードが見つかりません' }, { status: 404 });
            }

            // 有効期限チェック
            if (serial.expires_at && new Date(serial.expires_at) < new Date()) {
                return NextResponse.json({ error: 'このコードは有効期限切れです' }, { status: 400 });
            }

            // 使用回数チェック
            if (serial.current_uses >= serial.max_uses) {
                return NextResponse.json({ error: 'このコードは使用上限に達しています' }, { status: 400 });
            }

            // 使用回数をインクリメント
            await supabase
                .from('serial_codes')
                .update({ current_uses: serial.current_uses + 1 })
                .eq('id', serial.id);
        } else {
            return NextResponse.json({ error: '不正なレベルアップ方法です' }, { status: 400 });
        }

        // レベルを更新
        const { data: updated, error: updateErr } = await supabase
            .from('character_sheets')
            .update({ level: newLevel, updated_at: new Date().toISOString() })
            .eq('id', character_id)
            .select()
            .single();

        if (updateErr) throw updateErr;

        // 次のレベルアップコストも返す
        const nextCost = LEVELUP_CP_TABLE[newLevel] || null;

        return NextResponse.json({
            ok: true,
            data: updated,
            levelUp: { from: currentLevel, to: newLevel, method },
            nextCost,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
