// ルールデータ（docs/rules/data/*.json）と Web 実装の整合を検査する。
//   node docs/_build/check_rules_sync.mjs   … 不一致があれば一覧を出して終了コード1
//
// src/data/characterBuildData.js は rulesData.js 経由で JSON から組み立てる構造なので、
// ここでは「JSON を経由せずにリテラルを持っている場所」を検査する。
// characterBuildData の export 値そのものと JSON の突き合わせは
// __tests__/rules/data-integrity.test.js（Jest。next/jest の変換で import できる）が行う。
// v5.0 への移行が済むまで意図的に残る項目は「移行待ち」として警告のみ出す。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const load = (n) => JSON.parse(read(`docs/rules/data/${n}.json`));
const A = load('abilities'), EQ = load('equipment');

const errors = [], pending = [];
const eq = (label, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) errors.push(`${label}: data=${JSON.stringify(a)} / web=${JSON.stringify(b)}`); };

// 1. characterBuildData.js が JSON 駆動になっているか（選択肢のリテラル配列を持っていない）
const cbd = read('src/data/characterBuildData.js');
if (!/from '\.\/rulesData'/.test(cbd)) errors.push('characterBuildData.js が rulesData.js を import していない');
for (const name of ['BACKGROUNDS', 'ASSIGNMENTS', 'AWAKENINGS', 'LANGUAGES', 'ABILITIES', 'GIFTS']) {
  const m = cbd.match(new RegExp(`export const ${name} = ([^;\\n]+)`));
  if (m && /^[\[{]/.test(m[1].trim())) errors.push(`characterBuildData.js の ${name} がリテラル定義（JSON から派生させること）`);
}

// 2. リテラルを持つ他モジュールとの突き合わせ
const wc = read('src/lib/weaponCalc.js');
const mDice = wc.match(/RANK_DICE_LABEL = \{([^}]+)\}/);
if (mDice) {
  const web = Object.fromEntries([...mDice[1].matchAll(/(\w+): '([^']+)'/g)].map(m => [m[1], m[2]]));
  eq('weaponCalc.js RANK_DICE_LABEL', Object.fromEntries(A.ranks.map(r => [r.rank, r.dice])), web);
} else errors.push('weaponCalc.js の RANK_DICE_LABEL が見つからない');

const cyb = read('src/data/cyberneticsData.js');
for (const g of EQ.cybernetics.grades) {
  const m = cyb.match(new RegExp(`grade: '${g.grade}'[^}]*minLevel: (\\d+)`)) || cyb.match(new RegExp(`'${g.grade}'[^\\n]*(?:minLevel|min_level|requiredLevel)[^\\d]*(\\d+)`));
  if (m && Number(m[1]) !== g.unlockLv) errors.push(`cyberneticsData.js 等級${g.grade}の解禁Lv: data=${g.unlockLv} / web=${m[1]}`);
}

// 3. 移行待ち（v5.0 実装で解消する既知の残存）
if (fs.existsSync(path.join(ROOT, 'src/data/skillData.js'))) pending.push('src/data/skillData.js（v4.0 の6軸スキル）が残っている。既存 v4 ミッションの v5 化が終わったら削除');
if (/getAvailableSkills/.test(read('src/lib/gameEngine.js'))) pending.push('gameEngine.js（v4.0）が既存ミッション用に残っている。v5 は battleEngine.js、ミッション JSON の rules: "v5" で切替');

if (pending.length) console.warn('移行待ち（想定内）:\n  - ' + pending.join('\n  - '));
if (errors.length) { console.error('check_rules_sync: 不一致 ' + errors.length + ' 件\n  - ' + errors.join('\n  - ')); process.exit(1); }
console.log('check_rules_sync: OK（Web 実装のリテラルはデータと一致）');
