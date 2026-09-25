#!/usr/bin/env python3
"""Extract questions + correct answers from ClassMarker test-result PDFs (US Aviation Ground Schools stage tests).

    python3 tools/fii2_stage_import.py "~/Downloads/Stage 1 Pass.pdf" "~/Downloads/Stage 2 fail.pdf" …

Writes ~/Documents/Screen Captures/fii2_extra.json (kept OUT of the repo — it's third-party content; it only
ever reaches GitHub inside the vault-locked fii-study-2.html). tools/fii2_import.py merges it into the bank.

The correct choice is the one with a green check (filled when it was picked, outline when it wasn't); a picked
wrong choice has a pink X. The marks are images, so each page is rendered (pdftoppm, 72 dpi → 1 px = 1 pt) and
the icon column next to each choice is sampled for green.
"""
import json, os, re, subprocess, sys, tempfile
from html import unescape

OUT = os.path.expanduser('~/Documents/Screen Captures/fii2_extra.json')


def words_by_page(pdf):
    """[[{t, x0, y0, x1, y1}]] per page from pdftotext -bbox-layout (PDF points, top-left origin)."""
    xml = subprocess.run(['pdftotext', '-bbox', pdf, '-'], capture_output=True, text=True, check=True).stdout
    pages = []
    for page in re.findall(r'<page[^>]*>(.*?)</page>', xml, re.S):
        ws = [{'t': unescape(t), 'x0': float(a), 'y0': float(b), 'x1': float(c), 'y1': float(d)}
              for a, b, c, d, t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>', page)]
        pages.append(ws)
    return pages


def render(pdf, page, tmp):
    """→ (width, height, bytes RGB) at 72 dpi."""
    base = os.path.join(tmp, f'p{page}')
    subprocess.run(['pdftoppm', '-r', '72', '-f', str(page), '-l', str(page), '-singlefile', pdf, base], check=True)
    data = open(base + '.ppm', 'rb').read()
    m = re.match(rb'P6\s+(\d+)\s+(\d+)\s+(\d+)\s', data)
    w, h = int(m.group(1)), int(m.group(2))
    return w, h, data[m.end():]


def mark_at(img, y_top, y_bottom):
    """'check' | 'x' | None for the icon beside a choice spanning y_top…y_bottom (points).
    The icon column sits at ~80-90% of the page width, vertically centred on the (possibly multi-line) choice."""
    w, h, px = img
    green = pink = 0
    for yy in range(max(0, int(y_top) - 6), min(h, int(y_bottom) + 7)):
        for xx in range(int(w * 0.78), int(w * 0.9)):
            i = (yy * w + xx) * 3
            r, g, b = px[i], px[i + 1], px[i + 2]
            if g > 110 and g > r + 50 and g > b + 20: green += 1
            elif r > 170 and r > g + 80 and b > 60: pink += 1
    if green >= 6 and green >= pink: return 'check'
    if pink >= 6: return 'x'
    return None


def lines_of(ws):
    """Group words into text lines (same baseline), top to bottom."""
    out = []
    for wd in sorted(ws, key=lambda w: (round(w['y0']), w['x0'])):
        if out and abs(out[-1]['y0'] - wd['y0']) < 3:
            out[-1]['words'].append(wd); out[-1]['x1'] = max(out[-1]['x1'], wd['x1'])
        else:
            out.append({'y0': wd['y0'], 'y1': wd['y1'], 'x0': wd['x0'], 'x1': wd['x1'], 'words': [wd]})
    for l in out:
        l['text'] = ' '.join(w['t'] for w in sorted(l['words'], key=lambda w: w['x0']))
    return out


def parse(pdf, tag):
    pages = words_by_page(pdf)
    tmp = tempfile.mkdtemp()
    qs, cur, state = [], None, None
    for pno, ws in enumerate(pages, 1):
        img = render(pdf, pno, tmp)
        for l in lines_of(ws):
            t = l['text'].strip()
            if re.match(r'^(Gmail - |https?://|\d+ of \d+\s+\d+/\d+/\d+)', t) or re.match(r'^\d+ of \d+$', t):
                continue   # print header / footer
            m = re.match(r'^Question (\d+) of (\d+)$', t)
            if m:
                cur = {'n': int(m.group(1)), 'of': int(m.group(2)), 'section': None, 'stem': [], 'choices': [], 'src': tag}
                qs.append(cur); state = 'section'; continue
            if cur is None: continue
            if state == 'section':
                cur['section'] = t; state = 'stem'; continue
            cm = re.match(r'^([A-F])\.\s*(.*)$', t)
            if cm and state in ('stem', 'choice'):
                cur['choices'].append({'l': cm.group(1), 't': cm.group(2).strip(), 'img': img, 'y0': l['y0'], 'y1': l['y1']})
                state = 'choice'; continue
            if state == 'stem':
                cur['stem'].append(t)
            elif state == 'choice' and cur['choices']:   # wrapped choice text (same page → extend its height)
                cur['choices'][-1]['t'] += ' ' + t
                if cur['choices'][-1]['img'] is img: cur['choices'][-1]['y1'] = l['y1']
    out = []
    for q in qs:
        stem = re.sub(r'\s+', ' ', ' '.join(q['stem'])).strip()
        ch = [{'l': c['l'], 't': re.sub(r'\s+', ' ', c['t']).strip(), 'c': mark_at(c['img'], c['y0'], c['y1']) == 'check'}
              for c in q['choices']]
        out.append({'src': q['src'], 'n': q['n'], 'section': q['section'], 'stem': stem, 'choices': ch,
                    'ok': sum(c['c'] for c in ch) == 1})
    return out


def main(paths):
    allq = []
    for p in paths:
        tag = re.sub(r'\.pdf$', '', os.path.basename(p), flags=re.I)
        qs = parse(p, tag)
        bad = [q['n'] for q in qs if not q['ok']]
        print(f'{tag}: {len(qs)} questions' + (f', no single green check on: {bad}' if bad else ''))
        allq += qs
    # Same question in several attempts (pass/fail) → one entry; the green checks must agree
    norm = lambda s: re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()
    merged, conflicts = {}, []
    for q in allq:
        if not q['ok']: continue
        k = norm(q['stem']) + '|' + '|'.join(sorted(norm(c['t']) for c in q['choices']))
        right = next(c['t'] for c in q['choices'] if c['c'])
        if k in merged:
            if norm(merged[k]['right']) != norm(right): conflicts.append((q['stem'][:60], merged[k]['right'], right))
            merged[k]['seen'].append(f"{q['src']} #{q['n']}")
            continue
        merged[k] = {'stem': q['stem'], 'choices': [{'l': c['l'], 't': c['t'], 'c': c['c']} for c in q['choices']],
                     'right': right, 'section': q['section'], 'seen': [f"{q['src']} #{q['n']}"]}
    for c in conflicts: print('  answer conflict:', c)
    res = list(merged.values())
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(res, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print(f'{len(res)} unique questions → {OUT}')


if __name__ == '__main__':
    main([os.path.expanduser(p) for p in sys.argv[1:]])
