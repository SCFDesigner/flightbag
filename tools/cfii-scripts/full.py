#!/usr/bin/env python3
"""Full lesson text of the Backseat Pilot CFI-I eBook (.docx) for the binder's CFII "Full Text" tab.
Walks the document body in order (paragraphs and tables), starts a lesson at each "LP Title" paragraph
(matched to the lesson titles of cfi/cfii.js) and keeps everything after the lesson's "How" marker:
the development outline at its real depth (paragraph styles HEADING > Section Header > Sub Heading 1 >
Sub Heading > Bullet, numbered-list levels below that), main points, notes, tables and figures.
The lesson-plan header and the introduction table are skipped (they are on the Backseat Pilot tab).
Figures reuse the files tools/cfii-scripts/figs.py wrote to cfi/assets/cfii/ (same content-hash names).
Writes cfi/cfii-full.js (window.CFII_FULL = {lesson id: [[level, kind, text | rows | figs], ...]}).
kind: 0 text, 1 top heading, 2 main point, 3 note, 4 table (rows of cells), 5 figures ([file, width]).
Usage: python3 tools/cfii-scripts/full.py "<path to CFI-I eBook.docx>" [--dry]"""
import sys, os, re, json, zipfile, hashlib, subprocess
import xml.etree.ElementTree as ET
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, "..", "..")
docx = sys.argv[1]; dry = "--dry" in sys.argv
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
WP = "{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}"
V = "{urn:schemas-microsoft-com:vml}"
titles = json.loads(subprocess.check_output(["node", "-e",
  "global.window={};eval(require('fs').readFileSync('cfi/cfii.js','utf8'));console.log(JSON.stringify(window.CFII_DATA.aoes.flatMap(a=>a.lessons.map(l=>[l.id,l.title]))))"], cwd=root))
norm = lambda s: re.sub(r"[^a-z0-9]+", " ", s.lower().replace("&", "and")).strip()
tmap = {norm(t): i for i, t in titles}
z = zipfile.ZipFile(docx)
rels = {r.get("Id"): r.get("Target") for r in ET.fromstring(z.read("word/_rels/document.xml.rels"))}
body = ET.fromstring(z.read("word/document.xml")).find(W + "body")
asset_dir = os.path.join(root, "cfi", "assets", "cfii")
LEVEL = {"HEADING": 1, "SectionHeader": 2, "SubHeading1": 3, "SubHeading": 4, "Bullet": 5}

def raw(p): return "".join(t.text or "" for t in p.iter(W + "t"))
def is_bold(r):
    pr = r.find(W + "rPr"); b = pr.find(W + "b") if pr is not None else None
    return b is not None and b.get(W + "val") not in ("0", "false")
def rich(p, plain=False):
    """Paragraph text with **bold** runs kept (adjacent bold runs merged)."""
    parts = []
    for r in p.iter(W + "r"):
        t = "".join((x.text or "") if x.tag == W + "t" else ("\t" if x.tag == W + "tab" else "") for x in r)
        if not t: continue
        b = is_bold(r) and not plain
        if parts and parts[-1][0] == b: parts[-1][1] += t
        else: parts.append([b, t])
    if parts and all(b for b, t in parts if t.strip()): parts = [[False, "".join(t for b, t in parts)]]   # all bold = a heading, not emphasis
    out = ""
    for b, t in parts:
        if b and t.strip():
            lead = t[:len(t) - len(t.lstrip())]; trail = t[len(t.rstrip()):]
            out += lead + "**" + t.strip() + "**" + trail
        else: out += t
    return re.sub(r"[ \t]+", " ", out).strip()
def all_bold(p):
    runs = [r for r in p.iter(W + "r") if "".join(t.text or "" for t in r.iter(W + "t")).strip()]
    return bool(runs) and all(is_bold(r) for r in runs)
def info(p):
    pr = p.find(W + "pPr"); sid = ""; ilvl = None
    if pr is not None:
        s = pr.find(W + "pStyle"); sid = s.get(W + "val") if s is not None else ""
        n = pr.find(W + "numPr")
        if n is not None and n.find(W + "ilvl") is not None: ilvl = int(n.find(W + "ilvl").get(W + "val"))
    return sid, ilvl
