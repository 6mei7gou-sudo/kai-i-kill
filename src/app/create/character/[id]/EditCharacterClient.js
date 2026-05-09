// キャラクターシート編集 — クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import CharacterForm from '../CharacterForm';

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

export default function EditCharacterClient({ id }) {
    const { user, isLoaded } = useUser();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            const { data, error: e } = await supabase.from('character_sheets').select('*').eq('id', id).single();
            if (e) setError('データの取得に失敗しました');
            else setEntry(data);
            setLoading(false);
        })();
    }, [id]);

    if (!isLoaded || loading) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    if (error) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--accent-danger)' }}>{error}</div>;
    if (!entry) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>シートが見つかりませんでした。</div>;
    const isAdmin = !!(user && ADMIN_IDS.includes(user.id));
    if (entry.user_id && entry.user_id !== user?.id && !isAdmin) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--accent-danger)' }}>このシートを編集する権限がありません。</div>;

    return <CharacterForm editId={id} initialData={entry} />;
}
