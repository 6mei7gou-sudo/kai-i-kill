// v5.0 核防壁戦エンジンのテスト。乱数は固定列で注入する
import {
    createBattleStateV5, beginAction, beginTechnique, chooseDie, pushThrough, declinePush,
    endPlayerTurn, availableActions, getBattleResultV5, isFinishedV5, V5_PHASE,
    evalFormula, isFumbleRoll, suggestDieIndex, rerollPending,
} from '@/lib/battleEngine';
import { getMissionById } from '@/data/missions';

const die = (...vals) => { const q = vals.map(v => (v - 1) / 6 + 0.01); return () => (q.length ? q.shift() : 0.5); };

const TETSU = {
    id: 'chr-tetsu', character_name: '灰島 鉄', level: 1, affiliation: '傭兵', sub_affiliation: '突撃型',
    background: '鋼の肉体', awakening: 'ショック覚醒型', weapon_type: '打撃型', equipment_type: '武装型',
    rank_tai: 'B', rank_haya: 'C', rank_shiki: 'D', rank_han: 'D', rank_shiya: 'D', rank_jutsu: 'D', rank_kon: 'D',
    stage_plus: ['rank_tai', 'rank_haya'], styles: { main: 'crush', sub: 'seal', third: null }, belief_points: 6,
};
const mission = () => JSON.parse(JSON.stringify(getMissionById('v5_grade4_midnight')));
const freshState = (char = TETSU, m = mission()) => createBattleStateV5(char, m, die(4));

describe('基礎', () => {
    test('ダメージ式の評価', () => {
        expect(evalFormula('achievement + weapon - defense', { achievement: 5, weapon: 2, defense: 1 })).toBe(6);
        expect(evalFormula('achievement * 2', { achievement: 5 })).toBe(10);
        expect(evalFormula('achievement + meter(thirst)', { achievement: 4, meters: { thirst: 7 } })).toBe(11);
        expect(() => evalFormula('achievement; alert(1)', { achievement: 1 })).toThrow();
    });
    test('ファンブルは「全部3以下かつ1あり」', () => {
        expect(isFumbleRoll([1, 2, 3])).toBe(true);
        expect(isFumbleRoll([2, 3, 3])).toBe(false);
        expect(isFumbleRoll([1, 5])).toBe(false);
    });
    test('推奨の出目は「成功する最小の目」', () => {
        expect(suggestDieIndex([6, 4, 2])).toBe(1);
        expect(suggestDieIndex([2, 3])).toBe(1);
        expect(suggestDieIndex([6, 4, 2], 4, 0, true)).toBe(0);
    });
});

describe('初期化', () => {
    test('HP・ダイス数・技・鍵・開始共鳴', () => {
        const s = freshState();
        expect(s.rules).toBe('v5');
        expect(s.player.maxHp).toBe(10 + 4 + 0 + 2);           // 10＋体B＋Lv1＋鋼の肉体
        expect(s.player.techniques.map(t => t.id)).toEqual(['crush_1']); // Lv1 は主の段位Iのみ
        expect(s.anomaly.keys).toBe(2);
        expect(s.anomaly.layers[0].hp).toBe(12);
        expect(s.resonance.haste).toBe(1);                      // 戦闘開始時の共鳴
        expect(s.phase).toBe(V5_PHASE.PLAYER_TURN);
        expect(s.maxRounds).toBe(3);
    });
});

