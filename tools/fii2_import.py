#!/usr/bin/env python3
"""Import Prepware FII questions captured by ScreenToWord (auto-walk) into fii-study-2.html.

    python3 tools/fii2_import.py ["~/Documents/Screen Captures/Screen Captures.docx" ...]

Re-run any time more questions have been captured; the question bank and figures are rebuilt
from the .docx files. The page must be unlocked (node tools/exam-vault.mjs unlock fii-study-2.html)
and should be locked again before committing.

What it reads (per auto-walk item):
  bold "(4214) title…"  →  optional "Question 12 of 68"  →  Question / stem  →  Answer Choices
  (correct choice is the green text)  →  Explanation / Reference  →  embedded figure images.
Category comes from the "x of N" counter (N = size of that Prepware category), falling back to
tools/fii2_legacy_cats.json for items captured before the counter was recorded.
"""
import json, os, re, sys, zipfile
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'fii-study-2.html')
IMGDIR = 'images/fii2'
LEGACY = os.path.join(ROOT, 'tools', 'fii2_legacy_cats.json')
DEFAULT_DOCX = os.path.expanduser('~/Documents/Screen Captures/Screen Captures.docx')

CATS = ['Weather', 'Weather Services', 'Flight Instruments', 'Navigation',
        'Regulations and Procedures', 'Departure', 'En Route', 'Arrival and Approach']
# Prepware category sizes → category ("117" is how OCR read Weather's "111")
TOTALS = {111: 'Weather', 117: 'Weather', 68: 'Weather Services', 130: 'Flight Instruments',
          100: 'Navigation', 132: 'Regulations and Procedures', 136: 'Departure',
          66: 'En Route', 126: 'Arrival and Approach'}

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'


# ---------- .docx → paragraphs ----------

def paragraphs(path):
    """[(segments[(text, hexcolor|None, bold)], [image zip paths])] in document order."""
    z = zipfile.ZipFile(path)
    xml = z.read('word/document.xml').decode('utf8')
    rels = {}
    if 'word/_rels/document.xml.rels' in z.namelist():
        for rid, target in re.findall(r'Id="([^"]+)"[^>]*Target="([^"]+)"',
                                      z.read('word/_rels/document.xml.rels').decode('utf8')):
            rels[rid] = 'word/' + target.lstrip('/').replace('word/', '', 1)
    out = []
    for p in re.findall(r'<w:p[ >].*?</w:p>|<w:p/>', xml, re.S):
        segs = []
        for r in re.findall(r'<w:r[ >].*?</w:r>', p, re.S):
            col = re.search(r'<w:color w:val="([0-9A-Fa-f]{6})"', r)
            bold = bool(re.search(r'<w:b/>|<w:b w:val="(?:1|true|on)"', r))
            text = ''
            for m in re.finditer(r'<w:t[^>]*>([^<]*)</w:t>|<w:tab/>|<w:br/>', r):
                text += '\t' if m.group(0) == '<w:tab/>' else ' ' if m.group(0) == '<w:br/>' else unescape(m.group(1))
            if text:
                segs.append((text, col.group(1).upper() if col else None, bold))
        imgs = [rels[i] for i in re.findall(r'r:embed="([^"]+)"', p) if i in rels]
        out.append((segs, imgs, z))
    return out


def unescape(s):
    return s.replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&apos;', "'").replace('&amp;', '&')


def text(segs):
    return ''.join(t for t, _, _ in segs)


def is_green(hexcol):
    if not hexcol:
        return False
    r, g, b = (int(hexcol[i:i + 2], 16) for i in (0, 2, 4))
    return g > r + 35 and g > b + 25


def green_share(segs):
    total = sum(len(t.strip()) for t, _, _ in segs)
    return sum(len(t.strip()) for t, c, _ in segs if is_green(c)) / total if total else 0


# ---------- items ----------

TITLE = re.compile(r'^\((\d{3,6}(?:\.\d{1,2})?)\)\s*(.*)')
COUNTER = re.compile(r'(\d+)\s*of\s*(\d+)')
JUNK = re.compile(r'^(\d{1,2}:\d{2}\S*|figure|view figures?.*|[<＜‹]\s*back.*|exit quiz.*)$', re.I)


