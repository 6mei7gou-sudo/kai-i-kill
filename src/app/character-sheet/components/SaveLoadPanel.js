'use client';

// 保存/読み込みパネル — localStorage ベース
// ログイン時は Supabase 保存も対応予定（Phase 1-2 後半で統合）
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kai_characters';

function getSavedList() {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
}

export default function SaveLoadPanel({ state, onLoad, onReset }) {
    const [savedList, setSavedList] = useState([]);

    // 初回マウント時に読み込み
    useEffect(() => {
        setSavedList(getSavedList());
    }, []);

    const handleSave = () => {
        const name = state.name || '名無しの討伐者';
        const entry = {
            id: Date.now().toString(),
            name,
            savedAt: new Date().toLocaleString('ja-JP'),
            data: state,
        };
        const list = [entry, ...getSavedList().filter(s => s.name !== name)].slice(0, 20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        setSavedList(list);
    };

    const handleLoad = (id) => {
        const entry = savedList.find(s => s.id === id);
        if (entry) onLoad(entry.data);
    };

    const handleDelete = (id) => {
        const list = savedList.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        setSavedList(list);
    };

    // JSON エクスポート
    const handleExportJson = () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.name || 'character'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // JSON インポート
    const handleImportJson = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                onLoad(data);
            } catch (err) {
                alert('JSONの読み込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="sheet-section">
            <h3 className="sheet-section__title">
                <span className="sheet-section__icon">▤</span>
                保存 / 読込
                <span className="sheet-section__title-en">SAVE / LOAD</span>
            </h3>

            <div className="save-panel">
                <div className="save-panel__actions">
                    <button className="save-panel__btn save-panel__btn--primary" onClick={handleSave}>
                        ▶ 保存
                    </button>
                    <button className="save-panel__btn" onClick={handleExportJson}>
                        ↓ JSON出力
                    </button>
                    <label className="save-panel__btn save-panel__btn--upload">
                        ↑ JSON読込
                        <input type="file" accept=".json" onChange={handleImportJson} hidden />
                    </label>
                    <button className="save-panel__btn save-panel__btn--danger" onClick={onReset}>
                        ✕ リセット
                    </button>
                </div>

                {savedList.length > 0 && (
                    <div className="save-panel__list">
                        <div className="save-panel__list-title">保存済みキャラクター</div>
                        {savedList.map(entry => (
                            <div key={entry.id} className="save-panel__entry">
                                <div className="save-panel__entry-info">
                                    <span className="save-panel__entry-name">{entry.name}</span>
                                    <span className="save-panel__entry-date">{entry.savedAt}</span>
                                </div>
                                <div className="save-panel__entry-actions">
                                    <button className="save-panel__btn--sm" onClick={() => handleLoad(entry.id)}>
                                        読込
                                    </button>
                                    <button className="save-panel__btn--sm save-panel__btn--danger" onClick={() => handleDelete(entry.id)}>
                                        削除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
