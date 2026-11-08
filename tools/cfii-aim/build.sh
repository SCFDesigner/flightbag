#!/bin/sh
# AIM Augmentation for the CFII Oral deck: rebuild collin/cfii-aim-data.js + cfii-aim-index.js from the AIM PDF.
# usage: tools/cfii-aim/build.sh /path/to/aim.pdf [workdir]
#  1. pdftotext -layout, each page cropped into its left and right column (reading order L then R)
#  2. pdftohtml -xml gives font/colour/position: figure labels (Helvetica, AvantGarde, non-black text) and
#     full-width lines crossing the column gutter are blanked from the column text (aimfilter.py)
#  3. aimbuild.py splits the text into AIM paragraphs (5-3-8) and subparagraph blocks with labels (j.2(a))
#  4. merge.py applies parts/*.json (section -> card index -> [{p: paragraph, b: [block indices]}]) and writes the data
#  5. check.py: every quoted string must be verbatim in the extraction (exit 1 otherwise)
# Mapping helpers for editing parts/*.json: aimshow.py 5-3-8, aimgrep.py 'regex', deckdump.py VII.B, partcheck.py parts/x.json
# Pages: python3 -I with AIMDIR=<workdir>. Needs poppler (pdftotext, pdftohtml), python3, node.
set -e
PDF="$1"; W="${2:-/tmp/cfii-aim-extract}"; D="$(cd "$(dirname "$0")" && pwd)"; R="$D/../.."
[ -f "$PDF" ] || { echo "usage: $0 aim.pdf [workdir]"; exit 2; }
mkdir -p "$W/cols"
N=$(pdfinfo "$PDF" | awk '/^Pages:/{print $2}')
seq 1 "$N" | xargs -P 8 -I{} sh -c 'pdftotext -q -layout -f {} -l {} -x 0 -y 50 -W 306 -H 692 "$0" "$1/cols/{}L.txt"; pdftotext -q -layout -f {} -l {} -x 306 -y 50 -W 306 -H 692 "$0" "$1/cols/{}R.txt"' "$PDF" "$W"
pdftohtml -q -xml -i "$PDF" "$W/full" >/dev/null 2>&1
pdftotext -q "$PDF" "$W/aim_raw.txt"; pdftotext -q -raw "$PDF" "$W/aim_rawmode.txt"
export AIMDIR="$W"
python3 -I "$D/aimfilter.py" "$W/full.xml" "$W/cols" "$W/colsf"
python3 -I "$D/aimbuild.py" "$W/colsf" "$W"; python3 -I "$D/aimbuild.py" "$W/colsf" "$W"   # 2nd pass: hyphen rule uses the corpus
python3 -I "$D/aimflags.py"
python3 -I "$D/merge.py" "$R/collin/cfii-aim-data.js"
python3 -I "$D/check.py" "$R/collin/cfii-aim-data.js" "$R/collin/cfii-oral-data.js"
