"""
GM用総合ルールブック PDF生成スクリプト
全世界観・ルールファイルを統合し、スタイル付きHTMLを生成する
"""
import markdown
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
GM_DIR = os.path.join(os.path.dirname(BASE), '..', 'gm')
GM_DIR = os.path.normpath(GM_DIR)

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def strip_title(md_text):
    """最初の # 行（ファイルタイトル）を除去"""
    lines = md_text.split('\n')
    for i, line in enumerate(lines):
        if line.strip().startswith('# ') and i < 5:
            lines[i] = ''
            break
    return '\n'.join(lines)

# ファイル読み込み順序（論理構成）
sections = [
    # Part I: 世界観
    ("PART I　世界観", None),
    ("世界観バイブル", os.path.join(GM_DIR, 'world_bible_v1.1.md')),

    # Part II: ゲームルール
    ("PART II　ゲームルール", None),
    ("統合ルールブック v3.0", os.path.join(BASE, 'rules_unified.md')),

    # Part III: 戦闘詳細
    ("PART III　戦闘詳細ルール", None),
    ("戦闘ルール補遺 v2.0", os.path.join(BASE, 'combat_hp_v2.md')),

    # Part IV: 装備・サイバネティクス
    ("PART IV　装備・サイバネティクス", None),
    ("武器カスタムデータ", os.path.join(BASE, 'weapon_custom_data.md')),
    ("サイバネティクス補遺", os.path.join(BASE, 'cybernetics_v1.md')),

    # Part V: 組織詳細
    ("PART V　組織詳細設定", None),
    ("祓部 詳細設定", os.path.join(GM_DIR, 'detail_haraebe.md')),
    ("傭兵 詳細設定", os.path.join(GM_DIR, 'detail_mercenaries.md')),
    ("企業 詳細設定", os.path.join(GM_DIR, 'detail_companies.md')),
    ("無所属 詳細設定", os.path.join(GM_DIR, 'detail_unaffiliated.md')),

    # Part VI: 追加データブック
    ("PART VI　追加データブック《禁域解放》", None),
    ("追加データブック《禁域解放》 v1.0", os.path.join(BASE, 'expansion_v1.md')),

    # Appendix: 用語集
    ("APPENDIX　用語集", None),
    ("用語集（GM版）", os.path.join(GM_DIR, 'glossary_v1.0.md')),
]

# Markdown統合
combined_md = """---

# 電脳怪異譚 KAI-I//KILL
## GM用総合ルールブック

> *「噂が臨界点を超えた時、それは現実のバグになる。」*
> *「知識が命を救う。無知が人を殺す。」*

**本書はGM専用資料である。プレイヤーには公開しないこと。**

---

## 本書の構成

| パート | 内容 |
|:---|:---|
| **PART I** | 世界観バイブル——設定の全体像 |
| **PART II** | 統合ルールブック v3.0——判定・共鳴記録・戦闘・魔法・異能・キャラ作成・所属・装備・ギフト・成長 |
| **PART III** | 戦闘詳細ルール——HP・ダメージ・状態異常・連携・撤退・戦闘例 |
| **PART IV** | 装備・サイバネティクス——カスタムオプション・ベース装備リスト・義体 |
| **PART V** | 組織詳細設定——祓部・傭兵・企業・無所属の内部構造と秘匿情報 |
| **PART VI** | 追加データブック《禁域解放》——教団・怪異核素材・全装身型・搭乗型 |
| **APPENDIX** | 用語集（GM版・秘匿情報あり） |

---

"""

for title, filepath in sections:
    if filepath is None:
        # Part区切り
        combined_md += f"\n\n---\n\n<div class='part-break'></div>\n\n# {title}\n\n---\n\n"
    else:
        content = read_file(filepath)
        content = strip_title(content)
        combined_md += f"\n\n{content}\n\n"

# HTML変換
html_body = markdown.markdown(
    combined_md,
    extensions=['tables', 'fenced_code', 'toc', 'nl2br'],
    output_format='html5'
)