def items_from(paras):
    """Split into auto-walk items: {id, title, counter, body[(segs, blank)], images[], session}."""
    items, cur, in_walk, session = [], None, False, 0
    for segs, imgs, z in paras:
        t = text(segs).strip()
        if t.startswith(('Auto-walk', 'Live session', 'Capture test')):
            in_walk = t.startswith('Auto-walk')
            session += 1
            cur = None
            continue
        m = TITLE.match(t)
        if in_walk and m and any(b for _, _, b in segs):
            cur = {'id': m.group(1), 'title': m.group(2).rstrip('\t >＞›'), 'counter': None,
                   'body': [], 'images': [], 'session': session}
            items.append(cur)
            continue
        if cur is None:
            continue
        cm = COUNTER.search(t)
        if cm and not cur['counter'] and (t.startswith(('Question ', '<', '＜', '&lt;')) or len(t) < 24):
            cur['counter'] = (int(cm.group(1)), int(cm.group(2)))
            continue
        for path in imgs:
            cur['images'].append((z, path))
        cur['body'].append((segs, not t))
    return items


def join_lines(lines):
    out = ''
    for l in lines:
        l = l.replace('\t', ' ').strip()
        if not l:
            continue
        if out.endswith('-') and len(out) > 1 and out[-2].isalpha():
            out += l            # "single-" + "engine" → "single-engine"
        else:
            out += (' ' if out else '') + l
    return re.sub(r'\s+', ' ', out).strip()


def parse(item):
    """→ (stem, choices[{t, c}], exp, warnings)"""
    sect, stem, choice_rows, exp = None, [], [], []
    for segs, blank in item['body']:
        t = text(segs).strip()
        low = t.lower()
        if low == 'question':
            sect = 'q'; continue
        if low == 'answer choices':
            sect = 'c'; continue
        if low == 'explanation':
            sect = 'e'; continue
        if t and JUNK.match(t):
            continue
        if sect == 'q' and t:
            stem.append(t)
        elif sect == 'c':
            choice_rows.append((segs, blank))
        elif sect == 'e' and t:
            t = re.sub(r'\s*[•○◦●]\s*$|^[•○◦●]\s*', '', t).strip()
            if t: exp.append(t)
    warn = []
    stem_txt = re.sub(r'^\(\d{3,6}(?:\.\d{1,2})?\)\s*', '', join_lines(stem))
    if not stem_txt:
        stem_txt = item['title']; warn.append('no stem')

    # Choices. OCR reads each radio button as "•" on the choice's *middle* line, and the green (correct)
    # choice usually has none. So: split on blank lines and green/non-green changes first, then split any
    # block holding several bullets between them, preferring a sentence end.
    BUL = re.compile(r'^\s*[•○◦●]\s*|^O\t\s*')
    blocks, blk, prev_green = [], [], None
    for segs, blank in choice_rows:
        t = text(segs).strip()
        if blank or not t:
            if blk: blocks.append(blk); blk = []
            prev_green = None
            continue
        green = green_share(segs) > 0   # partial: the radio circle often merges with the first word
        if blk and prev_green is not None and green != prev_green:
            blocks.append(blk); blk = []
        blk.append({'t': BUL.sub('', t).strip(), 'bullet': bool(BUL.match(t)), 'green': green})
        prev_green = green
    if blk: blocks.append(blk)

    def split_block(b):
        bullets = [i for i, l in enumerate(b) if l['bullet']]
        if len(bullets) < 2: return [b]
        parts, start = [], 0
        for k in range(len(bullets) - 1):
            lo, hi = bullets[k], bullets[k + 1]           # boundary goes after some line in [lo, hi)
            cands = [i for i in range(lo, hi) if re.search(r'[.?!)]$', b[i]['t'])]
            cut = cands[0] if cands else (lo + hi - 1) // 2
            parts.append(b[start:cut + 1]); start = cut + 1
        parts.append(b[start:])
        return [x for x in parts if x]
    groups = [part for b in blocks for part in split_block(b)]
    groups = [[l for l in g if l['t']] for g in groups]
    groups = [g for g in groups if g]
    if len(groups) > 3:   # stray fragments with no bullet: attach to the previous choice
        merged = []
        for g in groups:
            if merged and len(groups) - (len(groups) - len(merged)) and not any(l['bullet'] or l['green'] for l in g) \
               and len(merged) + (len(groups) - groups.index(g)) > 3:
                merged[-1] = merged[-1] + g
            else:
                merged.append(g)
        groups = merged
    while len(groups) > 3:   # a green answer split across lines → rejoin neighbouring green pieces
        i = next((i for i in range(len(groups) - 1) if all(l['green'] for l in groups[i] + groups[i + 1])), None)
        if i is None: break
        groups[i:i + 2] = [groups[i] + groups[i + 1]]
    groups = [[(l['t'], l['green']) for l in g] for g in groups]
    choices = [{'t': join_lines([t for t, _ in grp]), 'g': sum(1 for _, gr in grp if gr) / len(grp), 'c': False}
               for grp in groups]
    choices = [c for c in choices if c['t']]
    if choices and max(c['g'] for c in choices) > 0:   # the greenest choice is the correct one
        max(choices, key=lambda c: c['g'])['c'] = True
    if len(choices) != 3: warn.append(f'{len(choices)} choices')
    if not any(c['c'] for c in choices): warn.append('no green answer')
    for c in choices: c.pop('g', None)

    # Explanation: prose, then the reference line on its own
    ref = [l for l in exp if l.lower().startswith('reference')]
    body = [l for l in exp if not l.lower().startswith('reference')]
    exp_txt = join_lines(body)
    if ref: exp_txt += ('\n\n' if exp_txt else '') + ' '.join(ref)
    if not exp_txt: warn.append('no explanation')
    if choices and not any(c['c'] for c in choices) and exp_txt:
        # No colour captured: the explanation usually quotes the right choice
        norm = lambda x: re.sub(r'[^a-z0-9]+', ' ', x.lower()).strip()
        e = ' ' + norm(exp_txt) + ' '
        hits = [c for c in choices if norm(c['t']) and ' ' + norm(c['t']) + ' ' in e]
        if len(hits) == 1:
            hits[0]['c'] = True
            warn = [w for w in warn if w != 'no green answer'] + ['answer inferred from explanation']
    return stem_txt, choices, exp_txt, warn


