#!/usr/bin/env python3
"""usage: partcheck.py PART.json  -- validates a mapping part file and prints what each card would show.
Format: {"<section id>": {"<card index>": [{"p": "5-3-8", "b": [0, 2]}, ...], ...}, ..., "_notes": {...}}"""
import sys, os, json, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aimlib as L
P = L.paras()
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'collin', 'cfii-oral-data.js')
js = 'global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.CFII_ORAL))'
deck = {s['id']: s for s in json.loads(subprocess.run(['node', '-e', js, DATA], capture_output=True, text=True, check=True).stdout)}
m = json.load(open(sys.argv[1], encoding='utf8'))
err = 0
verbose = '-q' not in sys.argv
for sid, cards in m.items():
    if sid.startswith('_'): continue
    if sid not in deck: print('ERR unknown section', sid); err += 1; continue
    for ci, exs in cards.items():
        c = deck[sid]['cards'][int(ci)] if ci.isdigit() and int(ci) < len(deck[sid]['cards']) else None
        if not c or c['t'] != 's': print(f'ERR {sid}[{ci}] is not a script card'); err += 1; continue
        tot = 0; lines = []
        for e in exs:
            p = P.get(e.get('p'))
            if not p: print(f"ERR {sid}[{ci}] unknown paragraph {e.get('p')}"); err += 1; continue
            for b in e['b']:
                if not (0 <= b < len(p['blocks'])): print(f"ERR {sid}[{ci}] {e['p']} block {b} out of range"); err += 1; continue
                if not p['ok'][b]: print(f"WARN {sid}[{ci}] {e['p']} [{b}] flagged '?' block"); 
                tot += len(p['blocks'][b])
            lines.append(f"    AIM {e['p']} {p['labels'][e['b'][0]] if e['b'] else ''} ({p['title'][:40]}) blocks {e['b']}")
        if verbose:
            print(f"{sid}[{ci}] {c['h']}: {tot} chars"); print('\n'.join(lines))
        if tot > 4500: print(f"WARN {sid}[{ci}] long ({tot} chars) - trim to the relevant subparagraphs")
print('errors:', err)
