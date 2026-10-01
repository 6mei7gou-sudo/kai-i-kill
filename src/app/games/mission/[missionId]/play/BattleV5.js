'use client';

// v5.0 核防壁戦のプレイ画面（rules: 'v5' のミッション専用）
// 判定ロジックは src/lib/battleEngine.js に閉じ込め、ここは表示と入力だけを担当する

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  createBattleStateV5, beginAction, beginTechnique, chooseDie, pushThrough, declinePush,
  rerollPending, endPlayerTurn, availableActions, getBattleResultV5, isFinishedV5,
  suggestDieIndex, traitInfo, meterStage, topLayer, V5_PHASE, METER_KEYS, METER_NAME, METER_MAX,
} from '@/lib/battleEngine';
import { STYLE_BY_ID, GRADE_LABEL, TIMING_LABEL } from '@/data/rulesData';

const CP_BY_DIFFICULTY = { E: 1, D: 2, C: 3, B: 5, A: 8, S: 12 };
const ABILITY_LABEL = { rank_tai: '体', rank_haya: '疾', rank_shiki: '識', rank_han: '判', rank_shiya: '察', rank_jutsu: '術', rank_kon: '魂' };
const METER_COLOR = {
  fear: '#8f7cff', rage: '#ff5a5a', sorrow: '#5aa0ff', haste: '#ffb340', thirst: '#ff6fd8', purge: '#7dffc4',
};
const STAGE_LABEL = { 0: '', 1: '微', 2: '昂', 3: '激', critical: '臨界' };

const mono = { fontFamily: 'var(--font-mono)' };
const muted = { ...mono, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' };

function Bar({ current, max, label, color = 'var(--accent-gold)', right }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: 'var(--space-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', ...mono, color: 'var(--text-secondary)', marginBottom: 2 }}>
        <span>{label}</span>
        <span>{right ?? `${current}/${max}`}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

function MeterBar({ meter, value }) {
  const stage = meterStage(value);
  const color = stage === 'critical' ? 'var(--accent-danger)' : METER_COLOR[meter];
  return (
    <Bar
      label={`${METER_NAME[meter]}${STAGE_LABEL[stage] ? `〔${STAGE_LABEL[stage]}〕` : ''}`}
      current={value} max={METER_MAX} color={color}
    />
  );
}

function BattleLogV5({ log }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [log]);
  const color = (e) => {
    if (e.type === 'round_start') return 'var(--accent-gold)';
    if (e.type === 'critical') return 'var(--accent-danger)';
    if (e.type === 'result') return /成功|剥離|露出|討伐成功|判明/.test(e.message) ? 'var(--accent-gold)' : 'var(--accent-danger)';
    if (e.type === 'player_skill') return '#ff8844';
    if (e.type === 'resonance') return '#b48cff';
    if (e.type === 'roll') return 'var(--text-primary)';
    if (e.type?.startsWith('player_')) return 'var(--accent-blue)';
    if (e.type === 'anomaly') return 'var(--accent-danger)';
    return 'var(--text-secondary)';
  };
  return (
    <div ref={ref} style={{
      background: 'rgba(0,0,0,0.5)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)', maxHeight: 320, overflowY: 'auto', ...mono, fontSize: 'var(--font-size-sm)',
    }}>
      {log.map((entry, i) => (
        <div key={i} style={{ color: color(entry), marginBottom: 4, lineHeight: 1.6 }}>{entry.message}</div>
      ))}
    </div>
  );
}

function btn(color, { disabled = false, filled = false } = {}) {
  return {
    padding: '8px 14px', ...mono, fontSize: 'var(--font-size-sm)',
    background: filled ? color : 'rgba(255,255,255,0.04)',
    border: `1px solid ${disabled ? 'var(--text-muted)' : color}`,
    color: filled ? 'var(--bg-primary)' : disabled ? 'var(--text-muted)' : color,
    borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.2s', textDecoration: 'none', display: 'inline-block',
    fontWeight: filled ? 700 : 400,
  };
}

