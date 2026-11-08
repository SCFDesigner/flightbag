#!/usr/bin/env python3
"""usage: deckdump.py SECTION_ID [SECTION_ID ...]  -> the deck's script cards for those sections."""
import sys, os, json, subprocess
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'collin', 'cfii-oral-data.js')
js = 'global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.CFII_ORAL))'
d = json.loads(subprocess.run(['node', '-e', js, DATA], capture_output=True, text=True, check=True).stdout)
want = sys.argv[1:]
for s in d:
    if s['id'] not in want: continue
    print(f"######## {s['id']} {s['title']}  refs={s.get('refs')}")
    for i, c in enumerate(s['cards']):
        if c['t'] != 's': continue
        print(f"--- [{i}] {c['h']}" + (f"  (ref: {c['ref']})" if c.get('ref') else ''))
        print('obj:', c['obj'])
        for p in c['pts']: print(' *', p)
        if c.get('ce'): print(' CE:', c['ce'])
    print()
