/**
 * @jest-environment node
 */

/**
 * 画像ダウンロードページのデータ整合テスト
 *
 * src/data/downloads.json に登録された file / preview が
 * public/downloads/ に実在することを検証する（差し替え時の参照切れ防止）。
 */

const fs = require('fs');
const path = require('path');
const downloads = require('../src/data/downloads.json');

const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'downloads');

describe('downloads.json と public/downloads/ の整合', () => {
    const items = downloads.flatMap((cat) => cat.items.map((item) => ({ ...item, category: cat.category })));

    test('登録画像が1件以上ある', () => {
        expect(items.length).toBeGreaterThan(0);
    });

    test.each(items.map((i) => [i.category, i.name, i.file]))(
        '%s / %s の file "%s" が実在する',
        (_category, _name, file) => {
            expect(fs.existsSync(path.join(PUBLIC_DIR, file))).toBe(true);
        }
    );

    test.each(items.filter((i) => i.preview).map((i) => [i.name, i.preview]))(
        '%s の preview "%s" が実在する',
        (_name, preview) => {
            expect(fs.existsSync(path.join(PUBLIC_DIR, preview))).toBe(true);
        }
    );

    test('file 名が重複していない', () => {
        const files = items.map((i) => i.file);
        expect(new Set(files).size).toBe(files.length);
    });

    test('file 名に版番号を含めない（改版時のリンク切れ防止）', () => {
        for (const { file } of items) {
            expect(file).not.toMatch(/\d+\.\d+\.(png|jpg|webp)$/);
        }
    });
});
