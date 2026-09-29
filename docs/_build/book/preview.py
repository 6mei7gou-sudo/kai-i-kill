"""out/*.pdf の指定ページを PNG に描画する（目視確認用）。
使い方: python3 preview.py 1 2 5   （ページ番号は1始まり。省略時は 1〜6）"""
import sys, os, fitz
here = os.path.dirname(os.path.abspath(__file__))
pdf = os.path.join(here, 'out', 'KAI-I_KILL_CoreRulebook.pdf')
doc = fitz.open(pdf)
pages = [int(a) for a in sys.argv[1:]] or list(range(1, min(7, doc.page_count + 1)))
os.makedirs(os.path.join(here, 'out', 'preview'), exist_ok=True)
for p in pages:
    pix = doc[p - 1].get_pixmap(dpi=96)
    out = os.path.join(here, 'out', 'preview', f'p{p:03d}.png')
    pix.save(out); print(out)
print('pages:', doc.page_count)
