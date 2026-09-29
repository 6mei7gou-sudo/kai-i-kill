#!/usr/bin/env bash
# Google Fonts から Noto Sans JP / Noto Serif JP / JetBrains Mono を取得し、
# fonts/ 配下にローカル化する（書籍ビルド用。fonts/ は git 管理外）。
# 取得できない環境では IPAPGothic 等のローカルフォントにフォールバックする。
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p fonts
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
URL='https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Serif+JP:wght@400;600&family=JetBrains+Mono:wght@400;700&display=swap'
curl -fsS -A "$UA" "$URL" -o fonts/fonts.src.css
# url(...) を列挙してダウンロード
grep -oE 'url\((https://fonts\.gstatic\.com/[^)]+)\)' fonts/fonts.src.css | sed -E 's/^url\((.*)\)$/\1/' | sort -u > fonts/urls.txt
echo "fonts: $(wc -l < fonts/urls.txt) files"
i=0
: > fonts/map.txt
while read -r u; do
  i=$((i+1)); f="f$(printf '%04d' "$i").woff2"
  echo "$u $f" >> fonts/map.txt
done < fonts/urls.txt
# 並列ダウンロード
awk '{print "url = \"" $1 "\"\noutput = \"fonts/" $2 "\""}' fonts/map.txt > fonts/curl.cfg
curl -sS -A "$UA" --parallel --parallel-max 16 -K fonts/curl.cfg
# CSS の URL をローカルパスに書き換え
cp fonts/fonts.src.css fonts/fonts.css
while read -r u f; do
  esc=$(printf '%s' "$u" | sed 's/[&/\]/\\&/g')
  sed -i "s|$esc|$f|g" fonts/fonts.css
done < fonts/map.txt
echo "ok: fonts/fonts.css"
