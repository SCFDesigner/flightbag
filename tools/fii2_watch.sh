#!/bin/zsh
# Wait for the ScreenToWord auto-walk to finish, quit iPhone Mirroring, then publish FII Study 2.
LOG=~/Library/Logs/ScreenToWord.log
cd "$(dirname "$0")/.."
echo "watch: waiting for the auto-walk to finish ($(date '+%H:%M'))…"
tail -n 0 -F "$LOG" 2>/dev/null | grep -m 1 --line-buffered "RUN FINISHED" | tee /tmp/fii2_run_result.txt
pkill -f "tail -n 0 -F $LOG" 2>/dev/null
echo "watch: run finished — quitting iPhone Mirroring"
osascript -e 'tell application "iPhone Mirroring" to quit' 2>/dev/null || true
exec ./tools/fii2_publish.sh