def quality(q):
    return (len(q['choices']) == 3) * 4 + any(c['c'] for c in q['choices']) * 3 + bool(q['exp']) * 2 + bool(q.get('fig'))


def main(paths):
    page = open(PAGE, encoding='utf8').read()
    if re.search(r'<script id="vault" type="application/json"[^>]*>\s*[^<\s]', page):
        sys.exit('fii-study-2.html is locked — run: node tools/exam-vault.mjs unlock fii-study-2.html')
    legacy = json.load(open(LEGACY)) if os.path.exists(LEGACY) else {}
    os.makedirs(os.path.join(ROOT, IMGDIR), exist_ok=True)

    best, figs, report = OrderedDict(), {}, {'uncategorized': [], 'warnings': 0, 'flagged': []}
    order = 0
    for path in paths:
        for it in items_from(paragraphs(path)):
            order += 1
            if any('couldn\'t capture' in text(sg) for sg, _ in it['body']) and len(it['body']) < 6:
                continue   # placeholder written when an item didn't open
            stem, choices, exp, warn = parse(it)
            n = it['counter'][1] if it['counter'] else None
            cat = TOTALS.get(n) if n else None
            cat = cat or legacy.get(it['id'])
            if not cat:
                report['uncategorized'].append(it['id']); cat = 'Uncategorized'
            q = {'id': it['id'], 'cat': cat, 'stem': stem,
                 'choices': [{'l': 'ABC'[i] if i < 3 else chr(65 + i), 't': c['t'], 'c': c['c']} for i, c in enumerate(choices)],
                 'exp': exp, 'b': order}
            if it['counter']: q['n'] = it['counter'][0]
            # Figures: key by the figure number in the stem so questions sharing a figure share the image
            refs = re.findall(r'Figures?\s+(\d+[A-Z]?)(?:\s*(?:,|and)\s*(\d+[A-Z]?))?', stem)
            fignum = refs[0][0] if refs else None
            if it['images']:
                key = fignum or 'Q' + it['id']
                z, member = it['images'][0]
                ext = os.path.splitext(member)[1] or '.jpeg'
                rel = f'{IMGDIR}/{key}{".jpg" if ext in (".jpeg", ".jpg") else ext}'
                with open(os.path.join(ROOT, rel), 'wb') as f:
                    f.write(z.read(member))
                figs['P' + key] = rel
                q['fig'] = key
            elif fignum:
                q['_wantfig'] = fignum
            if not choices:
                continue   # nothing usable captured
            if warn: q['_warn'] = warn
            old = best.get(q['id'])
            if not old or quality(q) >= quality(old):
                best[q['id']] = q

    questions = list(best.values())
    for q in questions:   # figure captured on another question that uses the same figure
        want = q.pop('_wantfig', None)
        if want and 'P' + want in figs: q['fig'] = want
        w = q.pop('_warn', None)
        if w:
            report['warnings'] += 1
            if any(x != 'answer inferred from explanation' for x in w): report['flagged'].append(q['id'])
    # Seq A = by question number within category (stable, like a study guide); seq B = capture order
    def num(q): return tuple(float(x) for x in q['id'].split('.')) if q['id'].replace('.', '').isdigit() else (0,)
    for c in CATS + ['Uncategorized']:
        for i, q in enumerate(sorted((q for q in questions if q['cat'] == c), key=num)):
            q['a'] = i
    questions.sort(key=lambda q: ((CATS + ['Uncategorized']).index(q['cat']), q['a']))
    # Only categories that have questions (Study mode can't plan an empty one); order stays as in Prepware
    cats = [c for c in CATS + ['Uncategorized'] if any(q['cat'] == c for q in questions)]
    course = {'name': 'FII 2 — Flight Instructor Instrument (Prepware)', 'short': 'FII 2', 'pfx': 'fii2_',
              'hasB': True, 'figpfx': 'P', 'cats': cats, 'questions': questions, 'units': []}
    data = json.dumps({'courses': {'fii2': course}}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    figjson = json.dumps(figs, separators=(',', ':')).replace('</', '<\\/')
    page = re.sub(r'(<script id="data" type="application/json">)[\s\S]*?(</script>)', lambda m: m.group(1) + data + m.group(2), page, count=1)
    page = re.sub(r'(<script id="figs" type="application/json">)[\s\S]*?(</script>)', lambda m: m.group(1) + figjson + m.group(2), page, count=1)
    open(PAGE, 'w', encoding='utf8').write(page)
    idx = os.path.join(ROOT, 'index.html')   # keep the Flight Bag home-page count current
    if os.path.exists(idx):
        h = open(idx, encoding='utf8').read()
        h2 = re.sub(r'(href="fii-study-2.html">[\s\S]*?<span class="fb-row-tag">)\d+ Q', lambda m: f'{m.group(1)}{len(questions)} Q', h, count=1)
        if h2 != h: open(idx, 'w', encoding='utf8').write(h2)

    counts = {c: sum(q['cat'] == c for q in questions) for c in cats}
    print(f'{len(questions)} questions, {len(figs)} figures →', os.path.relpath(PAGE, ROOT))
    for c in CATS:
        counts.setdefault(c, 0)
        tot = next((k for k, v in TOTALS.items() if v == c and k != 117), None)
        print(f'  {c:28} {counts[c]:4}' + (f' / {tot}' if tot else ''))
    if report['flagged']: print('  check / re-walk:', ' '.join(report['flagged']))
    print(f'  {report["warnings"]} questions with parse warnings', '· uncategorized: ' + ' '.join(report['uncategorized']) if report['uncategorized'] else '')


if __name__ == '__main__':
    main([os.path.expanduser(p) for p in sys.argv[1:]] or [DEFAULT_DOCX])
