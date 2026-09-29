// ルールデータ（docs/rules/data/*.json）から rules_unified.md の表を再生成する。
//   node docs/_build/render_tables.mjs          … 表を書き換える
//   node docs/_build/render_tables.mjs --check  … 差分があれば一覧を出して終了コード1
// 原稿側は <!-- table:NAME --> … <!-- /table --> で囲った区間だけが対象。手で編集しない。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const DOC = path.join(ROOT, 'docs/rules/rules_unified.md');
const DATA = path.join(ROOT, 'docs/rules/data');
const load = (n) => JSON.parse(fs.readFileSync(path.join(DATA, `${n}.json`), 'utf8'));
const A = load('abilities'), R = load('resonance'), G = load('anomaly_grades'), C = load('character_options');
const S = load('styles'), GI = load('gifts'), EQ = load('equipment'), LV = load('level_table');

const b = (s) => `**${s}**`;
const table = (header, rows) => [
  `| ${header.join(' | ')} |`,
  `|${header.map(() => '---').join('|')}|`,
  ...rows.map(r => `| ${r.join(' | ')} |`),
].join('\n');

const gradeRow = (g, quick = false) => {
  if (!quick) return [g.grade, g.layers, g.layerHp, g.layerDef, g.coreHp, g.coreDef, g.threat, g.limitRounds, g.decode === '必須' ? b(g.decode) : g.decode];
  const short = { '五級': '五', '四級': '四', '三級': '三', '二級': '二', '一級': '一', '特級': '特' }[g.grade];
  const layers = g.layers === 'なし' ? '0' : g.layers.startsWith('3＋') ? '3+' : g.layers;
  return [short, layers, g.layerHp === '特殊' ? '—' : g.layerHp, g.layerDef, g.coreHp.replace('封印ゲージ', '封印'), g.coreDef, g.threat, g.limitRounds === '特殊' ? '—' : g.limitRounds];
};
const stageLabel = (gf) => gf.stage === 'critical' ? b(gf.stageLabel) : gf.stageLabel;
const slotJa = { main: '主', sub: '副', third: '第三' };
const gradeJa = { 1: 'I', 2: 'II', 3: 'III', '極': '極' };

