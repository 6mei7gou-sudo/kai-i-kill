-- migration_characters_v7_styles.sql
-- v5.0 対応：スキル（6軸）→ スタイル（主／副／第三）
-- character_sheets.styles（JSONB {main, sub, third}。値はスタイルID：blade / crush / snipe / spell / decode / scan / seal / support / anomaly）
-- を追加し、ゲームデータ付きの既存シートを武器型→主スタイル、配属→副スタイルで機械的に写像する
-- （写像表は docs/rules/rules_unified.md 付録B B-2）。旧 skills 列は参照用に残す（書き換えない）。
-- 実行前にバックアップ推奨。v5.0 のフォームをデプロイする前に実行すること
-- （フォームは styles 列に書き込むため、列がないと投稿・編集が失敗する）。

ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}'::JSONB;

WITH mapped AS (
  SELECT id,
    CASE weapon_type
      WHEN '斬撃型' THEN 'blade'
      WHEN '打撃型' THEN 'crush'
      WHEN '射撃型' THEN 'snipe'
      WHEN '魔導型' THEN 'spell'
      WHEN '体術型' THEN 'blade'
    END AS main_style,
    CASE sub_affiliation
      WHEN '古怪班' THEN 'decode'    WHEN '新怪班' THEN 'scan'         WHEN '封印班' THEN 'seal'      WHEN '機動班' THEN 'crush'
      WHEN '突撃型' THEN 'crush'     WHEN '偵察型' THEN 'scan'         WHEN '技術型' THEN 'spell'     WHEN '護衛型' THEN 'support'
      WHEN '野良討伐者' THEN 'blade' WHEN '裏社会の住人' THEN 'support' WHEN '在野研究者' THEN 'decode' WHEN '退魔師' THEN 'seal'
      ELSE NULL
    END AS sub_style
  FROM character_sheets
  WHERE weapon_type IS NOT NULL
    AND (styles IS NULL OR styles = '{}'::jsonb OR styles->>'main' IS NULL)
)
UPDATE character_sheets c
SET styles = jsonb_build_object(
  'main', m.main_style,
  'sub', CASE WHEN m.sub_style IS NULL OR m.sub_style = m.main_style THEN 'support' ELSE m.sub_style END,
  'third', NULL
)
FROM mapped m
WHERE c.id = m.id AND m.main_style IS NOT NULL;

-- 確認：
-- SELECT weapon_type, sub_affiliation, styles FROM character_sheets WHERE weapon_type IS NOT NULL LIMIT 20;
