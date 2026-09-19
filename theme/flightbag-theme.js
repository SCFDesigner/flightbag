// Flight Bag theme runtime (pairs with flightbag-theme.css). Generates the panel grain tile and
// positions one page-wide soft light: every .fb-panel shows the same viewport-sized gradient shifted
// by its own on-screen position, so the light is continuous across panels (CSS fixed backgrounds
// render per element). Started from the My Stuff dashboard's look (config.look, 2026-09-17); retuned 2026-09-18.
(() => {
  // Tuned with ?tune on 2026-09-18 (light moved up-left, softer glass).
  const DEFAULTS = { grain: 0.1, grainScale: 1, edge: 0.2, lampAmt: 0.07, lampX: 0.39, lampY: 0.03, lampRadius: 0.68, lampMid: 0.5, lampShadow: 0.5,
    // glass (readouts): glare strength (× lampAmt) and size (× screen height); edge sheen strength (× glare) and reach (× glare size)
    glareAmt: 1.1, glareSize: 0.78, sheenAmt: 0.35, sheenReach: 2.5, sheenStart: 0.22, btnSheen: 0.1, btnRim: 1 };
  // Local overrides from the ?tune panel (this browser only; Copy hands them over to bake in as DEFAULTS)
  const TUNE_KEY = 'fbLookTune';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(TUNE_KEY) || '{}') || {}; } catch (e) {}
  const LOOK = Object.assign({}, DEFAULTS, saved);
  const root = document.documentElement.style;

  function grainTile() {
    const dpr = window.devicePixelRatio || 1, n = 128, scale = LOOK.grainScale;
    const small = document.createElement('canvas');
    small.width = small.height = n;
    const sctx = small.getContext('2d');
    const img = sctx.createImageData(n, n);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 128 + (Math.random() - 0.5) * 256;
      img.data[i + 3] = Math.round(255 * LOOK.grain);
    }
    sctx.putImageData(img, 0, 0);
    const big = document.createElement('canvas');
    big.width = big.height = Math.round(n * scale * dpr);
    const bctx = big.getContext('2d');
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(small, 0, 0, big.width, big.height);
    root.setProperty('--fb-grain', `url(${big.toDataURL()})`);
    root.setProperty('--fb-grain-size', `${n * scale}px`);
  }

  function lamp() {
    const vw = window.innerWidth, vh = window.innerHeight, a = LOOK.lampAmt;
    const R = Math.hypot(vw, vh) * LOOK.lampRadius, sh = Math.round(128 * (1 - LOOK.lampShadow)), mid = 4 + LOOK.lampMid * 96;
    root.setProperty('--fb-lamp', `radial-gradient(circle ${Math.round(R)}px at ${Math.round(vw * LOOK.lampX)}px ${Math.round(vh * LOOK.lampY)}px, rgba(255,255,255,${a}) 4%, rgba(128,128,128,${a}) ${mid.toFixed(1)}%, rgba(${sh},${sh},${sh},${a}) 100%)`);
    root.setProperty('--fb-lamp-size', `${vw}px ${vh}px`);
    // Glass (.fb-glass) reflects the same lamp: one glare centred on it that fades to nothing ~¾ of a
    // screen height away, so glass near the light shows a sheen and glass far from it stays dark.
    // sized from the screen height (not the diagonal) so it falls off visibly on wide screens too
    const G = Math.round(Math.max(260, vh * LOOK.glareSize)), g = LOOK.lampAmt * LOOK.glareAmt;
    const stop = (k, p) => `rgba(255,255,255,${(g * k).toFixed(3)}) ${p}%`;
    root.setProperty('--fb-glare', `radial-gradient(circle ${G}px at ${Math.round(vw * LOOK.lampX)}px ${Math.round(vh * LOOK.lampY)}px, ${stop(1, 0)}, ${stop(0.55, 40)}, ${stop(0.25, 72)}, ${stop(0, 100)})`);
    glass = { x: vw * LOOK.lampX, y: vh * LOOK.lampY, reach: G * LOOK.sheenReach, amt: g * LOOK.sheenAmt };
  }
  let glass = { x: 0, y: 0, reach: 1, amt: 0 };
  // Per glass element: a sheen on the edge that faces the lamp, fading with distance from it — this is
  // what makes each pane read as lit from one direction (the glare alone is nearly flat across a tile).
  function sheen(el, r) {
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = glass.x - cx, dy = glass.y - cy;
    const k = glass.amt * Math.max(0, 1 - Math.hypot(dx, dy) / glass.reach);
    if (k < 0.004) { el.style.setProperty('--fb-sheen', 'none'); return; }
    const deg = Math.round(Math.atan2(dx, -dy) * 180 / Math.PI);          // CSS angle pointing at the lamp
    const s0 = Math.round(LOOK.sheenStart * 100), s1 = Math.round(s0 + (100 - s0) * 0.62);
    el.style.setProperty('--fb-sheen', `linear-gradient(${deg}deg, rgba(255,255,255,0) ${s0}%, rgba(255,255,255,${(k * 0.35).toFixed(3)}) ${s1}%, rgba(255,255,255,${k.toFixed(3)}) 100%)`);
  }

  let frame = 0;
  function place() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      // pages can light extra glass by selector (window.FB_GLASS), for elements they render later
      const glassSel = '.fb-glass' + (window.FB_GLASS ? ', ' + window.FB_GLASS : '');
      for (const el of document.querySelectorAll('.fb-panel, ' + glassSel)) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--fb-lamp-pos', `${Math.round(-r.left - el.clientLeft)}px ${Math.round(-r.top - el.clientTop)}px`);
        if (el.matches(glassSel)) sheen(el, r);
      }
    });
  }

  // liquid-glass buttons: scales the sheen band (1 = the original .16 white)
  const btnGlass = () => { root.setProperty('--fb-btn-sheen', String(LOOK.btnSheen)); root.setProperty('--fb-btn-rim', String(LOOK.btnRim)); };
  const edge = () => root.setProperty('--fb-edge', `linear-gradient(180deg, rgba(255,255,255,${(0.06 * LOOK.edge).toFixed(3)}) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,${(0.2 * LOOK.edge).toFixed(3)}) 100%)`);
  edge(); btnGlass();
  grainTile();
  lamp();
  // Re-place when the page or any panel changes size (tabs, collapsibles, content loading). Pages that
  // move panels without resizing anything can call FlightBagTheme.place() themselves.
  const ro = new ResizeObserver(place);
  const watched = new WeakSet();
  const watch = () => { for (const el of document.querySelectorAll('.fb-panel')) if (!watched.has(el)) { watched.add(el); ro.observe(el); } };
  const start = () => { ro.observe(document.body); watch(); place(); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  window.addEventListener('resize', () => { lamp(); place(); });
  // Page scrolls always move panels; an inner scroller only matters if it contains panels.
  document.addEventListener('scroll', e => {
    const t = e.target;
    if (t === document || t === document.documentElement || t === document.body || (t.querySelector && t.querySelector('.fb-panel'))) place();
  }, { passive: true, capture: true });
  window.FlightBagTheme = { place: () => { watch(); place(); } };

  /* ---------- ?tune — sliders for the light, saved in this browser ---------- */
  const TUNE = [
    ['Light', null],
    ['lampX', 'Light X', 0, 1, 0.01], ['lampY', 'Light Y', -0.3, 1, 0.01],
    ['lampAmt', 'Panel light', 0, 0.3, 0.005], ['edge', 'Panel edge', 0, 1, 0.01],
    ['Glass readouts', null],
    ['glareAmt', 'Glare strength', 0, 6, 0.05], ['glareSize', 'Glare size', 0.2, 2, 0.01],
    ['sheenAmt', 'Edge sheen', 0, 3, 0.05], ['sheenReach', 'Sheen reach', 0.3, 3, 0.01], ['sheenStart', 'Sheen width', 0, 0.9, 0.01, true],
    ['Glass buttons', null],
    ['btnSheen', 'Button sheen', 0, 2, 0.05], ['btnRim', 'Button rim', 0, 2, 0.05],
  ];
  function tuner() {
    const box = document.createElement('div');
    box.className = 'fb-panel fb-tuner';
    box.innerHTML = `<style>
      .fb-tuner { position: fixed; right: 12px; bottom: 12px; z-index: 9999; width: 290px; max-height: 80vh; overflow: auto; padding: 12px 14px; font-size: 12px; box-shadow: 0 10px 40px rgba(0,0,0,.6); }
      .fb-tuner h4 { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--fb-dim); margin: 10px 0 6px; font-weight: 500; }
      .fb-tuner h4:first-of-type { margin-top: 0; }
      .fb-tuner label { display: grid; grid-template-columns: 96px 1fr 44px; gap: 8px; align-items: center; color: var(--fb-text); margin: 4px 0; }
      .fb-tuner input { width: 100%; accent-color: var(--fb-accent); }
      .fb-tuner output { font-family: var(--fb-mono); color: var(--fb-bright); text-align: right; }
      .fb-tuner .row { display: flex; gap: 6px; margin-top: 10px; }
      .fb-tuner .row .fb-btn { flex: 1; min-height: 30px; }
      .fb-tuner .x { position: absolute; top: 6px; right: 8px; background: none; border: 0; color: var(--fb-dim); font-size: 16px; cursor: pointer; }
    </style><button class="x" type="button" aria-label="Close">×</button>`;
    for (const [k, label, min, max, step, invert] of TUNE) {
      if (label === null) { const h = document.createElement('h4'); h.textContent = k; box.appendChild(h); continue; }
      const row = document.createElement('label');
      row.innerHTML = `<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}"><output></output>`;
      const inp = row.querySelector('input'), out = row.querySelector('output');
      // "Sheen width" reads the other way round: more width = the sheen starts earlier
      const toUi = v => invert ? (max - v + min) : v, fromUi = v => invert ? (max - v + min) : v;
      const show = () => { out.textContent = (+toUi(LOOK[k])).toFixed(step < 0.01 ? 3 : 2); };
      inp.value = toUi(LOOK[k]); show();
      inp.addEventListener('input', () => {
        LOOK[k] = +fromUi(+inp.value).toFixed(4); show();
        const diff = {}; for (const key in DEFAULTS) if (LOOK[key] !== DEFAULTS[key]) diff[key] = LOOK[key];
        try { localStorage.setItem(TUNE_KEY, JSON.stringify(diff)); } catch (e) {}
        if (k === 'edge') edge();
        if (k === 'btnSheen' || k === 'btnRim') btnGlass();
        lamp(); place();
      });
      row.dataset.key = k;
      box.appendChild(row);
    }
    const btns = document.createElement('div');
    btns.className = 'row';
    btns.innerHTML = '<button class="fb-btn" type="button" data-a="copy">Copy values</button><button class="fb-btn" type="button" data-a="reset">Reset</button>';
    box.appendChild(btns);
    btns.addEventListener('click', e => {
      const a = e.target.closest('button')?.dataset.a;
      if (a === 'reset') {
        try { localStorage.removeItem(TUNE_KEY); } catch (err) {}
        Object.assign(LOOK, DEFAULTS); edge(); btnGlass(); lamp(); place();
        box.querySelectorAll('label').forEach(l => { const d = TUNE.find(t => t[0] === l.dataset.key); const inp = l.querySelector('input'); inp.value = d[5] ? (d[3] - LOOK[d[0]] + d[2]) : LOOK[d[0]]; l.querySelector('output').textContent = (+inp.value).toFixed(d[4] < 0.01 ? 3 : 2); });
      }
      if (a === 'copy') {
        const vals = {}; TUNE.forEach(t => { if (t[1] !== null) vals[t[0]] = LOOK[t[0]]; });
        const txt = JSON.stringify(vals);
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
          () => { e.target.textContent = 'Copied'; setTimeout(() => e.target.textContent = 'Copy values', 1200); },
          () => { window.prompt('Copy these values:', txt); });
      }
    });
    box.querySelector('.x').addEventListener('click', () => box.remove());
    document.body.appendChild(box);
    watch(); place();
  }
  if (/[?&]tune\b/.test(location.search) && window.top === window) {
    if (document.body) tuner(); else document.addEventListener('DOMContentLoaded', tuner);
  }
})();
