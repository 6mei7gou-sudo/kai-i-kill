'use strict';

// ═══════════════════════════════════════════════════════════════════
// KAI-I//KILL キャラクターシート — アプリケーションロジック
// ═══════════════════════════════════════════════════════════════════

// ─── 状態（シングルソースオブトゥルース） ──────────────────────────
let state = {
  name: '',
  affiliation: DATA.affiliations[0],
  background: '',
  awakeningPattern: DATA.awakeningPatterns[0],
  belief: DATA.beliefs[0],
  abilities: {
    body: 'D', sense: 'D', mind: 'D', skill: 'D',
    social: 'D', kaiki: 'D', survival: 'D'
  },
  emotions: {
    fear: 0, anger: 0, sorrow: 0, anxiety: 0, desire: 0, purify: 0
  },
  erosion: 0,
  equipped: [],      // [{ equipId, optionIds: [] }]
  selectedGifts: [], // [giftId, ...]
  notes: '',
  rollHistory: []
};

// ─── 初期化 ─────────────────────────────────────────────────────────
function init() {
  populateSelects();
  buildAbilitiesUI();
  buildEmotionsUI();
  buildGiftsUI();
  bindEvents();
  loadLastSession();
  renderAll();
}

// ─── セレクトボックスを DATA から埋める ─────────────────────────────
function populateSelects() {
  fillSelect('char-affiliation',  DATA.affiliations);
  fillSelect('char-awakening',    DATA.awakeningPatterns);
  fillSelect('char-belief',       DATA.beliefs);
  fillSelect('judgment-ability',  DATA.abilities.map(a => a.name), DATA.abilities.map(a => a.id));
}

function fillSelect(id, labels, values) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  labels.forEach((label, i) => {
    const opt = document.createElement('option');
    opt.value  = values ? values[i] : label;
    opt.textContent = label;
    el.appendChild(opt);
  });
}

// ─── 能力値UIを生成 ──────────────────────────────────────────────────
function buildAbilitiesUI() {
  const grid = document.getElementById('abilities-grid');
  grid.innerHTML = '';

  DATA.abilities.forEach(ability => {
    const card = document.createElement('div');
    card.className = 'ability-card';
    card.dataset.abilityId = ability.id;

    const ranks = Object.keys(DATA.rankData);
    const btnHtml = ranks.map(r =>
      `<button class="rank-btn" data-ability="${ability.id}" data-rank="${r}">${r}</button>`
    ).join('');

    card.innerHTML = `
      <div class="ability-header">
        <span class="ability-name">${ability.name}</span>
        <span class="ability-desc">${ability.desc}</span>
      </div>
      <div class="rank-selector">${btnHtml}</div>
      <div class="ability-rank-info" id="rank-info-${ability.id}">未覚醒 / 1d6</div>
    `;
    grid.appendChild(card);
  });

  // ランクボタンのクリックイベント（委譲）
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.rank-btn');
    if (!btn) return;
    const abilityId = btn.dataset.ability;
    const rank = btn.dataset.rank;
    state.abilities[abilityId] = rank;
    renderAbilityCard(abilityId);
    updateJudgmentRankPreview();
  });
}

function renderAbilityCard(abilityId) {
  const card = document.querySelector(`.ability-card[data-ability-id="${abilityId}"]`);
  if (!card) return;
  const currentRank = state.abilities[abilityId];
  const rankInfo = DATA.rankData[currentRank];
  const rankClass = `active-${currentRank.toLowerCase()}`;

  // ボタン状態更新
  card.querySelectorAll('.rank-btn').forEach(btn => {
    btn.className = 'rank-btn';
    if (btn.dataset.rank === currentRank) btn.classList.add(rankClass);
  });

  // 情報テキスト
  const infoEl = document.getElementById(`rank-info-${abilityId}`);
  if (infoEl) {
    const diceStr = currentRank === 'S'
      ? `5d6（4基本＋1ボーナス）`
      : `${rankInfo.dice}d6`;
    infoEl.textContent = `${rankInfo.label} / ${diceStr}`;
  }
}

function renderAllAbilities() {
  DATA.abilities.forEach(a => renderAbilityCard(a.id));
}

