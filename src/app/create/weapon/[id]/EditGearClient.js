// 武器・装備 編集 — クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { fetchPost } from '@/lib/postsApi';
import WeaponForm from '../WeaponForm';

export default function EditGearClient({ id }) {
    const { user, isLoaded } = useUser();
    const [entry, setEntry] = useState(null);
    const [characterBonus, setCharacterBonus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoaded) return;
        (async () => {
            // 武器データ取得
            const data = await fetchPost('gear_posts', id);
            if (!data) { setError('データの取得に失敗しました'); setLoading(false); return; }
            setEntry(data);

            // この武器に紐づくキャラクターを検索してCP補正を計算（自分のキャラは限定公開でも取得できる）
            let chars = [];
            try {
                const params = new URLSearchParams({ table: 'character_sheets', linked_gear_id: id });
                if (user?.id) params.set('user_id', user.id);
                const res = await fetch(`/api/posts?${params.toString()}`);
                const json = await res.json();
                if (json.ok) chars = json.data || [];
            } catch (_) {}

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
    }, [id, isLoaded, user?.id]);

    if (!isLoaded || loading) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    if (error) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--accent-danger)' }}>{error}</div>;
    if (!entry) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>装備データが見つかりませんでした。</div>;

    if (entry.user_id && entry.user_id !== user?.id) {
        return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--accent-danger)' }}>この装備データを編集する権限がありません。</div>;
    }

    return <WeaponForm editId={id} initialData={entry} characterBonus={characterBonus} originalTotalCp={entry.total_cp || 0} />;
}
