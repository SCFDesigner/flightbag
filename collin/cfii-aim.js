/* AIM Augmentation: shared rendering for the CFII Oral deck sheet (cfii-oral.html) and the
   inline page (cfii-aim.html). Data: window.CFII_AIM from cfii-aim-data.js (verbatim AIM text).
   window.CFIIAim = { load(), list(sid, ci), lesson(sid), html(list), edition(), anchor(sid, ci) } */
(function () {
'use strict';
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const D = () => window.CFII_AIM;
const KIND = /\s(NOTE|REFERENCE|EXAMPLE|PHRASEOLOGY|CAUTION|WARNING)$/;
const core = lab => (lab || '').replace(KIND, '');
const depth = lab => { const c = core(lab); if (!c) return 0; return (c.match(/\.|\(/g) || []).length; };

let loading = null;
/* lazy-load the data file once (the deck calls this on the first AIM tap) */
function load(src) {
  if (D()) return Promise.resolve(D());
  if (loading) return loading;
  loading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src || 'cfii-aim-data.js';
    s.onload = () => D() ? res(D()) : rej(new Error('cfii-aim-data.js loaded without CFII_AIM'));
    s.onerror = () => { loading = null; rej(new Error('could not load ' + s.src)); };
    document.head.appendChild(s);
  });
  return loading;
}

/* excerpts for one script card: [[pid, [block, ...]], ...] */
function list(sid, ci) { const m = D() && D().map[sid]; return (m && m[String(ci)]) || []; }

/* L1 lesson card: union of its topics' excerpts, one entry per paragraph, blocks in AIM order */
function lesson(sid) {
  const m = (D() && D().map[sid]) || {}, by = new Map();
  Object.keys(m).sort((a, b) => a - b).forEach(ci => m[ci].forEach(([pid, bl]) => {
    const set = by.get(pid) || new Set(); bl.forEach(b => set.add(b)); by.set(pid, set);
  }));
  return [...by].map(([pid, set]) => [pid, [...set].sort((a, b) => a - b)]);
}

function blockText(t) {
  const one = s => esc(s).replace(/ {3,}/g, ' <span class="aim-sep">&middot;</span> ');
  return Array.isArray(t) ? t.map(one).join(' <span class="aim-gap" title="figure omitted">&hellip;</span> ') : one(t);
}

/* HTML for a list of excerpts */
function html(lst) {
  const P = D().paras;
  return lst.map(([pid, bl]) => {
    const p = P[pid]; if (!p) return '';
    const labs = bl.map(b => core(p.b[b][0])).filter(Boolean);
    const first = labs[0] || '', last = labs[labs.length - 1] || '';
    const ref = 'AIM ' + pid + (first ? ' ' + first : '') + (last && last !== first ? ' &ndash; ' + last : '');
    let prev = null, body = '';
    bl.forEach(b => {
      const [lab, txt] = p.b[b];
      if (prev != null && b > prev + 1) body += '<div class="aim-skip" aria-label="paragraphs omitted">&hellip;</div>';
      const k = (lab.match(KIND) || [])[1];
      body += '<p class="aim-p' + (k ? ' aim-note' : '') + '" style="--d:' + Math.min(depth(lab), 3) + '">' + blockText(txt) + '</p>';
      prev = b;
    });
    return '<section class="aim-x"><div class="aim-h"><span class="aim-ref">' + ref + '</span><span class="aim-t">' + esc(p.t) + '</span></div>' + body + '</section>';
  }).join('');
}

function edition() {
  const e = D().edition;
  return 'AIM ' + esc(e.edition) + ', effective ' + esc(e.effective) + ' &middot; Change: ' + esc(e.change.split(' (')[0].toLowerCase()) + '. Quoted verbatim; paragraph numbers as of this edition.';
}
const anchor = (sid, ci) => sid + (ci == null ? '' : '-' + ci);

/* excerpt styles (one copy for both pages) */
const CSS = '.aim-x{margin:0 0 18px}.aim-x:last-child{margin-bottom:0}' +
  '.aim-h{display:flex;flex-wrap:wrap;gap:2px 10px;align-items:baseline;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--fb-rim,var(--fb-border))}' +
  '.aim-ref{font-family:var(--fb-mono);font-size:13px;color:var(--fb-accent)}' +
  '.aim-t{font-size:13px;color:var(--fb-dim)}' +
  '.aim-p{font-size:15px;line-height:1.55;color:var(--fb-bright);margin:0 0 8px;padding-left:calc(var(--d,0) * 10px);overflow-wrap:anywhere}' +
  '.aim-note{font-size:14px;color:var(--fb-text)}' +
  '.aim-skip{color:var(--fb-dim);margin:-2px 0 6px;letter-spacing:2px}' +
  '.aim-sep,.aim-gap{color:var(--fb-dim)}';
const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

window.CFIIAim = { load, list, lesson, html, edition, anchor };
})();
