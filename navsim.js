/* ===== NavSim — the shared flight instruments for the VOR and DME Arc trainers =====
   One HSI, one set of knobs and one mini-view frame, so both trainers look and behave the same.
   Drawing functions take the 2D context to draw into (trainers swap to an offscreen context to render
   the mini view). Scene is a 540×540 logical canvas drawn at device resolution.
   Position is NM from the station (x east, y north); `s` = { x, y, hdg, bug, crs, gs }. */
window.NavSim = (() => {
  const W = 540, H = 540;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const C = { bg:'#282827', line:'#45433e', text:'#f0eee6', text2:'#b5b3a9', text3:'#918f84',
              accent:'#d97757', warn:'#d9a545', blue:'#7fb3d9', ok:'#6faf6a', bad:'#c0584c' };
  const rad = d => d*Math.PI/180;
  const deg = r => r*180/Math.PI;
  const norm = d => ((d%360)+360)%360;
  const n180 = d => ((d%360)+540)%360 - 180;
  const fmt3 = d => String(Math.round(norm(d)) || 360).padStart(3,'0');
  const monoFont = () => getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace';

  /* VOR geometry. Course on the OBS: FROM when your radial is within 90° of it, else TO.
     dev > 0 = the course is to your right (the CDI deflects right). */
  function geom(s){
    const dme = Math.hypot(s.x, s.y), radial = norm(deg(Math.atan2(s.x, s.y)));
    const diff = n180(radial - s.crs), from = Math.abs(diff) < 90;
    const dev = from ? -diff : n180(radial - norm(s.crs + 180));
    return { dme, radial, from, dev, brg: norm(radial + 180) };
  }

  /* Background + faint grid */
  function clear(ctx){
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    for(let x=0;x<W;x+=46){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=46){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }

  /* HSI: card turns with heading; course pointer + CDI bar (2.5° per dot, 4 dots full scale), TO/FROM,
     bearing pointer to the station, heading bug; readouts in the corners (top-right is left free for
     the mini view). opts: { bug, bearing, dme } — pass false to hide one (quiz questions). */
  function hsi(ctx, s, opts){
    opts = opts || {};
    clear(ctx);
    const g = geom(s), R = 196, cx = W/2, cy = H/2;
    ctx.fillStyle = '#1b1b1a'; ctx.beginPath(); ctx.arc(cx, cy, R + 8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.save(); ctx.translate(cx, cy);
    for(let d=0; d<360; d+=5){
      ctx.save(); ctx.rotate(rad(d - s.hdg));
      const len = d%30===0 ? 16 : d%10===0 ? 11 : 6;
      ctx.strokeStyle = d%10===0 ? C.text : C.text3; ctx.lineWidth = d%10===0 ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(0, -R + len); ctx.stroke();
      if(d%30===0){
        ctx.fillStyle = C.text; ctx.font = '600 17px '+monoFont(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText({0:'N',90:'E',180:'S',270:'W'}[d] || String(d/10), 0, -R + 32);
      }
      ctx.restore();
    }
    if(opts.bug !== false){
      ctx.save(); ctx.rotate(rad(s.bug - s.hdg));
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(-11, -R - 2); ctx.lineTo(11, -R - 2); ctx.lineTo(11, -R + 8); ctx.lineTo(4, -R + 8); ctx.lineTo(0, -R + 3); ctx.lineTo(-4, -R + 8); ctx.lineTo(-11, -R + 8); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    if(opts.bearing !== false){
      ctx.save(); ctx.rotate(rad(g.brg - s.hdg));
      ctx.strokeStyle = C.blue; ctx.fillStyle = C.blue; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, R - 44); ctx.lineTo(0, -R + 52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -R + 44); ctx.lineTo(7, -R + 58); ctx.lineTo(-7, -R + 58); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.save(); ctx.rotate(rad(s.crs - s.hdg));
    const dotPx = 22, dev = Math.max(-10, Math.min(10, g.dev)), barX = dev / 2.5 * dotPx;
    ctx.fillStyle = 'rgba(240,238,230,0.55)';
    for(let i=-4;i<=4;i++){ if(!i) continue; ctx.beginPath(); ctx.arc(i*dotPx, 0, 3.2, 0, Math.PI*2); ctx.fill(); }
    ctx.strokeStyle = C.ok; ctx.fillStyle = C.ok; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -R + 50); ctx.lineTo(0, -92); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -R + 40); ctx.lineTo(10, -R + 60); ctx.lineTo(-10, -R + 60); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 92); ctx.lineTo(0, R - 44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(barX, -82); ctx.lineTo(barX, 82); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = C.text;
    ctx.beginPath();
    if(g.from){ ctx.moveTo(34, 50); ctx.lineTo(46, 50); ctx.lineTo(40, 62); }
    else { ctx.moveTo(34, -50); ctx.lineTo(46, -50); ctx.lineTo(40, -62); }
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // lubber + fixed airplane
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.moveTo(0, -R - 12); ctx.lineTo(7, -R - 24); ctx.lineTo(-7, -R - 24); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, 16); ctx.moveTo(-18, -2); ctx.lineTo(18, -2); ctx.moveTo(-7, 13); ctx.lineTo(7, 13); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.restore();
    const ro = (x, y, lab, val, align, color) => {
      ctx.textAlign = align; ctx.font = '10px -apple-system, sans-serif'; ctx.fillStyle = C.text3; ctx.fillText(lab, x, y);
      ctx.font = '600 18px '+monoFont(); ctx.fillStyle = color || C.text; ctx.fillText(val, x, y + 20);
    };
    ro(12, 22, 'CRS', fmt3(s.crs) + '°', 'left', C.ok);
    if(opts.dme !== false) ro(12, 70, 'DME', g.dme.toFixed(1), 'left');
    ro(12, H - 34, 'HDG', fmt3(s.hdg) + '°', 'left', C.accent);
    if(s.gs) ro(W - 12, H - 34, 'GS', s.gs + ' kt', 'right');
    ctx.textAlign = 'center'; ctx.font = '600 12px '+monoFont(); ctx.fillStyle = C.text2;
    ctx.fillText(g.from ? 'FROM' : 'TO', cx, H - 12);
    ctx.textAlign = 'start';
  }

  /* Mini view: the other display, rendered offscreen at full size, framed in the top-right corner */
  const INSET = { x: W - 176, y: 8, w: 168, h: 168 };
  function offscreen(){
    const c = document.createElement('canvas');
    c.width = W*DPR; c.height = H*DPR;
    return c;
  }
  function drawInset(ctx, off, label){
    const {x, y, w, h} = INSET;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3;
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.clip();
    ctx.drawImage(off, x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(240,238,230,0.28)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x + .5, y + .5, w - 1, h - 1, 10); ctx.stroke();
    ctx.font = '600 9px ' + monoFont(); ctx.fillStyle = C.text3; ctx.textAlign = 'right';
    ctx.fillText(label + ' ⇄', x + w - 8, y + h - 8); ctx.textAlign = 'start';
  }
  /* true when a click/tap on `canvas` landed on the mini view */
  function insetHit(canvas, e){
    const r = canvas.getBoundingClientRect(), px = (e.clientX - r.left) * W / r.width, py = (e.clientY - r.top) * H / r.height;
    return px >= INSET.x && px <= INSET.x + INSET.w && py >= INSET.y && py <= INSET.y + INSET.h;
  }

  /* Knob: drag round (1° per degree turned), wheel, arrow keys (Shift = 10°), or its − / + buttons */
  function knob(el, get, set){
    const cap = el.querySelector('.knob-cap');
    let drag = null;
    const ang = e => { const r = cap.getBoundingClientRect(); return deg(Math.atan2(e.clientX - (r.left + r.width/2), -(e.clientY - (r.top + r.height/2)))); };
    cap.addEventListener('pointerdown', e => { drag = { a: ang(e), id: e.pointerId, acc: 0 }; try { cap.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
    cap.addEventListener('pointermove', e => {
      if(!drag || e.pointerId !== drag.id) return;
      const a = ang(e), d = n180(a - drag.a); drag.a = a;
      drag.acc += d;
      const whole = Math.trunc(drag.acc);
      if(whole){ drag.acc -= whole; set(norm(get() + whole)); }
    });
    const end = () => { drag = null; };
    cap.addEventListener('pointerup', end); cap.addEventListener('pointercancel', end);
    cap.addEventListener('wheel', e => { e.preventDefault(); set(norm(get() + (e.deltaY > 0 ? 1 : -1) * (e.shiftKey ? 10 : 1))); }, { passive: false });
    el.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if(k){ e.preventDefault(); set(norm(get() + k * (e.shiftKey ? 10 : 1))); }
    });
    el.querySelectorAll('.knob-btns button').forEach(b => b.addEventListener('click', () => set(norm(get() + +b.dataset.d))));
  }

  return { W, H, DPR, C, rad, deg, norm, n180, fmt3, monoFont, geom, clear, hsi, INSET, offscreen, drawInset, insetHit, knob };
})();
