// クイックスタートの描画テスト — Webゲーム向け構成と、共有データからの表生成を確認する
import { render, screen } from '@testing-library/react';
import QuickstartPage from '@/app/quickstart/page';
import { BACKGROUNDS, GIFTS, GAME_DATA_STEPS } from '@/data/characterBuildData';

describe('QuickstartPage', () => {
    test('世界 → RPシート → ゲームデータ → Webゲーム → 成長 の構成で章が並ぶ', () => {
        render(<QuickstartPage />);
        expect(screen.getByRole('heading', { name: /最低限これだけ知っておけばいい/ })).toBeInTheDocument();
        expect(screen.getByText(/怪異は必ず「核」と「ルール」を持つ/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /RPシートを作る/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /ゲームデータの読み方/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /ゲームデータを作る/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Webゲームの遊び方/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /キャラクターを育てる/ })).toBeInTheDocument();
    });

    test('TRPG卓向けのルール解説（ダイス・共鳴記録・核護衛戦）とサイバネティクスは載せない', () => {
        render(<QuickstartPage />);
        expect(screen.queryByText(/共鳴記録/)).not.toBeInTheDocument();
        expect(screen.queryByText(/核護衛戦/)).not.toBeInTheDocument();
        expect(screen.queryByText(/ファンブル/)).not.toBeInTheDocument();
        expect(screen.queryByText(/サイバネティクス/)).not.toBeInTheDocument();
    });

    test('背景・ギフト・STEP一覧が共有データから生成され、Webゲームの各モードが説明される', () => {
        render(<QuickstartPage />);
        BACKGROUNDS.forEach(b => expect(screen.getAllByText(b.id).length).toBeGreaterThan(0));
        GIFTS.forEach(g => expect(screen.getAllByText(g.id).length).toBeGreaterThan(0));
        GAME_DATA_STEPS.filter(s => !['cybernetics', 'languages'].includes(s.key)).forEach(s => expect(screen.getAllByText(s.effect).length).toBeGreaterThan(0));
        expect(screen.getByRole('heading', { name: /怪異討伐シミュレーション/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /怪異譚アドベンチャー/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /派遣クエスト/ })).toBeInTheDocument();
    });

    test('ランクの決まり方の例（体B+ / 察D+）がランク計算から描画される', () => {
        render(<QuickstartPage />);
        expect(screen.getAllByText('B+').length).toBeGreaterThan(0);
        expect(screen.getAllByText('D+').length).toBeGreaterThan(0);
    });
});
