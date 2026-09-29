// ルールデータ（docs/rules/data/*.json）と Web 実装（src/data/characterBuildData.js）の整合を検査する。
//   node docs/_build/check_rules_sync.mjs   … 不一致があれば一覧を出して終了コード1
// v5.0 への移行が済むまで意図的に異なる項目は「移行待ち」として警告のみ出す。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/rules/data', `${n}.json`), 'utf8'));
const A = load('abilities'), C = load('character_options'), EQ = load('equipment'), LV = load('level_table'), S = load('styles');

// characterBuildData.js は ESM の export const 群。export を外して評価する
const src = fs.readFileSync(path.join(ROOT, 'src/data/characterBuildData.js'), 'utf8').replace(/^export /gm, '');
const ctx = {};
vm.runInNewContext(src + '\nObject.assign(__out, { ABILITIES, RANK_DICE, BACKGROUNDS, ASSIGNMENTS, AWAKENINGS, LANGUAGES, MAX_LEVEL, CYBER_GRADE_MIN_LEVEL, BASE_CP_BUDGET, STAGE_PLUS_MAX, BASE_BELIEF_POINTS, SKILL_SLOTS_BY_LEVEL });', { __out: ctx });

const errors = [], pending = [];
const eq = (label, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) errors.push(`${label}: data=${JSON.stringify(a)} / web=${JSON.stringify(b)}`); };
const nameToKey = Object.fromEntries(A.abilities.map(a => [a.name, a.key]));
const keysIn = (text) => [...text.split('。')[0]].filter(ch => nameToKey[ch]).map(ch => nameToKey[ch]);

eq('能力値（key）', A.abilities.map(a => a.key), ctx.ABILITIES.map(a => a.key));
eq('能力値（名前）', A.abilities.map(a => a.name), ctx.ABILITIES.map(a => a.name));
eq('能力値（読み）', A.abilities.map(a => a.reading), ctx.ABILITIES.map(a => a.reading));
eq('ランクのダイス', Object.fromEntries(A.ranks.map(r => [r.rank, r.dice])), ctx.RANK_DICE);
eq('背景（id）', C.backgrounds.map(x => x.id), ctx.BACKGROUNDS.map(x => x.id));
for (const x of C.backgrounds) {
  const web = ctx.BACKGROUNDS.find(w => w.id === x.id);
  if (web) eq(`背景「${x.id}」の昇格能力値`, keysIn(x.upgrades), web.upgrades);
}
for (const aff of Object.keys(ctx.ASSIGNMENTS)) {
  const data = C.assignments.filter(x => x.affiliation === aff);
  eq(`配属（${aff}）`, data.map(x => x.id), ctx.ASSIGNMENTS[aff].map(x => x.id));
  for (const x of data) { const w = ctx.ASSIGNMENTS[aff].find(w => w.id === x.id); if (w) eq(`配属「${x.id}」の昇格`, nameToKey[x.upgrade], w.upgrade); }
}
eq('覚醒パターン', C.awakenings.map(x => x.id), ctx.AWAKENINGS.map(x => x.id));
eq('魔法言語', C.languages.filter(x => x.id !== 'P').map(x => x.id), ctx.LANGUAGES.map(x => x.id));
eq('最大レベル', LV.maxLevel, ctx.MAX_LEVEL);
eq('Lv1 CP予算', LV.levels[0].cp, ctx.BASE_CP_BUDGET);
eq('信念初期値', LV.beliefCap[0].cap, ctx.BASE_BELIEF_POINTS);
eq('サイバネ解禁Lv', Object.fromEntries(EQ.cybernetics.grades.map(g => [g.grade, g.unlockLv])), ctx.CYBER_GRADE_MIN_LEVEL);
eq('専心（旧+段階）の数', C.focus.initial, ctx.STAGE_PLUS_MAX);

// v5.0 で置き換わる項目：不一致は移行待ちとして警告のみ
const slotsFromData = Array.from({ length: LV.maxLevel + 1 }, (_, lv) => S.gradeUnlock.filter(u => u.lv <= lv && u.grade !== '極').length);
if (JSON.stringify(slotsFromData) !== JSON.stringify(ctx.SKILL_SLOTS_BY_LEVEL)) pending.push(`スキル枠 → スタイル段位（SKILL_SLOTS_BY_LEVEL は v4.0 のまま。v5.0 実装で STYLE_GRADES_BY_LEVEL に置換）`);

if (pending.length) console.warn('移行待ち（想定内）:\n  - ' + pending.join('\n  - '));
if (errors.length) { console.error('check_rules_sync: 不一致 ' + errors.length + ' 件\n  - ' + errors.join('\n  - ')); process.exit(1); }
console.log('check_rules_sync: OK（データと Web 実装の共通項目は一致）');
