#!/bin/zsh
# Rebuild FII Study 2 from the ScreenToWord capture, lock it with the vault password, commit + push.
# The password is read from the macOS Keychain (service "flightbag-exam-vault"), never typed or echoed:
#   security add-generic-password -s flightbag-exam-vault -a vault -w      (prompts for it once)
set -euo pipefail
cd "$(dirname "$0")/.."
PW=$(security find-generic-password -s flightbag-exam-vault -w 2>/dev/null) || {
  echo "publish: no vault password in Keychain. Run once: security add-generic-password -s flightbag-exam-vault -a vault -w" >&2; exit 1; }
export EXAM_PASSWORD="$PW"; unset PW

if node tools/exam-vault.mjs status fii-study-2.html | grep -q ': locked'; then
  node tools/exam-vault.mjs unlock fii-study-2.html
fi
python3 -W ignore tools/fii2_import.py | tee /tmp/fii2_import_summary.txt
node tools/exam-vault.mjs lock fii-study-2.html
unset EXAM_PASSWORD

# Only the locked page, encrypted figures and the home-page link
git add fii-study-2.html index.html
git add images/fii2/*.enc 2>/dev/null || true
git add -u images/fii2 2>/dev/null || true
if git diff --cached --quiet; then echo "publish: nothing changed"; exit 0; fi
N=$(head -1 /tmp/fii2_import_summary.txt | grep -o '^[0-9]*')
git commit -q -F - <<MSG
FII Study 2: rebuild from Prepware captures (${N:-?} questions, vault-locked)

$(sed -n '2,20p' /tmp/fii2_import_summary.txt)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
git push -q
echo "publish: pushed $(git log --oneline -1)"
