// 小説編集ページ
'use client';

import { useEffect, useState, use } from 'react';
import { Show, RedirectToSignIn, useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import NovelForm from '../NovelForm';

export default function EditNovelPage({ params }) {
    const { id } = use(params);
    const { user, isLoaded } = useUser();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('novels').select('*').eq('id', id).single();
            setEntry(data || null);
            setLoading(false);
        })();
    }, [id]);

    if (loading || !isLoaded) {
        return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    }
    if (!entry) {
        return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>小説が見つかりませんでした。</div>;
    }
    if (entry.user_id && entry.user_id !== user?.id) {
        return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>この小説を編集する権限がありません。</div>;
    }

    return (
        <>
            <Show when="signed-out"><RedirectToSignIn /></Show>
            <Show when="signed-in">
                <NovelForm editId={id} initialData={entry} />
            </Show>
        </>
    );
}
