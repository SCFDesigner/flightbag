#!/usr/bin/env python3
"""Merge parts/*.json (card -> AIM block mappings, + manual fixes below) into collin/cfii-aim-data.js and cfii-aim-index.js.
usage: merge.py OUT_JS"""
import sys, os, json, glob, re, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aimlib as L

base = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'collin', 'cfii-oral-data.js')
js = 'global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.CFII_ORAL))'
deck = json.loads(subprocess.run(['node', '-e', js, DATA], capture_output=True, text=True, check=True).stdout)
P = L.paras()

parts = {}
notes = {}
for fn in sorted(glob.glob(os.path.join(base, 'parts', 'p*.json'))):
    m = json.load(open(fn, encoding='utf8'))
    for sid, cards in m.items():
        if sid.startswith('_'):
            notes[os.path.basename(fn)] = cards; continue
        for ci, exs in cards.items():
            parts.setdefault(sid, {})[ci] = exs

# manual fixes after the cleaner re-extraction (figure text removed from these blocks)
def add(sid, ci, pid, blocks):
    exs = parts[sid][ci]
    same = [e for e in exs if e['p'] == pid]
    if same:   # join the excerpt of that paragraph whose blocks are nearest
        e = min(same, key=lambda e: min(abs(a - b) for a in e['b'] for b in blocks))
        e['b'] = sorted(set(e['b']) | set(blocks)); return
    exs.append({'p': pid, 'b': sorted(blocks)})
def drop(sid, ci, pid, blocks):
    for e in parts[sid][ci]:
        if e['p'] == pid:
            e['b'] = [b for b in e['b'] if b not in blocks]
    parts[sid][ci] = [e for e in parts[sid][ci] if e['b']]
add('VII.B', '0', '5-3-8', [28])        # j.2(b)(2) 175-kt restriction
add('VII.B', '1', '5-3-8', [18])        # i.6 EFC item
add('VII.B', '2', '5-3-8', [38])        # j.3(c) direct entry
drop('III.A+', '21', '7-1-21', [8])     # rime/clear-ice NOTE still mixed with a table

TRAIL = re.compile(r'(\s+(\d+−\d+−\d+|CONTENTS))+\s*$')
# table text that the extraction ran into the end of a block: cut it off (what remains is a prefix, still verbatim)
TRIM = {('1-1-9', 49): r'\s+Marker Passage Indications Marker\s.*$',
        ('7-2-3', 8): r'\s+200\s{3,}300\s.*$'}
# figure labels in the middle of a block: split into verbatim segments around them (shown with an ellipsis)
CUT = {('5-4-21', 7): r'\s*Circling and Missed Approach Obstruction Clearance Areas Missed Approach 056 36\s+°\s+109\.2 CNU R2\s+191 °\s*'}
def clean(t, pid=None, b=None):
    t = TRAIL.sub('', t).strip()
    if (pid, b) in TRIM:
        t2 = re.sub(TRIM[(pid, b)], '', t, flags=re.S); assert t2 != t, (pid, b); t = t2
    if (pid, b) in CUT:
        segs = re.split(CUT[(pid, b)], t); assert len(segs) == 2, (pid, b)
        return [x.strip() for x in segs]
    return t

paras, amap = {}, {}
order = []
for s in deck:
    sid = s['id']
    if sid not in parts: continue
    for ci in sorted(parts[sid], key=int):
        exs = parts[sid][ci]
        if not exs: continue
        out = []
        for e in exs:
            pid = e['p']; p = P[pid]
            d = paras.setdefault(pid, {'t': p['title'], 'pg': p['page'], 'b': {}})
            for b in e['b']:
                d['b'][str(b)] = [p['labels'][b], clean(p['blocks'][b], pid, b)]
            out.append([pid, e['b']])
        amap.setdefault(sid, {})[ci] = out

def pkey(pid): return tuple(int(x) for x in pid.split('-'))
paras = {k: paras[k] for k in sorted(paras, key=pkey)}
for k in paras:
    paras[k]['b'] = dict(sorted(paras[k]['b'].items(), key=lambda kv: int(kv[0])))

edition = {
    'title': 'Aeronautical Information Manual (AIM): Official Guide to Basic Flight Information and ATC Procedures',
    'edition': 'Basic Manual',
    'effective': 'October 12, 2017',
    'change': 'None (Basic edition; the Record of Changes is blank)',
    'source': 'FAA AIM PDF, 732 pages; text extracted with pdftotext -layout, quoted verbatim',
    'note': 'Paragraph numbers and content are as of this edition. Later AIM changes may renumber or revise them.'
}
ntop = sum(len(v) for v in amap.values())
nblk = sum(len(v['b']) for v in paras.values())
hdr = ('// CFII Oral Prep: AIM Augmentation. Verbatim AIM excerpts (FAA AIM Basic, effective 10/12/2017; public domain).\n'
       '// Generated from the PDF (pdftotext -layout, per column, figure text removed); every string checked verbatim against the extraction.\n'
       '// paras: {pid: {t: title, pg: PDF page, b: {block index: [subparagraph label, text or [verbatim segments]]}}}; map: {section id: {card index: [[pid, [block indices]], ...]}}.\n'
       f'// {ntop} topics, {len(paras)} AIM paragraphs, {nblk} subparagraph blocks.\n')
# deck order outline of the mapped topics (so the inline page needn't load the 450 KB deck)
topics = [{'id': s['id'], 'title': s['title'], 'area': s['area'], 'optional': bool(s.get('optional')),
           'cards': [[int(ci), s['cards'][int(ci)]['h']] for ci in amap[s['id']]]} for s in deck if s['id'] in amap]
body = 'window.CFII_AIM = ' + json.dumps({'edition': edition, 'topics': topics, 'paras': paras, 'map': amap}, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(sys.argv[1], 'w', encoding='utf8').write(hdr + body)
# tiny eager index for the deck: which script cards have AIM excerpts
idx = {sid: sorted(int(ci) for ci in cards) for sid, cards in amap.items()}
ix = os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), 'cfii-aim-index.js')
open(ix, 'w', encoding='utf8').write('// Which CFII Oral script cards have AIM Augmentation excerpts (generated with cfii-aim-data.js). {section id: [card index]}\n'
    'window.CFII_AIM_INDEX = ' + json.dumps(idx, separators=(',', ':')) + ';\n')
print(f'{ntop} topics, {len(paras)} paragraphs, {nblk} blocks, {len(body)//1024} KB')
# per-part notes (unmapped cards + reasons) stay in parts/*.json under "_notes"
