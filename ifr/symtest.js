/* Symbology Quick Test — one chart symbol, three choices, built for speed.
   Wrong answers come from the same look-alike family (SYM_TEST[].f in data.js), and the first one is the
   closest twin (VOR vs VOR compulsory, NDB vs NDB/DME, minimum vs maximum altitude…).
   IFRSymTest.mount(el, {img: "img/sym/"}). Keys: 1/2/3 answer · Enter/Space next · Esc back to setup.
   Per-symbol stats in localStorage "ifr-symtest" weight later rounds toward misses and slow answers. */
(() => {
  const KEY = "ifr-symtest", PREFS = "ifr-symtest-prefs";
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const stem = id => id.replace(/-(c|lf|g|d|dir)$/, "").split("-")[0];

  const CSS = `
.st{display:grid;gap:14px;max-width:640px;margin:0 auto;width:100%}
.st-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.st-top .st-sp{flex:1}
.st-chips{display:flex;flex-wrap:wrap;gap:6px}
.st-chip{font:500 12px var(--fb-font);padding:5px 11px;border-radius:999px;border:1px solid var(--fb-rim);background:var(--fb-cell);color:var(--fb-text);cursor:pointer}
.st-chip[aria-pressed="true"]{color:var(--fb-accent);border-color:color-mix(in srgb,var(--fb-accent) 55%,transparent);background:var(--fb-panel)}
.st-chip small{font-family:var(--fb-mono);color:var(--fb-dim);margin-left:4px}
.st-card{padding:18px;display:grid;gap:14px;border-radius:14px}
.st-meta{display:flex;gap:14px;align-items:center;font:500 12px var(--fb-mono);color:var(--fb-dim)}
.st-meta b{color:var(--fb-bright);font-weight:600}
.st-bar{height:4px;border-radius:2px;background:var(--fb-well);overflow:hidden}
.st-bar i{display:block;height:100%;background:var(--fb-accent);transition:width .25s}
.st-sym{background:#fff;border-radius:10px;height:clamp(130px,26vh,190px);display:flex;align-items:center;justify-content:center;padding:14px;box-shadow:inset 0 2px 6px rgba(0,0,0,.25)}
.st-sym img{max-height:100%;max-width:100%;width:auto;height:auto;image-rendering:auto}
.st-q{margin:0;font:500 11px var(--fb-font);letter-spacing:2px;text-transform:uppercase;color:var(--fb-dim);text-align:center}
.st-opts{display:grid;gap:8px}
.st-opt{display:grid;grid-template-columns:26px 1fr;gap:10px;align-items:center;text-align:left;width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--fb-border);
  background:var(--fb-cell);color:var(--fb-bright);font:500 15px/1.3 var(--fb-font);cursor:pointer;transition:border-color .12s,background .12s}
.st-opt:hover:not(:disabled){border-color:var(--fb-accent)}
.st-opt kbd{font:600 12px var(--fb-mono);color:var(--fb-dim);border:1px solid var(--fb-rim);border-radius:5px;text-align:center;padding:2px 0}
.st-opt.ok{border-color:var(--fb-ok);background:color-mix(in srgb,var(--fb-ok) 18%,var(--fb-cell))}
.st-opt.bad{border-color:var(--fb-bad);background:color-mix(in srgb,var(--fb-bad) 18%,var(--fb-cell))}
.st-opt:disabled{cursor:default}
.st-why{border-radius:10px;padding:10px 12px;background:var(--fb-well);border:1px solid var(--fb-well-rim);font-size:13.5px;line-height:1.45;color:var(--fb-text);display:grid;gap:6px}
.st-why b{color:var(--fb-bright)}
.st-why .no{color:var(--fb-bad)} .st-why .yes{color:var(--fb-ok)}
.st-actions{display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap}
.st-hint{font:500 11px var(--fb-mono);color:var(--fb-dim)}
.st-big{font:600 40px/1 var(--fb-mono);color:var(--fb-bright)}
.st-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.st-stat{background:var(--fb-cell);border-radius:10px;padding:10px 12px;display:grid;gap:4px}
.st-stat span{font:500 10px var(--fb-font);letter-spacing:2px;text-transform:uppercase;color:var(--fb-dim)}
.st-stat b{font:600 22px var(--fb-mono);color:var(--fb-bright)}
.st-miss{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center;padding:8px;border-radius:10px;background:var(--fb-cell)}
.st-miss .im{background:#fff;border-radius:6px;height:56px;display:flex;align-items:center;justify-content:center;padding:4px}
.st-miss img{max-height:48px;max-width:100%}
.st-miss div{font-size:13px;line-height:1.4;color:var(--fb-text)} .st-miss div b{color:var(--fb-bright)}
.st-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.st-row label{font:500 12px var(--fb-font);color:var(--fb-dim);display:flex;gap:6px;align-items:center}
.st-row select{font:inherit;color:var(--fb-bright);background:var(--fb-well);border:1px solid var(--fb-well-rim);border-radius:8px;padding:5px 8px}
@media (prefers-reduced-motion: reduce){.st-bar i,.st-opt{transition:none}}
`;

  function mount(root, opts = {}) {
    const IMG = opts.img || "img/sym/";
    if (!document.getElementById("st-css")) { const s = document.createElement("style"); s.id = "st-css"; s.textContent = CSS; document.head.appendChild(s); }
    const bank = SYM_TEST, byId = Object.fromEntries(bank.map(x => [x.id, x]));
    const groups = ["All", ...new Set(bank.map(x => x.g))];
    const stats = load(KEY, {});
    const prefs = Object.assign({ group: "All", len: 20, auto: true }, load(PREFS, {}));
    let round = null, timer = null;
    root.classList.add("st");

    /* weight: unseen 3, each miss +2, slow (>3 s avg) +1, mastered (≥3 right, no recent miss) 0.4 */
    const weight = x => { const s = stats[x.id]; if (!s) return 3; let w = 1 + 2 * (s.n - s.c) / Math.max(1, s.n) * 3 + (s.ms / Math.max(1, s.n) > 3000 ? 1 : 0); if (s.c >= 3 && !s.lastMiss) w *= 0.4; return w; };
    function pick(pool, n) {
      const out = [], p = pool.slice();
      while (out.length < n && p.length) { const tot = p.reduce((a, x) => a + weight(x), 0); let r = Math.random() * tot, i = 0;
        for (; i < p.length - 1; i++) { r -= weight(p[i]); if (r <= 0) break; } out.push(p.splice(i, 1)[0]); }
      return out;
    }
    function choicesFor(x) {
      const fam = shuffle(bank.filter(y => y.f === x.f && y.id !== x.id));
      fam.sort((a, b) => (stem(b.id) === stem(x.id)) - (stem(a.id) === stem(x.id)));   // twin first
      const d = [fam[0], ...shuffle(fam.slice(1)).slice(0, 1)].filter(Boolean);
      while (d.length < 2) { const o = bank[Math.random() * bank.length | 0]; if (o.id !== x.id && !d.includes(o)) d.push(o); }
      return shuffle([x, ...d]);
    }

    function setup() {
      clearInterval(timer); round = null;
      const counts = Object.fromEntries(groups.map(g => [g, g === "All" ? bank.length : bank.filter(x => x.g === g).length]));
      const seen = bank.filter(x => stats[x.id]).length, right = bank.reduce((a, x) => a + (stats[x.id] ? stats[x.id].c : 0), 0), tries = bank.reduce((a, x) => a + (stats[x.id] ? stats[x.id].n : 0), 0);
      root.innerHTML = `<div class="st-chips" role="group" aria-label="Symbol group">${groups.map(g => `<button type="button" class="st-chip" data-g="${esc(g)}" aria-pressed="${g === prefs.group}">${esc(g)}<small>${counts[g]}</small></button>`).join("")}</div>
        <div class="st-card fb-panel">
          <div class="st-sym"><img src="${IMG}${bank[(Math.random() * bank.length) | 0].id}.png" alt=""></div>
          <p class="st-q">One symbol · three answers · the wrong ones are look-alikes</p>
          <div class="st-row"><label>Round <select class="st-len">${[10, 20, 40, 0].map(n => `<option value="${n}"${n === prefs.len ? " selected" : ""}>${n ? n + " symbols" : "All in group"}</option>`).join("")}</select></label>
            <label><input type="checkbox" class="st-auto"${prefs.auto ? " checked" : ""}> Auto-advance when right</label></div>
          <div class="st-actions"><span class="st-hint">${seen}/${bank.length} seen · ${tries ? Math.round(100 * right / tries) : 0}% all-time</span>
            <span class="st-row">${tries ? `<button type="button" class="fb-btn small st-reset">Reset stats</button>` : ""}<button type="button" class="fb-btn primary st-go">Start</button></span></div>
        </div>`;
    }

    function start(items) {
      const pool = prefs.group === "All" ? bank : bank.filter(x => x.g === prefs.group);
      items = items || pick(pool, prefs.len || pool.length);
      round = { items, i: 0, right: 0, ms: 0, streak: 0, best: 0, miss: [] };
      ask();
    }

    function ask() {
      clearInterval(timer);
      const r = round, x = r.items[r.i];
      r.choices = choicesFor(x); r.t0 = performance.now(); r.done = false;
      root.innerHTML = `<div class="st-card fb-panel">
          <div class="st-meta"><span><b>${r.i + 1}</b>/${r.items.length}</span><span>streak <b>${r.streak}</b></span><span class="st-clock">0.0 s</span><span style="margin-left:auto">${esc(x.g)}</span></div>
          <div class="st-bar"><i style="width:${100 * r.i / r.items.length}%"></i></div>
          <div class="st-sym"><img src="${IMG}${x.id}.png" alt="Chart symbol to identify"></div>
          <div class="st-opts">${r.choices.map((c, k) => `<button type="button" class="st-opt" data-k="${k}"><kbd>${k + 1}</kbd><span>${esc(c.a)}</span></button>`).join("")}</div>
          <div class="st-actions"><button type="button" class="fb-btn small st-quit">End round</button><span class="st-hint">keys 1 · 2 · 3</span></div>
        </div>`;
      const clock = root.querySelector(".st-clock");
      timer = setInterval(() => { clock.textContent = ((performance.now() - r.t0) / 1000).toFixed(1) + " s"; }, 100);
    }

    function answer(k) {
      const r = round; if (!r || r.done) return; r.done = true; clearInterval(timer);
      const x = r.items[r.i], c = r.choices[k], ok = c.id === x.id, ms = performance.now() - r.t0;
      const s = stats[x.id] || (stats[x.id] = { n: 0, c: 0, ms: 0 });
      s.n++; s.ms += ms; if (ok) { s.c++; s.lastMiss = false; } else s.lastMiss = true; save(KEY, stats);
      r.ms += ms;
      if (ok) { r.right++; r.streak++; r.best = Math.max(r.best, r.streak); } else { r.streak = 0; r.miss.push({ x, picked: c }); }
      root.querySelectorAll(".st-opt").forEach((b, i) => { b.disabled = true; if (r.choices[i].id === x.id) b.classList.add("ok"); else if (i === k) b.classList.add("bad"); });
      root.querySelector(".st-clock").textContent = (ms / 1000).toFixed(1) + " s";
      const why = document.createElement("div"); why.className = "st-why";
      why.innerHTML = ok ? `<div><span class="yes">Right.</span> ${esc(x.tip)}</div>`
        : `<div><span class="no">That's not ${esc(c.a)}.</span> It's <b>${esc(x.a)}</b>: ${esc(x.tip)}</div><div><b>${esc(c.a)}</b> looks like this instead: ${esc(c.tip)}</div>`;
      const acts = root.querySelector(".st-actions");
      acts.before(why);
      acts.innerHTML = `<button type="button" class="fb-btn small st-quit">End round</button><button type="button" class="fb-btn primary st-next">${r.i + 1 < r.items.length ? "Next" : "Results"}</button>`;
      if (ok && prefs.auto) timer = setTimeout(next, 650);
      else root.querySelector(".st-next").focus({ preventScroll: true });
    }

    function next() { clearTimeout(timer); const r = round; if (!r) return; if (r.i + 1 < r.items.length) { r.i++; ask(); } else results(); }

    function results() {
      clearInterval(timer); const r = round, n = r.done ? r.i + 1 : r.i;
      if (!n) { setup(); return; }
      const pct = Math.round(100 * r.right / n);
      root.innerHTML = `<div class="st-card fb-panel">
          <div class="st-stats"><div class="st-stat"><span>Score</span><b>${pct}%</b></div><div class="st-stat"><span>Avg time</span><b>${(r.ms / n / 1000).toFixed(1)} s</b></div><div class="st-stat"><span>Best streak</span><b>${r.best}</b></div></div>
          <div class="st-hint">${r.right} of ${n} right${r.miss.length ? " · misses below, with what you picked" : " · clean round"}</div>
          ${r.miss.map(m => `<div class="st-miss"><div class="im"><img src="${IMG}${m.x.id}.png" alt=""></div><div><b>${esc(m.x.a)}</b> — ${esc(m.x.tip)}<br><span style="color:var(--fb-bad)">You picked: ${esc(m.picked.a)}</span></div></div>`).join("")}
          <div class="st-actions"><button type="button" class="fb-btn st-setup">Change group</button><span class="st-row">${r.miss.length ? `<button type="button" class="fb-btn st-redo">Retry misses</button>` : ""}<button type="button" class="fb-btn primary st-go">New round</button></span></div>
        </div>`;
      round = { ...r, over: true };
    }

    root.addEventListener("click", e => {
      const t = e.target.closest("button, input"); if (!t) return;
      if (t.matches(".st-chip")) { prefs.group = t.dataset.g; save(PREFS, prefs); root.querySelectorAll(".st-chip").forEach(b => b.setAttribute("aria-pressed", String(b === t))); return; }
      if (t.matches(".st-auto")) { prefs.auto = t.checked; save(PREFS, prefs); return; }
      if (t.matches(".st-go")) { start(); return; }
      if (t.matches(".st-redo")) { const m = round.miss.map(z => z.x); start(shuffle(m)); return; }
      if (t.matches(".st-setup")) { setup(); return; }
      if (t.matches(".st-reset")) { for (const k in stats) delete stats[k]; save(KEY, stats); setup(); return; }
      if (t.matches(".st-opt")) { answer(+t.dataset.k); return; }
      if (t.matches(".st-next")) { next(); return; }
      if (t.matches(".st-quit")) { results(); return; }
    });
    root.addEventListener("change", e => { if (e.target.matches(".st-len")) { prefs.len = +e.target.value; save(PREFS, prefs); } });
    document.addEventListener("keydown", e => {
      if (!root.isConnected || root.offsetParent === null || e.target.matches?.("input[type=search], input[type=text], select, textarea")) return;
      if (!round || round.over) return;
      if (!round.done && /^[123]$/.test(e.key)) { e.preventDefault(); answer(+e.key - 1); }
      else if (round.done && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); }
      else if (e.key === "Escape") { results(); }
    });
    setup();
  }
  window.IFRSymTest = { mount };
})();
