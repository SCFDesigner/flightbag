/* Builds cfi/cfii-scripts.js — the CFII "My Script" tab of the binder.
   Per lesson: the PTS task elements (FAA-S-8081-9E, public domain; text extract beside this file, from
   `pdftotext -layout`) + the condensed script cards of collin/cfii-oral-data.js (condensed from the eBook)
   + FAA Chart Users' Guide figures on the cards named in faa-figs.json.
   Lessons and deck sections are both in eBook order, so they pair by position (codes are checked).
   Run: node tools/cfii-scripts/build.js */
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "..", "..");
global.window = {};
eval(fs.readFileSync(path.join(root, "collin/cfii-oral-data.js"), "utf8")); const deck = window.CFII_ORAL;
eval(fs.readFileSync(path.join(root, "cfi/cfii.js"), "utf8")); const lessons = window.CFII_DATA.aoes.flatMap(a => a.lessons);
if (deck.length !== lessons.length) throw new Error(`deck ${deck.length} vs lessons ${lessons.length}`);

/* ---- PTS: area notes + task objective / elements ---- */
const L = fs.readFileSync(path.join(__dirname, "fii-pts-8081-9E.txt"), "utf8").replace(/\f/g, "\n").replace(/[\uE000-\uF8FF]/g, "—").split("\n"); /* private-use glyph = the PDF's dash */
const start = L.findIndex(x => /^\s*I\.\s+AREA OF OPERATION:\s+FUNDAMENTALS/.test(x));
const pts = {}; let area = null, task = null, inObj = false, noteFor = null;
const junk = x => !x.trim() || /^\s*\d+\s*$/.test(x) || /FAA-S-8081-9E/.test(x);
for (let i = start; i < L.length; i++) {
  const x = L[i]; if (junk(x)) continue; const s = x.trim();
  if (/^APPENDIX|^Appendix \d/.test(s)) break;
  let m;
  if ((m = s.match(/^([IVXl]+)\.\s+AREA OF OPERATION:/))) { area = m[1].replace(/l/g, "I"); task = null; inObj = false; pts[area] = { note: "", tasks: {} }; noteFor = null; continue; }
  if (!area) continue;
  if ((m = s.match(/^([A-Z])\.\s+TASK:\s*(.*)/))) { task = pts[area].tasks[m[1]] = { name: m[2], obj: "", items: [], note: "" }; inObj = false; noteFor = null; continue; }
  if (/^NOTE:/.test(s)) { noteFor = task || pts[area]; noteFor.note += (noteFor.note ? " " : "") + s; continue; }
  if (!task) { if (noteFor === pts[area] && !/^[A-Z]{2,}/.test(s)) pts[area].note += " " + s; continue; }
  if (/^REFERENCES?:/.test(s)) { inObj = false; noteFor = null; continue; }
  if ((m = s.match(/^Objective\.\s*(.*)/))) { inObj = true; noteFor = null; task.obj = m[1]; continue; }
  if (!inObj) { if (noteFor === task) task.note += " " + s; continue; }
  if ((m = s.match(/^(\d+)\.\s+(.*)/))) { task.items.push({ t: m[2], sub: [] }); continue; }
  if ((m = s.match(/^([a-z])\.\s+(.*)/)) && task.items.length) { task.items[task.items.length - 1].sub.push(m[2]); continue; }
  const it = task.items[task.items.length - 1];
  if (!it) task.obj += " " + s; else if (it.sub.length) it.sub[it.sub.length - 1] += " " + s; else it.t += " " + s;
}

