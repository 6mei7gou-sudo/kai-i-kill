// Clerk Dev → Production 移行の自動実行
// ログイン後に1度だけ /api/auth/migrate-from-dev を呼び、Dev時代のデータを引き継ぐ
'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export default function MigrationRunner() {
    const { isSignedIn, user, isLoaded } = useUser();
    const ranRef = useRef(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user || ranRef.current) return;

        // セッション中に一度だけ実行（同じタブで何度も叩かない）
        const sessionKey = `kaiii_migrated_${user.id}`;
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) return;

        ranRef.current = true;

        fetch('/api/auth/migrate-from-dev', { method: 'POST' })
            .then(r => r.json())
            .then(json => {
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem(sessionKey, '1');
                }
                if (json.migrated && json.total_rows > 0) {
                    showToast(`✓ Dev環境のデータ ${json.total_rows} 件を引き継ぎました`);
                }
            })
            .catch(() => {});
    }, [isSignedIn, user, isLoaded]);

    return null;
}

function showToast(message) {
    if (typeof document === 'undefined') return;
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = [
        'position:fixed',
        'bottom:24px',
        'left:50%',
        'transform:translateX(-50%)',
        'padding:12px 24px',
        'background:rgba(0,255,170,0.12)',
        'border:1px solid rgba(0,255,170,0.4)',
        'color:#00ffaa',
        'font-family:var(--font-mono, monospace)',
        'font-size:13px',
        'letter-spacing:0.05em',
        'z-index:9999',
        'transition:opacity 0.5s',
        'box-shadow:0 4px 12px rgba(0,0,0,0.4)',
    ].join(';');
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 500);
    }, 6000);
}
