"""Shared helpers for the AIM tools. Import with sys.path set to this directory."""
import json, os, re

# extraction work dir (made by build.sh); set AIMDIR, default /tmp/cfii-aim-extract
AIM = os.environ.get('AIMDIR', '/tmp/cfii-aim-extract')

def soft_join(text):
    """Join physical lines; ASCII '-' at a line end between letters + lowercase next line = soft
    hyphen (dropped) unless both halves are words and the joined form is not (then kept)."""
    out = []
    for ln in text.split('\n'):
        ln = ln.strip()
        if not ln or (ln.startswith('<<page ') and ln.endswith('>>')):
            continue
        if out:
            prev = out[-1]
            if prev.endswith('-') and len(prev) > 1 and prev[-2].isalpha() and ln[:1].islower():
                out[-1] = (prev[:-1] if soft_hyphen(prev[:-1], ln) else prev) + ln
                continue
        out.append(ln)
    return ' '.join(out)

_words = {}
def _dict():
    if 'd' not in _words:
        d = set()
        try:
            d = {w.strip().lower() for w in open('/usr/share/dict/words', encoding='utf8')}
        except OSError:
            pass
        # words the AIM itself uses unbroken (any token not at a line end)
        cf = os.path.join(AIM, 'corpus.txt')
        if os.path.exists(cf):
            for ln in open(cf, encoding='utf8'):
                for t in ln.split()[:-1]:
                    d.add(re.sub(r'[^a-z]', '', t.lower()))
        _words['d'] = d
    return _words['d']

def soft_hyphen(left, right):
    """Line-end ASCII hyphen: True = soft (drop it), False = real hyphen/dash (keep it).
    Kept only when both halves are real words of 3+ letters and the joined form is not a word."""
    a = re.search(r'([A-Za-z]+)$', left); b = re.match(r'([a-z]+)', right)
    if not a or not b:
        return True
    a, b = a.group(1).lower(), b.group(1).lower()
    d = _dict()
    if len(a) < 3 or len(b) < 3 or (a + b) in d:
        return True
    return not (a in d and b in d)

def norm(s):
    """Comparison form: U+2212 minus -> '-', NBSP -> space, whitespace collapsed."""
    return re.sub(r'\s+', ' ', s.replace('−', '-').replace(' ', ' ')).strip()

_cache = {}
def paras():
    if 'p' not in _cache:
        _cache['p'] = json.load(open(os.path.join(AIM, 'paras.json'), encoding='utf8'))
    return _cache['p']

def corpus():
    """Primary corpus: per-column `pdftotext -layout` text in reading order."""
    if 'c' not in _cache:
        _cache['c'] = norm(soft_join(open(os.path.join(AIM, 'corpus.txt'), encoding='utf8').read()))
    return _cache['c']

def alt_corpora():
    """Independent extractions (pdftotext default + -raw mode), for the cross-check."""
    if 'a' not in _cache:
        out = []
        for fn in ('aim_raw.txt', 'aim_rawmode.txt'):
            t = open(os.path.join(AIM, fn), encoding='utf8').read().replace('\f', '\n')
            out.append(norm(soft_join(t)))
        _cache['a'] = out
    return _cache['a']

def in_alt(s):
    s = norm(s)
    return any(s in a for a in alt_corpora())

def cross_ok(block):
    """True if every sentence of the block is found in an independent extraction
    (a sentence may be split once, e.g. across a page break / running header)."""
    sents = re.split(r'(?<=[.;:?!])\s+', norm(block))
    for st in sents:
        if len(st) < 12 or in_alt(st):
            continue
        w = st.split(' ')
        if not any(in_alt(' '.join(w[:k])) and in_alt(' '.join(w[k:])) for k in range(3, len(w) - 2)):
            return False
    return True

def junky(block):
    return bool(re.match(r'^(FIG|TBL)\b', block)) or '     ' in block

N = 6
def _shingles():
    if 'sh' not in _cache:
        sh = set()
        for a in alt_corpora():
            w = a.split(' ')
            for i in range(len(w) - N + 1):
                sh.add(' '.join(w[i:i + N]))
        _cache['sh'] = sh
    return _cache['sh']

def cross_ok_fast(text):
    """Sentence/segment confirmed by an independent extraction: all N-word shingles present,
    except at most one run of <= N-1 missing shingles (a page break / running header)."""
    sh = _shingles(); w = norm(text).split(' ')
    if len(w) < N:
        return in_alt(text)
    miss = [(' '.join(w[i:i + N]) not in sh) for i in range(len(w) - N + 1)]
    runs = []; r = 0
    for m in miss + [False]:
        if m: r += 1
        elif r: runs.append(r); r = 0
    return len(runs) == 0 or (len(runs) == 1 and runs[0] <= N - 1)
