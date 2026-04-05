'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SEARCH_INDEX } from '@/data/searchIndex';

export default function SiteSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const ref = useRef(null);
    const router = useRouter();

    // 検索ロジック
    const search = useCallback((q) => {
        if (!q.trim()) { setResults([]); return; }
        const terms = q.toLowerCase().split(/\s+/);
        const scored = SEARCH_INDEX.map((entry) => {
            const haystack = [entry.title, entry.desc, ...entry.keywords].join(' ').toLowerCase();
            const hits = terms.filter(t => haystack.includes(t)).length;
            return { ...entry, hits };
        }).filter(e => e.hits > 0).sort((a, b) => b.hits - a.hits);
        setResults(scored.slice(0, 8));
    }, []);

    useEffect(() => { search(query); setSelectedIdx(-1); }, [query, search]);

    // 外側クリックで閉じる
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navigate = (path) => { setOpen(false); setQuery(''); router.push(path); };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') { setOpen(false); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && selectedIdx >= 0 && results[selectedIdx]) { navigate(results[selectedIdx].path); }
    };

    return (
        <div className="site-search" ref={ref}>
            <input
                className="site-search__input"
                type="text"
                placeholder="検索..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => { if (query) setOpen(true); }}
                onKeyDown={handleKeyDown}
            />
            {open && results.length > 0 && (
                <div className="site-search__results">
                    {results.map((r, i) => (
                        <button
                            key={r.path}
                            className={`site-search__item ${i === selectedIdx ? 'site-search__item--active' : ''}`}
                            onClick={() => navigate(r.path)}
                            onMouseEnter={() => setSelectedIdx(i)}
                        >
                            <span className="site-search__item-title">{r.title}</span>
                            <span className="site-search__item-desc">{r.desc}</span>
                        </button>
                    ))}
                </div>
            )}
            {open && query && results.length === 0 && (
                <div className="site-search__results">
                    <div className="site-search__empty">見つかりませんでした</div>
                </div>
            )}
        </div>
    );
}
