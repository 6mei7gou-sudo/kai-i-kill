// キャラクターシートフォームの描画テスト
// RPシートが既定で表示され、ゲームデータはスイッチで追加されることを確認する
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('@clerk/nextjs', () => ({ useUser: () => ({ user: null, isLoaded: true }) }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/lib/exportImage', () => ({ exportAsImage: jest.fn() }));
jest.mock('@/lib/storage', () => ({ uploadImage: jest.fn() }));

import CharacterForm from '@/app/create/character/CharacterForm';

beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: [] }) }));
});

describe('CharacterForm', () => {
    test('既定ではRPシートの4ステップと出力が表示され、ゲームデータは畳まれている', () => {
        render(<CharacterForm />);
        expect(screen.getByRole('heading', { name: /名前と立場/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /見た目・性格・口調/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /来歴と因縁/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /二次創作ガイドライン/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /ゲームデータを付ける/ })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /能力値の確認/ })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /RPシートを投稿/ })).toBeInTheDocument();
    });

    test('スイッチでゲームデータのSTEP 1〜8とステータス概要が現れる', () => {
        render(<CharacterForm />);
        fireEvent.click(screen.getByRole('button', { name: /＋ ゲームデータを付ける/ }));
        expect(screen.getByRole('heading', { name: /^背景/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /能力値の確認/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /サイバネティクス/ })).toBeInTheDocument();
        expect(screen.getAllByText('STATUS SUMMARY').length).toBeGreaterThan(0);
        expect(screen.getByRole('button', { name: /ゲームデータ付き/ })).toBeInTheDocument();
    });

    test('背景と配属を選ぶと概要パネルに昇格の出どころが表示される', () => {
        render(<CharacterForm />);
        fireEvent.click(screen.getByRole('button', { name: /＋ ゲームデータを付ける/ }));
        fireEvent.click(screen.getByRole('button', { name: /鋼の肉体/ }));
        fireEvent.click(screen.getAllByRole('button', { name: /古怪班/ })[0]);
        expect(screen.getAllByText('背景:鋼の肉体→C').length).toBeGreaterThan(0);
        expect(screen.getAllByText('配属:古怪班→B').length).toBeGreaterThan(0);
    });

    test('キャラ名なしで投稿するとエラーになる', () => {
        render(<CharacterForm />);
        fireEvent.click(screen.getByRole('button', { name: /RPシートを投稿/ }));
        expect(screen.getByText('キャラ名は必須です')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalledWith('/api/posts', expect.objectContaining({ method: 'POST' }));
    });

    test('ゲームデータONで必須項目が未選択なら投稿を止める', () => {
        render(<CharacterForm />);
        fireEvent.change(screen.getByPlaceholderText('例：黒崎 蓮'), { target: { value: '黒崎 蓮' } });
        fireEvent.click(screen.getByRole('button', { name: /＋ ゲームデータを付ける/ }));
        fireEvent.click(screen.getByRole('button', { name: /キャラクターシートを投稿/ }));
        expect(screen.getByText(/ゲームデータが未完成です：背景・配属・戦闘流派/)).toBeInTheDocument();
    });
});