// ─── 感情メーターUIを生成 ─────────────────────────────────────────────
function buildEmotionsUI() {
  const grid = document.getElementById('emotions-grid');
  grid.innerHTML = '';

  DATA.emotions.forEach(emotion => {
    const card = document.createElement('div');
    card.className = 'emotion-card';
    card.dataset.emotionId = emotion.id;

    card.innerHTML = `
      <div class="emotion-header">
        <span class="emotion-name" style="color: ${emotion.color}">${emotion.name}</span>
        <span class="emotion-value-display" id="emotion-val-${emotion.id}">0 / 10</span>
      </div>
      <div class="emotion-controls-row">
        <button class="emotion-btn" data-emotion="${emotion.id}" data-delta="-1">−</button>
        <div class="emotion-bar-track">
          <div class="emotion-bar-fill" id="emotion-bar-${emotion.id}"
            style="background: ${emotion.color}; width: 0%"></div>
        </div>
        <button class="emotion-btn" data-emotion="${emotion.id}" data-delta="1">＋</button>
      </div>
      <div class="emotion-critical hidden" id="emotion-crit-${emotion.id}">臨界！</div>
    `;
    grid.appendChild(card);
  });

  // ボタンのクリックイベント（委譲）
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.emotion-btn');
    if (!btn) return;
    const id = btn.dataset.emotion;
    const delta = parseInt(btn.dataset.delta, 10);
    const current = state.emotions[id];
    state.emotions[id] = Math.max(0, Math.min(10, current + delta));
    renderEmotion(id);
  });
}

function renderEmotion(id) {
  const val = state.emotions[id];
  const valEl  = document.getElementById(`emotion-val-${id}`);
  const barEl  = document.getElementById(`emotion-bar-${id}`);
  const critEl = document.getElementById(`emotion-crit-${id}`);
  if (valEl)  valEl.textContent = `${val} / 10`;
  if (barEl)  barEl.style.width = `${val * 10}%`;
  if (critEl) critEl.classList.toggle('hidden', val < 10);
}

function renderAllEmotions() {
  Object.keys(state.emotions).forEach(id => renderEmotion(id));
}

// ─── ギフトUIを生成 ──────────────────────────────────────────────────
function buildGiftsUI() {
  const list = document.getElementById('gifts-list');
  list.innerHTML = '';

  DATA.gifts.forEach(gift => {
    const item = document.createElement('label');
    item.className = 'gift-item';
    item.htmlFor = `gift-${gift.id}`;

    const cpLabel = gift.cp === 0
      ? `<span class="gift-cp-tag free">無料</span>`
      : `<span class="gift-cp-tag">−${gift.cp}CP</span>`;

    item.innerHTML = `
      <input class="gift-check" type="checkbox" id="gift-${gift.id}" data-gift-id="${gift.id}">
      <div class="gift-info">
        <div class="gift-name">${gift.name} ${cpLabel}</div>
        <div class="gift-desc">${gift.desc}</div>
      </div>
    `;
    list.appendChild(item);
  });

  list.addEventListener('change', e => {
    const cb = e.target.closest('.gift-check');
    if (!cb) return;
    const giftId = cb.dataset.giftId;

    if (cb.checked) {
      const gift = DATA.gifts.find(g => g.id === giftId);
      const remaining = calcRemainingCP();
      if (remaining < gift.cp) {
        alert(`CPが足りません（必要: ${gift.cp}CP、残: ${remaining}CP）`);
        cb.checked = false;
        return;
      }
      if (!state.selectedGifts.includes(giftId)) state.selectedGifts.push(giftId);
    } else {
      state.selectedGifts = state.selectedGifts.filter(id => id !== giftId);
    }

    renderCPDisplays();
    updateGiftSelectedClass();
  });
}

function renderGiftsUI() {
  // チェック状態を state から反映
  DATA.gifts.forEach(gift => {
    const cb = document.getElementById(`gift-${gift.id}`);
    if (cb) cb.checked = state.selectedGifts.includes(gift.id);
  });
  updateGiftSelectedClass();
}

function updateGiftSelectedClass() {
  document.querySelectorAll('.gift-item').forEach(item => {
    const cb = item.querySelector('.gift-check');
    item.classList.toggle('selected', cb && cb.checked);
  });
}

// ─── 侵食率 ──────────────────────────────────────────────────────────
function getErosionInfo(value) {
  let result = DATA.erosionLabels[0];
  DATA.erosionLabels.forEach(entry => {
    if (value >= entry.threshold) result = entry;
  });
  return result;
}