describe('判定：振って1つ選ぶ', () => {
    test('体B＋専心で4d6。出目4を選ぶと達成値4・怒り+1、層へ 4+武器+鍵2−防御1', () => {
        let s = freshState();
        const r = beginAction(s, 'attack', {}, die(5, 2, 4, 1));
        expect(r.state.phase).toBe(V5_PHASE.PENDING);
        expect(r.state.pending.dice).toEqual([5, 2, 4, 1]);
        const r2 = chooseDie(r.state, 2);
        s = r2.state;
        expect(s.phase).toBe(V5_PHASE.PLAYER_TURN);
        expect(s.resonance.rage).toBe(1);
        expect(s.anomaly.layers[0].hp).toBe(12 - (4 + s.player.weaponMod + 2 - 1));
        expect(s.resonance.fear).toBe(1);                        // 層特性：感染
        expect(s.turn.mainUsed).toBe(true);
    });
    test('出目6（スペシャル）は防御無視+1、怒り+3', () => {
        const s0 = freshState();
        const s = chooseDie(beginAction(s0, 'attack', {}, die(6, 2, 2, 2)).state, 0).state;
        expect(s.resonance.rage).toBe(3);
        expect(s.anomaly.layers[0].hp).toBe(12 - (6 + s.player.weaponMod + 2 + 1));
    });
    test('ファンブル（全部3以下で1あり）は自動失敗・恐怖+2・メイン消費', () => {
        const s = beginAction(freshState(), 'attack', {}, die(1, 2, 3, 3)).state;
        expect(s.phase).toBe(V5_PHASE.PLAYER_TURN);
        expect(s.resonance.fear).toBe(2);
        expect(s.resonance.rage).toBe(0);
        expect(s.anomaly.layers[0].hp).toBe(12);
        expect(s.turn.mainUsed).toBe(true);
    });
    test('失敗は押し通し（怒り+3で達成値4）か受け入れを選ぶ', () => {
        const s0 = freshState();
        let s = chooseDie(beginAction(s0, 'attack', {}, die(2, 3, 2, 2)).state, 1).state;
        expect(s.phase).toBe(V5_PHASE.PUSH);
        const pushed = pushThrough(s).state;
        expect(pushed.resonance.rage).toBe(3);
        expect(pushed.anomaly.layers[0].hp).toBe(12 - (4 + pushed.player.weaponMod + 2 - 1));
        expect(pushed.phase).toBe(V5_PHASE.PLAYER_TURN);
        const declined = declinePush(s).state;
        expect(declined.anomaly.layers[0].hp).toBe(12);
        expect(declined.turn.mainUsed).toBe(true);
    });
    test('余剰ダメージは次の層へ貫通し、層がなくなると核が露出する', () => {
        let s0 = freshState();
        s0.anomaly.layers[0].hp = 1;
        const s = chooseDie(beginAction(s0, 'attack', {}, die(6, 6, 6, 6)).state, 0).state;
        expect(s.anomaly.layers[0].broken).toBe(true);
        expect(s.anomaly.core.hp).toBe(18);                      // 核への貫通は粉砕（pierce）持ちのみ
        const s2 = chooseDie(beginAction({ ...s, turn: { ...s.turn, mainUsed: false } }, 'attack', {}, die(4, 4, 4, 4)).state, 0).state;
        expect(s2.anomaly.core.hp).toBe(18 - Math.max(0, 4 + s2.player.weaponMod + 2 - 1));
    });
    test('二級以上は未解明のままだと核へのダメージが0', () => {
        const m = mission(); m.anomaly.decodeRequired = true; m.anomaly.layers = [];
        const s = chooseDie(beginAction(createBattleStateV5(TETSU, m, die(4)), 'attack', {}, die(5, 5, 5, 5)).state, 0).state;
        expect(s.anomaly.core.hp).toBe(18);
        expect(s.log.some(l => l.message.includes('未解明'))).toBe(true);
    });
});

describe('怪異の手番', () => {
    test('襲撃：回避成功で半減、スペシャルで無効、失敗で全額。被弾で恐怖+1', () => {
        const s0 = freshState();
        const base = Math.max(1, 4 - s0.player.defense);
        let r = endPlayerTurn(s0, die(4, 2, 2));                  // 疾C＋専心＝3d6
        expect(r.state.pending.kind).toBe('evade');
        let s = chooseDie(r.state, 0).state;
        expect(s.player.hp).toBe(s0.player.maxHp - Math.ceil(base / 2));
        expect(s.resonance.fear).toBe(2);                        // 回避判定の共鳴（出目4→+1）＋被弾+1
        expect(s.round).toBe(2);                                  // ラウンドが進んだ
        s = chooseDie(endPlayerTurn(s0, die(6, 2, 2)).state, 0).state;
        expect(s.player.hp).toBe(s0.player.maxHp);
        const failed = declinePush(chooseDie(endPlayerTurn(s0, die(2, 3, 2)).state, 0).state).state;
        expect(failed.player.hp).toBe(s0.player.maxHp - base);
    });
    test('構えは回避ダイス+1個', () => {
        const s = beginAction(freshState(), 'stance', {}).state;
        expect(s.turn.stance).toBe(true);
        expect(endPlayerTurn(s, die(4, 4, 4, 4)).state.pending.dice).toHaveLength(4);
    });
    test('制限ラウンドを超えると撤退。核HPは持ち越し扱いで結果は「撤退」', () => {
        let s = freshState();
        for (let i = 0; i < 3; i++) s = chooseDie(endPlayerTurn(s, die(6, 6, 6)).state, 0).state;
        expect(s.phase).toBe(V5_PHASE.RETREAT);
        expect(getBattleResultV5(s).result).toBe('撤退');
        expect(isFinishedV5(s)).toBe(true);
    });
    test('臨界：怒り10でラウンド終了に代償、次ラウンドは最大の目しか選べない', () => {
        let s = freshState(); s.resonance.rage = 9;
        s = chooseDie(beginAction(s, 'attack', {}, die(4, 2, 2, 2)).state, 0).state;
        expect(s.resonance.rage).toBe(10);
        s = chooseDie(endPlayerTurn(s, die(6, 6, 6)).state, 0).state;
        expect(s.resonance.rage).toBe(0);
        expect(s.battle.curse.rage).toBe(true);
        const r = beginAction(s, 'attack', {}, die(6, 4, 4, 4));
        expect(chooseDie(r.state, 1).error).toMatch(/最大の出目/);
        expect(chooseDie(r.state, 0).state.resonance.rage).toBe(3);
    });
    test('浄化の臨界は大浄化：全メーター−3、怪異は次の手番を失う', () => {
        let s = freshState(); s.resonance.purge = 9; s.resonance.fear = 5;
        s = chooseDie(beginAction(s, 'cleanse', { meter: 'haste' }, die(4)).state, 0).state;  // 魂D=1d6
        expect(s.resonance.purge).toBe(10);
        s = chooseDie(endPlayerTurn(s, die(6, 6, 6)).state, 0).state;
        expect(s.resonance.purge).toBe(0);
        expect(s.resonance.fear).toBe(2);
        const hpBefore = s.player.hp;
        s = endPlayerTurn(s, die(2, 2, 2)).state;
        expect(s.player.hp).toBe(hpBefore);                       // 手番スキップ
        expect(s.round).toBe(3);
    });
});