def figs(el):
    out = []
    targets = [rels.get(b.get(R + "embed")) for b in el.iter(A + "blip")] + [rels.get(i.get(R + "id")) for i in el.iter(V + "imagedata")]
    ext = next(el.iter(WP + "extent"), None); w = int(ext.get("cx")) // 9525 if ext is not None else 0
    for t in targets:
        if not t or t.lower().endswith((".emf", ".wmf")): continue
        name = hashlib.sha1(z.read("word/" + t)).hexdigest()[:16] + ".webp"
        if os.path.exists(os.path.join(asset_dir, name)) and name not in [f[0] for f in out]: out.append([name, w])
    return out

full = {}; cur = None; nodes = None; pre = None; started = False; last = 1; seen = []; stats = {"tables": 0, "figs": 0, "nodes": 0}
def close():
    global cur
    if cur is None: return
    full[cur] = nodes if started else pre + nodes      # a lesson without a "How" marker keeps everything after its title
for el in body:
    if el.tag == W + "tbl":
        if cur is None or not started: continue
        rows = []
        for tr in el.findall(W + "tr"):
            cells = ["\n".join(x for x in (rich(p) for p in tc.iter(W + "p")) if x) for tc in tr.findall(W + "tc")]
            if any(cells): rows.append(cells)
        if rows: nodes.append([min(last + 1, 6), 4, rows]); stats["tables"] += 1
        f = figs(el)
        if f: nodes.append([min(last + 1, 6), 5, f]); stats["figs"] += len(f)
        continue
    if el.tag != W + "p": continue
    sid, ilvl = info(el); t = raw(el).strip()
    if sid == "LPTitle" and norm(t) in tmap:
        close(); cur = tmap[norm(t)]; seen.append(cur); nodes = []; pre = []; started = False; last = 1; continue
    if cur is None: continue
    if sid == "Heading1":                       # area divider page: belongs to no lesson
        continue
    if sid in ("IntroductionHow", "IntroHow"):
        if t.lower() == "how": started = True
        continue
    f = figs(el)
    target = nodes if started else pre
    if t:
        text = rich(el)
        if sid in LEVEL:
            lvl = LEVEL[sid]; kind = 1 if lvl == 1 else 0; last = lvl
            if kind == 1: text = rich(el, plain=True)
        elif sid == "MainPoint": lvl = min(last + 1, 7); kind = 2
        elif sid == "Notes": lvl = min(last + 1, 7); kind = 3
        elif ilvl is not None and sid == "":   # numbered below the styled levels: list level n = outline level n + 1
            lvl = min(ilvl + 1, 8); kind = 0; last = lvl
        elif ilvl is not None:                  # ListParagraph / NoSpacing lists (common errors, sample plans)
            lvl = min(ilvl + 1, 8) if ilvl >= 4 else 2 + ilvl; kind = 0
        elif all_bold(el) or re.match(r"^(Conclusion|Common Errors)\b", t):
            lvl = 1; kind = 1; last = 1; text = rich(el, plain=True)
        else: lvl = max(last, 2) if sid == "" else 2; kind = 0
        target.append([lvl, kind, text]); stats["nodes"] += 1
    if f: target.append([min(last + 1, 7), 5, f]); stats["figs"] += len(f)
close()

missing = [t for i, t in titles if i not in full]
print("lessons:", len(full), "of", len(titles), "| missing:", missing, "| nodes:", stats["nodes"], "| tables:", stats["tables"], "| figures:", stats["figs"])
print("smallest:", sorted((len(v), k) for k, v in full.items())[:4])
out = "/* Generated by tools/cfii-scripts/full.py — do not edit by hand. Full Backseat Pilot CFI-I lesson text for the CFII \"Full Text\" tab. */\nwindow.CFII_FULL = " + json.dumps({i: full.get(i, []) for i, t in titles}, ensure_ascii=False, separators=(",", ":")) + ";\n"
print("bytes:", len(out.encode()))
if not dry: open(os.path.join(root, "cfi", "cfii-full.js"), "w").write(out)