function MeterPicker({ title, onPick, onCancel }) {
  return (
    <div className="card" style={{ padding: 'var(--space-md)', marginTop: 'var(--space-md)', border: '1px solid var(--accent-gold)' }}>
      <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>{title}</div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        {METER_KEYS.map(k => (
          <button key={k} onClick={() => onPick(k)} style={btn(METER_COLOR[k])}>{METER_NAME[k]}</button>
        ))}
        <button onClick={onCancel} style={btn('var(--text-muted)')}>やめる</button>
      </div>
    </div>
  );
}

export default function BattleV5({ mission, character, missionId, user, router }) {
  const [state, setState] = useState(() => createBattleStateV5(character, mission));
  const [error, setError] = useState('');
  const [meterPrompt, setMeterPrompt] = useState(null); // { kind: 'action'|'technique', id, title }
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cpAwarded, setCpAwarded] = useState(0);

  const apply = (res) => {
    if (res.error) { setError(res.error); return; }
    setError('');
    setState(res.state);
  };

  const finished = isFinishedV5(state);
  const acts = availableActions(state);
  const top = topLayer(state);
  const rerollTech = state.player.techniques.find(t => t.timing === 'reaction' && t.effects.some(e => e.type === 'reroll'));
  const rerollLeft = rerollTech ? (rerollTech.uses ? [].concat(rerollTech.uses).reduce((m, u) => Math.min(m, u.count - (u.per === 'round' ? (state.battle.roundUses[rerollTech.id] || 0) : (state.battle.uses[rerollTech.id] || 0))), Infinity) : Infinity) : 0;

  const onMainAction = (a) => {
    if (a.id === 'cleanse') { setMeterPrompt({ kind: 'action', id: 'cleanse', title: '浄化で下げるメーターを選ぶ' }); return; }
    apply(beginAction(state, a.id));
  };
  const onTechnique = (t) => {
    if (t.effects.some(e => e.type === 'resonance' && e.meter === 'choice')) {
      setMeterPrompt({ kind: 'technique', id: t.id, title: `「${t.name}」の対象メーターを選ぶ` });
      return;
    }
    apply(beginTechnique(state, t.id));
  };
  const onPickMeter = (meter) => {
    const p = meterPrompt; setMeterPrompt(null);
    if (!p) return;
    apply(p.kind === 'action' ? beginAction(state, p.id, { meter }) : beginTechnique(state, p.id, { meter }));
  };

  const handleSave = async () => {
    if (!user || saved) return;
    setSaving(true);
    const result = getBattleResultV5(state);
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'mission_results',
          data: {
            character_id: character.id,
            mission_id: missionId,
            mission_name: state.anomaly.name,
            difficulty: mission.difficulty,
            result: result.result,
            rounds_taken: result.roundsTaken,
            total_damage_dealt: result.totalDamageDealt,
            total_damage_taken: result.totalDamageTaken,
            remaining_hp: result.remainingHp,
            battle_log: result.battleLog,
            resonance_snapshot: result.resonanceSnapshot,
            achievements: mission.achievements,
          },
        }),
      });
      if (!res.ok) throw new Error('保存に失敗しました');
      const json = await res.json();
      if (json.cpAwarded) setCpAwarded(json.cpAwarded);
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const phaseLabel = {
    [V5_PHASE.PLAYER_TURN]: 'あなたの手番',
    [V5_PHASE.PENDING]: state.pending?.kind === 'evade' ? '回避判定——出目を選ぶ' : '判定——出目を選ぶ',
    [V5_PHASE.PUSH]: '失敗——押し通すか？',
    [V5_PHASE.ANOMALY_TURN]: '怪異の手番',
    [V5_PHASE.VICTORY]: '討伐成功', [V5_PHASE.DEFEAT]: '討伐失敗', [V5_PHASE.RETREAT]: '撤退',
  }[state.phase] || '';

  const p = state.pending;
  const pushInfo = state.push;
  const pushMeter = pushInfo ? (pushInfo.meter || (pushInfo.kind === 'evade' ? 'fear' : 'sorrow')) : null;

  return (
    <div>
      {/* ヘッダー */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)',
        padding: 'var(--space-md)', borderBottom: 'var(--border-subtle)', marginBottom: 'var(--space-lg)',
      }}>
        <div style={{ ...mono, color: 'var(--accent-gold)', fontWeight: 700 }}>
          ROUND {Math.min(state.round, state.maxRounds)} / {state.maxRounds}
          <span className="badge--gold" style={{ marginLeft: 'var(--space-sm)', fontSize: 'var(--font-size-xs)' }}>v5.0 核防壁戦</span>
        </div>
        <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{phaseLabel}</div>
        <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{state.anomaly.name}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
        {/* 怪異パネル */}
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <span style={{ ...mono, fontWeight: 700, color: 'var(--accent-danger)' }}>
              {state.anomaly.grade}{state.anomaly.threatType ? `・${state.anomaly.threatType}` : ''}
            </span>
            <span style={muted}>脅威度 {state.anomaly.threat}</span>
          </div>
          <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            解明鍵 {'●'.repeat(state.anomaly.keys)}{'○'.repeat(4 - state.anomaly.keys)}
            {state.anomaly.resolved && <span className="badge--gold" style={{ marginLeft: 'var(--space-sm)', fontSize: 'var(--font-size-xs)' }}>解明完了</span>}
            {!state.anomaly.resolved && state.anomaly.decodeRequired && <span style={{ marginLeft: 'var(--space-sm)', color: 'var(--accent-danger)' }}>未解明：核は無敵</span>}
          </div>

          {state.anomaly.layers.map((l, i) => {
            const isTop = top && top.id === l.id;
            const veiled = l.trait === 'veil' && !l.revealed && !state.anomaly.resolved && !l.broken;
            const t = l.trait ? traitInfo(l.trait) : null;
            const traitShown = l.trait && (l.revealed || state.anomaly.resolved);
            return (
              <div key={l.id} style={{ opacity: l.broken ? 0.4 : 1, marginBottom: 'var(--space-sm)', paddingLeft: isTop ? 0 : 0 }}>
                <Bar
                  label={`防壁層${i + 1}《${l.name}》 防御${l.defense}${isTop ? '　◀ 攻撃対象' : ''}${l.broken ? '　剥離' : ''}`}
                  current={veiled ? l.hp * 2 : l.hp} max={veiled ? l.maxHp * 2 : l.maxHp}
                  color={l.broken ? 'var(--text-muted)' : 'var(--accent-danger)'}
                />
                <div style={{ ...muted, marginTop: -4, marginBottom: 6 }}>
                  {!l.trait ? '特性なし'
                    : !traitShown ? '特性：未判明（解明で暴ける）'
                    : `特性「${t.name}」${l.traitDisabled || state.anomaly.traitsDisabled ? '（無効化中）' : ''}：${t.effect}`}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: 'var(--border-subtle)' }}>
            <Bar
              label={`核《${state.anomaly.core.name}》 防御${state.anomaly.core.defense}${!top ? '　◀ 露出' : ''}`}
              current={state.anomaly.core.hp} max={state.anomaly.core.maxHp}
              color={top ? 'var(--text-muted)' : 'var(--accent-gold)'}
            />
          </div>
        </div>

        {/* プレイヤーパネル */}
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <span style={{ ...mono, fontWeight: 700, color: 'var(--accent-blue)' }}>{state.player.name}</span>
            <span style={muted}>Lv{state.player.level}</span>
          </div>
          <Bar label="HP" current={state.player.hp} max={state.player.maxHp} color="var(--accent-blue)" />
          <div style={{ ...muted, display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
            <span>攻撃【{ABILITY_LABEL[state.player.attackKey]}】武器+{state.player.weaponMod}</span>
            <span>防御+{state.player.defense}</span>
            <span>信念 {state.player.belief}</span>
            <span>回復薬 {state.player.potions}</span>
            {state.turn.stance && <span style={{ color: 'var(--accent-gold)' }}>構え</span>}
            {state.turn.aimed && <span style={{ color: 'var(--accent-gold)' }}>照準</span>}
            {state.battle.barrier && <span style={{ color: 'var(--accent-gold)' }}>結界</span>}
          </div>
          <div style={{ ...muted, marginBottom: 'var(--space-sm)' }}>
            {Object.entries(state.player.ranks).map(([k, v]) => `${ABILITY_LABEL[k]}${v}${state.player.focus.includes(k) ? '✦' : ''}`).join('　')}
          </div>
          <div style={{ ...muted, marginBottom: 'var(--space-sm)' }}>
            {['main', 'sub', 'third'].map(k => state.player.styles?.[k]).filter(Boolean).map(id => STYLE_BY_ID[id]?.name || id).join(' / ') || 'スタイル未設定'}
          </div>
          <div style={{ ...muted, marginBottom: 4 }}>共鳴メーター</div>
          {METER_KEYS.map(k => <MeterBar key={k} meter={k} value={state.resonance[k]} />)}
          {Object.keys(state.battle.curse).some(k => state.battle.curse[k]) && (
            <div style={{ ...mono, fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', marginTop: 'var(--space-sm)' }}>
              臨界の代償：{Object.entries(state.battle.curse).filter(([, v]) => v).map(([k]) => METER_NAME[k]).join('・')}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--accent-danger)', marginTop: 'var(--space-md)' }}>{error}</div>
      )}

      {/* 行動選択 */}
      {state.phase === V5_PHASE.PLAYER_TURN && !meterPrompt && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <div style={{ ...muted, marginBottom: 'var(--space-sm)' }}>
            メイン行動{state.turn.mainUsed && state.turn.extraMain <= 0 ? '（使用済み）' : ''}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
            {acts.main.map(a => (
              <button key={a.id} onClick={() => onMainAction(a)} style={btn(a.id === 'declare' ? 'var(--accent-gold)' : 'var(--accent-blue)')}>
                {a.label}【{ABILITY_LABEL[a.ability]}】{a.target === 5 ? ' 目標5' : ''}
              </button>
            ))}
            {acts.main.length === 0 && <span style={muted}>—</span>}
          </div>

          <div style={{ ...muted, marginBottom: 'var(--space-sm)' }}>サブ行動{state.turn.subUsed ? '（使用済み）' : ''}</div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
            {acts.sub.map(a => (
              <button key={a.id} onClick={() => apply(beginAction(state, a.id))} style={btn('var(--text-secondary)')}>{a.label}</button>
            ))}
            {acts.sub.length === 0 && <span style={muted}>—</span>}
          </div>

          {acts.techniques.length > 0 && (
            <>
              <div style={{ ...muted, marginBottom: 'var(--space-sm)' }}>技</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                {acts.techniques.map(t => {
                  const disabled = !!t.disabledReason;
                  return (
                    <button
                      key={t.id} onClick={() => !disabled && onTechnique(t)} disabled={disabled}
                      title={t.text}
                      style={{ ...btn('#ff8844', { disabled }), textAlign: 'left', whiteSpace: 'normal', lineHeight: 1.5 }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {t.name}
                        <span style={{ fontWeight: 400, fontSize: 'var(--font-size-xs)', marginLeft: 6, opacity: 0.8 }}>
                          {STYLE_BY_ID[t.style]?.name}・{GRADE_LABEL[t.grade]}・{TIMING_LABEL[t.timing]}
                          {t.usesLeft != null ? `・残${t.usesLeft}` : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.85 }}>{disabled ? t.disabledReason : t.text}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <button onClick={() => apply(endPlayerTurn(state))} style={btn('var(--accent-danger)', { filled: true })}>
            手番を終える → 怪異の手番
          </button>
        </div>
      )}

      {meterPrompt && <MeterPicker title={meterPrompt.title} onPick={onPickMeter} onCancel={() => setMeterPrompt(null)} />}

      {/* 出目の選択 */}
      {state.phase === V5_PHASE.PENDING && p && (
        <div className="card" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', border: '1px solid var(--accent-gold)' }}>
          <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>
            {p.kind === 'evade'
              ? `回避判定【疾】——成功で${p.base}ダメージを半減、出目6で無効`
              : `【${ABILITY_LABEL[p.ability]}】判定——目標値${p.target}${p.modifier ? `（修正+${p.modifier}）` : ''}`}
            {p.meter && <span style={{ color: 'var(--text-secondary)' }}>　共鳴：{METER_NAME[p.meter]}＝出目−3</span>}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
            {p.dice.map((d, i) => {
              const ok = d + (p.modifier || 0) >= p.target;
              return (
                <button key={i} onClick={() => apply(chooseDie(state, i))} style={{
                  ...btn(ok ? 'var(--accent-gold)' : 'var(--text-muted)'),
                  width: 56, height: 56, fontSize: 'var(--font-size-xl)', fontWeight: 900, padding: 0,
                }}>
                  {d}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <button onClick={() => apply(chooseDie(state, suggestDieIndex(p.dice, p.target, p.modifier || 0, !!state.battle.curse.rage && p.kind === 'attack')))} style={btn('var(--accent-blue)')}>
              {p.kind === 'evade' ? '最小の成功を選ぶ（恐怖を抑える）' : '最小の成功を選ぶ（共鳴を抑える）'}
            </button>
            <button onClick={() => apply(chooseDie(state, p.dice.indexOf(Math.max(...p.dice))))} style={btn('var(--accent-danger)')}>
              最大の目を選ぶ
            </button>
            {rerollTech && p.kind !== 'evade' && (
              <button onClick={() => apply(rerollPending(state))} disabled={rerollLeft <= 0} style={btn('#ff8844', { disabled: rerollLeft <= 0 })}>
                「{rerollTech.name}」で振り直す{rerollLeft !== Infinity ? `（残${rerollLeft}）` : ''}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 押し通し */}
      {state.phase === V5_PHASE.PUSH && pushInfo && (
        <div className="card" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', border: '1px solid var(--accent-danger)' }}>
          <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--accent-danger)', marginBottom: 'var(--space-sm)' }}>
            判定失敗（出目{pushInfo.die}）。{METER_NAME[pushMeter]}を+3して達成値4の成功に押し通すか？
            {pushInfo.kind === 'evade' && `　受け入れると${pushInfo.base}ダメージ`}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <button onClick={() => apply(pushThrough(state))} style={btn(METER_COLOR[pushMeter], { filled: true })}>
              押し通す（{METER_NAME[pushMeter]}+3 → {Math.min(METER_MAX, state.resonance[pushMeter] + 3)}/{METER_MAX}）
            </button>
            <button onClick={() => apply(declinePush(state))} style={btn('var(--text-secondary)')}>受け入れる</button>
          </div>
        </div>
      )}

      {/* 戦闘ログ */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ ...muted, marginBottom: 'var(--space-sm)' }}>BATTLE LOG</div>
        <BattleLogV5 log={state.log} />
      </div>

      {/* 結果 */}
      {finished && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <div className="card" style={{
            textAlign: 'center', padding: 'var(--space-xl)',
            border: state.phase === V5_PHASE.VICTORY ? '1px solid var(--accent-gold)' : '1px solid var(--accent-danger)',
          }}>
            <div style={{
              ...mono, fontSize: 'var(--font-size-2xl)', fontWeight: 900,
              color: state.phase === V5_PHASE.VICTORY ? 'var(--accent-gold)' : 'var(--accent-danger)', marginBottom: 'var(--space-md)',
            }}>
              {state.phase === V5_PHASE.VICTORY ? '討伐成功' : state.phase === V5_PHASE.DEFEAT ? '討伐失敗' : '制限ラウンド超過 — 撤退'}
            </div>
            <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              {Math.min(state.round, state.maxRounds)}ラウンド | 与ダメージ {state.totalDamageDealt} | 被ダメージ {state.totalDamageTaken} | 残HP {state.player.hp}
            </div>
            {state.phase === V5_PHASE.VICTORY && (
              <div style={{ ...mono, fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', marginTop: 'var(--space-sm)' }}>
                CP報酬: +{CP_BY_DIFFICULTY[mission.difficulty] || 0} CP
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)', flexWrap: 'wrap' }}>
              {user && !saved && (
                <button onClick={handleSave} disabled={saving} style={btn('var(--accent-gold)')}>
                  {saving ? '保存中...' : '戦績を保存'}
                </button>
              )}
              {saved && (
                <span style={{ ...mono, fontSize: 'var(--font-size-sm)' }}>
                  <span style={{ color: 'var(--accent-gold)' }}>保存完了</span>
                  {cpAwarded > 0 && <span style={{ color: 'var(--accent-gold)', marginLeft: 'var(--space-sm)' }}>+{cpAwarded} CP</span>}
                </span>
              )}
              <button onClick={() => router.push(`/games/mission/${missionId}/`)} style={btn('var(--text-secondary)')}>再挑戦</button>
              <Link href="/games/mission/" style={btn('var(--text-muted)')}>掲示板に戻る</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
