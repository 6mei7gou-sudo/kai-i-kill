'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  createBattleState, startRound, playerAttack, playerMagic,
  playerEvade, processEnemyTurn, endRound, getBattleResult, PHASE
} from '@/lib/gameEngine';

// HPバー
function HPBar({ current, max, label, color = 'var(--accent-gold)' }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div style={{ marginBottom: 'var(--space-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 2 }}>
        <span>{label}</span>
        <span>{current}/{max}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct > 30 ? color : 'var(--accent-danger)', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// ログ表示
function BattleLog({ log }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [log]);

  const logColor = (entry) => {
    if (entry.type === 'round_start') return 'var(--accent-gold)';
    if (entry.type === 'result') return entry.message.includes('成功') || entry.message.includes('破壊') ? 'var(--accent-gold)' : 'var(--accent-danger)';
    if (entry.type?.startsWith('player_')) return 'var(--accent-blue)';
    if (entry.type?.startsWith('enemy_')) return 'var(--accent-danger)';
    return 'var(--text-secondary)';
  };

  return (
    <div ref={ref} style={{
      background: 'rgba(0,0,0,0.5)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)', maxHeight: 300, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
    }}>
      {log.map((entry, i) => (
        <div key={i} style={{ color: logColor(entry), marginBottom: 4, lineHeight: 1.6 }}>
          {entry.type === 'round_start' && <span>──── </span>}
          {entry.message}
        </div>
      ))}
    </div>
  );
}

export default function BattlePage() {
  const { missionId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [state, setState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 初期化
  useEffect(() => {
    const charJson = sessionStorage.getItem('battle_character');
    const missionJson = sessionStorage.getItem('battle_mission');
    if (!charJson || !missionJson) {
      router.push(`/games/mission/${missionId}/`);
      return;
    }
    const character = JSON.parse(charJson);
    const mission = JSON.parse(missionJson);
    const initial = createBattleState(character, mission);
    setState(startRound(initial));
  }, [missionId, router]);

  if (!state) return <div style={{ color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>読み込み中...</div>;

  const isFinished = [PHASE.VICTORY, PHASE.DEFEAT, PHASE.TIMEOUT].includes(state.phase);
  const aliveEnemies = state.enemies.filter(e => e.hp > 0);

  // 行動ハンドラ
  const handleAction = (action, targetId) => {
    let result;
    switch (action) {
      case 'attack': result = playerAttack(state, targetId); break;
      case 'magic': result = playerMagic(state, targetId); break;
      case 'evade': result = playerEvade(state); break;
      default: return;
    }

    let newState = result.state || result;

    // 敵ターン自動処理
    if (newState.phase === PHASE.ENEMY_TURN) {
      newState = processEnemyTurn(newState);
    }
    // ラウンド終了自動処理
    if (newState.phase === PHASE.ROUND_END) {
      newState = endRound(newState);
      if (newState.phase === PHASE.INIT) {
        newState = startRound(newState);
      }
    }

    setState(newState);
  };

  // 結果保存
  const handleSave = async () => {
    if (!user || saved) return;
    setSaving(true);
    const charJson = sessionStorage.getItem('battle_character');
    const character = JSON.parse(charJson);
    const result = getBattleResult(state);

    try {
      await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'mission_results',
          data: {
            character_id: character.id,
            mission_id: missionId,
            mission_name: state.core.name,
            difficulty: JSON.parse(sessionStorage.getItem('battle_mission')).difficulty,
            result: result.result,
            rounds_taken: result.roundsTaken,
            total_damage_dealt: result.totalDamageDealt,
            total_damage_taken: result.totalDamageTaken,
            remaining_hp: result.remainingHp,
            battle_log: result.battleLog,
            resonance_snapshot: result.resonanceSnapshot,
            achievements: JSON.parse(sessionStorage.getItem('battle_mission')).achievements,
          },
        }),
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div>
      {/* ヘッダー */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--space-md)', borderBottom: 'var(--border-subtle)', marginBottom: 'var(--space-lg)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontWeight: 700 }}>
          ROUND {state.round} / {state.maxRounds}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          {state.phase === PHASE.PLAYER_TURN ? '▶ あなたのターン' : isFinished ? '戦闘終了' : '処理中...'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* 左: プレイヤー */}
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 'var(--space-sm)' }}>
              {state.player.name}
            </div>
            <HPBar current={state.player.hp} max={state.player.maxHp} label="HP" color="var(--accent-blue)" />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {state.player.class} | 体{state.player.rank_tai} 疾{state.player.rank_haya} 識{state.player.rank_shiki} 術{state.player.rank_jutsu}
            </div>
          </div>

          {/* 感情共鳴 */}
          <div className="card" style={{ padding: 'var(--space-sm) var(--space-md)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
              共鳴記録
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)' }}>
              {Object.entries(state.resonance).map(([key, val]) => {
                const names = { fear: '恐怖', rage: '怒り', sorrow: '哀愁', haste: '焦燥', thirst: '渇望', purge: '浄化' };
                const colors = { fear: 'var(--resonance-fear)', rage: 'var(--resonance-rage)', sorrow: 'var(--resonance-sorrow)', haste: 'var(--resonance-haste)', thirst: 'var(--resonance-thirst)', purge: 'var(--resonance-purge)' };
                return (
                  <span key={key} style={{ color: val > 0 ? colors[key] : 'var(--text-muted)' }}>
                    {names[key]} {val}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右: 敵 */}
        <div>
          {/* 護衛 */}
          {state.enemies.map(e => (
            <div key={e.id} className="card" style={{ marginBottom: 'var(--space-sm)', opacity: e.hp <= 0 ? 0.3 : 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-danger)', marginBottom: 4, fontSize: 'var(--font-size-sm)' }}>
                {e.name} {e.hp <= 0 && '(撃破)'}
              </div>
              <HPBar current={Math.max(e.hp, 0)} max={e.maxHp} label="HP" color="var(--accent-danger)" />
            </div>
          ))}

          {/* 核 */}
          <div className="card" style={{
            border: state.core.exposed ? '1px solid var(--accent-danger)' : 'var(--border-subtle)',
            opacity: state.core.exposed ? 1 : 0.5,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: state.core.exposed ? 'var(--grade-special)' : 'var(--text-muted)', marginBottom: 4 }}>
              {state.core.name} {!state.core.exposed && '(護衛が守っている)'}
            </div>
            <HPBar current={Math.max(state.core.hp, 0)} max={state.core.maxHp} label="核HP" color="var(--grade-special)" />
          </div>
        </div>
      </div>

      {/* 行動選択 */}
      {state.phase === PHASE.PLAYER_TURN && !isFinished && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', marginBottom: 'var(--space-md)' }}>
            ▶ 行動を選択
          </div>

          {/* 対象選択可能な敵 */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
            攻撃対象:
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
            {aliveEnemies.map(e => (
              <div key={e.id} style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button
                  onClick={() => handleAction('attack', e.id)}
                  style={actionBtnStyle('var(--accent-blue)')}
                >
                  ⚔ 攻撃 → {e.name}
                </button>
                <button
                  onClick={() => handleAction('magic', e.id)}
                  style={actionBtnStyle('var(--magic-ignis)')}
                >
                  ✦ 魔法 → {e.name}
                </button>
              </div>
            ))}
            {state.core.exposed && (
              <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                <button
                  onClick={() => handleAction('attack', 'core')}
                  style={actionBtnStyle('var(--grade-special)')}
                >
                  ⚔ 攻撃 → 核
                </button>
                <button
                  onClick={() => handleAction('magic', 'core')}
                  style={actionBtnStyle('var(--grade-special)')}
                >
                  ✦ 魔法 → 核
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleAction('evade')}
            style={actionBtnStyle('var(--text-secondary)')}
          >
            ↺ 回避態勢
          </button>
        </div>
      )}

      {/* 戦闘ログ */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
          BATTLE LOG
        </div>
        <BattleLog log={state.log} />
      </div>

      {/* 結果表示 */}
      {isFinished && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <div className="card" style={{
            textAlign: 'center', padding: 'var(--space-xl)',
            border: state.phase === PHASE.VICTORY ? '1px solid var(--accent-gold)' : '1px solid var(--accent-danger)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', fontWeight: 900,
              color: state.phase === PHASE.VICTORY ? 'var(--accent-gold)' : 'var(--accent-danger)',
              marginBottom: 'var(--space-md)',
            }}>
              {state.phase === PHASE.VICTORY ? '討伐成功' : state.phase === PHASE.DEFEAT ? '討伐失敗' : '時間切れ — 撤退'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              {state.round}ラウンド | 与ダメージ {state.totalDamageDealt} | 被ダメージ {state.totalDamageTaken} | 残HP {state.player.hp}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
              {user && !saved && (
                <button onClick={handleSave} disabled={saving} style={actionBtnStyle('var(--accent-gold)')}>
                  {saving ? '保存中...' : '戦績を保存'}
                </button>
              )}
              {saved && <span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>保存完了</span>}
              <button
                onClick={() => router.push(`/games/mission/${missionId}/`)}
                style={actionBtnStyle('var(--text-secondary)')}
              >
                再挑戦
              </button>
              <Link href="/games/mission/" style={actionBtnStyle('var(--text-muted)')}>
                掲示板に戻る
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function actionBtnStyle(color) {
  return {
    padding: '8px 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-sm)',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${color}`,
    color: color,
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
    display: 'inline-block',
  };
}
