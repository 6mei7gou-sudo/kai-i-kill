/**
 * ルールデータ（docs/rules/data/*.json）の整合性テスト。
 * - JSON 同士の構造（スタイル9×段位3、ギフト6メーター×3段階＋大浄化、レベル1〜20 など）
 * - 原稿 rules_unified.md の表がデータから再生成した内容と一致すること（render_tables --check）
 * - Web 実装 characterBuildData.js と共通項目が一致すること（check_rules_sync）
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const load = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/rules/data', `${n}.json`), 'utf8'));

describe('docs/rules/data の構造', () => {
    test('スタイルは9種、技は27（各スタイル段位I〜III）', () => {
        const S = load('styles');
        expect(S.styles).toHaveLength(9);
        expect(S.techniques).toHaveLength(27);
        expect(new Set(S.techniques.map(t => t.id)).size).toBe(27);
        for (const st of S.styles) {
            expect(S.techniques.filter(t => t.style === st.id).map(t => t.grade).sort()).toEqual([1, 2, 3]);
        }
    });
    test('技の列挙値はスキーマの範囲内', () => {
        const S = load('styles');
        for (const t of S.techniques) {
            expect(S.schema.timing).toContain(t.timing);
            expect(S.schema.target).toContain(t.target);
            expect(S.schema['resonance.mode']).toContain(t.resonance.mode);
            expect(t.effects.length).toBeGreaterThan(0);
            for (const e of t.effects) expect(S.schema['effects.type']).toContain(e.type);
            if (t.uses) for (const u of [].concat(t.uses)) expect(S.schema['uses.per']).toContain(u.per);
        }
    });
    test('覚醒ギフトは6メーター×3段階＋大浄化', () => {
        const GI = load('gifts'); const R = load('resonance');
        expect(GI.initial).toHaveLength(6);
        for (const m of R.meters) {
            const stages = GI.awakening.filter(g => g.meter === m.key).map(g => g.stage);
            expect(stages.slice(0, 3)).toEqual([1, 2, 3]);
        }
        expect(GI.awakening.filter(g => g.stage === 'critical').map(g => g.meter)).toEqual(['purge']);
    });
    test('等級表は五級〜特級の6行で、数値列が単調', () => {
        const G = load('anomaly_grades');
        expect(G.grades.map(g => g.grade)).toEqual(['五級', '四級', '三級', '二級', '一級', '特級']);
        const core = G.grades.slice(0, 5).map(g => Number(g.coreHp));
        for (let i = 1; i < core.length; i++) expect(core[i]).toBeGreaterThan(core[i - 1]);
        const threat = G.grades.map(g => Number(g.threat));
        for (let i = 1; i < threat.length; i++) expect(threat[i]).toBeGreaterThan(threat[i - 1]);
    });
    test('レベル表は1〜20が連続し、CPとHPが減らない', () => {
        const LV = load('level_table');
        expect(LV.levels.map(l => l.lv)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
        for (let i = 1; i < LV.levels.length; i++) {
            expect(LV.levels[i].cp).toBeGreaterThanOrEqual(LV.levels[i - 1].cp);
            expect(LV.levels[i].hpBonus).toBeGreaterThanOrEqual(LV.levels[i - 1].hpBonus);
        }
        const unlockLvs = load('styles').gradeUnlock.map(u => u.lv);
        for (const lv of unlockLvs) expect(LV.levels[lv - 1].style).not.toBe('—');
    });
});

describe('原稿・Web実装との同期', () => {
    const run = (script) => execFileSync(process.execPath, [path.join(ROOT, 'docs/_build', script), '--check'], { encoding: 'utf8', stdio: 'pipe' });
    test('rules_unified.md の表はデータから再生成した内容と一致する', () => {
        expect(() => run('render_tables.mjs')).not.toThrow();
    });
    test('characterBuildData.js の共通項目はデータと一致する', () => {
        expect(() => run('check_rules_sync.mjs')).not.toThrow();
    });
});
