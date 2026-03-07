'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { resolveCheck, isRankAtLeast } from '@/lib/dice';

export default function AdvPlayPage() {
  const { scenarioId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [scenario, setScenario] = useState(null);
  const [character, setCharacter] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [choicesMade, setChoicesMade] = useState([]);
  const [diceResults, setDiceResults] = useState([]);
  const [diceDisplay, setDiceDisplay] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 初期化
  useEffect(() => {
    const charJson = sessionStorage.getItem('adv_character');
    const scenarioJson = sessionStorage.getItem('adv_scenario');
    if (!charJson || !scenarioJson) {
      router.push(`/games/adv/${scenarioId}/`);
      return;
    }
    const c = JSON.parse(charJson);
    const s = JSON.parse(scenarioJson);
    setCharacter(c);
    setScenario(s);
    setCurrentNodeId(s.start_node);
  }, [scenarioId, router]);

  if (!scenario || !character || !currentNodeId) {
    return <div style={{ color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>読み込み中...</div>;
  }

  const node = scenario.nodes[currentNodeId];
  if (!node) {
    return <div style={{ color: 'var(--accent-danger)', padding: 'var(--space-xl)' }}>ノードエラー: {currentNodeId}</div>;
  }

  // 条件チェック
  const checkCondition = (condition) => {
    if (!condition) return true;
    switch (condition.type) {
      case 'rank_min':
        return isRankAtLeast(character[condition.attr] || 'D', condition.min);
      case 'class':
        return character.class === condition.value;
      case 'affiliation':
        return character.affiliation === condition.value;
      default:
        return true;
    }
  };

  // 選択肢クリック
  const handleChoice = (choice, index) => {
    setChoicesMade(prev => [...prev, { nodeId: currentNodeId, choiceIndex: index, text: choice.text }]);
    setHistory(prev => [...prev, { nodeId: currentNodeId, node }]);
    setDiceDisplay(null);
    setCurrentNodeId(choice.next);
  };

  // ダイス判定実行
  const handleDiceCheck = () => {
    const attr = character[node.attr] || 'D';
    const result = resolveCheck(attr, 0, node.difficulty);
    setDiceResults(prev => [...prev, { nodeId: currentNodeId, attr: node.attr, result }]);
    setDiceDisplay(result);

    // 2秒後に結果ノードへ遷移
    setTimeout(() => {
      setHistory(prev => [...prev, { nodeId: currentNodeId, node }]);
      setCurrentNodeId(result.success ? node.success : node.failure);
      setDiceDisplay(null);
    }, 2500);
  };

  // 次のノードへ進む（narration）
  const handleNext = () => {
    setHistory(prev => [...prev, { nodeId: currentNodeId, node }]);
    setDiceDisplay(null);
    setCurrentNodeId(node.next);
  };

  // 結果保存
  const handleSave = async () => {
    if (!user || saved) return;
    setSaving(true);
    try {
      await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'adv_completions',
          data: {
            character_id: character.id,
            scenario_id: scenarioId,
            scenario_name: scenario.name,
            ending_id: node.ending_id,
            ending_name: node.ending_name,
            ending_type: node.ending_type,
            choices_made: choicesMade,
            dice_results: diceResults,
            achievements: (node.achievements || []).map(a => ({ ...a, type: 'adv' })),
          },
        }),
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const isEnding = node.type === 'ending';

  // 属性名マップ
  const attrNames = {
    rank_tai: '体', rank_haya: '疾', rank_shiki: '識', rank_han: '判',
    rank_shiya: '察', rank_jutsu: '術', rank_kon: '魂',
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--space-md) 0', borderBottom: 'var(--border-subtle)', marginBottom: 'var(--space-xl)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
          {scenario.name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          {character.character_name} ({character.class})
        </div>
      </div>

      {/* 過去のテキスト（薄く表示） */}
      {history.slice(-3).map((h, i) => (
        <div key={i} style={{
          color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)',
          marginBottom: 'var(--space-md)', opacity: 0.4 + (i * 0.15),
          lineHeight: 1.8, borderLeft: '2px solid rgba(255,255,255,0.06)', paddingLeft: 'var(--space-md)',
        }}>
          {h.node.text && h.node.text.split('\n').map((line, j) => (
            <p key={j} style={{ marginBottom: 'var(--space-xs)' }}>{line}</p>
          ))}
        </div>
      ))}

      {/* 現在のノード */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        {/* テキスト */}
        {node.text && (
          <div style={{ lineHeight: 2.0, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
            {node.text.split('\n').map((line, i) => (
              <p key={i} style={{ marginBottom: 'var(--space-sm)' }}>
                {line || <br />}
              </p>
            ))}
          </div>
        )}

        {/* narration → 次へボタン */}
        {node.type === 'narration' && node.next && (
          <button onClick={handleNext} style={{
            marginTop: 'var(--space-xl)', padding: 'var(--space-md) var(--space-xl)',
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--accent-gold-border)',
            color: 'var(--accent-gold)', borderRadius: 'var(--radius-md)',
            cursor: 'pointer', width: '100%', transition: 'all 0.2s',
          }}>
            ▶ 続ける
          </button>
        )}

        {/* choice → 選択肢 */}
        {node.type === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }}>
            {node.choices.map((choice, i) => {
              const unlocked = checkCondition(choice.condition);
              return (
                <button
                  key={i}
                  onClick={() => unlocked && handleChoice(choice, i)}
                  disabled={!unlocked}
                  style={{
                    padding: 'var(--space-md)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-md)',
                    background: unlocked ? 'rgba(212, 175, 55, 0.06)' : 'rgba(255,255,255,0.02)',
                    border: unlocked ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)',
                    color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-md)',
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    textAlign: 'left', lineHeight: 1.6,
                    transition: 'all 0.2s',
                  }}
                >
                  {unlocked ? choice.text : (choice.locked_text || choice.text)}
                </button>
              );
            })}
          </div>
        )}

        {/* check → ダイス判定 */}
        {node.type === 'check' && !diceDisplay && (
          <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)', marginBottom: 'var(--space-md)',
            }}>
              判定: {attrNames[node.attr] || node.attr} (現在ランク: {character[node.attr] || 'D'}) / 難易度 {node.difficulty}
            </div>
            <button onClick={handleDiceCheck} style={{
              padding: 'var(--space-md) var(--space-2xl)',
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700,
              background: 'var(--accent-gold)', color: 'var(--bg-primary)',
              border: 'none', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              ダイスを振る
            </button>
          </div>
        )}

        {/* ダイス結果表示 */}
        {diceDisplay && (
          <div style={{
            marginTop: 'var(--space-xl)', textAlign: 'center',
            padding: 'var(--space-xl)', border: diceDisplay.success ? '1px solid var(--accent-gold)' : '1px solid var(--accent-danger)',
            borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', fontWeight: 900,
              color: diceDisplay.success ? 'var(--accent-gold)' : 'var(--accent-danger)',
              marginBottom: 'var(--space-md)',
            }}>
              {diceDisplay.isSpecial ? 'SPECIAL!' : diceDisplay.isFumble ? 'FUMBLE...' : diceDisplay.success ? 'SUCCESS' : 'FAILURE'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>
              [{diceDisplay.dice.join(', ')}] → 最大値 {diceDisplay.maxDie} / 難易度 {diceDisplay.difficulty}
            </div>
          </div>
        )}

        {/* ending → エンディング */}
        {isEnding && (
          <div style={{ marginTop: 'var(--space-2xl)' }}>
            <div style={{
              textAlign: 'center', padding: 'var(--space-xl)',
              border: '1px solid var(--accent-gold-border)', borderRadius: 'var(--radius-md)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)', marginBottom: 'var(--space-sm)', letterSpacing: '0.2em',
              }}>
                ENDING
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', fontWeight: 700,
                color: node.ending_type === 'true' ? 'var(--accent-gold)' :
                       node.ending_type === 'good' ? 'var(--accent-blue)' :
                       node.ending_type === 'bad' ? 'var(--accent-danger)' : 'var(--text-secondary)',
                marginBottom: 'var(--space-sm)',
              }}>
                {node.ending_name}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)', textTransform: 'uppercase',
              }}>
                {node.ending_type} END
              </div>

              {/* 実績 */}
              {node.achievements && node.achievements.length > 0 && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                    ACHIEVEMENTS UNLOCKED
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {node.achievements.map(a => (
                      <span key={a.id} className="badge--gold">{a.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
                {user && !saved && (
                  <button onClick={handleSave} disabled={saving} style={btnStyle('var(--accent-gold)')}>
                    {saving ? '保存中...' : '記録を保存'}
                  </button>
                )}
                {saved && <span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>保存完了</span>}
                <Link href="/games/adv/" style={btnStyle('var(--text-muted)')}>
                  シナリオ一覧に戻る
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
    background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}`,
    color: color, borderRadius: 'var(--radius-md)', cursor: 'pointer',
    transition: 'all 0.2s', textDecoration: 'none', display: 'inline-block',
  };
}
