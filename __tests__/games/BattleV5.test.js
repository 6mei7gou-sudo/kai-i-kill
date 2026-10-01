// v5.0 核防壁戦画面の描画テスト
// 判定の中身は __tests__/lib/battleEngine.test.js が担当。ここは画面が崩れずに1手番回ることを確認する
import { render, screen, fireEvent, within } from '@testing-library/react';

jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a> }));

import BattleV5 from '@/app/games/mission/[missionId]/play/BattleV5';
import mission from '@/data/missions/v5_grade4_midnight.json';

const TETSU = {
    id: 'chr-tetsu', character_name: '灰島 鉄', level: 1, affiliation: '傭兵', sub_affiliation: '突撃型',
    background: '鋼の肉体', awakening: 'ショック覚醒型', weapon_type: '打撃型', equipment_type: '武装型',
    rank_tai: 'B', rank_haya: 'C', rank_shiki: 'D', rank_han: 'D', rank_shiya: 'D', rank_jutsu: 'D', rank_kon: 'D',
    stage_plus: ['rank_tai', 'rank_haya'], styles: { main: 'crush', sub: 'seal', third: null }, belief_points: 6,
};

function renderBattle() {
    const router = { push: jest.fn() };
    const utils = render(<BattleV5 mission={mission} character={TETSU} missionId={mission.id} user={null} router={router} />);
    return { ...utils, router };
}

describe('BattleV5', () => {
    test('怪異・プレイヤー・行動ボタン・共鳴メーターが表示される', () => {
        renderBattle();
        expect(screen.getByText(/v5\.0 核防壁戦/)).toBeInTheDocument();
        expect(screen.getByText(/ROUND 1 \/ 3/)).toBeInTheDocument();
        expect(screen.getByText('灰島 鉄')).toBeInTheDocument();
        expect(screen.getByText(/防壁層1《/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /攻撃【体】/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /解明【識】/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /構え/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /手番を終える/ })).toBeInTheDocument();
        ['恐怖', '怒り', '哀愁', '焦燥', '渇望', '浄化'].forEach(n => expect(screen.getAllByText(new RegExp(`^${n}`)).length).toBeGreaterThan(0));
    });

    test('攻撃 → 出目を選ぶ → 手番終了 → 回避判定まで画面が進む', () => {
        renderBattle();
        fireEvent.click(screen.getByRole('button', { name: /攻撃【体】/ }));
        // 出目選択パネル（ファンブルでなければ）か、ファンブル後の手番画面
        const pick = screen.queryByRole('button', { name: /最小の成功を選ぶ/ });
        if (pick) fireEvent.click(pick);
        // 失敗した場合は押し通し／受け入れパネルが出る
        const decline = screen.queryByRole('button', { name: '受け入れる' });
        if (decline) fireEvent.click(decline);
        if (!screen.queryByText(/討伐成功|討伐失敗/)) {
            expect(screen.getByText(/メイン行動（使用済み）/)).toBeInTheDocument();
            fireEvent.click(screen.getByRole('button', { name: /手番を終える/ }));
            // 怪異の手番：回避判定の出目選択か、ファンブル処理後の次ラウンド
            const log = screen.getByText('BATTLE LOG').nextSibling;
            expect(within(log).getByText(/怪異の手番/)).toBeInTheDocument();
        }
    });

    test('浄化を選ぶとメーター選択が出て、やめると手番に戻る', () => {
        renderBattle();
        fireEvent.click(screen.getByRole('button', { name: /浄化【魂】/ }));
        expect(screen.getByText(/浄化で下げるメーターを選ぶ/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'やめる' }));
        expect(screen.getByRole('button', { name: /攻撃【体】/ })).toBeInTheDocument();
    });
});
