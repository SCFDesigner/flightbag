#!/usr/bin/env python3
"""Turn the site pages in this folder into claude.ai artifact sources (the artifact host adds its own
doctype/head/body, links must open in a new tab, and the theme is published alongside as theme/).
Usage: python3 make-artifact.py OUT_DIR   → writes OUT_DIR/{index.html,quick-review.html} + data.js, visuals.js, img/, theme/
Then publish OUT_DIR/index.html (IFR Atlas) and OUT_DIR/quick-review.html with their supporting files."""
import os, re, shutil, sys

ATLAS = "https://claude.ai/artifact/WbcJQHR1fK4V8cEgHP2pLU"
REVIEW = "https://claude.ai/artifact/QbL5YWdjHBBCKdRdNrmGqW"
EXT = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/></svg>'
here = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]
os.makedirs(out, exist_ok=True)

for name in ("index.html", "quick-review.html"):
    s = open(os.path.join(here, name)).read()
    head = re.search(r"<head>(.*)</head>", s, re.S).group(1)
    body = re.search(r'<body class="fb">(.*)</body>', s, re.S).group(1)
    head = re.sub(r'<meta charset="UTF-8">\n|<meta name="viewport"[^>]*>\n|<style>body\{margin:0\}img\{max-width:100%\}</style>\n', "", head).strip("\n")
    head = head.replace("../theme/", "theme/").replace('<link rel="stylesheet" href="theme/flightbag-theme.css">',
        '<link rel="stylesheet" href="theme/flightbag-theme.css">\n<script>document.body.classList.add("fb")</script>')
    body = body.replace('<a class="fb-home" href="../index.html">', '<a class="fb-home" href="https://scfdesigner.github.io/flightbag/">')
    body = body.replace('href="quick-review.html">Quick review</a>', f'href="{REVIEW}" target="_blank" rel="noopener">Quick review {EXT}</a>')
    body = body.replace('href="index.html">Concept map</a>', f'href="{ATLAS}" target="_blank" rel="noopener">Concept map {EXT}</a>')
    open(os.path.join(out, name), "w").write(head + "\n" + body.strip("\n") + "\n")

for f in ("data.js", "visuals.js"):
    shutil.copy(os.path.join(here, f), out)
shutil.copytree(os.path.join(here, "img"), os.path.join(out, "img"), dirs_exist_ok=True)
shutil.copytree(os.path.join(here, "..", "theme"), os.path.join(out, "theme"), dirs_exist_ok=True)
print("wrote", out)