function renderErosion() {
  const val = state.erosion;
  const info = getErosionInfo(val);

  const valEl   = document.getElementById('erosion-value');
  const labelEl = document.getElementById('erosion-label');
  const fillEl  = document.getElementById('erosion-fill');
  const sliderEl= document.getElementById('erosion-slider');
  const alertEl = document.getElementById('erosion-kaiki-alert');

  if (valEl)    valEl.textContent = `${val}%`;
  if (sliderEl) sliderEl.value = val;
  if (fillEl)   fillEl.style.width = `${val}%`;
  if (alertEl)  alertEl.classList.toggle('hidden', val < 100);

  if (labelEl) {
    labelEl.textContent = info.label;
    labelEl.className   = `erosion-status-badge ${info.cssClass}`;
  }
}

// ─── CP 計算 ──────────────────────────────────────────────────────────
function calcUsedCP() {
  let used = 0;
  state.equipped.forEach(e => {
    const item = DATA.equipment.find(eq => eq.id === e.equipId);
    if (item) used += item.cp;
    (e.optionIds || []).forEach(optId => {
      const opt = DATA.options.find(o => o.id === optId);
      if (opt) used += opt.cp;
    });
  });
  state.selectedGifts.forEach(gId => {
    const gift = DATA.gifts.find(g => g.id === gId);
    if (gift) used += gift.cp;
  });
  return used;
}

function calcRemainingCP() {
  return DATA.startingCP - calcUsedCP();
}

function renderCPDisplays() {
  const remaining = calcRemainingCP();
  const total     = DATA.startingCP;
  const ratio     = Math.max(0, remaining / total);

  // タブ④ の CP 表示
  const remEl  = document.getElementById('cp-remain');
  const fillEl = document.getElementById('cp-fill');
  if (remEl)  remEl.textContent = remaining;
  if (fillEl) {
    fillEl.style.width = `${ratio * 100}%`;
    fillEl.className   = 'cp-fill' + (remaining <= 0 ? ' zero' : remaining <= 3 ? ' low' : '');
  }

  // タブ① の残CP バッジ
  const badgeEl = document.getElementById('cp-gifts-remaining');
  if (badgeEl) badgeEl.textContent = remaining;
}

// ─── 装備 ─────────────────────────────────────────────────────────────
function initEquipmentForm() {
  const catSel   = document.getElementById('equip-category');
  const equipSel = document.getElementById('equip-select');
  const optsCont = document.getElementById('equip-options-container');
  const optsList = document.getElementById('equip-options-list');
  const costEl   = document.getElementById('equip-cost-preview');
  const addBtn   = document.getElementById('btn-add-equipment');

  function updateEquipDropdown() {
    const cat = catSel.value;
    equipSel.innerHTML = '<option value="">-- 装備を選択 --</option>';
    optsCont.classList.add('hidden');
    if (costEl) costEl.textContent = '0';
    if (addBtn) addBtn.disabled = true;

    if (!cat) return;

    DATA.equipment
      .filter(eq => eq.category === cat)
      .forEach(eq => {
        const opt = document.createElement('option');
        opt.value = eq.id;
        opt.textContent = `${eq.name}（${eq.cp}CP）`;
        equipSel.appendChild(opt);
      });
  }

  function updateOptionsAndCost() {
    const equipId = equipSel.value;
    optsList.innerHTML = '';
    optsCont.classList.add('hidden');

    if (!equipId) {
      if (costEl) costEl.textContent = '0';
      if (addBtn) addBtn.disabled = true;
      return;
    }

    const item = DATA.equipment.find(e => e.id === equipId);
    if (!item) return;

    const applicableOpts = DATA.options.filter(o => o.forCategory === item.category);

    if (applicableOpts.length > 0) {
      optsCont.classList.remove('hidden');
      applicableOpts.forEach(opt => {
        const label = document.createElement('label');
        label.className = 'option-check-item';
        label.innerHTML = `
          <input type="checkbox" data-opt-id="${opt.id}" data-opt-cp="${opt.cp}">
          <span>${opt.name}（+${opt.cp}CP）</span>
          <span class="option-check-desc">— ${opt.desc}</span>
        `;
        optsList.appendChild(label);
      });
    }

    updateCostPreview();
    if (addBtn) addBtn.disabled = false;
  }

  function updateCostPreview() {
    const equipId = equipSel.value;
    if (!equipId) { if (costEl) costEl.textContent = '0'; return; }

    const item = DATA.equipment.find(e => e.id === equipId);
    let total = item ? item.cp : 0;
    optsList.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      total += parseInt(cb.dataset.optCp || 0, 10);
    });
    if (costEl) costEl.textContent = total;
  }

  catSel.addEventListener('change', updateEquipDropdown);
  equipSel.addEventListener('change', updateOptionsAndCost);
  optsList.addEventListener('change', updateCostPreview);

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const equipId = equipSel.value;
      if (!equipId) return;

      const cost = parseInt(costEl.textContent || '0', 10);
      if (calcRemainingCP() < cost) {
        alert(`CPが足りません（必要: ${cost}CP、残: ${calcRemainingCP()}CP）`);
        return;
      }

      const optionIds = [];
      optsList.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        optionIds.push(cb.dataset.optId);
      });

      state.equipped.push({ equipId, optionIds });
      renderEquipmentList();
      renderCPDisplays();

      // フォームをリセット
      catSel.value = '';
      equipSel.innerHTML = '<option value="">-- 先にカテゴリを選択 --</option>';
      optsCont.classList.add('hidden');
      if (costEl) costEl.textContent = '0';
      addBtn.disabled = true;
    });
  }
}

