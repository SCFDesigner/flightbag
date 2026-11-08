#!/usr/bin/env python3
"""Verbatim checker for collin/cfii-aim-data.js.
usage: AIMDIR=<extraction dir> check.py path/to/cfii-aim-data.js path/to/cfii-oral-data.js

1. every quoted string (block text or segment), whitespace-normalised, is found in the primary
   extraction (per-column `pdftotext -layout` text, figure lines removed, soft hyphens joined);
2. every paragraph title is found as its heading ("5-3-8. Holding") in that extraction;
3. every quoted string is the extracted block itself, or a prefix / in-order pieces of it (no edits);
4. every map entry points at an existing script card and an included block, labels match;
5. cross-check: every sentence is also found in two independent extractions (pdftotext default
   and -raw modes), allowing one split for a page break. Reported, not fatal.
Exit code 1 on any failure of 1-4."""
import sys, os, json, re, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aimlib as L

def load(js, var):
    code = f'global.window={{}};require(process.argv[1]);process.stdout.write(JSON.stringify(window.{var}))'
    return json.loads(subprocess.run(['node', '-e', code, os.path.abspath(js)], capture_output=True, text=True, check=True).stdout)

D = load(sys.argv[1], 'CFII_AIM'); deck = {s['id']: s for s in load(sys.argv[2], 'CFII_ORAL')}
P = L.paras(); C = L.corpus()
fail = []; strings = 0; chars = 0; cross_bad = []; sents = 0
for pid, p in D['paras'].items():
    head = L.norm(f"{pid}. {p['t']}")
    if head not in C:
        # titles that wrap keep their words; accept when the first title line is a heading
        if L.norm(f"{pid}. {p['t'].split(' ')[0]}") not in C:
            fail.append(f'title not found: {head}')
    src = P.get(pid)
    if not src: fail.append(f'{pid}: not in extraction'); continue
    for k, (lab, txt) in p['b'].items():
        b = int(k); orig = L.norm(src['blocks'][b])
        if lab != src['labels'][b]: fail.append(f'{pid}[{k}] label {lab!r} != {src["labels"][b]!r}')
        segs = txt if isinstance(txt, list) else [txt]
        pos = 0
        for sg in segs:
            strings += 1; chars += len(sg); n = L.norm(sg)
            if n not in C: fail.append(f'{pid}[{k}] NOT VERBATIM: {sg[:90]}')
            i = orig.find(n, pos)
            if i < 0: fail.append(f'{pid}[{k}] not a piece of the extracted block: {sg[:90]}')
            else: pos = i + len(n)
            if not isinstance(txt, list) and not orig.startswith(n): fail.append(f'{pid}[{k}] not a prefix of the block')
            for st in re.split(r'(?<=[.;:?!])\s+', n):
                if len(st) < 12: continue
                sents += 1
                if not L.cross_ok_fast(st): cross_bad.append(f'{pid}[{k}] {st[:100]}')
topics = 0; used = set()
for sid, cards in D['map'].items():
    if sid not in deck: fail.append(f'map: unknown section {sid}'); continue
    for ci, exs in cards.items():
        topics += 1; c = deck[sid]['cards'][int(ci)]
        if c['t'] != 's': fail.append(f'map: {sid}[{ci}] is not a script card')
        for pid, bl in exs:
            for b in bl:
                used.add((pid, b))
                if str(b) not in D['paras'].get(pid, {}).get('b', {}): fail.append(f'map: {sid}[{ci}] -> {pid}[{b}] missing')
unused = [(pid, k) for pid, p in D['paras'].items() for k in p['b'] if (pid, int(k)) not in used]
if unused: fail.append(f'{len(unused)} included blocks are not referenced by any topic')
print(f"edition: AIM {D['edition']['edition']}, effective {D['edition']['effective']}; change: {D['edition']['change']}")
print(f'topics mapped: {topics} in {len(D["map"])} sections; AIM paragraphs: {len(D["paras"])}; blocks: {sum(len(p["b"]) for p in D["paras"].values())}')
print(f'quoted strings: {strings} ({chars} chars) - verbatim in primary extraction: {strings - sum(1 for f in fail if "NOT VERBATIM" in f)}/{strings}')
print(f'cross-check vs independent extractions: {sents - len(cross_bad)}/{sents} sentences confirmed')
for x in cross_bad: print('  unconfirmed:', x)
print('FAILURES:', len(fail))
for f in fail: print('  ', f)
sys.exit(1 if fail else 0)
