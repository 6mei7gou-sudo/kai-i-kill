"""
KAI-I//KILL 地理設定資料集 PDF生成スクリプト
Dark cyberpunk aesthetic
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.platypus.frames import Frame

# ── Colors ──
BG_DARK = HexColor('#0D0D12')
BG_CARD = HexColor('#14141F')
BG_TABLE_HEADER = HexColor('#1A1A2E')
BG_TABLE_ROW1 = HexColor('#111119')
BG_TABLE_ROW2 = HexColor('#0E0E16')
ACCENT_CYAN = HexColor('#00E5FF')
ACCENT_MAGENTA = HexColor('#FF0080')
ACCENT_PURPLE = HexColor('#8B5CF6')
ACCENT_AMBER = HexColor('#FFB800')
TEXT_PRIMARY = HexColor('#E8E8F0')
TEXT_SECONDARY = HexColor('#9898B0')
TEXT_DIM = HexColor('#606080')
BORDER_SUBTLE = HexColor('#2A2A40')
ACCENT_RED = HexColor('#FF3355')
ACCENT_GREEN = HexColor('#00FF88')

# ── Fonts ──
pdfmetrics.registerFont(TTFont('Gothic', 'C:/Windows/Fonts/BIZ-UDGothicR.ttc', subfontIndex=0))
pdfmetrics.registerFont(TTFont('GothicB', 'C:/Windows/Fonts/BIZ-UDGothicB.ttc', subfontIndex=0))

FONT = 'Gothic'
FONT_B = 'GothicB'

# ── Styles ──
def make_style(name, font=FONT, size=9, color=TEXT_PRIMARY, align=TA_LEFT,
               leading=None, space_before=0, space_after=0, left_indent=0):
    return ParagraphStyle(
        name, fontName=font, fontSize=size, textColor=color,
        alignment=align, leading=leading or size * 1.6,
        spaceBefore=space_before, spaceAfter=space_after,
        leftIndent=left_indent,
    )

S_BODY = make_style('body', size=8.5, leading=15)
S_BODY_INDENT = make_style('body_indent', size=8.5, leading=15, left_indent=12)
S_BODY_INDENT2 = make_style('body_indent2', size=8, leading=14, left_indent=24, color=TEXT_SECONDARY)
S_H1 = make_style('h1', font=FONT_B, size=18, color=ACCENT_CYAN, space_before=8, space_after=10)
S_H2 = make_style('h2', font=FONT_B, size=13, color=ACCENT_MAGENTA, space_before=14, space_after=6)
S_H3 = make_style('h3', font=FONT_B, size=11, color=ACCENT_PURPLE, space_before=10, space_after=4)
S_LABEL = make_style('label', font=FONT_B, size=8.5, color=ACCENT_CYAN)
S_GM = make_style('gm', size=8, color=ACCENT_AMBER, left_indent=12, leading=14)
S_TABLE_H = make_style('th', font=FONT_B, size=8, color=ACCENT_CYAN, align=TA_CENTER)
S_TABLE_C = make_style('tc', size=7.5, color=TEXT_PRIMARY, align=TA_CENTER, leading=12)
S_TABLE_L = make_style('tl', size=7.5, color=TEXT_PRIMARY, leading=12)
S_TOC = make_style('toc', size=10, color=TEXT_PRIMARY, space_after=6, leading=18)
S_TOC_SUB = make_style('toc_sub', size=9, color=TEXT_SECONDARY, space_after=4, leading=16, left_indent=16)
S_FOOTER = make_style('footer', size=7, color=TEXT_DIM, align=TA_CENTER)
S_TITLE_MAIN = make_style('title_main', font=FONT_B, size=28, color=ACCENT_CYAN, align=TA_CENTER, leading=40)
S_TITLE_SUB = make_style('title_sub', font=FONT_B, size=14, color=TEXT_SECONDARY, align=TA_CENTER, leading=22)

# ── Helpers ──
def hr(color=BORDER_SUBTLE, thickness=0.5):
    return HRFlowable(width='100%', thickness=thickness, color=color, spaceBefore=4, spaceAfter=6)

def spacer(h=6):
    return Spacer(1, h)

def field(label, value, style=S_BODY_INDENT):
    return Paragraph(f'<font name="{FONT_B}" color="{ACCENT_CYAN.hexval()}">{label}：</font>{value}', style)

def field2(label, value):
    return Paragraph(f'<font name="{FONT_B}" color="{ACCENT_PURPLE.hexval()}">{label}：</font>{value}', S_BODY_INDENT2)

def gm_note(text):
    return Paragraph(f'<font name="{FONT_B}" color="{ACCENT_AMBER.hexval()}">[GM] </font>{text}', S_GM)

def bullet(text, indent=1):
    s = S_BODY_INDENT if indent == 1 else S_BODY_INDENT2
    return Paragraph(f'<font color="{TEXT_DIM.hexval()}">-</font>  {text}', s)

def make_table(headers, rows, col_widths=None):
    """Create a styled table with dark theme."""
    data = [[Paragraph(h, S_TABLE_H) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), S_TABLE_L if i == len(row)-1 else S_TABLE_C)
                      for i, c in enumerate(row)])
    w = col_widths or [None] * len(headers)
    t = Table(data, colWidths=w, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), BG_TABLE_HEADER),
        ('TEXTCOLOR', (0, 0), (-1, 0), ACCENT_CYAN),
        ('GRID', (0, 0), (-1, -1), 0.4, BORDER_SUBTLE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = BG_TABLE_ROW1 if i % 2 == 1 else BG_TABLE_ROW2
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# ── Page background ──
def draw_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BG_DARK)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    # Subtle top accent line
    canvas.setStrokeColor(ACCENT_CYAN)
    canvas.setLineWidth(1.5)
    canvas.line(20*mm, A4[1] - 12*mm, A4[0] - 20*mm, A4[1] - 12*mm)
    # Footer
    canvas.setFont(FONT, 7)
    canvas.setFillColor(TEXT_DIM)
    canvas.drawCentredString(A4[0]/2, 10*mm,
        f'電脳怪異譚 KAI-I//KILL — 地理設定資料集  |  Page {doc.page}')
    canvas.restoreState()

def draw_bg_title(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BG_DARK)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    # Decorative border
    m = 15*mm
    canvas.setStrokeColor(ACCENT_CYAN)
    canvas.setLineWidth(1)
    canvas.rect(m, m, A4[0]-2*m, A4[1]-2*m, fill=0, stroke=1)
    # Inner border
    m2 = 17*mm
    canvas.setStrokeColor(HexColor('#1A3A4A'))
    canvas.setLineWidth(0.5)
    canvas.rect(m2, m2, A4[0]-2*m2, A4[1]-2*m2, fill=0, stroke=1)
    # Corner accents
    for x, y in [(m, m), (A4[0]-m, m), (m, A4[1]-m), (A4[0]-m, A4[1]-m)]:
        canvas.setFillColor(ACCENT_CYAN)
        canvas.circle(x, y, 2, fill=1, stroke=0)
    canvas.restoreState()

# ── Build document ──
OUTPUT = os.path.join(os.path.dirname(__file__), 'geography_reference.pdf')

doc = BaseDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=20*mm, rightMargin=20*mm,
    topMargin=18*mm, bottomMargin=18*mm,
    title='KAI-I//KILL 地理設定資料集',
    author='KAI-I//KILL TRPG Project',
)

frame_title = Frame(20*mm, 18*mm, A4[0]-40*mm, A4[1]-36*mm, id='title')
frame_body = Frame(20*mm, 18*mm, A4[0]-40*mm, A4[1]-36*mm, id='body')
doc.addPageTemplates([
    PageTemplate(id='Title', frames=frame_title, onPage=draw_bg_title),
    PageTemplate(id='Body', frames=frame_body, onPage=draw_bg),
])

story = []
W = A4[0] - 40*mm  # usable width

# ════════════════════════════════════════
# TITLE PAGE
# ════════════════════════════════════════
story.append(Spacer(1, 60*mm))
story.append(Paragraph('電脳怪異譚', S_TITLE_SUB))
story.append(Spacer(1, 4*mm))
story.append(Paragraph('KAI-I//KILL', make_style('t', font=FONT_B, size=42, color=ACCENT_CYAN, align=TA_CENTER, leading=52)))
story.append(Spacer(1, 8*mm))
story.append(HRFlowable(width='60%', thickness=1, color=ACCENT_MAGENTA, spaceBefore=0, spaceAfter=0))
story.append(Spacer(1, 8*mm))
story.append(Paragraph('地理設定資料集', make_style('ts', font=FONT_B, size=22, color=TEXT_PRIMARY, align=TA_CENTER, leading=32)))
story.append(Spacer(1, 6*mm))
story.append(Paragraph('Geography Reference Document', make_style('te', font=FONT, size=11, color=TEXT_DIM, align=TA_CENTER)))
story.append(Spacer(1, 30*mm))
story.append(Paragraph('GM専用資料  |  秘匿情報含む', make_style('tw', font=FONT_B, size=10, color=ACCENT_RED, align=TA_CENTER)))
story.append(Spacer(1, 6*mm))
story.append(Paragraph('ver 1.0  —  2026.03', make_style('tv', font=FONT, size=9, color=TEXT_DIM, align=TA_CENTER)))

from reportlab.platypus.doctemplate import NextPageTemplate
story.append(NextPageTemplate('Body'))
story.append(PageBreak())

# ════════════════════════════════════════
# TABLE OF CONTENTS
# ════════════════════════════════════════
story.append(Paragraph('目次', S_H1))
story.append(hr(ACCENT_CYAN, 1))
story.append(spacer(4))
toc_items = [
    ('1', '五管区制度（行政区画）'),
    ('2', '主要都市詳細'),
    None,  # sub-items marker
    ('3', '組織別拠点一覧'),
    ('4', '特殊地帯・ランドマーク'),
    ('5', '歴史的事件と土地の関係'),
    ('6', 'インフラ・都市景観'),
    ('7', '地名命名ガイドライン（GM向け）'),
    ('8', '主要地域一覧表（サマリー）'),
]
cities = ['千隼市', '灰嶺市', '底澱', '鉄嶺工業圏', '錆ヶ浜', '雷ノ湊', '凍月嶺', '蜃ノ群島']
for item in toc_items:
    if item is None:
        for c in cities:
            story.append(Paragraph(f'<font color="{TEXT_DIM.hexval()}">|</font>   {c}', S_TOC_SUB))
    else:
        num, title = item
        story.append(Paragraph(
            f'<font name="{FONT_B}" color="{ACCENT_CYAN.hexval()}">{num}.</font>  {title}', S_TOC))
story.append(PageBreak())

# ════════════════════════════════════════
# 1. 五管区制度
# ════════════════════════════════════════
story.append(Paragraph('1. 五管区制度（行政区画）', S_H1))
story.append(hr(ACCENT_CYAN, 1))
story.append(spacer(2))
story.append(Paragraph(
    '架空の近未来日本は、祓部が管轄する五つの行政管区に分割されている。'
    '各管区にはそれぞれの特色と主要都市が存在し、怪異の発生傾向も異なる。', S_BODY))
story.append(spacer(8))

cw1 = [22*mm, 22*mm, W-22*mm-22*mm-40*mm, 40*mm]
story.append(make_table(
    ['管区', '名称', '特徴', '主要都市'],
    [
        ['第一管区', '東管区', '最大都市圏。新規怪異発生件数が全国最多', '灰嶺市、鉄嶺工業圏'],
        ['第二管区', '西管区', '古代怪異の集中地帯。旧港町。傭兵文化の中心', '錆ヶ浜、雷ノ湊'],
        ['第三管区', '南管区', '群島地帯。孤立した島嶼生態系', '蜃ノ群島'],
        ['第四管区', '北管区', '山岳地帯。禁足地の数が最多', '凍月嶺'],
        ['第五管区', '中管区', '中央行政拠点。祓部本庁所在地', '千隼市'],
    ],
    col_widths=cw1
))
story.append(PageBreak())

# ════════════════════════════════════════
# 2. 主要都市詳細
# ════════════════════════════════════════
story.append(Paragraph('2. 主要都市詳細', S_H1))
story.append(hr(ACCENT_CYAN, 1))

# --- 千隼市 ---
story.append(Paragraph('千隼市（ちはやし）— 中央行政首都', S_H2))
story.append(hr(ACCENT_MAGENTA, 0.5))
story.append(field('所在管区', '第五管区（中管区）'))
story.append(field('人口規模', '中～大'))
story.append(field('概要', '魔法省本庁舎および祓部中央本部を擁する行政の中枢都市'))
story.append(spacer(4))
story.append(field('地上部', '清潔に管理された行政区画。政府庁舎が立ち並ぶ'))
story.append(field('地下部', '祓部中央本部が地下深くに設置'))
story.append(bullet('大祓主室', 2))
story.append(bullet('指令室', 2))
story.append(bullet('直轄即応隊', 2))
story.append(bullet('中央技術部', 2))
story.append(bullet('監察室', 2))
story.append(spacer(2))
story.append(field('祓部学校', '郊外に所在。表向きは省庁の訓練施設'))
story.append(field('治安', '極めて高い。祓部の監視は「絶対」と見なされる'))
story.append(spacer(4))
story.append(gm_note('千隼市内での怪異発生は祓部にとって「面目を失う事件」であり、政治的緊張が高まる'))

# --- 灰嶺市 ---
story.append(Paragraph('灰嶺市（かれいし）— 最大都市圏', S_H2))
story.append(hr(ACCENT_MAGENTA, 0.5))
story.append(field('所在管区', '第一管区（東管区）'))
story.append(field('人口規模', '国内最大'))
story.append(field('概要', '商業・文化の中心地。怪異発生件数は全国トップ'))
story.append(spacer(4))
story.append(Paragraph('<font name="{}" color="{}">都市構造：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY_INDENT))
story.append(field2('上層区画', '企業本社、高級商業施設、富裕層居住区（蒼鉄機工本社あり）'))
story.append(field2('中層区画', '一般市民の居住区。飲食店、娯楽施設。怪異は密集するが市民は無自覚'))
story.append(field2('下層区画', '荒廃した建造物群、スラム（底澱／そこよ）'))
story.append(spacer(2))
story.append(field('祓部東管区本部', 'ここに所在。「新怪班」が主力部隊'))
story.append(spacer(4))
story.append(gm_note('灰嶺市はデフォルトの物語舞台。都市型怪異の主な発生地'))

# --- 底澱 ---
story.append(Paragraph('底澱（そこよ）— スラム／暗黒街', S_H2))
story.append(hr(ACCENT_MAGENTA, 0.5))
story.append(field('所在管区', '第一管区（灰嶺市下層）'))
story.append(field('人口規模', '不明（未登録住民）'))
story.append(field('公的扱い', '公的地図上は「再開発地区」と記載。行政区画としては存在しない'))
story.append(spacer(4))
story.append(Paragraph('<font name="{}" color="{}">インフラ：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY_INDENT))
story.append(field2('違法サイバネティクス施術所', '「継ぎ師」と呼ばれる無登録の施術者が身体改造を行う'))
story.append(field2('闇市「濁り市」', '場所を変えながら開かれる地下市場。盗品の魔法具、闇市場の武器、偽造書類、禁制薬物を取引'))
story.append(field2('犯罪地下組織', '祓部からの脱走者、失敗した傭兵、身元を消された者の避難所'))
story.append(field2('教団浸透', '宗教組織が絶望した人々を狙い、勧誘拠点を構える'))
story.append(spacer(2))
story.append(Paragraph('<font name="{}" color="{}">不文律：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY_INDENT))
story.append(bullet('技師を殺すな', 2))
story.append(bullet('子供を傷つけるな', 2))
story.append(bullet('市場内での暴力禁止', 2))
story.append(spacer(2))
story.append(field('祓部の対応', '公式にはパトロールしているが実質的に放置。資源と政治的意志の欠如'))
story.append(spacer(4))
story.append(gm_note('「社会の裏側」を探索するのに最適な舞台。危険にもかかわらずNPCコミュニティが存在する'))
story.append(PageBreak())

# --- 鉄嶺工業圏 ---
story.append(Paragraph('鉄嶺工業圏（てつれこうぎょうけん）— 重工業地帯', S_H2))
story.append(hr(ACCENT_MAGENTA, 0.5))
story.append(field('所在管区', '第一管区（東管区）'))
story.append(field('人口規模', '中'))
story.append(field('概要', '蒼鉄機工の製造拠点。国家管理下の重工業地帯'))
story.append(spacer(4))
story.append(Paragraph('<font name="{}" color="{}">地区構成：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY_INDENT))
story.append(field2('工場地区', '蒼鉄機工の巨大な製造施設。厳重なセキュリティ'))
story.append(field2('労働者街', '工場労働者・技師のための居住区'))
story.append(field2('試験場', '新装備のテスト場。全装身型を含む。2019年のプロトタイプ事故の現場'))
story.append(spacer(2))
story.append(field('生産物', '祓部標準装備の大半、魔法具、サイバネティクス'))
story.append(field('闇市場問題', '工場廃材や規格外の試作品が底澱の闇市場に流出している疑い'))
story.append(spacer(4))
story.append(gm_note('「軍産複合体」の雰囲気。企業腐敗のナラティブに最適'))

# --- 錆ヶ浜 ---
story.append(Paragraph('錆ヶ浜（さびがはま）— 傭兵の街', S_H2))
story.append(hr(ACCENT_MAGENTA, 0.5))
story.append(field('所在管区', '第二管区（西管区）'))
story.append(field('人口規模', '中'))
story.append(field('概要', 'かつての主要貿易港。航路変更で衰退後、傭兵たちが施設を転用して拠点化'))
story.append(spacer(4))
story.append(Paragraph('<font name="{}" color="{}">地区構成：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY_INDENT))
story.append(field2('組合街', '非公式の傭兵組合本部。仕事仲介所、装備店、情報屋。白鷺調査事務所が所在'))
story.append(field2('倉庫街', '港湾倉庫を転用した訓練場、武器庫、仮宿。非公式の傭兵決闘の場'))
story.append(field2('酒場街', '傭兵の集いの場。評判形成・新規勧誘の拠点'))
story.append(spacer(2))
story.append(field('白鷺調査事務所', '調査系傭兵グループの本拠地'))
story.append(field('祓部の存在', '西管区本部は街から離れた場所に所在。定期的な「視察」で情報収集'))
story.append(spacer(4))
story.append(gm_note('傭兵のホーム。仕事ベースのキャンペーンの起点'))

# --- 雷ノ湊 ---
story.append(Paragraph('雷ノ湊（いかづちのみなと）— 企業城下町', S_H2))
story.append(hr(ACCENT_MAGENTA, 0.5))
story.append(field('所在管区', '第二管区（西管区）'))
story.append(field('人口規模', '中'))
story.append(field('概要', '雷禽重工の本社および主要施設を擁する独立企業都市。国家統制から距離を置く'))
story.append(spacer(4))
story.append(Paragraph('<font name="{}" color="{}">施設：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY_INDENT))
story.append(field2('雷禽重工本社', '港を見下ろす高台に位置。研究開発部門、試作工場、パイロット訓練施設を含む'))
story.append(field2('技師街', '雷禽の技術者とその家族の居住区。鉄嶺より管理が厳しく、従業員の異動制限あり'))
story.append(field2('傭兵インターフェース', '傭兵グループへの公開的な武器供給。錆ヶ浜への定期輸送ルート'))
story.append(field2('特別研究部門', 'パイロットの侵食加速問題を研究する秘密部門（存在自体が機密）'))
story.append(spacer(2))
story.append(field('企業理念', '国家安全基準からの独立。高性能・高リスク装備への注力'))
story.append(spacer(4))
story.append(gm_note('「危険だが先進的」な技術拠点。企業スパイや技術進歩のストーリーラインに最適'))
story.append(PageBreak())

# --- 凍月嶺 ---
story.append(Paragraph('凍月嶺（とうげつれい）— 禁足地集中地帯', S_H2))
story.append(hr(ACCENT_MAGENTA, 0.5))
story.append(field('所在管区', '第四管区（北管区）'))
story.append(field('人口規模', '小（散在する集落）'))
story.append(field('概要', '封印された場所が最も集中する山岳地帯'))
story.append(spacer(4))
story.append(Paragraph('<font name="{}" color="{}">特徴：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY_INDENT))
story.append(field2('禁足地', '大小合わせて10箇所以上。最古のものは1600年代に遡る'))
story.append(field2('山間集落', '代々禁足地の管理を担う家系が孤立して生活'))
story.append(field2('三日月旅団', '移動型傭兵グループが警戒・外周監視を実施（恒久的な拠点なし）'))
story.append(field2('白銀の廃線', '山中の廃鉄道。2034年に特級・class-d永続怪異事件が発生。現在も封印中'))
story.append(spacer(2))
story.append(field('封印方式', '時代により多様。近代の祓部でも仕組みが不明なものあり'))
story.append(spacer(4))
story.append(gm_note('ゴシックホラーの舞台。通信途絶が容易に正当化可能。古代の封印が破られるナラティブに最適'))

# --- 蜃ノ群島 ---
story.append(Paragraph('蜃ノ群島（しんのぐんとう）— 孤立した島嶼群', S_H2))
story.append(hr(ACCENT_MAGENTA, 0.5))
story.append(field('所在管区', '第三管区（南管区）'))
story.append(field('人口規模', '小（島ごとに数百～数千人）'))
story.append(field('概要', '本土から隔絶された群島。独自の怪異生態系を持つ'))
story.append(spacer(4))
story.append(Paragraph('<font name="{}" color="{}">特徴：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY_INDENT))
story.append(field2('孤立性', '本土との交通手段が限られ、情報伝達が遅い'))
story.append(field2('島守', '各島に祓部システムとは独立した怪異対処者が存在（協力度は島により異なる）'))
story.append(field2('怪異の特性', '本土とは異なり、SNSの噂ではなく古い島の伝承から怪異が発生'))
story.append(field2('蜃気楼工廠', '群島を経由した製品流通が未確認ながら疑われており、監視の弱さを示唆'))
story.append(field2('消えた島', '「地図から消えた島」がいくつか存在。怪異による消失か祓部による情報隠蔽かは不明'))
story.append(spacer(4))
story.append(gm_note('「閉鎖空間」ホラーの雰囲気。島に閉じ込められるシナリオ、古い伝統と現代の怪異の融合に最適'))
story.append(PageBreak())

# ════════════════════════════════════════
# 3. 組織別拠点一覧
# ════════════════════════════════════════
story.append(Paragraph('3. 組織別拠点一覧', S_H1))
story.append(hr(ACCENT_CYAN, 1))

story.append(Paragraph('祓部（公的機関）', S_H3))
cw3a = [34*mm, 36*mm, 28*mm, W-34*mm-36*mm-28*mm]
story.append(make_table(
    ['拠点名', '所在地', '機能', '備考'],
    [
        ['中央本部（本庁）', '千隼市・魔法省地下', '統括指揮', '大祓主室、指令室、中央調査部、中央技術部、監察室、教務部'],
        ['祓部学校', '千隼市郊外', '人材育成', '表向きは省庁訓練施設'],
        ['東管区本部', '灰嶺市', '新規怪異対応', '新怪班が主力。最大規模の作戦部隊'],
        ['西管区本部', '錆ヶ浜郊外', '古代怪異対応', '古怪班が主力。高僧ネットワーク'],
        ['南管区本部', '南方域', '島嶼封印怪異', '管区長ポスト空席'],
        ['北管区本部', '北方山岳部', '封印管理', '封印班が主力。禁足地最多'],
        ['中管区本部', '千隼市', '行政・連絡', '本庁に最も近い'],
    ],
    col_widths=cw3a
))
story.append(spacer(10))

story.append(Paragraph('企業', S_H3))
cw3b = [30*mm, 40*mm, W-30*mm-40*mm]
story.append(make_table(
    ['企業名', '本社所在地', '主要施設'],
    [
        ['蒼鉄機工', '首都圏・省庁街隣接', '鉄嶺工業圏（東管区）'],
        ['雷禽重工', '雷ノ湊（西管区）', '研究開発棟、試作工場、パイロット訓練場'],
        ['銀鎚精機', '非公開（秘匿工房）', '受注生産のみ。最小限のスタッフ'],
        ['鴉羽技研', '不明', '各都市に小規模拠点を分散配置'],
        ['朱鷺崎財閥', '旧市街・財閥街', '多業種複合体（金融、不動産、運輸、情報、魔法装備）'],
        ['蜃気楼工廠', '不明', '製造拠点不明。闇市場・孤立地帯を通じて流通'],
    ],
    col_widths=cw3b
))
story.append(PageBreak())

# ════════════════════════════════════════
# 4. 特殊地帯・ランドマーク
# ════════════════════════════════════════
story.append(Paragraph('4. 特殊地帯・ランドマーク', S_H1))
story.append(hr(ACCENT_CYAN, 1))

story.append(Paragraph('濁り市（にごりいち）— 地下闇市場', S_H3))
story.append(field('形態', '場所を変えながら開催される移動型闇市場'))
story.append(field('主な開催地域', '底澱周辺'))
story.append(field('取扱品', '盗品魔法具、闇市場武器、偽造書類、禁制薬物'))
story.append(spacer(8))

story.append(Paragraph('禁足地（きんそくち）— 封印怪異区域', S_H3))
story.append(field('集中地域', '北管区の山岳地帯を中心に全国に散在'))
story.append(field('最古の封印', '1600年代'))
story.append(field('管理', '祓部が維持管理、地元の神社家系が監視'))
story.append(spacer(8))

story.append(Paragraph('白銀の廃線（はくぎんのはいせん）', S_H3))
story.append(field('所在', '凍月嶺（北管区）'))
story.append(field('概要', '山中を走る廃鉄道'))
story.append(field('事件', '2034年に特級・class-d永続怪異事件が発生'))
story.append(field('現状', '封印中。「線路を歩くと永久に消える」という噂'))
story.append(spacer(8))

story.append(Paragraph('鵺ヶ原（ぬえがはら）', S_H3))
story.append(field('概要', '1867年の鵺ヶ原事変の舞台'))
story.append(field('現状', '旧市街地域。地名は現代の地図から消去されている'))
story.append(PageBreak())

# ════════════════════════════════════════
# 5. 歴史的事件と土地の関係
# ════════════════════════════════════════
story.append(Paragraph('5. 歴史的事件と土地の関係', S_H1))
story.append(hr(ACCENT_CYAN, 1))
story.append(spacer(4))

cw5 = [16*mm, 38*mm, 34*mm, W-16*mm-38*mm-34*mm]
story.append(make_table(
    ['年代', '事件名', '関連地域', '概要'],
    [
        ['1867', '鵺ヶ原事変', '旧市街地域', '大規模封印事件。地名が現代地図から消去'],
        ['1931', '白鴉事件', '灰嶺市地下', '古代の封印怪異が解放'],
        ['1952', '戦後復興', '全国', '国家規模のインフラ再建。鉄嶺施設の起源'],
        ['1978', '初の戦闘機械配備', '汎用地域', '戦争機械の初実戦運用'],
        ['1985', '御霊崩し事件', '所在不明', '再開発中の神社が怪異に転化'],
        ['2013', '霧島事案', '不明', '大規模怪異。傭兵vs祓部の管轄争い'],
        ['2019', 'プロトタイプ事故', '鉄嶺・試験場', '全装身型の試験中に事故発生'],
        ['2028', '第一次怪異兵器使用事案', '灰嶺市繁華街', '怪異を兵器として意図的に公共空間で解放'],
        ['2034', '白銀の廃線事件', '凍月嶺', '特級怪異事件。三勢力合同で対処'],
        ['2037', '戦闘機械汚染事件', '都市部', '戦闘機械が怪異化'],
    ],
    col_widths=cw5
))
story.append(PageBreak())

# ════════════════════════════════════════
# 6. インフラ・都市景観
# ════════════════════════════════════════
story.append(Paragraph('6. インフラ・都市景観', S_H1))
story.append(hr(ACCENT_CYAN, 1))
story.append(spacer(4))

infra_items = [
    ('都市景観', '高層ビルと古い低層建築が混在する。近代的な魔法インフラと古い町並みのコントラストが特徴的'),
    ('魔法インフラ', '都市全域に魔法による照明、通信、医療施設が整備されている。市民にとっては電気やガスと同等のインフラ'),
    ('公共交通', '地下鉄、バス、モノレール、主要都市間の高速鉄道。魔法エネルギーを動力源とするものも多い'),
    ('深夜の移動', '怪異リスクのため深夜のサービスは縮小されている。公式にはカバーストーリー（メンテナンス等）で説明'),
    ('都市伝説', '特定の場所に紐づいた都市伝説が存在し、SNS投稿を通じて都市に怪異を生み出す原因となる'),
]
for label, desc in infra_items:
    story.append(field(label, desc))
    story.append(spacer(6))
story.append(spacer(10))

# ════════════════════════════════════════
# 7. 地名命名ガイドライン
# ════════════════════════════════════════
story.append(Paragraph('7. 地名命名ガイドライン（GM向け）', S_H1))
story.append(hr(ACCENT_CYAN, 1))
story.append(spacer(4))

story.append(Paragraph(
    'GMがオリジナルの地名を作成する際の指針。世界観との統一感を保つために、以下のルールに従うことを推奨する。', S_BODY))
story.append(spacer(6))

story.append(Paragraph('<font name="{}" color="{}">基本ルール：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY))
story.append(bullet('日本語2～3文字の地名を使用する'))
story.append(bullet('実在の日本の地名は使用しない'))
story.append(spacer(6))

story.append(Paragraph('<font name="{}" color="{}">地形要素（推奨漢字）：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY))
story.append(spacer(2))
cw7 = [W/6]*6
story.append(make_table(
    ['嶺', '浜', '崎', '原', '谷', '島'],
    [['ridge', 'beach', 'cape', 'plain', 'valley', 'island']],
    col_widths=cw7
))
story.append(spacer(8))

story.append(Paragraph('<font name="{}" color="{}">不吉な意味を持つ漢字（推奨）：</font>'.format(FONT_B, ACCENT_CYAN.hexval()), S_BODY))
story.append(spacer(2))
story.append(make_table(
    ['灰', '錆', '凍', '澱', '朽', '翳'],
    [['ash', 'rust', 'frozen', 'sludge', 'decay', 'shadow']],
    col_widths=cw7
))
story.append(spacer(8))
story.append(gm_note('例：灰嶺、錆ヶ浜、凍月嶺、底澱 — いずれも不吉さと地形を組み合わせた命名'))
story.append(PageBreak())

# ════════════════════════════════════════
# 8. 主要地域一覧表
# ════════════════════════════════════════
story.append(Paragraph('8. 主要地域一覧表（サマリー）', S_H1))
story.append(hr(ACCENT_CYAN, 1))
story.append(spacer(4))

cw8 = [26*mm, 24*mm, 20*mm, 20*mm, W-26*mm-24*mm-20*mm-20*mm]
story.append(make_table(
    ['地名', '種別', '管区', '人口規模', '主要機能'],
    [
        ['千隼市', '首都', '中(5)', '中～大', '行政本部'],
        ['灰嶺市', '大都市', '東(1)', '最大', '商業・文化'],
        ['底澱', 'スラム', '東(1)', '不明', '地下経済・犯罪'],
        ['鉄嶺工業圏', '工業地帯', '東(1)', '中', '製造業'],
        ['錆ヶ浜', '港町', '西(2)', '中', '傭兵拠点'],
        ['雷ノ湊', '港町', '西(2)', '中', '企業城下町'],
        ['凍月嶺', '山岳地帯', '北(4)', '小', '禁足地管理'],
        ['蜃ノ群島', '群島', '南(3)', '小', '島嶼ネットワーク'],
        ['白銀の廃線', '遺構', '北(4)', 'なし', '封印区域'],
        ['濁り市', '闇市場', '不定', '流動的', '犯罪取引'],
    ],
    col_widths=cw8
))

# ── Build ──
doc.build(story)
print(f'PDF generated: {OUTPUT}')
