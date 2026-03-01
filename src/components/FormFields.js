// 投稿フォーム共通コンポーネント
'use client';

// スタイル定数
export const S = {
    section: {
        marginBottom: 'var(--space-3xl)',
        padding: 'var(--space-xl)',
        background: 'var(--bg-card)',
        border: 'var(--border-subtle)',
    },
    sectionTitle: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--accent-gold)',
        letterSpacing: '0.1em',
        marginBottom: 'var(--space-xs)',
        textTransform: 'uppercase',
    },
    sectionHeading: {
        fontSize: 'var(--font-size-xl)',
        marginBottom: 'var(--space-lg)',
    },
    label: {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--space-xs)',
    },
    input: {
        width: '100%',
        background: 'var(--bg-elevated)',
        border: 'var(--border-subtle)',
        color: 'var(--text-primary)',
        padding: '10px 14px',
        fontSize: 'var(--font-size-base)',
        fontFamily: 'inherit',
        outline: 'none',
    },
    textarea: {
        width: '100%',
        background: 'var(--bg-elevated)',
        border: 'var(--border-subtle)',
        color: 'var(--text-primary)',
        padding: '10px 14px',
        fontSize: 'var(--font-size-base)',
        fontFamily: 'inherit',
        outline: 'none',
        minHeight: '80px',
        resize: 'vertical',
    },
    select: {
        background: 'var(--bg-elevated)',
        border: 'var(--border-subtle)',
        color: 'var(--text-primary)',
        padding: '10px 14px',
        fontSize: 'var(--font-size-base)',
        fontFamily: 'inherit',
        cursor: 'pointer',
    },
    fieldGroup: {
        marginBottom: 'var(--space-lg)',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)',
    },
    addBtn: {
        padding: '6px 14px',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-mono)',
        background: 'transparent',
        border: '1px dashed rgba(255,255,255,0.2)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
    },
    submitBtn: {
        padding: '16px 48px',
        fontSize: 'var(--font-size-lg)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        background: 'linear-gradient(135deg, rgba(0, 255, 170, 0.2), rgba(0, 170, 255, 0.2))',
        border: '1px solid var(--accent-cyber)',
        color: 'var(--accent-cyber)',
        cursor: 'pointer',
        letterSpacing: '0.1em',
        transition: 'all 0.3s ease',
        width: '100%',
    },
    hint: {
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text-muted)',
        marginTop: '4px',
        fontStyle: 'italic',
    },
    tagBtn: (active) => ({
        padding: '6px 14px',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-mono)',
        background: active ? 'rgba(0, 255, 170, 0.15)' : 'var(--bg-elevated)',
        border: active ? '1px solid var(--accent-cyber)' : 'var(--border-subtle)',
        color: active ? 'var(--accent-cyber)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    }),
};

// セレクト入力
export function FormSelect({ label, value, onChange, options, hint }) {
    return (
        <div style={S.fieldGroup}>
            <label style={S.label}>{label}</label>
            <select style={S.select} value={value} onChange={e => onChange(e.target.value)}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {hint && <div style={S.hint}>{hint}</div>}
        </div>
    );
}

// テキスト入力
export function FormInput({ label, value, onChange, placeholder, hint, type = 'text' }) {
    return (
        <div style={S.fieldGroup}>
            <label style={S.label}>{label}</label>
            <input
                style={S.input}
                type={type}
                value={value}
                onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
            />
            {hint && <div style={S.hint}>{hint}</div>}
        </div>
    );
}

// テキストエリア
export function FormTextArea({ label, value, onChange, placeholder, hint }) {
    return (
        <div style={S.fieldGroup}>
            <label style={S.label}>{label}</label>
            <textarea
                style={S.textarea}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {hint && <div style={S.hint}>{hint}</div>}
        </div>
    );
}

// 動的リスト入力
export function FormDynamicList({ label, items, onUpdate, onAdd, onRemove, placeholder, hint }) {
    return (
        <div style={S.fieldGroup}>
            <label style={S.label}>{label}</label>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <input
                        style={{ ...S.input, flex: 1 }}
                        value={item}
                        onChange={e => onUpdate(i, e.target.value)}
                        placeholder={`${placeholder} ${i + 1}`}
                    />
                    {items.length > 1 && (
                        <button type="button"
                            style={{ ...S.addBtn, color: 'var(--accent-danger)', borderColor: 'rgba(255,77,77,0.3)' }}
                            onClick={() => onRemove(i)}>✕</button>
                    )}
                </div>
            ))}
            <button type="button" style={S.addBtn} onClick={onAdd}>+ 追加</button>
            {hint && <div style={S.hint}>{hint}</div>}
        </div>
    );
}
