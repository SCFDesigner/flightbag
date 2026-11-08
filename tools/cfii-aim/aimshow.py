#!/usr/bin/env python3
"""usage: aimshow.py PID [PID ...]   e.g. aimshow.py 5-3-8 4-4-3
Prints every block of the paragraph: [index] label flag text.
flag ' ' = clean; '?' = figure/table text or not confirmed by an independent extraction (avoid)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aimlib as L
P = L.paras()
for pid in sys.argv[1:]:
    p = P.get(pid)
    if not p:
        print(f'== {pid}: NOT FOUND'); continue
    print(f"== AIM {pid}. {p['title']}  (PDF page {p['page']}, {len(p['blocks'])} blocks)")
    for i, (lab, b) in enumerate(zip(p['labels'], p['blocks'])):
        ok = p.get('ok', [True]*len(p['blocks']))[i]
        print(f"[{i}] {lab or '-'} {' ' if ok else '?'} {b}")
    print()
