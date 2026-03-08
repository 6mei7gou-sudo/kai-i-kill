'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { dispatches } from '@/data/dispatches';
import { isRankAtLeast } from '@/lib/dice';

const RANK_ORDER = ['D', 'C', 'B', 'A', 'S'];

// 成功率計算
function calcSuccessRate(character, recommendedRank) {
  // キャラの最高属性ランクを取得
  const ranks = ['rank_tai', 'rank_haya', 'rank_shiki', 'rank_han', 'rank_shiya', 'rank_jutsu', 'rank_kon'];
  const bestRank = ranks.reduce((best, attr) => {
    const r = character[attr] || 'D';
    return RANK_ORDER.indexOf(r) > RANK_ORDER.indexOf(best) ? r : best;
  }, 'D');

  const bestIdx = RANK_ORDER.indexOf(bestRank);
  const reqIdx = RANK_ORDER.indexOf(recommendedRank);
  const diff = bestIdx - reqIdx;

  if (diff >= 0) return 90;
  if (diff === -1) return 60;
  return 30;
}

// 残り時間フォーマット
function formatTimeLeft(startedAt, durationHours) {
  const start = new Date(startedAt).getTime();
  const end = start + durationHours * 60 * 60 * 1000;
  const now = Date.now();
  const left = end - now;

  if (left <= 0) return { text: '完了', done: true, pct: 100 };

  const hours = Math.floor(left / (60 * 60 * 1000));
  const mins = Math.floor((left % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((left % (60 * 1000)) / 1000);

  const elapsed = now - start;
  const total = durationHours * 60 * 60 * 1000;
  const pct = Math.min(100, (elapsed / total) * 100);

  if (hours > 0) return { text: `${hours}時間${mins}分`, done: false, pct };
  if (mins > 0) return { text: `${mins}分${secs}秒`, done: false, pct };
  return { text: `${secs}秒`, done: false, pct };
}

// 難易度カラー
const diffColor = {
  D: 'var(--grade-4)', C: 'var(--grade-3)', B: 'var(--grade-2)',
  A: 'var(--grade-1)', S: 'var(--grade-special)',
};

export default function DispatchPage() {
  const { user, isLoaded } = useUser();
  const [characters, setCharacters] = useState([]);
  const [activeDispatches, setActiveDispatches] = useState([]);
  const [completedDispatches, setCompletedDispatches] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedChar, setSelectedChar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [tick, setTick] = useState(0);

  // 1秒ごとにカウントダウン更新
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // データ取得
  useEffect(() => {
    if (!isLoaded || !user) { setLoading(false); return; }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [charRes, dispatchRes] = await Promise.all([
          fetch(`/api/posts?table=character_sheets&user_id=${user.id}`),
          fetch(`/api/games/dispatch?user_id=${user.id}`),
        ]);
        const [charJson, dispatchJson] = await Promise.all([charRes.json(), dispatchRes.json()]);

        setCharacters(charJson.data || []);
        const all = dispatchJson.data || [];
        setActiveDispatches(all.filter(d => !d.completed_at));
        setCompletedDispatches(all.filter(d => d.completed_at));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [isLoaded, user]);

  // 派遣中のキャラIDセット
  const dispatchedCharIds = new Set(activeDispatches.map(d => d.character_id));

  // 派遣開始
  const handleDispatch = async () => {
    if (!selectedQuest || !selectedChar || dispatching) return;
    setDispatching(true);
    try {
      const res = await fetch('/api/games/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: selectedChar.id,
          quest_id: selectedQuest.id,
          quest_name: selectedQuest.name,
          duration_hours: selectedQuest.duration_hours,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setActiveDispatches(prev => [json.data, ...prev]);
        setSelectedQuest(null);
        setSelectedChar(null);
      } else {
        alert(json.error || '派遣に失敗しました');
      }
    } catch (e) {
      console.error(e);
    }
    setDispatching(false);
  };

  // 派遣完了処理
  const handleComplete = async (dispatch) => {
    if (completing) return;
    setCompleting(dispatch.id);

    // 成功判定
    const char = characters.find(c => c.id === dispatch.character_id);
    const quest = dispatches.find(q => q.id === dispatch.quest_id);
    const rate = char && quest ? calcSuccessRate(char, quest.recommended_rank) : 50;
    const roll = Math.random() * 100;
    const success = roll < rate;
    const result = success ? '成功' : '失敗';
    const rewards = success && quest ? quest.rewards : null;

    try {
      const res = await fetch('/api/games/dispatch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatch_id: dispatch.id,
          result,
          rewards,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setActiveDispatches(prev => prev.filter(d => d.id !== dispatch.id));
        setCompletedDispatches(prev => [json.data, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
    setCompleting(null);
  };

  return (
    <div>
      <div className="page-header">
        <span className="page-header__badge">DISPATCH</span>
        <h1 className="page-header__title">派遣クエスト</h1>
        <p className="page-header__lead">キャラクターを任務に派遣し、時間経過で報酬を獲得する。</p>
      </div>

      {/* 進行中の派遣 */}
      {activeDispatches.length > 0 && (
        <div className="section">
          <h2 className="section__title">進行中の派遣</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {activeDispatches.map(d => {
              const timeInfo = formatTimeLeft(d.started_at, d.duration_hours);
              const charName = characters.find(c => c.id === d.character_id)?.character_name || '不明';
              return (
                <div key={d.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {d.quest_name}
                      </span>
                      <span style={{ marginLeft: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {charName}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: timeInfo.done ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                      {timeInfo.done ? '完了！' : `残り ${timeInfo.text}`}
                    </span>
                  </div>

                  {/* プログレスバー */}
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 'var(--space-sm)' }}>
                    <div style={{
                      height: '100%', width: `${timeInfo.pct}%`,
                      background: timeInfo.done ? 'var(--accent-gold)' : 'var(--accent-blue)',
                      borderRadius: 3, transition: 'width 1s linear',
                    }} />
                  </div>

                  {timeInfo.done && (
                    <button
                      onClick={() => handleComplete(d)}
                      disabled={completing === d.id}
                      style={{
                        padding: '8px 20px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                        background: 'var(--accent-gold)', color: 'var(--bg-primary)',
                        border: 'none', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', fontWeight: 700,
                      }}
                    >
                      {completing === d.id ? '判定中...' : '報告を受け取る'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* クエスト一覧 */}
      <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
        <h2 className="section__title">派遣任務一覧</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
          {dispatches.map(quest => (
            <div
              key={quest.id}
              onClick={() => setSelectedQuest(selectedQuest?.id === quest.id ? null : quest)}
              className="card"
              style={{
                cursor: 'pointer',
                border: selectedQuest?.id === quest.id ? '2px solid var(--accent-gold)' : undefined,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {quest.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: diffColor[quest.recommended_rank] }}>
                  推奨 {quest.recommended_rank}
                </span>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)', lineHeight: 1.6 }}>
                {quest.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                  {quest.tags.map(t => (
                    <span key={t} className="badge--gold" style={{ fontSize: 'var(--font-size-xs)' }}>{t}</span>
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {quest.duration_hours}時間
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* キャラ選択 & 派遣ボタン */}
      {selectedQuest && (
        <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
          <h2 className="section__title">
            「{selectedQuest.name}」に派遣するキャラクターを選択
          </h2>

          {!isLoaded || loading ? (
            <p style={{ color: 'var(--text-muted)' }}>読み込み中...</p>
          ) : !user ? (
            <div className="callout">
              <strong>ログインが必要です。</strong><br />
              派遣するにはログインしてキャラクターシートを作成してください。
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
                  const isDispatched = dispatchedCharIds.has(c.id);
                  const rate = calcSuccessRate(c, selectedQuest.recommended_rank);
                  return (
                    <div
                      key={c.id}
                      onClick={() => !isDispatched && setSelectedChar(selectedChar?.id === c.id ? null : c)}
                      style={{
                        padding: 'var(--space-md)',
                        border: selectedChar?.id === c.id ? '2px solid var(--accent-gold)' : 'var(--border-subtle)',
                        background: selectedChar?.id === c.id ? 'var(--accent-gold-subtle)' : isDispatched ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        cursor: isDispatched ? 'not-allowed' : 'pointer',
                        opacity: isDispatched ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{c.character_name}</span>
                          <span style={{ color: 'var(--text-secondary)', marginLeft: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>
                            {c.class} / {c.affiliation}
                          </span>
                          {isDispatched && (
                            <span className="badge--gold" style={{ marginLeft: 'var(--space-sm)', fontSize: 'var(--font-size-xs)' }}>
                              派遣中
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: rate >= 90 ? 'var(--accent-gold)' : rate >= 60 ? 'var(--text-secondary)' : 'var(--accent-danger)' }}>
                          成功率 {rate}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleDispatch}
                disabled={!selectedChar || dispatching}
                style={{
                  marginTop: 'var(--space-lg)', padding: 'var(--space-md) var(--space-xl)',
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700,
                  background: selectedChar ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                  color: selectedChar ? 'var(--bg-primary)' : 'var(--text-muted)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  cursor: selectedChar ? 'pointer' : 'not-allowed',
                  width: '100%', transition: 'all 0.2s',
                }}
              >
                {dispatching ? '派遣中...' : '▶ 派遣する'}
              </button>
            </>
          )}
        </div>
      )}

      {/* 完了済み派遣履歴 */}
      {completedDispatches.length > 0 && (
        <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
          <h2 className="section__title">派遣履歴</h2>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            {completedDispatches.slice(0, 10).map(d => {
              const charName = characters.find(c => c.id === d.character_id)?.character_name || '不明';
              const isSuccess = d.result === '成功';
              return (
                <div key={d.id} style={{
                  padding: 'var(--space-md)', background: 'rgba(0,0,0,0.3)',
                  border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.quest_name}</span>
                      <span style={{ marginLeft: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{charName}</span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: isSuccess ? 'var(--accent-gold)' : 'var(--accent-danger)',
                    }}>
                      {d.result}
                    </span>
                  </div>
                  {isSuccess && d.rewards?.achievements && (
                    <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                      {d.rewards.achievements.map(a => (
                        <span key={a.id} className="badge--gold" style={{ fontSize: 'var(--font-size-xs)' }}>{a.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="callout" style={{ marginTop: 'var(--space-xl)' }}>
        <strong>派遣について</strong><br />
        派遣中のキャラクターは、他のゲーム（ミッション・ADV）に出撃できません。
        所要時間が経過すると完了となり、成功判定が行われます。
        キャラの最高属性ランクが推奨ランク以上なら成功率90%です。
      </div>
    </div>
  );
}
