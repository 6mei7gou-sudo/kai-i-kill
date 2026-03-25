export const metadata = {
    title: 'お問い合わせ — 電脳怪異譚 KAI-I//KILL',
    description: 'KAI-I//KILLに関するお問い合わせフォーム。ご質問・ご要望・不具合報告などお気軽にどうぞ。',
};

export default function ContactPage() {
    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">CONTACT</div>
                <h1 className="page-header__title">お問い合わせ</h1>
                <div className="page-header__subtitle">ご質問・ご要望・不具合報告など</div>
            </div>

            <div className="callout" style={{ marginBottom: 'var(--space-2xl)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                    KAI-I//KILLに関するお問い合わせは、以下のフォームからお送りください。
                    内容を確認のうえ、必要に応じてご返信いたします。
                </p>
            </div>

            <div style={{
                width: '100%',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: 'var(--border-subtle)',
                background: 'rgba(255,255,255,0.02)',
            }}>
                <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLScHS8VYEbUFw6xAe-WnVL8imj9dPD4Ir-b_K0kCRmMfk4bs2A/viewform?embedded=true"
                    width="100%"
                    height="900"
                    style={{ border: 'none', display: 'block' }}
                    title="お問い合わせフォーム"
                    loading="lazy"
                >
                    読み込み中...
                </iframe>
            </div>
        </div>
    );
}
