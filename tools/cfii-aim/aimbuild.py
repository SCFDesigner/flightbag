#!/usr/bin/env python3
"""Build the AIM paragraph index from per-page, per-column `pdftotext -layout` output.
usage: aimbuild.py COLS_DIR OUT_DIR
writes OUT_DIR/corpus.txt (reading order, page markers), OUT_DIR/paras.json
{pid: {title, page, blocks:[str]}} and OUT_DIR/outline.txt (pid  title  [page]).
"""
import json, os, re, sys

cols, out = sys.argv[1], sys.argv[2]
HEAD = re.compile(r'^(\d{1,2})−(\d{1,2})−(\d{1,2})\.\s+(\S.*)$')
SECT = re.compile(r'^(Section \d+\.|Chapter \d+\.)\s')
LABEL = re.compile(r'^(?:[a-z]\.|\d{1,2}\.|\([a-z0-9]{1,4}\))\s')
BLOCKSTART = re.compile(r'^(NOTE−|NOTE\b|REFERENCE−|EXAMPLE−|PHRASEOLOGY−|(?:FIG|TBL) [\d−]+\s*$|CAUTION−|WARNING−)')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ['AIMDIR'] = os.path.abspath(out)
import aimlib
def dehyph_join(lines):
    """Join physical lines (same rule as aimlib.soft_join, used by the checker)."""
    return aimlib.soft_join('\n'.join(lines))

# reading order: page by page, left column then right column
seq = []  # (page, col, line)
for p in range(1, 733):
    for c in 'LR':
        fn = os.path.join(cols, f'{p}{c}.txt')
        if not os.path.exists(fn):
            continue
        txt = open(fn, encoding='utf8').read().replace('\f', '')
        lines = txt.split('\n')
        ne = [l for l in lines if l.strip()]
        ind = min((len(l) - len(l.lstrip()) for l in ne), default=0)
        for l in lines:
            seq.append((p, c, l[ind:] if l.strip() else ''))

with open(os.path.join(out, 'corpus.txt'), 'w', encoding='utf8') as f:
    cur = None
    for p, c, l in seq:
        if (p, c) != cur:
            f.write(f'\n<<page {p}{c}>>\n')
            cur = (p, c)
        f.write(l + '\n')

paras = {}
cur = None
titled = True
buf = []  # list of blocks, each a list of physical lines

LV = [re.compile(r'^([a-z])\.\s'), re.compile(r'^(\d{1,2})\.\s'), re.compile(r'^\(([a-z]{1,4})\)\s'), re.compile(r'^\((\d{1,2})\)\s')]
def label_blocks(blocks):
    path = [None, None, None, None]
    out = []
    for b in blocks:
        lvl = None
        for i, rx in enumerate(LV):
            m = rx.match(b)
            if m:
                lvl = i; val = m.group(1); break
        if lvl is not None:
            # a lone '(i)'-style roman after (h) is still level 2; good enough for AIM a./1./(a)/(1)
            path[lvl] = val
            for j in range(lvl + 1, 4):
                path[j] = None
            for j in range(lvl):
                pass
            lab = ''
            for j in range(4):
                if path[j] is None:
                    if j <= lvl: continue
                    break
                lab += (('.' if lab and j < 2 else '') + path[j]) if j < 2 else f'({path[j]})'
            out.append(lab)
        else:
            lab = ''
            for j in range(4):
                if path[j] is None: break
                lab += (('.' if lab and j < 2 else '') + path[j]) if j < 2 else f'({path[j]})'
            kind = b.split('−')[0].split(' ')[0] if BLOCKSTART.match(b) else ''
            out.append((lab + ' ' + kind).strip())
    return out

def flush():
    if cur is None:
        return
    blocks = [dehyph_join(b) for b in buf]
    blocks = [b for b in blocks if b]
    pid, title, page = cur
    if pid not in paras or len(' '.join(blocks)) > len(' '.join(paras[pid]['blocks'])):
        paras[pid] = {'title': title, 'page': page, 'blocks': blocks, 'labels': label_blocks(blocks)}

for p, c, l in seq:
    st = l.strip()
    if p < 33:  # front matter + main table of contents
        continue
    m = HEAD.match(st)
    if m and '. . .' not in st and not re.search(r'\s\d+−\d+−\d+\s*$', st):
        flush()
        pid = f'{m.group(1)}-{m.group(2)}-{m.group(3)}'
        cur = (pid, m.group(4).strip(), p)
        buf = []
        titled = 0
        continue
    if SECT.match(st) and len(st) < 90 and l == l.lstrip():
        flush(); cur = None; buf = []
        continue
    if p > 500 and (st.startswith('Appendix 1.') or st.startswith('PILOT/CONTROLLER GLOSSARY')) and '. .' not in st:
        flush(); cur = None; buf = []; break
    if cur is None:
        continue
    if not st:
        continue
    # heading title wrapped onto a second short line (bold heading, before any body text)
    if not buf and titled is not True and titled < 2 and len(st) < 46 and not LABEL.match(st) and not BLOCKSTART.match(st) and (st[:1].isupper() or st[:1] in '(“' or cur[1].endswith('-')) and not st.endswith('.'):
        cur = (cur[0], (cur[1][:-1] if cur[1].endswith('-') else cur[1] + ' ') + st, cur[2])
        titled += 1
        continue
    titled = True
    indent = len(l) - len(l.lstrip())
    if (LABEL.match(st) and indent >= 1) or BLOCKSTART.match(st) or not buf:
        buf.append([st])
    else:
        buf[-1].append(st)
flush()

# titles can wrap onto the next line; keep as-is (first line) but expose
with open(os.path.join(out, 'paras.json'), 'w', encoding='utf8') as f:
    json.dump(paras, f, ensure_ascii=False, indent=0)

def key(pid):
    return tuple(int(x) for x in pid.split('-'))
with open(os.path.join(out, 'outline.txt'), 'w', encoding='utf8') as f:
    for pid in sorted(paras, key=key):
        f.write(f"{pid}  {paras[pid]['title']}  [p{paras[pid]['page']}, {len(' '.join(paras[pid]['blocks']))} ch]\n")
print(len(paras), 'paragraphs')