# 完全なHTMLドキュメント
html_doc = f"""<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>電脳怪異譚 KAI-I//KILL GM用総合ルールブック</title>
<style>
@page {{
  size: A4;
  margin: 20mm 18mm 25mm 18mm;
  @bottom-center {{
    content: counter(page);
    font-size: 9pt;
    color: #666;
  }}
}}

* {{
  box-sizing: border-box;
}}

body {{
  font-family: "Yu Gothic", "YuGothic", "Hiragino Sans", "Noto Sans JP", sans-serif;
  font-size: 10pt;
  line-height: 1.7;
  color: #1a1a1a;
  max-width: 100%;
  padding: 0;
  margin: 0;
}}

/* Part区切り */
.part-break {{
  page-break-before: always;
}}

h1 {{
  font-size: 20pt;
  border-bottom: 3px solid #b8860b;
  padding-bottom: 8px;
  margin-top: 40px;
  margin-bottom: 20px;
  color: #1a0a00;
  page-break-after: avoid;
}}

h2 {{
  font-size: 15pt;
  border-bottom: 2px solid #c9a84c;
  padding-bottom: 5px;
  margin-top: 30px;
  margin-bottom: 15px;
  color: #2a1500;
  page-break-after: avoid;
}}

h3 {{
  font-size: 12pt;
  border-left: 4px solid #c9a84c;
  padding-left: 10px;
  margin-top: 24px;
  margin-bottom: 10px;
  color: #3a2000;
  page-break-after: avoid;
}}

h4 {{
  font-size: 11pt;
  margin-top: 18px;
  margin-bottom: 8px;
  color: #4a3000;
  page-break-after: avoid;
}}

h5, h6 {{
  font-size: 10.5pt;
  margin-top: 14px;
  margin-bottom: 6px;
}}

p {{
  margin: 6px 0;
  text-align: justify;
}}

blockquote {{
  border-left: 4px solid #c9a84c;
  background: #faf6ed;
  padding: 10px 16px;
  margin: 12px 0;
  font-style: italic;
  color: #4a3000;
}}

table {{
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 9.5pt;
  page-break-inside: avoid;
}}

th {{
  background: #2a1a00;
  color: #f0e6c8;
  font-weight: bold;
  padding: 6px 10px;
  text-align: left;
  border: 1px solid #4a3a20;
}}

td {{
  padding: 5px 10px;
  border: 1px solid #ccc;
  vertical-align: top;
}}

tr:nth-child(even) {{
  background: #faf8f2;
}}

tr:nth-child(odd) {{
  background: #fff;
}}

code {{
  font-family: "Consolas", "Source Code Pro", monospace;
  background: #f5f2eb;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9pt;
}}

pre {{
  background: #1a1a1a;
  color: #e0dcc8;
  padding: 14px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 9pt;
  line-height: 1.5;
  page-break-inside: avoid;
}}

pre code {{
  background: none;
  padding: 0;
  color: inherit;
}}

ul, ol {{
  padding-left: 24px;
  margin: 8px 0;
}}

li {{
  margin: 3px 0;
}}

strong {{
  color: #8b0000;
}}

em {{
  color: #555;
}}

hr {{
  border: none;
  border-top: 1px solid #c9a84c;
  margin: 30px 0;
}}

/* 表紙 */
body > h1:first-of-type {{
  font-size: 28pt;
  text-align: center;
  border-bottom: none;
  margin-top: 120px;
  color: #b8860b;
}}

body > h1:first-of-type + h2 {{
  text-align: center;
  border-bottom: none;
  font-size: 16pt;
  color: #666;
  margin-bottom: 40px;
}}

/* 印刷用改ページ制御 */
h1 {{
  page-break-before: always;
}}

body > hr:first-of-type + h1 {{
  page-break-before: avoid;
}}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

# HTML出力
output_html = os.path.join(BASE, 'gm_rulebook_full.html')
with open(output_html, 'w', encoding='utf-8') as f:
    f.write(html_doc)

print(f"HTML generated: {output_html}")
print(f"Size: {os.path.getsize(output_html) / 1024:.0f} KB")
