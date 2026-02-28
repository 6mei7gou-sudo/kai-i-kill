// モバイルメニューボタン — クライアントコンポーネント
'use client';

export default function MobileMenuButton() {
    const toggle = () => {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('site-sidebar--open');
    };

    return (
        <button
            className="mobile-menu-btn"
            aria-label="メニューを開く"
            onClick={toggle}
        >
            ☰
        </button>
    );
}
