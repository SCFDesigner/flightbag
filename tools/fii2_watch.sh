#!/bin/zsh
# Wait for a *full* ScreenToWord Prepware run to finish on its own (log marker "FULL RUN FINISHED"; a manual
# Stop or a single-list walk doesn't count), then quit iPhone Mirroring and publish FII Study 2.
LOG=~/Library/Logs/ScreenToWord.log
cd "$(dirname "$0")/.."
start=$(wc -l < "$LOG" | tr -d ' ')
echo "watch: waiting for a full run to finish ($(date '+%H:%M'), log line $start)…"
while true; do
  hit=$(tail -n +$((start + 1)) "$LOG" | grep -m 1 "FULL RUN FINISHED")
  [[ -n "$hit" ]] && break
  sleep 5
done
echo "watch: $hit"
echo "watch: quitting iPhone Mirroring"
osascript -e 'tell application "iPhone Mirroring" to quit' 2>/dev/null || true
exec ./tools/fii2_publish.sh
