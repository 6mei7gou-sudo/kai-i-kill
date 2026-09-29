// KAI-I//KILL コアルールブック 組版スクリプト
// 入力：docs/rules/core_design.md（唯一の原稿）
// 出力：out/rulebook.html（Paged.js で組版）→ out/KAI-I_KILL_CoreRulebook.pdf
//
// 原稿側の約束：
//   # PART …          → パート扉（全面ダーク）
//   ## 第N章／序章／付録X → 章（章頭は帯見出し。直後の引用は題辞）
//   ### N-M　見出し     → 節（目次に載る）
//   > *斜体*            → フレーバー引用
//   > **例：**          → プレイ例ボックス
//   <!-- book:skip --> … <!-- /book:skip --> → 書籍に含めない
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { chromium } from 'playwright-core';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const SRC = path.join(ROOT, 'docs/rules/core_design.md');
const OUT_DIR = path.join(HERE, 'out');
const OUT_HTML = path.join(OUT_DIR, 'rulebook.html');
const OUT_PDF = path.join(OUT_DIR, 'KAI-I_KILL_CoreRulebook.pdf');
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';

marked.setOptions({ gfm: true, breaks: false });

// ---------- 原稿の読み込みと前処理 ----------
let md = fs.readFileSync(SRC, 'utf8');
const version = (md.match(/\*\*版：(.+?)／/) || [, 'v5.0'])[1].trim();
md = md.replace(/<!--\s*book:skip\s*-->[\s\S]*?<!--\s*\/book:skip\s*-->/g, '');
md = md.slice(md.search(/^## /m)); // 冒頭の版・注記は書籍に載せない

// ---------- 構造の解析（パート → 章 → 本文） ----------
const lines = md.split('\n');
const parts = [];           // { n, title, chapters[] }
let cur = { n: null, title: null, chapters: [] }; // パート前の章（序章）
parts.push(cur);
let ch = null;
let inFence = false;
for (const line of lines) {
  if (/^```/.test(line)) inFence = !inFence;
  if (!inFence && /^# /.test(line)) {
    cur = { n: parts.length, title: line.replace(/^# /, '').trim(), chapters: [] };
    parts.push(cur); ch = null; continue;
  }
  if (!inFence && /^## /.test(line)) {
    ch = { title: line.replace(/^## /, '').trim(), body: [] };
    cur.chapters.push(ch); continue;
  }
  if (ch) ch.body.push(line);
}

const PART_META = {
  'PART I　世界': { n: 'PART I', desc: '怪異とは何か。討伐者は何者か。ルールを読む前に、この世界の輪郭を知る。' },
  'PART II　ルール': { n: 'PART II', desc: 'ダイスを振り、どの目を使うかを決め、共鳴を刻む。調査から討伐までの手順。' },
  'PART III　キャラクター': { n: 'PART III', desc: '所属と背景で立場を、スタイルで戦い方を決める。成長し、背負うものが増える。' },
  'PART IV　ゲームマスター': { n: 'PART IV', desc: '怪異を数字に翻訳し、卓に載せる。解明が戦闘を短くするように組む。' },
  '付録': { n: 'APPENDIX', desc: 'クイックリファレンス、v4.0からの変更点、キャラクターシート。' },
};

let chapterIndex = 0;
const toc = []; // { level, id, label, num }

function chapterMeta(title) {
  let m;
  if ((m = title.match(/^序章　(.*)$/))) return { kicker: 'PROLOGUE', num: '序章', name: m[1], id: 'ch-0' };
  if ((m = title.match(/^第(\d+)章　(.*)$/))) return { kicker: `CHAPTER ${String(m[1]).padStart(2, '0')}`, num: `第${m[1]}章`, name: m[2], id: `ch-${m[1]}` };
  if ((m = title.match(/^付録([A-Z])　(.*)$/))) return { kicker: `APPENDIX ${m[1]}`, num: `付録${m[1]}`, name: m[2], id: `ap-${m[1]}` };
  return { kicker: '', num: '', name: title, id: `ch-x${++chapterIndex}` };
}

function classifyBlockquote(html) {
  if (/^<blockquote>\s*<p><em>/.test(html)) return html.replace('<blockquote>', '<blockquote class="flavor">');
  if (/^<blockquote>\s*<p><strong>例/.test(html)) return html.replace('<blockquote>', '<blockquote class="example">');
  return html;
}

function renderChapter(meta, body) {
  const tokens = marked.lexer(body.join('\n'));
  const out = [];
  let flow = [];
  let first = true;
  const flush = () => {
    if (!flow.length) return;
    const html = marked.parser(flow).replace(/<blockquote>[\s\S]*?<\/blockquote>/g, classifyBlockquote);
    const text = html.replace(/<[^>]+>/g, '');
    out.push(html);
    flow = [];
  };
  let secCount = 0;
  for (const t of tokens) {
    if (first && t.type === 'blockquote') {
      first = false;
      out.push(marked.parser([t]).replace('<blockquote>', '<blockquote class="epigraph"'));
      continue;
    }
    if (t.type !== 'space') first = false;
    if (t.type === 'heading') {
      flush();
      let html = marked.parser([t]);
      if (t.depth === 3) {
        const m = t.text.match(/^([0-9A-Z]+-[0-9]+)　(.*)$/);
        const id = `${meta.id}-s${++secCount}`;
        if (m) {
          html = `<h3 id="${id}"><span class="num">${m[1]}</span>${marked.parseInline(m[2])}</h3>`;
          toc.push({ level: 'sec', id, num: m[1], label: m[2] });
        } else {
          html = `<h3 id="${id}">${marked.parseInline(t.text)}</h3>`;
          toc.push({ level: 'sec', id, num: '', label: t.text });
        }
      }
      out.push(html);
      continue;
    }
    if (t.type === 'table' || t.type === 'code' || t.type === 'hr' || t.type === 'html') {
      flush();
      if (t.type === 'hr') continue; // 章内の区切り線は組版では不要
      let html = marked.parser([t]);
      if (t.type === 'table' && t.rows.length <= 8) html = html.replace('<table>', '<table class="avoid">');
      if (t.type === 'code' && t.text.split('\n').length > 18) html = html.replace('<pre>', '<pre class="long">');
      out.push(html);
      continue;
    }
    flow.push(t);
  }
  flush();
  return `<section class="chapter" id="${meta.id}">
<h2 data-kicker="${meta.kicker}">${meta.num ? meta.num + '　' : ''}${meta.name}</h2>
${out.join('\n')}
</section>`;
}

// ---------- 本文の生成 ----------
const bodyHtml = [];
for (const part of parts) {
  if (part.title) {
    const pm = PART_META[part.title] || { n: `PART ${part.n}`, desc: '' };
    const pid = `part-${part.n}`;
    toc.push({ level: 'part', id: pid, num: pm.n, label: part.title.replace(/^PART [IVX]+　/, '') });
    const list = part.chapters.map(c => { const m = chapterMeta(c.title); return `<div><b>${m.num || '—'}</b>${m.name}</div>`; }).join('');
    bodyHtml.push(`<section class="part" id="${pid}"><div class="n">${pm.n}</div><div class="rule"></div><div class="t">${part.title.replace(/^PART [IVX]+　/, '')}</div><div class="d">${pm.desc}</div><div class="list">${list}</div></section>`);
  }
  for (const c of part.chapters) {
    const meta = chapterMeta(c.title);
    toc.push({ level: 'ch', id: meta.id, num: meta.num, label: meta.name });
    bodyHtml.push(renderChapter(meta, c.body));
  }
}

// ---------- 前付・後付 ----------
const cover = `<section class="cover">
  <div class="frame"></div>
  <div class="kicker">電脳怪異譚 ／ DENNO KAII-TAN</div>
  <div class="series">電脳怪異譚</div>
  <div class="meter"><i style="background:#8b2030"></i><i style="background:#d45020"></i><i style="background:#2855a0"></i><i style="background:#d48820"></i><i style="background:#7030a0"></i><i style="background:#40a070"></i></div>
  <div class="title">KAI-I//KILL<small>コアルールブック</small></div>
  <div class="sub">TRPG CORE RULEBOOK　<b>ver.5.0</b><br>ランク制ダイスプール ／ 共鳴記録 ／ 核防壁戦</div>
  <div class="quotes"><span>「噂が臨界点を超えた時、それは現実のバグになる。」</span><span>「知識が命を救う。無知が人を殺す。」</span></div>
  <div class="foot"><span>${version.toUpperCase()}</span><span>PLAYTEST DRAFT — NOT FOR DISTRIBUTION</span></div>
</section>`;

const titlepage = `<section class="frontmatter titlepage">
  <div class="t1">KAI-I//KILL</div>
  <div class="t2">コアルールブック</div>
  <div class="t3">TRPG CORE RULEBOOK<br>${version}</div>
  <div class="note"><p><strong>本書はテストプレイ用のドラフトだ。</strong>数値は逆算値であり、卓で回して削る前提で置いている。第14章「テストプレイのチェック観点」を読んでから遊んでほしい。</p><p>原稿：<code>docs/rules/core_design.md</code>。この版が確定するまで、判定メカニクスの正本は統合ルールブック v4.0 のままとする。</p></div>
</section>`;

function tocHtml() {
  const items = toc.map(e => {
    if (e.level === 'part') return `<li class="part"><span class="n">${e.num}</span><span class="lbl">${e.label}</span><span class="dots"></span><a class="pg" href="#${e.id}"></a></li>`;
    if (e.level === 'ch') return `<li class="ch"><span class="n">${e.num}</span><span class="lbl">${e.label}</span><span class="dots"></span><a class="pg" href="#${e.id}"></a></li>`;
    return `<li class="sec"><span class="n">${e.num}</span><span class="lbl">${e.label}</span><span class="dots"></span><a class="pg" href="#${e.id}"></a></li>`;
  }).join('\n');
  return `<section class="frontmatter toc"><h1>目次</h1><ol>${items}</ol></section>`;
}

const sheet = fs.readFileSync(path.join(HERE, 'sheet.html'), 'utf8');
const colophon = `<section class="colophon">
  <div class="t">電脳怪異譚 KAI-I//KILL　コアルールブック</div>
  <table><tr><td>版</td><td>${version}</td></tr><tr><td>組版</td><td>${new Date().toISOString().slice(0, 10)}　docs/_build/book/build.mjs（Paged.js）</td></tr><tr><td>原稿</td><td>docs/rules/core_design.md</td></tr><tr><td>判型</td><td>B5（182×257mm）</td></tr></table>
  <p>本書は KAI-I//KILL プロジェクトの内部ドラフトであり、頒布物ではない。</p>
</section>`;

// ---------- HTML の組み立て ----------
const css = fs.readFileSync(path.join(HERE, 'style.css'), 'utf8');
const fontsCss = fs.existsSync(path.join(HERE, 'fonts/fonts.css'))
  ? fs.readFileSync(path.join(HERE, 'fonts/fonts.css'), 'utf8').replace(/url\((f\d+\.woff2)\)/g, 'url(../fonts/$1)')
  : '';
const pagedJs = path.join(HERE, 'node_modules/pagedjs/dist/paged.polyfill.js');
const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<title>KAI-I//KILL コアルールブック ${version}</title>
<style>${fontsCss}</style>
<style>${css.replace(/@import url\([^)]*\);\s*/, '')}</style>
<script>window.PagedConfig = { auto: true, after: () => { window.__pagedDone = true; } };</script>
<script src="file://${pagedJs}"></script>
</head><body>
${cover}
${titlepage}
${tocHtml()}
${bodyHtml.join('\n')}
${sheet}
${colophon}
</body></html>`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_HTML, html);
console.log(`html: ${OUT_HTML} (${(html.length / 1024).toFixed(0)} KB, ${toc.length} toc entries)`);

// ---------- PDF ----------
if (process.argv.includes('--html-only')) process.exit(0);
const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'] });
const page = await browser.newPage();
page.on('pageerror', e => console.error('pageerror:', e.message));
await page.goto('file://' + OUT_HTML, { waitUntil: 'load' });
await page.waitForFunction(() => window.__pagedDone === true, null, { timeout: 300000 });
await page.evaluate(() => document.fonts.ready);
const pages = await page.evaluate(() => document.querySelectorAll('.pagedjs_page').length);
await page.pdf({ path: OUT_PDF, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`pdf: ${OUT_PDF} (${pages} pages)`);
