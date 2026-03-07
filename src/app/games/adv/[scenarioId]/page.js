'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getScenarioById } from '@/data/scenarios';

export default function AdvDetailPage() {
  const { scenarioId } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [characters, setCharacters] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [loading, setLoading] = useState(true);

  const scenario = getScenarioById(scenarioId);

  useEffect(() => {
    if (!isLoaded || !user) { setLoading(false); return; }

    Promise.all([
      fetch(`/api/posts?table=character_sheets&user_id=${user.id}`).then(r => r.json()),
      fetch(`/api/games?table=adv_completions&user_id=${user.id}`).then(r => r.json()),
    ]).then(([charRes, compRes]) => {
      if (charRes.ok) setCharacters(charRes.data || []);
      if (compRes.ok) setCompletions(compRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoaded, user]);

  if (!scenario) {
    return (
      <div>
        <div className="page-header"><h1 className="page-header__title">シナリオが見つかりません</h1></div>
        <Link href="/games/adv/" style={{ color: 'var(--accent-gold)' }}>シナリオ一覧に戻る</Link>
      </div>
    );
  }

  // このシナリオをクリア済みのキャラIDセット
  const completedCharIds = new Set(
    completions.filter(c => c.scenario_id === scenarioId).map(c => c.character_id)
  );

  const handleStart = () => {
    if (!selectedChar) return;
    sessionStorage.setItem('adv_character', JSON.stringify(selectedChar));
    sessionStorage.setItem('adv_scenario', JSON.stringify(scenario));
    router.push(`/games/adv/${scenarioId}/play/`);
  };

  return (
    <div>
      <div className="page-header">
        <span className="page-header__badge">ADVENTURE</span>
        <h1 className="page-header__title">{scenario.name}</h1>
        <p className="page-header__lead">{scenario.description}</p>
      </div>

      <div className="section">
        <h2 className="section__title">シナリオ情報</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['難易度', scenario.difficulty],
              ['推定時間', scenario.estimated_time],
              ['タグ', scenario.tags.join(', ')],
            ].map(([l, v]) => (
              <tr key={l} style={{ borderBottom: 'var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', width: '140px' }}>{l}</td>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--text-primary)' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
        <h2 className="section__title">キャラクター選択</h2>

        {!isLoaded || loading ? (
          <p style={{ color: 'var(--text-muted)' }}>読み込み中...</p>
        ) : !user ? (
          <div className="callout">
            <strong>ログインが必要です。</strong>
          </div>
        ) : characters.length === 0 ? (
          <div className="callout">
            <strong>キャラクターシートがありません。</strong><br />
            <Link href="/create/character/" style={{ color: 'var(--accent-gold)' }}>キャラシート作成</Link>から登録してください。
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {characters.map(c => {
                const completed = completedCharIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => !completed && setSelectedChar(c)}
                    style={{
                      padding: 'var(--space-md)',
                      border: selectedChar?.id === c.id ? '2px solid var(--accent-gold)' : 'var(--border-subtle)',
                      background: selectedChar?.id === c.id ? 'var(--accent-gold-subtle)' : completed ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      cursor: completed ? 'not-allowed' : 'pointer',
                      opacity: completed ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: completed ? 'var(--text-muted)' : 'var(--text-heading)' }}>{c.character_name}</span>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>
                          {c.class} / {c.affiliation}
                        </span>
                      </div>
                      {completed && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)' }}>
                          CLEARED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStart}
              disabled={!selectedChar}
              style={{
                marginTop: 'var(--space-lg)', padding: 'var(--space-md) var(--space-xl)',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700,
                background: selectedChar ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                color: selectedChar ? 'var(--bg-primary)' : 'var(--text-muted)',
                border: 'none', borderRadius: 'var(--radius-md)',
                cursor: selectedChar ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', width: '100%',
              }}
            >
              ▶ 怪異譚を始める
            </button>
          </>
        )}
      </div>
    </div>
  );
}
