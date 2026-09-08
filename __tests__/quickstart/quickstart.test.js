// クイックスタートの描画テスト — 二段構成と、共有データからの表生成を確認する
import { render, screen } from '@testing-library/react';
import QuickstartPage from '@/app/quickstart/page';
import { BACKGROUNDS, GIFTS, GAME_DATA_STEPS } from '@/data/characterBuildData';

describe('QuickstartPage', () => {
    test('RPシート → ゲームデータの二段構成で章が並ぶ', () => {
        render(<QuickstartPage />);
        expect(screen.getByRole('heading', { name: /最低限これだけ知っておけばいい/ })).toBeInTheDocument();
        expect(screen.getByText(/怪異は必ず「核」と「ルール」を持つ/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /RPシートを作る/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /ゲームデータの読み方/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /ゲームデータを作る/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /セッションの流れ/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /共鳴記録/ })).toBeInTheDocument();
    });

    test('背景・ギフト・STEP一覧が共有データから生成される', () => {
        render(<QuickstartPage />);
        BACKGROUNDS.forEach(b => expect(screen.getAllByText(b.id).length).toBeGreaterThan(0));
        GIFTS.forEach(g => expect(screen.getAllByText(g.id).length).toBeGreaterThan(0));
        GAME_DATA_STEPS.forEach(s => expect(screen.getAllByText(s.effect).length).toBeGreaterThan(0));
    });

    test('ルールブック9-1の例（体B+ / 察D+）がランク計算から描画される', () => {
        render(<QuickstartPage />);
        expect(screen.getAllByText('B+').length).toBeGreaterThan(0);
        expect(screen.getAllByText('D+').length).toBeGreaterThan(0);
        expect(screen.getByText(/振ったダイスすべてが1でファンブル/)).toBeInTheDocument();
    });
});
