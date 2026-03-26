'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMissionById } from '@/data/missions';
import { calculateHP } from '@/lib/dice';

const difficultyColor = {
  E: 'var(--grade-5)', D: 'var(--grade-4)', C: 'var(--grade-3)',
  B: 'var(--grade-2)', A: 'var(--grade-1)', S: 'var(--grade-special)',
};

export default function MissionDetailPage() {
  const { missionId } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [selectedParty, setSelectedParty] = useState([]);
  const [dispatchedCharIds, setDispatchedCharIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const mission = getMissionById(missionId);
  const isCoop = mission?.type === 'coop';
  const partySize = mission?.party_size || 1;

  useEffect(() => {
    if (!isLoaded || !user) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/posts?table=character_sheets&user_id=${user.id}`).then(r => r.json()),
      fetch(`/api/games/dispatch?user_id=${user.id}&active=true`).then(r => r.json()),
    ]).then(([charRes, dispatchRes]) => {
      if (charRes.ok) setCharacters(charRes.data || []);
      if (dispatchRes.ok) setDispatchedCharIds(new Set((dispatchRes.data || []).map(d => d.character_id)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoaded, user]);

  if (!mission) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-header__title">ミッションが見つかりません</h1>
        </div>
        <Link href="/games/mission/" style={{ color: 'var(--accent-gold)' }}>依頼掲示板に戻る</Link>
      </div>
    );
  }

  const handleSortie = () => {
    if (isCoop) {
      if (selectedParty.length !== partySize) return;
      sessionStorage.setItem('battle_party', JSON.stringify(selectedParty));
      sessionStorage.setItem('battle_character', JSON.stringify(selectedParty[0]));
    } else {
      if (!selectedChar) return;
      sessionStorage.setItem('battle_character', JSON.stringify(selectedChar));
    }
    sessionStorage.setItem('battle_mission', JSON.stringify(mission));
    router.push(`/games/mission/${missionId}/play/`);
  };

  const togglePartyMember = (c) => {
    setSelectedParty(prev => {
      const exists = prev.find(p => p.id === c.id);
      if (exists) return prev.filter(p => p.id !== c.id);
      if (prev.length >= partySize) return prev;
      return [...prev, c];
    });
  };

  return (
    <div>
      <div className="page-header">
        <span className="page-header__badge" style={{ color: difficultyColor[mission.difficulty] }}>
          難易度 {mission.difficulty}
        </span>
        <h1 className="page-header__title">{mission.name}</h1>
        <p className="page-header__lead">{mission.description}</p>
      </div>

      {/* ミッション情報 */}
      <div className="section">
        <h2 className="section__title">作戦概要</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['依頼元', mission.client],
              ['報酬', mission.reward],
              ...(isCoop ? [['形式', `協力（${partySize}人用）`]] : []),
              ['ラウンド制限', `${mission.battle.max_rounds}ラウンド`],
              ['核', `${mission.battle.core.name} (HP${mission.battle.core.hp} / 防御${mission.battle.core.defense})`],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: 'var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', width: '140px' }}>
                  {label}
                </td>
                <td style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--text-primary)' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 護衛一覧 */}
      <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
        <h2 className="section__title">護衛</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
          {mission.battle.guardians.map(g => (
            <div key={g.id} className="card" style={{ padding: 'var(--space-md)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-danger)', marginBottom: 'var(--space-sm)' }}>
                {g.name}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                HP {g.hp} / ATK {g.attack} / DEF {g.defense}
              </div>
              {g.traits.length > 0 && (
                <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                  {g.traits.map(t => (
                    <span key={t} className="badge--gold" style={{ fontSize: 'var(--font-size-xs)' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* キャラクター選択 */}
      <div className="section" style={{ marginTop: 'var(--space-xl)' }}>
        <h2 className="section__title">
          {isCoop ? `出撃パーティ編成（${selectedParty.length}/${partySize}人選択）` : '出撃キャラクター選択'}
        </h2>

        {!isLoaded || loading ? (
          <p style={{ color: 'var(--text-muted)' }}>読み込み中...</p>
        ) : !user ? (
          <div className="callout">
            <strong>ログインが必要です。</strong><br />
            出撃するにはログインしてキャラクターシートを作成してください。
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
                const isInParty = selectedParty.find(p => p.id === c.id);
                const isSelected = isCoop ? isInParty : selectedChar?.id === c.id;
                const partyIndex = isCoop ? selectedParty.findIndex(p => p.id === c.id) + 1 : 0;
                return (
                  <div
                    key={c.id}
                    onClick={() => !isDispatched && (isCoop ? togglePartyMember(c) : setSelectedChar(c))}
                    style={{
                      padding: 'var(--space-md)',
                      border: isSelected ? '2px solid var(--accent-gold)' : 'var(--border-subtle)',
                      background: isSelected ? 'var(--accent-gold-subtle)' : isDispatched ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      cursor: isDispatched ? 'not-allowed' : 'pointer',
                      opacity: isDispatched ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {isCoop && isSelected && (
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 'var(--font-size-sm)',
                            color: 'var(--accent-gold)', marginRight: 'var(--space-sm)',
                          }}>
                            [{partyIndex}]
                          </span>
                        )}
                        <span style={{ fontWeight: 700, color: isDispatched ? 'var(--text-muted)' : 'var(--text-heading)' }}>{c.character_name}</span>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>
                          {c.class} / {c.affiliation}
                        </span>
                        {isDispatched && (
                          <span className="badge--gold" style={{ marginLeft: 'var(--space-sm)', fontSize: 'var(--font-size-xs)' }}>
                            派遣中
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                        HP {calculateHP(c.rank_tai)} | 体{c.rank_tai} 疾{c.rank_haya} 識{c.rank_shiki} 判{c.rank_han} 察{c.rank_shiya} 術{c.rank_jutsu} 魂{c.rank_kon}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSortie}
              disabled={isCoop ? selectedParty.length !== partySize : !selectedChar}
              style={{
                marginTop: 'var(--space-lg)',
                padding: 'var(--space-md) var(--space-xl)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 700,
                background: (isCoop ? selectedParty.length === partySize : selectedChar) ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                color: (isCoop ? selectedParty.length === partySize : selectedChar) ? 'var(--bg-primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: (isCoop ? selectedParty.length === partySize : selectedChar) ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                width: '100%',
              }}
            >
              ▶ {isCoop ? '出撃（協力）' : '出撃'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