/* ---- figures (figs.json from figs.py): each one sits under an outline heading of the eBook lesson ---- */
const FIGS = fs.existsSync(path.join(__dirname, "figs.json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, "figs.json"), "utf8")) : [];
const STOP = new Set("the and for are that this with from when your will not but all can has have was were into than then its it of to in on at by or an is as be if".split(" "));
const toks = s => String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
function pathTitles(l, p) { const o = l.outline || [], [i, j, k] = p.split("-").map(n => +n - 1); const a = o[i], b = a && (a.k || [])[j], c = b && (b.k || [])[k]; return [a && a.t, b && b.t, c && c.t].filter(Boolean); }
/* put each figure on a script card: best word overlap with the card, keeping the eBook's order (figures never jump backwards) */
function placeFigs(l, cards, figs) {
  if (!figs.length || !cards.length) return;
  const ct = cards.map(c => ({ h: new Set(toks(c.h)), b: new Set(toks(c.obj + " " + c.pts.join(" "))) }));
  const score = (f, c) => { const t = [...new Set([...pathTitles(l, f.path).flatMap(toks), ...toks(f.head), ...toks(f.own || f.prev)])]; let s = 0; t.forEach(w => { if (ct[c].h.has(w)) s += 3; else if (ct[c].b.has(w)) s += 1; }); return s / Math.sqrt(t.length || 1); };
  const n = figs.length, m = cards.length, best = [], from = [];
  for (let f = 0; f < n; f++) { best.push([]); from.push([]); let run = -1, arg = 0;
    for (let c = 0; c < m; c++) { const prev = f ? best[f - 1][c] : 0; if (prev > run) { run = prev; arg = c; } best[f][c] = score(figs[f], c) + (f ? run : 0); from[f][c] = arg; } }
  let c = best[n - 1].indexOf(Math.max(...best[n - 1]));
  for (let f = n - 1; f >= 0; f--) { const card = cards[c], g = figs[f]; card.figs = card.figs || []; if (!card.figs.some(x => x.f === g.file)) card.figs.unshift({ f: g.file, w: g.wh[0], h: g.wh[1], cap: g.head }); c = from[f][c]; }
}
const FAA = JSON.parse(fs.readFileSync(path.join(__dirname, "faa-figs.json"), "utf8")); let faaCount = 0;
/* ---- Figures tab: every figure of a lesson by section. eBook figures come from cfi/cfii-full.js (full.py) grouped
   under their top heading and second-level title; FAA chart sets (faa-figs.json _gallery) follow. ---- */
const FULL = (() => { const f = path.join(root, "cfi/cfii-full.js"); if (!fs.existsSync(f)) return {}; const w = {}; new Function("window", fs.readFileSync(f, "utf8"))(w); return w.CFII_FULL || {}; })();
const GROUPS = (() => { const s = fs.readFileSync(path.join(root, "ifr/data.js"), "utf8"), a = s.indexOf("const SYMBOL_GROUPS = ["), b = s.indexOf("\n];", a);
  if (a < 0 || b < 0) throw new Error("SYMBOL_GROUPS not found in ifr/data.js"); const g = new Function(s.slice(a, b + 3) + "; return SYMBOL_GROUPS;")().concat(FAA._gallery_extra || []); return Object.fromEntries(g.map(x => [x.id, x])); })();
const plain = t => String(t || "").replace(/\*\*/g, "").trim();
const clip = (t, n) => { t = plain(t); return t.length > n ? t.slice(0, n - 1).trim() + "…" : t; };
function gallery(l) {
  const secs = []; let sec = null, sub = null, h1 = "", h2 = "", last = "";
  (FULL[l.id] || []).forEach(n => {
    if (n[1] === 1) { h1 = plain(n[2]); h2 = ""; last = ""; sec = null; sub = null; return; }
    if (n[1] === 5) {
      n[2].forEach(([f, w]) => {
        if (w && w < 60) return;                                     // inline chart symbols, not figures
        if (!sec) secs.push(sec = { t: h1 || "Introduction", sub: [] });
        if (!sub || sub.t !== h2) sec.sub.push(sub = { t: h2, figs: [] });
        if (!sub.figs.some(x => x.f === f)) { const cap = last && last !== h2 ? clip(last, 110) : ""; sub.figs.push(cap ? { f, w, cap } : { f, w }); }
      });
      return;
    }
    if (typeof n[2] !== "string") return;
    if (n[0] === 2 && n[1] === 0) { h2 = clip(n[2], 80); sub = null; }
    if (n[1] !== 3) last = n[2];                                     // a note ("see lesson ...") is not a caption
  });
  (FAA._gallery[l.id] || []).forEach(id => {
    const g = GROUPS[id]; if (!g) throw new Error(`faa-figs _gallery: no group "${id}" (${l.id})`);
    const figs = g.cards.filter(c => c.img).map(c => { if (!fs.existsSync(path.join(root, "ifr/img", c.img + ".png"))) throw new Error("missing ifr/img/" + c.img + ".png"); return { src: "../ifr/img/" + c.img + ".png", w: 520, cap: c.t, d: c.d }; });
    secs.push({ t: g.chart + ": " + g.t, faa: 1, sub: [{ t: "", figs }] });
  });
  return secs;
}
const NUM = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };
/* required TASKs: the letters the area NOTE names ("shall select TASKS A and D and ..."); an area with one task is required too */
function requiredLetters(A) { const m = (A.note || "").match(/shall select (?:at least )?TASKS? ((?:[A-H](?:, and |, | and )?)+)/); const named = m ? m[1].match(/[A-H]/g) : []; const all = Object.keys(A.tasks); return all.length === 1 ? all : named; }

/* ---- pair lessons with deck sections, attach PTS task by code ---- */
const out = {}, miss = [];
lessons.forEach((l, i) => {
  const d = deck[i], code = (l.title.match(/^([IVX]+)\.([A-Z\-+]+)\./) || []).slice(1);
  if (d.id.replace(/\+$/, "").split(".")[0] !== code[0]) throw new Error(`order mismatch: ${l.title} vs ${d.id}`);
  const single = code[1] && /^[A-H]$/.test(code[1]) && !/Additional|Weather Theory/.test(l.title);
  const A = pts[code[0]], T = single && A ? A.tasks[code[1]] : null;
  if (single && !T && +({ I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 }[code[0]] || 99) <= 10) miss.push(l.title);
  const arr = v => v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
  const myFigs = FIGS.filter(f => f.lesson === l.id), ofigs = {};
  myFigs.forEach(f => { const a = ofigs[f.path || "0"] = ofigs[f.path || "0"] || []; if (!a.some(x => x.f === f.file)) a.push({ f: f.file, w: f.wh[0], h: f.wh[1], cap: f.head }); });
  out[l.id] = {
    req: !!(T && requiredLetters(A).includes(code[1])), ofigs,
    pts: T ? { task: `${code[0]}.${code[1]} ${T.name}`, area: (A.note || "").trim(), note: (T.note || "").trim(), obj: T.obj.trim(), items: T.items } : null,
    intro: d.intro || "", key: d.key || [],
    cards: d.cards.filter(c => c.t === "s").map(c => ({ h: c.h, obj: c.obj || "", pts: c.pts || [], ce: arr(c.ce) })),
    recall: d.cards.filter(c => c.t === "r").map(c => [arr(c.q), arr(c.a)])
  };
  placeFigs(l, out[l.id].cards, myFigs);
  out[l.id].gal = gallery(l);
  /* FAA Chart Users' Guide figures (faa-figs.json): fixed to a card by its heading, after the eBook's own */
  Object.entries(FAA[l.id] || {}).forEach(([h, list]) => {
    const card = out[l.id].cards.find(c => c.h === h); if (!card) throw new Error(`faa-figs: no card "${h}" in ${l.id}`);
    list.forEach(([name, cap]) => { if (!fs.existsSync(path.join(root, "ifr/img", name + ".png"))) throw new Error("faa-figs: missing ifr/img/" + name + ".png"); (card.figs = card.figs || []).push({ src: "../ifr/img/" + name + ".png", w: 520, cap }); faaCount++; });
  });
});
fs.writeFileSync(path.join(root, "cfi/cfii-scripts.js"),
  "/* Generated by tools/cfii-scripts/build.js — do not edit by hand. CFII \"My Script\": PTS elements + condensed script per lesson. */\nwindow.CFII_SCRIPTS = " + JSON.stringify(out) + ";\n");
const withPts = Object.values(out).filter(o => o.pts);
console.log("lessons", lessons.length, "| with PTS task", withPts.length, "| PTS tasks parsed", Object.values(pts).reduce((n, a) => n + Object.keys(a.tasks).length, 0), "| missing", miss);
console.log("areas:", Object.entries(pts).map(([k, a]) => k + ":" + Object.keys(a.tasks).join("")).join(" "));

console.log("required:", lessons.filter(l => out[l.id].req).map(l => l.title.split(" ")[0]).join(" "));
console.log("figures placed on cards:", Object.values(out).reduce((n, o) => n + o.cards.reduce((k, c) => k + (c.figs || []).length, 0), 0), "| under outline headings:", Object.values(out).reduce((n, o) => n + Object.values(o.ofigs).reduce((k, a) => k + a.length, 0), 0));
console.log("FAA chart figures:", faaCount);
{ const g = Object.values(out).map(o => o.gal.reduce((n, x) => n + x.sub.reduce((k, y) => k + y.figs.length, 0), 0)); console.log("Figures tab:", g.reduce((a, b) => a + b, 0), "figures |", g.filter(n => n).length, "lessons with figures"); }
const iia = out["cfii-ii-a-instruments-nav-equipment"]; console.log(iia.cards.map(c => c.h.slice(0, 26) + ":" + (c.figs || []).map(f => f.cap.slice(0, 14)).join("/")).join("\n"));
console.log("empty item lists:", withPts.filter(o => !o.pts.items.length).map(o => o.pts.task));
