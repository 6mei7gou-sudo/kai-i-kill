// 小説投稿ページ
'use client';

import { Show, RedirectToSignIn } from '@clerk/nextjs';
import NovelForm from './NovelForm';

export default function CreateNovelPage() {
    return (
        <>
            <Show when="signed-out"><RedirectToSignIn /></Show>
            <Show when="signed-in">
                <NovelForm />
            </Show>
        </>
    );
}