function renderEquipmentList() {
  const listEl   = document.getElementById('equipped-list');
  const emptyEl  = document.getElementById('equipped-empty');
  if (!listEl) return;

  // イベントリスナーを含む全子要素を一度クリアし再描画
  listEl.innerHTML = '';
  if (emptyEl) listEl.appendChild(emptyEl);

  if (state.equipped.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  state.equipped.forEach((entry, index) => {
    const item = DATA.equipment.find(eq => eq.id === entry.equipId);
    if (!item) return;

    const optTags = (entry.optionIds || []).map(optId => {
      const opt = DATA.options.find(o => o.id === optId);
      return opt ? `<span class="option-tag">${opt.name} +${opt.cp}CP</span>` : '';
    }).join('');

    const totalCP = (() => {
      let t = item.cp;
      (entry.optionIds || []).forEach(optId => {
        const opt = DATA.options.find(o => o.id === optId);
        if (opt) t += opt.cp;
      });
      return t;
    })();

    const div = document.createElement('div');
    div.className = 'equip-item';
    div.innerHTML = `
      <div class="equip-main">
        <div class="equip-name-row">
          <span class="equip-name">${item.name}</span>
          <span class="equip-slot-tag">${item.slot}</span>
          <span class="equip-cp-cost">−${totalCP}CP</span>
        </div>
        <div class="equip-meta">${item.maker} ／ ${item.desc}</div>
        ${optTags ? `<div class="equip-options-tags">${optTags}</div>` : ''}
      </div>
      <button class="btn btn-danger btn-sm" data-remove-index="${index}">外す</button>
    `;
    listEl.appendChild(div);
  });

  // 外すボタン（各ボタンに直接登録して重複を回避）
  listEl.querySelectorAll('[data-remove-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeIndex, 10);
      state.equipped.splice(idx, 1);
      renderEquipmentList();
      renderCPDisplays();
    });
  });
}

// ─── ダイス判定 ────────────────────────────────────────────────────────
function rollDice() {
  const abilityId = document.getElementById('judgment-ability').value;
  const ability   = DATA.abilities.find(a => a.id === abilityId);
  if (!ability) return;

  const rank     = state.abilities[abilityId];
  const numDice  = DATA.rankData[rank].dice;
  const isSRank  = (rank === 'S');

  const results = [];
  for (let i = 0; i < numDice; i++) {
    results.push(Math.floor(Math.random() * 6) + 1);
  }

  const highest     = Math.max(...results);
  const highestIdx  = results.lastIndexOf(highest);
  const resultInfo  = DATA.judgmentResults[highest];

  // ダイス表示
  const diceDisplay = document.getElementById('dice-display');
  diceDisplay.innerHTML = '';
  results.forEach((val, i) => {
    const die = document.createElement('div');
    die.className = 'die';
    if (val === highest && i === highestIdx) die.classList.add('highest');
    if (val === 1) die.classList.add('fumble');
    if (isSRank && i === numDice - 1) die.classList.add('bonus-die');
    die.textContent = val;
    diceDisplay.appendChild(die);
  });

  // 達成値
  document.getElementById('achievement-value').textContent = highest;

  // 結果バッジ
  const badgeContainer = document.getElementById('result-badge');
  badgeContainer.innerHTML = `
    <div class="result-badge ${resultInfo.cssClass}">
      <span class="result-icon">${resultInfo.icon}</span>
      <span class="result-label">${resultInfo.label}</span>
      <span class="result-desc">${resultInfo.desc}</span>
    </div>
  `;

  // 結果表示エリアを表示
  document.getElementById('judgment-result').classList.remove('hidden');

  // 履歴に追加
  const diceStr = results.join(', ');
  addRollHistory({ ability: ability.name, rank, diceStr, highest, resultInfo });
}

