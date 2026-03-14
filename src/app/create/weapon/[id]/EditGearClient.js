// 武器・装備 編集 — クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import WeaponForm from '../WeaponForm';

export default function EditGearClient({ id }) {
    const { user, isLoaded } = useUser();
    const [entry, setEntry] = useState(null);
    const [characterBonus, setCharacterBonus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            // 武器データ取得
            const { data, error: e } = await supabase
                .from('gear_posts').select('*').eq('id', id).single();
            if (e) { setError('データの取得に失敗しました'); setLoading(false); return; }
            setEntry(data);

            // この武器に紐づくキャラクターを検索してCP補正を計算
            const { data: chars } = await supabase
                .from('character_sheets')
                .select('character_name, background, equipment_type, sub_affiliation')
                .eq('linked_gear_id', id)
                .limit(1);

            if (chars && chars.length > 0) {
                const ch = chars[0];
                let bonusCp = 0;
                const details = [];
                if (ch.background === '鋼の肉体' && (ch.equipment_type === '武装型' || ch.equipment_type === '半装身型')) {
                    bonusCp += 4; details.push('背景「鋼の肉体」+4CP');
                }
                if (ch.background === 'ハッカー上がり' && ch.equipment_type === '独立型') {
                    bonusCp += 3; details.push('背景「ハッカー上がり」+3CP');
                }
                setCharacterBonus({
                    characterName: ch.character_name,
                    bonusCp,
                    bonusDetail: details.join('、'),
                });
            }
            setLoading(false);
        })();
    }, [id]);

    if (!isLoaded || loading) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    if (error) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--accent-danger)' }}>{error}</div>;
    if (!entry) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>装備データが見つかりませんでした。</div>;

    if (entry.user_id && entry.user_id !== user?.id) {
        return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--accent-danger)' }}>この装備データを編集する権限がありません。</div>;
    }

    return <WeaponForm editId={id} initialData={entry} characterBonus={characterBonus} />;
}
