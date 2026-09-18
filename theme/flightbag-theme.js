// Flight Bag theme runtime (pairs with flightbag-theme.css). Generates the panel grain tile and
// positions one page-wide soft light: every .fb-panel shows the same viewport-sized gradient shifted
// by its own on-screen position, so the light is continuous across panels (CSS fixed backgrounds
// render per element). Values are the My Stuff dashboard's tuned look (config.look, 2026-09-17).
(() => {
  const LOOK = { grain: 0.1, grainScale: 1, edge: 0.25, lampAmt: 0.08, lampX: 0.53, lampY: 0.23, lampRadius: 0.68, lampMid: 0.5, lampShadow: 0.5 };
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
    // Glass (.fb-glass) reflects the same lamp: one glare centred on it that fades to nothing at the lamp's
    // radius, so glass near the light shows a sheen and glass far from it stays dark.
    const G = Math.round(R), g = LOOK.lampAmt * 2.2;
    const stop = (k, p) => `rgba(255,255,255,${(g * k).toFixed(3)}) ${p}%`;
    root.setProperty('--fb-glare', `radial-gradient(circle ${G}px at ${Math.round(vw * LOOK.lampX)}px ${Math.round(vh * LOOK.lampY)}px, ${stop(1, 0)}, ${stop(0.55, 40)}, ${stop(0.25, 72)}, ${stop(0, 100)})`);
  }

  let frame = 0;
  function place() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      for (const el of document.querySelectorAll('.fb-panel, .fb-glass')) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--fb-lamp-pos', `${Math.round(-r.left - el.clientLeft)}px ${Math.round(-r.top - el.clientTop)}px`);
      }
    });
  }

  root.setProperty('--fb-edge', `linear-gradient(180deg, rgba(255,255,255,${(0.06 * LOOK.edge).toFixed(3)}) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,${(0.2 * LOOK.edge).toFixed(3)}) 100%)`);
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
})();