function addRollHistory(entry) {
  state.rollHistory.unshift(entry);
  if (state.rollHistory.length > 20) state.rollHistory.pop();
  renderRollHistory();
}

function renderRollHistory() {
  const historyEl = document.getElementById('roll-history');
  const emptyEl   = document.getElementById('history-empty');
  if (!historyEl) return;

  historyEl.querySelectorAll('.history-item').forEach(el => el.remove());

  if (state.rollHistory.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  state.rollHistory.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <span class="history-ability">${entry.ability}</span>
      <span class="history-rank">${entry.rank}</span>
      <span class="history-dice">[${entry.diceStr}]</span>
      <span class="history-achieve" style="color:${entry.resultInfo.cssClass.includes('success') ? 'var(--success)' : entry.resultInfo.cssClass.includes('fumble') ? 'var(--danger)' : 'var(--text)'}">${entry.highest}</span>
      <span class="history-result" style="color:${getResultColor(entry.resultInfo.cssClass)}">${entry.resultInfo.icon} ${entry.resultInfo.label}</span>
    `;
    historyEl.appendChild(item);
  });
}

function getResultColor(cssClass) {
  if (cssClass.includes('fumble'))  return 'var(--danger)';
  if (cssClass.includes('critical'))return 'var(--accent)';
  if (cssClass.includes('success')) return 'var(--success)';
  if (cssClass.includes('partial')) return 'var(--warning)';
  return 'var(--text-dim)';
}

function updateJudgmentRankPreview() {
  const abilityId = document.getElementById('judgment-ability').value;
  if (!abilityId) return;
  const rank    = state.abilities[abilityId] || 'D';
  const numDice = DATA.rankData[rank].dice;
  const badgeEl = document.getElementById('judgment-rank-badge');
  const diceEl  = document.getElementById('judgment-dice-count');
  if (badgeEl) badgeEl.textContent = rank;
  if (diceEl)  diceEl.textContent  = `${numDice}d6${rank === 'S' ? '（ボーナス込み）' : ''}`;
}

// ─── 保存 / 読み込み ────────────────────────────────────────────────────
const STORAGE_KEY = 'kai_characters';

function getSavedList() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveCharacter() {
  const name = state.name.trim() || '名無し';
  const list = getSavedList();
  const id = Date.now().toString();
  const savedAt = new Date().toLocaleString('ja-JP');
  list.push({ id, name, state: JSON.parse(JSON.stringify(state)), savedAt });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  localStorage.setItem('kai_last_id', id);
  alert(`「${name}」を保存しました。`);
}

function loadCharacter(id) {
  const list = getSavedList();
  const entry = list.find(e => e.id === id);
  if (!entry) return;
  applyState(entry.state);
  localStorage.setItem('kai_last_id', id);
  renderAll();
  closeModal('modal-load');
  alert(`「${entry.name}」を読み込みました。`);
}

function deleteCharacter(id) {
  if (!confirm('このキャラクターを削除しますか？')) return;
  const list = getSavedList().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  showLoadModal(); // リストを再描画
}

function loadLastSession() {
  const lastId = localStorage.getItem('kai_last_id');
  if (!lastId) return;
  const list = getSavedList();
  const entry = list.find(e => e.id === lastId);
  if (entry) applyState(entry.state);
}

function applyState(saved) {
  // 安全なマージ（将来の構造変更に備えて各フィールドを個別に適用）
  state.name             = saved.name             ?? '';
  state.affiliation      = saved.affiliation      ?? DATA.affiliations[0];
  state.background       = saved.background       ?? '';
  state.awakeningPattern = saved.awakeningPattern ?? DATA.awakeningPatterns[0];
  state.belief           = saved.belief           ?? DATA.beliefs[0];
  state.abilities        = Object.assign({ body:'D',sense:'D',mind:'D',skill:'D',social:'D',kaiki:'D',survival:'D' }, saved.abilities || {});
  state.emotions         = Object.assign({ fear:0,anger:0,sorrow:0,anxiety:0,desire:0,purify:0 }, saved.emotions || {});
  state.erosion          = saved.erosion          ?? 0;
  state.equipped         = saved.equipped         ?? [];
  state.selectedGifts    = saved.selectedGifts    ?? [];
  state.notes            = saved.notes            ?? '';
  state.rollHistory      = saved.rollHistory      ?? [];
}

// ─── エクスポート ──────────────────────────────────────────────────────
function buildExportText() {
  const bar  = (val, max=10) => '▓'.repeat(val) + '░'.repeat(max - val);
  const name = state.name || '（名前なし）';
  const lines = [];

  lines.push('═══════════════════════════════════');
  lines.push(`  KAI-I//KILL キャラクターシート`);
  lines.push('═══════════════════════════════════');
  lines.push('');
  lines.push('【基本情報】');
  lines.push(`名前：${name}`);
  lines.push(`所属：${state.affiliation}`);
  lines.push(`覚醒：${state.awakeningPattern}`);
  lines.push(`信念：${state.belief}`);
  if (state.background) lines.push(`背景：${state.background}`);
  lines.push('');
  lines.push('【能力値】');
  DATA.abilities.forEach(a => {
    const rank = state.abilities[a.id] || 'D';
    lines.push(`  ${a.name}：${rank}（${DATA.rankData[rank].dice}d6）`);
  });
  lines.push('');
  lines.push('【感情状態】');
  DATA.emotions.forEach(e => {
    const val = state.emotions[e.id] || 0;
    lines.push(`  ${e.name}：${bar(val)} ${val}/10${val >= 10 ? ' ⚠臨界！' : ''}`);
  });
  lines.push('');
  lines.push('【侵食率】');
  const erosionInfo = getErosionInfo(state.erosion);
  lines.push(`  ${state.erosion}% ／ 【${erosionInfo.label}】`);
  lines.push('');
  lines.push(`【装備】（CP残：${calcRemainingCP()} / ${DATA.startingCP}）`);
  if (state.equipped.length === 0) {
    lines.push('  （なし）');
  } else {
    state.equipped.forEach(entry => {
      const item = DATA.equipment.find(eq => eq.id === entry.equipId);
      if (!item) return;
      let optStr = '';
      if (entry.optionIds && entry.optionIds.length > 0) {
        const optNames = entry.optionIds.map(oid => {
          const o = DATA.options.find(opt => opt.id === oid);
          return o ? o.name : '';
        }).filter(Boolean);
        optStr = ` ＋ ${optNames.join('、')}`;
      }
      lines.push(`  • ${item.name}（${item.slot}）${optStr}`);
    });
  }
  if (state.selectedGifts.length > 0) {
    lines.push('');
    lines.push('【ギフト】');
    state.selectedGifts.forEach(gId => {
      const g = DATA.gifts.find(gift => gift.id === gId);
      if (g) lines.push(`  • ${g.name}：${g.desc}`);
    });
  }
  if (state.notes) {
    lines.push('');
    lines.push('【メモ】');
    lines.push(state.notes);
  }
  lines.push('');
  lines.push('═══════════════════════════════════');
  return lines.join('\n');
}

// ─── モーダル操作 ──────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function showLoadModal() {
  const list   = getSavedList();
  const listEl = document.getElementById('character-list');
  listEl.innerHTML = '';

  if (list.length === 0) {
    listEl.innerHTML = '<p class="empty-message">保存済みキャラクターがありません。</p>';
  } else {
    list.slice().reverse().forEach(entry => {
      const item = document.createElement('div');
      item.className = 'char-list-item';
      item.innerHTML = `
        <div>
          <div class="char-list-name">${entry.name}</div>
          <div class="char-list-date">${entry.savedAt}</div>
        </div>
        <div class="char-list-btns">
          <button class="btn btn-accent btn-sm" data-load-id="${entry.id}">読み込み</button>
          <button class="btn btn-danger btn-sm" data-delete-id="${entry.id}">削除</button>
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  listEl.addEventListener('click', e => {
    const loadBtn   = e.target.closest('[data-load-id]');
    const deleteBtn = e.target.closest('[data-delete-id]');
    if (loadBtn)   loadCharacter(loadBtn.dataset.loadId);
    if (deleteBtn) deleteCharacter(deleteBtn.dataset.deleteId);
  });

  openModal('modal-load');
}

// ─── イベント登録 ──────────────────────────────────────────────────────
function bindEvents() {
  // タブ切り替え
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ヘッダーボタン
  document.getElementById('btn-save').addEventListener('click', saveCharacter);
  document.getElementById('btn-load').addEventListener('click', showLoadModal);
  document.getElementById('btn-new').addEventListener('click', () => {
    if (!confirm('現在の内容をリセットして新規作成しますか？')) return;
    resetState();
    renderAll();
  });
  document.getElementById('btn-export').addEventListener('click', () => {
    document.getElementById('export-text').value = buildExportText();
    openModal('modal-export');
  });

  // モーダル閉じる
  document.getElementById('btn-modal-load-close').addEventListener('click', () => closeModal('modal-load'));
  document.getElementById('btn-export-close').addEventListener('click', () => closeModal('modal-export'));
  document.getElementById('btn-copy').addEventListener('click', () => {
    const ta = document.getElementById('export-text');
    ta.select();
    document.execCommand('copy');
    alert('クリップボードにコピーしました！');
  });

  // モーダル背景クリックで閉じる
  document.querySelectorAll('.modal-backdrop').forEach(el => {
    el.addEventListener('click', () => {
      closeModal('modal-load');
      closeModal('modal-export');
    });
  });

  // 基本情報フィールド
  document.getElementById('char-name').addEventListener('input', e => { state.name = e.target.value; });
  document.getElementById('char-affiliation').addEventListener('change', e => { state.affiliation = e.target.value; });
  document.getElementById('char-awakening').addEventListener('change', e => { state.awakeningPattern = e.target.value; });
  document.getElementById('char-belief').addEventListener('change', e => { state.belief = e.target.value; });
  document.getElementById('char-background').addEventListener('input', e => { state.background = e.target.value; });
  document.getElementById('char-notes').addEventListener('input', e => { state.notes = e.target.value; });

  // 侵食スライダー
  document.getElementById('erosion-slider').addEventListener('input', e => {
    state.erosion = parseInt(e.target.value, 10);
    renderErosion();
  });

  // 判定ボタン
  document.getElementById('btn-roll').addEventListener('click', rollDice);
  document.getElementById('judgment-ability').addEventListener('change', updateJudgmentRankPreview);

  // 履歴クリア
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    state.rollHistory = [];
    renderRollHistory();
    document.getElementById('judgment-result').classList.add('hidden');
  });

  // 装備フォーム
  initEquipmentForm();
}

// ─── タブ切り替え ────────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    const panelId = panel.id.replace('tab-', '');
    panel.classList.toggle('active', panelId === tabId);
    panel.classList.toggle('hidden', panelId !== tabId);
  });
  if (tabId === 'judgment') updateJudgmentRankPreview();
}

// ─── 全体レンダリング ──────────────────────────────────────────────────
function renderAll() {
  // 基本情報フィールド
  setInputValue('char-name',        state.name);
  setSelectValue('char-affiliation', state.affiliation);
  setSelectValue('char-awakening',   state.awakeningPattern);
  setSelectValue('char-belief',      state.belief);
  setInputValue('char-background',  state.background);
  setInputValue('char-notes',       state.notes);

  // 各タブ
  renderAllAbilities();
  renderAllEmotions();
  renderErosion();
  renderEquipmentList();
  renderGiftsUI();
  renderCPDisplays();
  renderRollHistory();
  updateJudgmentRankPreview();
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function setSelectValue(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  const opt = [...el.options].find(o => o.value === val);
  if (opt) el.value = val;
}

// ─── 状態リセット ─────────────────────────────────────────────────────
function resetState() {
  state = {
    name: '', affiliation: DATA.affiliations[0],
    background: '', awakeningPattern: DATA.awakeningPatterns[0],
    belief: DATA.beliefs[0],
    abilities: { body:'D',sense:'D',mind:'D',skill:'D',social:'D',kaiki:'D',survival:'D' },
    emotions: { fear:0,anger:0,sorrow:0,anxiety:0,desire:0,purify:0 },
    erosion: 0, equipped: [], selectedGifts: [], notes: '', rollHistory: []
  };
}

// ─── 起動 ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