const RENDER = {
  'abilities': () => table(['能力値', '読み', '主な用途'], A.abilities.map(a => [b(a.name), a.reading, a.use])),
  'ranks': () => table(['ランク', 'ダイス', '位置づけ'], A.ranks.map(r => [b(r.rank), r.dice, r.label])),
  'resonance-meters': () => table(['行為', 'メーター', '色', '臨界（10点）の代償'], R.meters.map(m => [m.actions, b(`${m.name}（${m.en}）`), m.color, m.critical])),
  'resonance-gain': () => table(['タイミング', '上昇'], R.gain.map(g => [g.timing, g.value])),
  'resonance-stages': () => table(['蓄積', '段階', '解放されるもの'], R.stages.map(s => [s.range === '10' ? b(s.range) : s.range, b(s.stage), s.unlock])),
  'grades': () => table(['等級', '防壁層', '層HP（各）', '層防御', '核HP', '核防御', '脅威度', '制限R', '解明'], G.grades.map(g => gradeRow(g))),
  'grades-gm': () => table(['等級', '防壁層', '層HP（各）', '層防御', '核HP', '核防御', '脅威度', '制限R', '解明', '想定R'], G.grades.map(g => [...gradeRow(g), g.expectedRounds])),
  'grades-quick': () => table(['等級', '層', '層HP', '層防', '核HP', '核防', '脅威', '制限R'], G.grades.map(g => gradeRow(g, true))),
  'layer-traits': () => table(['特性', '効果', '使いどころ'], G.layerTraits.map(t => [b(t.name), t.effect, t.use])),
  'backgrounds': () => table(['背景', 'C昇格', '初期効果'], C.backgrounds.map(x => [b(x.id), x.upgrades, x.effect])),
  'assignments': () => table(['所属', '配属', 'B昇格', '特色'], C.assignments.map(x => [x.affiliation, b(x.id), x.upgrade, x.desc])),
  'awakenings': () => table(['パターン', '概要', '特典'], C.awakenings.map(x => [b(x.id), x.desc, x.bonus])),
  'languages': () => table(['言語', '色', '質感', '得意な状況（判定 +1）'], C.languages.map(x => [b(x.id), x.color, x.texture, x.strength])),
  'styles': () => table(['#', 'スタイル', '主能力値', '役割', '共鳴の傾き'], S.styles.map((s, i) => [String(i + 1), `${b(s.name)}（${s.en}）`, s.abilities, s.role, s.meter])),
  'style-unlock': () => table(['レベル', '解禁', '使える技の数'], S.gradeUnlock.map((u, i) => [String(u.lv), u.grade === '極' ? `${b('極')}（主スタイル段位IIIの技の使用回数が2倍）` : `${slotJa[u.slot]}スタイル 段位${gradeJa[u.grade]}`, String(u.grade === '極' ? i : i + 1)])),
  'gifts-initial': () => table(['ギフト', '効果'], GI.initial.map(g => [b(g.id), g.effect])),
  'equipment-classes': () => table(['分類', '主な用途', '武器修正', '防御修正', '解禁Lv', '備考'], EQ.classes.map(c => [b(c.id), c.use, c.weaponMod, c.defenseMod, c.unlockLv, c.note])),
  'equipment-cp': () => table(['分類', '本体CP'], EQ.cpRanges.map(c => [c.id, c.cp])),
  'equipment-options': () => table(['オプション', 'CP', 'Lv', '効果', '共鳴'], EQ.options.map(o => [b(o.name), String(o.cp), String(o.lv), o.effect, o.resonance])),
  'makers': () => table(['メーカー', '補正'], EQ.makers.map(m => [b(m.name), m.effect])),
  'cyber-grades': () => table(['等級', '名称', '解禁Lv', '常時共鳴', '概要'], EQ.cybernetics.grades.map(g => [b(g.grade), g.name, String(g.unlockLv), g.resonance, g.desc])),
  'cyber-examples': () => table(['例', '等級', '部位', 'CP', '効果'], EQ.cybernetics.examples.map(e => [e.name, e.grade, e.part, String(e.cp), e.effect])),
  'level-table': () => table(['Lv', 'HP', 'スタイル', '能力値成長', 'CP', '解禁'], LV.levels.map(l => [String(l.lv), `+${l.hpBonus}`, l.style === '極' ? b('極') : l.style, l.growth, String(l.cp), l.unlock])),
  'belief-cap': () => table(['レベル', '信念ポイント上限'], LV.beliefCap.map(c => [c.levels, `${c.cap}点`])),
  'growth-quick': () => table(['Lv', ...S.gradeUnlock.map(u => String(u.lv))], [['スタイル', ...S.gradeUnlock.map(u => u.grade === '極' ? '極' : `${slotJa[u.slot]}${gradeJa[u.grade]}`)]]),
};
for (const st of S.styles) {
  RENDER[`techs:${st.id}`] = () => table(['段位', '技', 'タイミング', '効果'],
    S.techniques.filter(t => t.style === st.id).sort((x, y) => x.grade - y.grade).map(t => [gradeJa[t.grade], b(t.name), { main: 'メイン', sub: 'サブ', passive: 'パッシブ', reaction: 'リアクション' }[t.timing], t.text]));
}
for (const m of R.meters) {
  RENDER[`gifts:${m.key}`] = () => table(['段階', 'ギフト', '効果'], GI.awakening.filter(g => g.meter === m.key).map(g => [stageLabel(g), b(g.name), g.effect]));
}

const src = fs.readFileSync(DOC, 'utf8');
const re = /<!-- table:([\w:-]+) -->\n([\s\S]*?)\n<!-- \/table -->/g;
const diffs = []; const seen = new Set();
const out = src.replace(re, (whole, name, body) => {
  seen.add(name);
  if (!RENDER[name]) { diffs.push(`${name}: 未知の表名`); return whole; }
  const next = RENDER[name]();
  if (next !== body) diffs.push(name);
  return `<!-- table:${name} -->\n${next}\n<!-- /table -->`;
});
const unused = Object.keys(RENDER).filter(k => !seen.has(k));
if (process.argv.includes('--check')) {
  if (diffs.length) { console.error('render_tables: 原稿の表がデータと一致しない →', diffs.join(', ')); process.exit(1); }
  if (unused.length) console.warn('render_tables: 原稿に未配置の表:', unused.join(', '));
  console.log(`render_tables: OK（${seen.size} 表）`); process.exit(0);
}
fs.writeFileSync(DOC, out);
console.log(`render_tables: ${seen.size} 表を再生成${diffs.length ? '（更新: ' + diffs.join(', ') + '）' : '（変更なし）'}`);
if (unused.length) console.warn('未配置の表:', unused.join(', '));
