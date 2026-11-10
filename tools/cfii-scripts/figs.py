#!/usr/bin/env python3
"""Pull the figures out of the Backseat Pilot CFI-I eBook (.docx) with their place in each lesson.
Walks the document body in order, tracks the current lesson (a paragraph equal to a lesson title of cfi/cfii.js)
and the last heading-like / text paragraphs, and records every picture with those anchors.
Writes images to cfi/assets/cfii/ (content-hashed names) and tools/cfii-scripts/figs.json.
Usage: python3 tools/cfii-scripts/figs.py "<path to CFI-I eBook.docx>" [--dry]"""
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
  "global.window={};eval(require('fs').readFileSync('cfi/cfii.js','utf8'));console.log(JSON.stringify(window.CFII_DATA.aoes.flatMap(a=>a.lessons.map(l=>[l.id,l.title,(l.outline||[]).map(e=>[e.t,(e.k||[]).map(s=>[s.t,(s.k||[]).map(x=>x.t)])])]))))"], cwd=root))
outline = {i: o for i, t, o in titles}; titles = [(i, t) for i, t, o in titles]
areas = set()
norm = lambda s: re.sub(r"[^a-z0-9]+", " ", s.lower().replace("&", "and")).strip()
tmap = {norm(t): i for i, t in titles}
z = zipfile.ZipFile(docx)
rels = {r.get("Id"): r.get("Target") for r in ET.fromstring(z.read("word/_rels/document.xml.rels"))}
body = ET.fromstring(z.read("word/document.xml")).find(W + "body")
def ptext(p): return "".join(t.text or "" for t in p.iter(W + "t")).strip()
def pbold(p):
    runs = [r for r in p.iter(W + "r") if "".join(t.text or "" for t in r.iter(W + "t")).strip()]
    return bool(runs) and all(r.find(W + "rPr") is not None and r.find(W + "rPr").find(W + "b") is not None for r in runs)
def pics(p):
    out = []
    for b in p.iter(A + "blip"):
        rid = b.get(R + "embed")
        if rid in rels: out.append(rels[rid])
    for im in p.iter(V + "imagedata"):
        rid = im.get(R + "id")
        if rid in rels: out.append(rels[rid])
    return out
def extent(p):
    e = next(p.iter(WP + "extent"), None)
    return (int(e.get("cx")) // 9525, int(e.get("cy")) // 9525) if e is not None else (0, 0)
cur = None; head = ""; last = ""; figs = []; seen_lessons = []; pos = [-1, -1, -1]
intbl = {id(p) for tbl in body.iter(W + "tbl") for p in tbl.iter(W + "p")}   # the lesson-plan header tables repeat the element names
def advance(k):
    """Move the outline position forward when this paragraph is the next matching outline title."""
    o = outline.get(cur) or []
    i, j, l = pos
    if i >= 0:
        subs = o[i][1]
        if j >= 0:
            for n in range(l + 1, len(subs[j][1])):
                if norm(subs[j][1][n]) == k: pos[2] = n; return
        for n in range(j + 1, len(subs)):
            if norm(subs[n][0]) == k: pos[1] = n; pos[2] = -1; return
    for n in range(i + 1, len(o)):
        if norm(o[n][0]) == k: pos[0] = n; pos[1] = -1; pos[2] = -1; return
for p in body.iter(W + "p"):
    t = ptext(p)
    if t:
        k = norm(t)
        if k in tmap and "\t" not in "".join(x.text or "" for x in p.iter(W + "t")) and not re.search(r"\d+$", t):
            cur = tmap[k]; head = ""; last = ""; seen_lessons.append(cur); pos = [-1, -1, -1]
            continue
        if cur:
            style = p.find(W + "pPr"); sid = style.find(W + "pStyle").get(W + "val") if style is not None and style.find(W + "pStyle") is not None else ""
            if pbold(p) or sid.lower().startswith("heading"): head = t
            last = t
            if id(p) not in intbl: advance(k)
    for target in pics(p):
        banner = re.match(r"^[IVX]+\. [A-Z]", t or last or "") and not re.match(r"^[IVX]+\.[A-Z]", t or last or "")   # area divider pages
        if cur and not banner and not target.lower().endswith((".emf", ".wmf")):
            figs.append({"lesson": cur, "path": "-".join(str(n + 1) for n in pos if n >= 0), "head": head, "prev": last[:200], "own": t[:200], "src": target, "wh": extent(p)})
print("lessons found:", len(dict.fromkeys(seen_lessons)), "of", len(titles), "| figures:", len(figs))
missing = [t for i, t in titles if i not in seen_lessons]; print("lessons not found:", missing)
ext = {}
for f in figs: ext[os.path.splitext(f["src"])[1].lower()] = ext.get(os.path.splitext(f["src"])[1].lower(), 0) + 1
print("types:", ext, "| total bytes:", sum(z.getinfo("word/" + f["src"]).file_size for f in figs))
per = {}
for f in figs: per[f["lesson"]] = per.get(f["lesson"], 0) + 1
print("per lesson:", per)
if dry:
    for f in figs[:40]: print(f["lesson"][5:22], "|", f["path"], "|", f["head"][:40], "|", f["prev"][:50], "|", f["src"], f["wh"])
    print("no outline position:", sum(1 for f in figs if not f["path"]))
    sys.exit()
out_dir = os.path.join(root, "cfi", "assets", "cfii"); os.makedirs(out_dir, exist_ok=True)
import tempfile
for f in figs:
    data = z.read("word/" + f["src"]); e = os.path.splitext(f["src"])[1].lower()
    name = hashlib.sha1(data).hexdigest()[:16] + ".webp"
    path = os.path.join(out_dir, name)
    if not os.path.exists(path):   # shrink: WebP, at most 1400 px wide
        with tempfile.NamedTemporaryFile(suffix=e, delete=False) as tf: tf.write(data)
        w = int(subprocess.check_output(["sips", "-g", "pixelWidth", tf.name]).split()[-1])
        cmd = ["cwebp", "-quiet", "-q", "82"] + (["-resize", "1400", "0"] if w > 1400 else []) + [tf.name, "-o", path]
        subprocess.check_call(cmd); os.unlink(tf.name)
    f["file"] = name; del f["src"]
json.dump(figs, open(os.path.join(here, "figs.json"), "w"), indent=0)
print("wrote", len(set(f["file"] for f in figs)), "files")
