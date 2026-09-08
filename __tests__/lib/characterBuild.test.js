// キャラクター作成ロジックのテスト
import {
    computeRanks, calcBeliefPoints, calcCpBudget, getSkillSlots,
    hasGameData, getGameDataStatus, validateCharacterForm,
    buildCharacterPayload, buildPlainText,
} from '@/lib/characterBuild';

const BASE = {
    character_name: '黒崎 蓮', affiliation: '傭兵', sub_affiliation: '突撃型',
    awakening: '先天覚醒型', background: '鋼の肉体', weapon_type: '斬撃型',
    stage_plus: ['rank_tai', 'rank_shiya'], skills: [], level: 1,
};

describe('computeRanks', () => {
    test('ルールブック9-1の例：鋼の肉体×傭兵・突撃型×+段階（体・察）→ 体B+ 疾C 察D+', () => {
        const r = computeRanks(BASE);
        expect(r.rank_tai.display).toBe('B+');
        expect(r.rank_haya.display).toBe('C');
        expect(r.rank_shiya.display).toBe('D+');
        expect(r.rank_tai.sources.map(s => s.type)).toEqual(['背景', '配属', '段階']);
    });

    test('先天覚醒型は選んだ能力値（既定は術）をCにする', () => {
        expect(computeRanks(BASE).rank_jutsu.rank).toBe('C');
        expect(computeRanks(BASE, { innateChoice: 'rank_kon' }).rank_kon.rank).toBe('C');
        expect(computeRanks(BASE, { innateChoice: 'rank_kon' }).rank_jutsu.rank).toBe('D');
    });

    test('未選択なら全てD、Sには+段階が付かない', () => {
        const r = computeRanks({});
        Object.values(r).forEach(v => { expect(v.rank).toBe('D'); expect(v.sources).toEqual([]); });
        const s = computeRanks({ rank_tai: 'S', stage_plus: ['rank_tai'] }, { isOfficial: true });
        expect(s.rank_tai.display).toBe('S');
    });

    test('保存済みランクが計算値より高ければ下げない（ステータスポイント上昇分の保持）', () => {
        const r = computeRanks(BASE, { savedRanks: { rank_tai: 'A', rank_kon: 'C' } });
        expect(r.rank_tai.rank).toBe('A');
        expect(r.rank_kon.rank).toBe('C');
        expect(r.rank_kon.sources[0].type).toBe('成長');
    });
});

describe('初期値ヘルパー', () => {
    test('信念はショック覚醒型のみ+1', () => {
        expect(calcBeliefPoints('先天覚醒型')).toBe(5);
        expect(calcBeliefPoints('ショック覚醒型')).toBe(6);
    });
    test('CP予算は背景×装備形態で補正', () => {
        expect(calcCpBudget('鋼の肉体', '武装型')).toBe(14);
        expect(calcCpBudget('鋼の肉体', '独立型')).toBe(10);
        expect(calcCpBudget('ハッカー上がり', '独立型')).toBe(13);
    });
    test('スキルスロットは3レベルに1つ', () => {
        expect(getSkillSlots(1)).toBe(1);
        expect(getSkillSlots(3)).toBe(2);
        expect(getSkillSlots(20)).toBe(7);
        expect(getSkillSlots(undefined)).toBe(1);
    });
});

describe('ゲームデータの有無', () => {
    test('RPのみのレコードは false', () => {
        expect(hasGameData({ character_name: 'A', affiliation: '祓部', appearance: '長身' })).toBe(false);
    });
    test('背景・流派・スキル・ギフトのいずれかがあれば true', () => {
        expect(hasGameData({ background: '神社育ち' })).toBe(true);
        expect(hasGameData({ skills: ['連斬'] })).toBe(true);
        expect(hasGameData({ level: 3 })).toBe(true);
    });
    test('未完成項目を列挙する', () => {
        expect(getGameDataStatus({ background: '神社育ち' })).toEqual({ started: true, complete: false, missing: ['配属', '戦闘流派'] });
        expect(getGameDataStatus(BASE).complete).toBe(true);
    });
});

describe('validateCharacterForm', () => {
    test('名前は常に必須', () => {
        expect(validateCharacterForm({}, { gameEnabled: false })).toMatch('キャラ名');
    });
    test('ゲームデータOFFなら名前だけで通る', () => {
        expect(validateCharacterForm({ character_name: 'A' }, { gameEnabled: false })).toBeNull();
    });
    test('ゲームデータONなら背景・配属・戦闘流派が必要', () => {
        expect(validateCharacterForm({ character_name: 'A', background: '神社育ち' }, { gameEnabled: true })).toMatch('配属・戦闘流派');
        expect(validateCharacterForm(BASE, { gameEnabled: true })).toBeNull();
    });
    test('言語の数とサイバネ等級のレベル要件', () => {
        expect(validateCharacterForm({ ...BASE, proficient_languages: ['NGT'] }, { gameEnabled: true })).toMatch('得意1 / 苦手0');
        expect(validateCharacterForm({ ...BASE, cyber_grade: 'II', cybernetics: [{ name: '義腕【戦闘型】' }] }, { gameEnabled: true })).toMatch('レベル4以上');
        expect(validateCharacterForm({ ...BASE, cyber_grade: 'I', cybernetics: [] }, { gameEnabled: true })).toMatch('パーツが未選択');
    });
});

describe('buildCharacterPayload', () => {
    test('ゲームデータOFFではステータス列を初期値に戻し、空文字の列挙型は null', () => {
        const p = buildCharacterPayload({ ...BASE, gift: '', equipment_type: '武装型', id: 'x', created_at: 'y' }, { gameEnabled: false });
        expect(p.background).toBeNull();
        expect(p.weapon_type).toBeNull();
        expect(p.equipment_type).toBeNull();
        expect(p.skills).toEqual([]);
        expect(p.sub_affiliation).toBe('突撃型');
        expect(p.rank_tai).toBe('B');   // 配属によるB昇格は残る（RP上の立場）
        expect(p.rank_haya).toBe('D');  // 背景は外れる
        expect(p.belief_points).toBe(5);
        expect(p.id).toBeUndefined();
        expect(p.created_at).toBeUndefined();
    });
    test('ゲームデータONでは計算済みランクと信念を反映', () => {
        const p = buildCharacterPayload({ ...BASE, gift: '' }, { gameEnabled: true });
        expect(p.rank_tai).toBe('B');
        expect(p.rank_haya).toBe('C');
        expect(p.rank_jutsu).toBe('C');
        expect(p.gift).toBeNull();
        expect(p.class).toBeNull();
        expect(p.belief_points).toBe(5);
    });
    test('編集時は既存の高いランクを維持する', () => {
        const p = buildCharacterPayload(BASE, { gameEnabled: true, isEdit: true, initialData: { rank_tai: 'A' } });
        expect(p.rank_tai).toBe('A');
    });
});

describe('buildPlainText', () => {
    test('RP情報を先に、ゲームデータは含む場合だけ出力', () => {
        const rp = buildPlainText({ character_name: 'A', affiliation: '祓部', appearance: '長身' }, { gameEnabled: false });
        expect(rp).toMatch('外見：長身');
        expect(rp).not.toMatch('【能力値】');
        const full = buildPlainText(BASE, { gameEnabled: true });
        expect(full).toMatch('【能力値】');
        expect(full).toMatch('体B+');
        expect(full).toMatch('背景:鋼の肉体');
    });
});
