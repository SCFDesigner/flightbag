#!/usr/bin/env python3
"""Precompute per-block cross-check flags into aim/paras.json ('ok': [bool])."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aimlib as L
P = L.paras()
bad = 0
for pid, p in P.items():
    p['ok'] = [ (not L.junky(b)) and L.cross_ok(b) for b in p['blocks'] ]
    bad += p['ok'].count(False)
json.dump(P, open(os.path.join(L.AIM, 'paras.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(sum(len(p['blocks']) for p in P.values()), 'blocks,', bad, 'flagged')