describe('技（styles.json の effects）', () => {
    test('重撃：ダメージ+2。段位の解禁で技が増える', () => {
        const s0 = freshState();
        const s = chooseDie(beginTechnique(s0, 'crush_1', {}, die(4, 2, 2, 2)).state, 0).state;
        expect(s.anomaly.layers[0].hp).toBe(12 - (4 + s.player.weaponMod - 1 + 2 + 2));
        expect(s.turn.mainUsed).toBe(true);
        const lv5 = freshState({ ...TETSU, level: 5 });
        expect(lv5.player.techniques.map(t => t.id)).toEqual(['crush_1', 'crush_2', 'seal_1']);
    });
    test('兜割り：防御無視。浄化（サブ・判定なし）：メーター−3・浄化+1固定', () => {
        let s = freshState({ ...TETSU, level: 5 }); s.resonance.rage = 6;
        s = chooseDie(beginTechnique(s, 'crush_2', {}, die(4, 2, 2, 2)).state, 0).state;
        expect(s.anomaly.layers[0].hp).toBe(12 - (4 + s.player.weaponMod + 2));
        expect(beginTechnique(s, 'seal_1', {}).error).toMatch(/メーター/);
        s = beginTechnique(s, 'seal_1', { meter: 'rage' }).state;
        expect(s.resonance.rage).toBe(4);                        // 兜割りで+1した後に−3
        expect(s.resonance.purge).toBe(1);
        expect(s.turn.subUsed).toBe(true);
        expect(availableActions(s).techniques.find(t => t.id === 'seal_1').disabledReason).toMatch(/サブ/);
    });
    test('戦場解明：鍵+2。真名暴露は鍵4つが条件で核に8（防御無視）', () => {
        const AKARI = { ...TETSU, character_name: '九条 灯', rank_shiki: 'B', rank_han: 'D', weapon_type: '魔導型', styles: { main: 'decode', sub: null, third: null }, level: 10, stage_plus: ['rank_shiki'] };
        let s = freshState(AKARI);
        expect(availableActions(s).techniques.find(t => t.id === 'decode_3').disabledReason).toMatch(/解明鍵/);
        s = chooseDie(beginTechnique(s, 'decode_2', {}, die(5, 5, 5, 5)).state, 0).state;
        expect(s.anomaly.keys).toBe(4);
        expect(s.resonance.sorrow).toBe(2);
        s.turn.mainUsed = false;
        s = chooseDie(beginTechnique(s, 'decode_3', {}, die(4)).state, 0).state;   // 判D＝1d6
        expect(s.anomaly.core.hp).toBe(18 - 8);                                         // 固定ダメージには鍵ボーナスを乗せない
    });
    test('狙撃は前の手番の「照準」が条件', () => {
        const SNIPER = { ...TETSU, weapon_type: '射撃型', styles: { main: 'snipe', sub: null, third: null }, level: 10 };
        let s = freshState(SNIPER);
        expect(availableActions(s).techniques.find(t => t.id === 'snipe_3').disabledReason).toMatch(/照準/);
        s = beginAction(s, 'aim', {}).state;
        expect(availableActions(s).techniques.find(t => t.id === 'snipe_3').disabledReason).toBeNull();
    });
    test('未来視（リアクション）で保留中の判定を振り直せる', () => {
        const SEER = { ...TETSU, styles: { main: 'scan', sub: null, third: null }, level: 10, rank_shiya: 'B' };
        let s = freshState(SEER);
        const r = beginAction(s, 'attack', {}, die(2, 2, 2, 2));
        const rr = rerollPending(r.state, die(6, 5, 4, 3));
        expect(rr.state.pending.dice).toEqual([6, 5, 4, 3]);
        expect(rerollPending(rr.state, die(6, 6, 6, 6)).state.pending.dice).toEqual([6, 5, 4, 3]); // 1ラウンド1回
    });
});

describe('決着', () => {
    test('核HPが0で勝利。結果の形は v4 と同じ', () => {
        const m = mission(); m.anomaly.layers = []; m.anomaly.core.hp = 3;
        const s = chooseDie(beginAction(createBattleStateV5(TETSU, m, die(4)), 'attack', {}, die(4, 4, 4, 4)).state, 0).state;
        expect(s.phase).toBe(V5_PHASE.VICTORY);
        const r = getBattleResultV5(s);
        expect(r.result).toBe('勝利');
        expect(Object.keys(r).sort()).toEqual(['battleLog', 'remainingHp', 'resonanceSnapshot', 'result', 'roundsTaken', 'totalDamageDealt', 'totalDamageTaken']);
    });
});
