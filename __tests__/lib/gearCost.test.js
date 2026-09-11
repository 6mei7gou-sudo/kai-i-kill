const { calcGearCost } = require('../../src/lib/gearCost');

describe('calcGearCost', () => {
    test('本体CPはスペックから決まり、申告の base_cp / total_cp は無視される', () => {
        const c = calcGearCost({ weapon_type: '射撃型', manufacturer: '汎用品', category: '武装型', base_cp: 0, total_cp: 0, options: [] });
        expect(c.baseCp).toBe(5);
        expect(c.totalCp).toBe(5);
    });

    test('カタログ登録済みオプションはカタログのCPで計算する', () => {
        const c = calcGearCost({ weapon_type: '射撃型', manufacturer: '雷禽重工', category: '武装型', options: [{ name: '出力増幅', cp: 0 }, { name: 'ルール干渉型魔導具', cp: -10 }] });
        expect(c.baseCp).toBe(8);
        expect(c.optionCp).toBe(6);
        expect(c.optionCount).toBe(2);
    });

    test('自由入力オプションは申告値（0以上）を使い、空名は数えない', () => {
        const c = calcGearCost({ options: [{ name: '独自機構', cp: 3 }, { name: '不正', cp: -5 }, { name: '  ', cp: 99 }], base_cp: 4 });
        expect(c.baseCp).toBe(4);
        expect(c.optionCp).toBe(3);
        expect(c.optionCount).toBe(2);
    });

    test('options が JSON 文字列でも扱える', () => {
        const c = calcGearCost({ base_cp: 2, options: JSON.stringify([{ name: 'x', cp: 1 }]) });
        expect(c.totalCp).toBe(3);
    });
});
