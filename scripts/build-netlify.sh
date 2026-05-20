#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST"

rsync -a \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.netlify' \
  --exclude '.cursor' \
  --exclude 'node_modules' \
  "$ROOT/" "$DIST/"

cd "$DIST"

# 目录与文件重命名为 ASCII 路径（Netlify 对中文路径支持不稳定）
if [ -d "开发环境页面复刻-分享包" ]; then mv "开发环境页面复刻-分享包" dev-replica; fi
if [ -d "通用申请审批页面-分享包" ]; then mv "通用申请审批页面-分享包" approve-share; fi
if [ -d "approve-share/原型图样例" ]; then mv "approve-share/原型图样例" approve-share/prototype; fi
if [ -f "approve-share/prototype/通用申请-审批页面.html" ]; then
  mv "approve-share/prototype/通用申请-审批页面.html" approve-share/prototype/approve-page.html
fi
if [ -d "approve-share/prototype/通用申请-审批页面_files" ]; then
  mv "approve-share/prototype/通用申请-审批页面_files" approve-share/prototype/approve-page_files
fi
if [ -f "今麦郎BPM平台-开发环境.html" ]; then mv "今麦郎BPM平台-开发环境.html" bpm-dev.html; fi
if [ -f "今麦郎BPM平台-工作台.html" ]; then mv "今麦郎BPM平台-工作台.html" bpm-workbench.html; fi
if [ -d "今麦郎BPM平台-开发环境_files" ]; then mv "今麦郎BPM平台-开发环境_files" bpm-dev_files; fi
if [ -d "今麦郎BPM平台-工作台_files" ]; then mv "今麦郎BPM平台-工作台_files" bpm-workbench_files; fi
if [ -f "饮品OA通知通报-移动端审批页面.html" ]; then mv "饮品OA通知通报-移动端审批页面.html" mobile-approve.html; fi

# 批量替换文件内容中的旧路径
replace_in_files() {
  local from="$1"
  local to="$2"
  while IFS= read -r -d '' file; do
    if sed --version 2>/dev/null | grep -q GNU; then
      sed -i "s|${from}|${to}|g" "$file"
    else
      sed -i '' "s|${from}|${to}|g" "$file"
    fi
  done < <(find . -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' -o -name '*.json' \) -print0)
}

replace_in_files "今麦郎BPM平台-开发环境_files" "bpm-dev_files"
replace_in_files "今麦郎BPM平台-工作台_files" "bpm-workbench_files"
replace_in_files "今麦郎BPM平台-开发环境.html" "bpm-dev.html"
replace_in_files "今麦郎BPM平台-工作台.html" "bpm-workbench.html"
replace_in_files "开发环境页面复刻-分享包" "dev-replica"
replace_in_files "通用申请审批页面-分享包" "approve-share"
replace_in_files "原型图样例/通用申请-审批页面.html" "prototype/approve-page.html"
replace_in_files "原型图样例" "prototype"
replace_in_files "通用申请-审批页面_files" "approve-page_files"
replace_in_files "通用申请-审批页面.html" "approve-page.html"
replace_in_files "饮品OA通知通报-移动端审批页面.html" "mobile-approve.html"

echo "Netlify dist ready at $DIST"
