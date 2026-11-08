#!/usr/bin/env python3
"""Drop figure-label and gutter-crossing (full-width title/figure) lines from the per-column
`pdftotext -layout` crops. Line identity comes from `pdftohtml -xml` text runs (font + position):
the k-th non-blank -layout line of a column is matched to the k-th baseline cluster of runs in
that column; when the counts disagree the column is kept unfiltered (and reported).
usage: aimfilter.py FULL.xml COLS_DIR OUT_DIR
"""
import os, re, sys, html, collections

xml, cols, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
s = open(xml, encoding='utf8', errors='replace').read()
FIGFONT = re.compile(r'Helvetica|AvantGarde|Swiss|Arial|MonotypeSorts|FIGCOLOR')
SC = 1.5  # pdftohtml -xml coordinates are 1.5x points
Y0, Y1 = 50, 742
fonts = {a: (c + ('' if col in ('#000000', '#0000ff') else ' FIGCOLOR'), int(b)) for a, b, c, col in re.findall(r'<fontspec id="(\d+)" size="(\d+)" family="(?:[A-Z]+\+)?([^"]+)" color="([^"]+)"', s)}
pages = re.split(r'<page number="', s)[1:]
kept = dropped = mism = 0
report = []
for pg in pages:
    pno = int(pg.split('"', 1)[0])
    runs = []
    for m in re.finditer(r'<text top="(-?\d+)" left="(-?\d+)" width="(\d+)" height="(\d+)" font="(\d+)">(.*?)</text>', pg):
        t, l, w, h, f = (int(x) for x in m.groups()[:5])
        txt = html.unescape(re.sub(r'<.*?>', '', m.group(6)))
        if not txt.strip():
            continue
        top, left, right, bot = t / SC, l / SC, (l + w) / SC, (t + h) / SC
        if top < Y0 or top > Y1:
            continue
        fam, size = fonts.get(str(f), ('', 0))
        head = '<b>' in m.group(6) and size == 17 and 'Helvetica' in fam and 'FIGCOLOR' not in fam
        runs.append((top, left, right, bot, '' if head else fam, txt, head))
    for c, x0 in (('L', 0), ('R', 306)):
        fn = os.path.join(cols, f'{pno}{c}.txt')
        if not os.path.exists(fn):
            continue
        lines = open(fn, encoding='utf8').read().replace('\f', '').split('\n')
        mine = [r for r in runs if r[2] > x0 + 2 and r[1] < x0 + 306 - 2]
        mine.sort(key=lambda r: r[0])
        clusters = []
        for r in mine:
            if clusters and abs(r[0] - clusters[-1][0][0]) < 3.0:
                clusters[-1].append(r)
            else:
                clusters.append([r])
        nb = [i for i, l in enumerate(lines) if l.strip()]
        res = list(lines)
        if len(nb) != len(clusters):
            # align lines to clusters by text similarity (monotonic, small look-ahead)
            import difflib
            def key(t): return re.sub(r'\s+', '', t.replace('−', '-').replace('‐', '-'))
            ck = [key(''.join(r[5] for r in sorted(cl, key=lambda r: r[1]))) for cl in clusters]
            j = 0; un = 0
            for i in nb:
                lk = key(lines[i]); best = None
                for jj in range(j, min(j + 6, len(clusters))):
                    sc = difflib.SequenceMatcher(None, lk, ck[jj]).ratio() if lk in ck[jj] or ck[jj] in lk or True else 0
                    if lk and lk in ck[jj]: sc = max(sc, 0.95)
                    if best is None or sc > best[0]: best = (sc, jj)
                if best and best[0] >= 0.6:
                    cl = clusters[best[1]]; j = best[1] + 1
                    fig = all(FIGFONT.search(r[4]) for r in cl)
                    gut = any(r[1] < 306 - 1 and r[2] > 306 + 1 for r in cl) and not any(r[6] for r in cl)
                    if fig or gut:
                        res[i] = ''; dropped += 1
                    else:
                        kept += 1
                else:
                    un += 1; kept += 1
            mism += 1
            report.append(f'{pno}{c}: {len(nb)} lines vs {len(clusters)} clusters, aligned by text, {un} unmatched')
        else:
            for i, cl in zip(nb, clusters):
                fig = all(FIGFONT.search(r[4]) for r in cl)
                gut = any(r[1] < 306 - 1 and r[2] > 306 + 1 for r in cl) and not any(r[6] for r in cl)
                if fig or gut:
                    res[i] = ''
                    dropped += 1
                else:
                    kept += 1
        figtok = set()
        for r in runs:
            if FIGFONT.search(r[4]) or (r[1] < 306 - 1 and r[2] > 306 + 1 and not r[6]):
                figtok.update(r[5].replace('‐', '−').split())
        for i, l in enumerate(res):
            st = l.strip()
            if not st:
                continue
            toks = st.split()
            if re.fullmatch(r'(FIG|TBL)?\s*−?\d*(−\d+)*\s*', st) and re.search(r'\d', st) and '−' in st:
                res[i] = ''; dropped += 1; continue   # bare figure/table number fragment
            if not re.search(r'[a-z]', st) and all(t in figtok for t in toks):
                res[i] = ''; dropped += 1        # all-caps line made only of figure-label words
        open(os.path.join(out, f'{pno}{c}.txt'), 'w', encoding='utf8').write('\n'.join(res))
print(f'kept {kept} lines, dropped {dropped}, {mism} columns unfiltered')
open(os.path.join(out, '_report.txt'), 'w').write('\n'.join(report))
