#!/usr/bin/env python3
"""usage: aimgrep.py REGEX [MAXHITS]   case-insensitive search over all AIM blocks (chapters 1-9).
Prints pid [block] label: snippet."""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aimlib as L
rx = re.compile(sys.argv[1], re.I); mx = int(sys.argv[2]) if len(sys.argv) > 2 else 60
n = 0
for pid, p in L.paras().items():
    if pid.startswith('10-'): continue
    for i, b in enumerate(p['blocks']):
        m = rx.search(L.norm(b))
        if m:
            t = L.norm(b); a = max(0, m.start() - 70)
            print(f"{pid} [{i}] {p['labels'][i] or '-'} ({p['title'][:40]}): …{t[a:m.end()+90]}…")
            n += 1
            if n >= mx: sys.exit(0)
