/* ===== VOR Trainer — radials, TO/FROM, intercepting and tracking, on an HSI =====
   Same instrument as the DME Arc Trainer's Fly mode (drawHSI / knobs / mini view are kept in step with
   dme.js). Position is in NM from the VOR (x east, y north); the heading bug steers at standard rate and
   the OBS drives the course pointer / CDI (±10° full scale, 2.5° per dot). No wind in the sim — wind
   correction (bracketing) is taught in Learn and the Quick Reference. */
(function(){
const cv = document.getElementById('navCanvas');
let cx2 = cv.getContext('2d');          // swapped to an offscreen context while drawing the mini view
const W = 540, H = 540;
const DPR = Math.min(2, window.devicePixelRatio || 1);
cv.width = W*DPR; cv.height = H*DPR;
cx2.setTransform(DPR,0,0,DPR,0,0);
const STN = {x: W/2, y: H/2};
const RING_R = 214;
const C = { bg:'#282827', line:'#45433e', text:'#f0eee6', text2:'#b5b3a9', text3:'#918f84',
            accent:'#d97757', warn:'#d9a545', blue:'#7fb3d9', ok:'#6faf6a', bad:'#c0584c' };

const rad = d => d*Math.PI/180;
const deg = r => r*180/Math.PI;
const norm = d => ((d%360)+360)%360;
const n180 = d => ((d%360)+540)%360 - 180;
const fmt3 = d => String(Math.round(norm(d)) || 360).padStart(3,'0');
const monoFont = () => getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace';
const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
const within = (a, b, t) => Math.abs(n180(a - b)) <= t;
let SCALE = 10;                          // px per NM on the map
const ptOn = (bearing, distPx) => ({x: STN.x + Math.sin(rad(bearing))*distPx, y: STN.y - Math.cos(rad(bearing))*distPx});

/* ---------- VOR geometry ----------
   Course c on the OBS: FROM when your radial is within 90° of c, else TO.
   dev > 0 = the course is to your right (the CDI deflects right). */
function vorGeom(s){
  const dme = Math.hypot(s.x, s.y), radial = norm(deg(Math.atan2(s.x, s.y)));
  const diff = n180(radial - s.crs), from = Math.abs(diff) < 90;
  const dev = from ? -diff : n180(radial - norm(s.crs + 180));
  return { dme, radial, from, dev, brg: norm(radial + 180) };
}
/* Heading that intercepts course c at `angle`°, from a position on `radial` (inbound = course c is TO) */
function interceptHdg(c, radial, inbound, angle){
  const R = inbound ? norm(c + 180) : c;                     // the radial the course lies on
  const side = Math.sign(n180(radial - R)) || 1;             // + = clockwise of that radial
  return norm(inbound ? c + side*angle : c - side*angle);
}

/* ---------- Drawing primitives ---------- */
function clearScene(){
  cx2.setTransform(DPR,0,0,DPR,0,0);
  cx2.clearRect(0,0,W,H);
  cx2.fillStyle = C.bg; cx2.fillRect(0,0,W,H);
  cx2.strokeStyle = 'rgba(255,255,255,0.04)'; cx2.lineWidth = 1;
  for(let x=0;x<W;x+=46){cx2.beginPath();cx2.moveTo(x,0);cx2.lineTo(x,H);cx2.stroke();}
  for(let y=0;y<H;y+=46){cx2.beginPath();cx2.moveTo(0,y);cx2.lineTo(W,y);cx2.stroke();}
}
function drawCompass(){
  cx2.strokeStyle = C.line; cx2.lineWidth = 1;
  cx2.beginPath(); cx2.arc(STN.x, STN.y, RING_R, 0, Math.PI*2); cx2.stroke();
  for(let d=0; d<360; d+=5){
    const len = d%30===0 ? 11 : d%10===0 ? 7 : 4, a = ptOn(d, RING_R), b = ptOn(d, RING_R+len);
    cx2.strokeStyle = d%30===0 ? C.text2 : C.text3; cx2.lineWidth = d%30===0 ? 1.5 : 1;
    cx2.beginPath(); cx2.moveTo(a.x, a.y); cx2.lineTo(b.x, b.y); cx2.stroke();
  }
  const names = {0:'N', 90:'E', 180:'S', 270:'W'};
  cx2.font = '600 12px '+monoFont(); cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
  for(let d=0; d<360; d+=30){
    const q = ptOn(d, RING_R+23);
    cx2.fillStyle = d===0 ? C.accent : names[d] ? C.text : C.text2;
    cx2.fillText(names[d] || String(d/10), q.x, q.y);
  }
  cx2.textAlign = 'start'; cx2.textBaseline = 'alphabetic';
}
function drawStation(label){
  cx2.strokeStyle = C.text; cx2.lineWidth = 1.5;
  cx2.beginPath();
  for(let i=0;i<6;i++){ const a = rad(60*i+30); const x = STN.x + Math.cos(a)*8, y = STN.y + Math.sin(a)*8; i ? cx2.lineTo(x,y) : cx2.moveTo(x,y); }
  cx2.closePath(); cx2.stroke();
  cx2.fillStyle = C.text; cx2.beginPath(); cx2.arc(STN.x, STN.y, 1.8, 0, Math.PI*2); cx2.fill();
  if(label){ cx2.fillStyle = C.text3; cx2.font = '11px '+monoFont(); cx2.textAlign = 'center'; cx2.fillText(label, STN.x, STN.y + 24); cx2.textAlign = 'start'; }
}
function drawRadial(bearing, color, width, dash, fromR, toR){
  const a = ptOn(bearing, fromR || 12), b = ptOn(bearing, toR || RING_R);
  cx2.strokeStyle = color; cx2.lineWidth = width || 1.5; if(dash) cx2.setLineDash(dash);
  cx2.beginPath(); cx2.moveTo(a.x, a.y); cx2.lineTo(b.x, b.y); cx2.stroke(); cx2.setLineDash([]);
}
function arrowOut(bearing, r0, r1, color){
  const a = ptOn(bearing, r0), b = ptOn(bearing, r1);
  cx2.strokeStyle = color; cx2.fillStyle = color; cx2.lineWidth = 2;
  cx2.beginPath(); cx2.moveTo(a.x, a.y); cx2.lineTo(b.x, b.y); cx2.stroke();
  cx2.save(); cx2.translate(b.x, b.y); cx2.rotate(rad(bearing));
  cx2.beginPath(); cx2.moveTo(0, -2); cx2.lineTo(6, 10); cx2.lineTo(-6, 10); cx2.closePath(); cx2.fill(); cx2.restore();
}
function drawPath(pts, color, width, dash){
  if(!pts.length) return;
  cx2.strokeStyle = color; cx2.lineWidth = width || 2; if(dash) cx2.setLineDash(dash);
  cx2.beginPath(); cx2.moveTo(pts[0].x, pts[0].y); pts.forEach(p=>cx2.lineTo(p.x,p.y)); cx2.stroke(); cx2.setLineDash([]);
}
function drawPlane(p, color, scale){
  cx2.save(); cx2.translate(p.x, p.y); cx2.rotate(rad(p.h)); if(scale) cx2.scale(scale, scale);
  cx2.fillStyle = color || C.text;
  cx2.beginPath(); cx2.moveTo(0,-10); cx2.lineTo(7,6); cx2.lineTo(0,2); cx2.lineTo(-7,6); cx2.closePath(); cx2.fill();
  cx2.restore();
}
function labelAt(x,y,txt,color,size){
  cx2.fillStyle = color || C.text2; cx2.font = (size||11)+'px -apple-system, sans-serif';
  cx2.textAlign='center'; cx2.fillText(txt, x, y); cx2.textAlign='start';
}
function pill(p, txt, color){
  cx2.font = '600 11px '+monoFont();
  const w = cx2.measureText(txt).width + 14, h = 20;
  const x = Math.max(4, Math.min(W - w - 4, p.x - w/2)), y = Math.max(4, Math.min(H - h - 4, p.y - h/2));
  cx2.fillStyle = 'rgba(25,25,24,0.92)'; cx2.strokeStyle = color || 'rgba(240,238,230,0.45)'; cx2.lineWidth = 1;
  cx2.beginPath(); cx2.roundRect(x, y, w, h, 5); cx2.fill(); cx2.stroke();
  cx2.fillStyle = color || C.text; cx2.textAlign = 'left'; cx2.textBaseline = 'middle';
  cx2.fillText(txt, x + 7, y + h/2 + 0.5); cx2.textAlign = 'start'; cx2.textBaseline = 'alphabetic';
}
/* Airplane position (NM) → map pixels */
const P = t => ({x: STN.x + t.x*SCALE, y: STN.y - t.y*SCALE});

/* ---------- HSI (same instrument as the DME trainer's Fly mode) ---------- */
function drawHSI(s, opts){
  opts = opts || {};
  clearScene();
  const g = vorGeom(s), R = 196, c = STN;
  cx2.fillStyle = '#1b1b1a'; cx2.beginPath(); cx2.arc(c.x, c.y, R + 8, 0, Math.PI*2); cx2.fill();
  cx2.strokeStyle = C.line; cx2.lineWidth = 1.5; cx2.stroke();
  cx2.save(); cx2.translate(c.x, c.y);
  for(let d=0; d<360; d+=5){
    cx2.save(); cx2.rotate(rad(d - s.hdg));
    const len = d%30===0 ? 16 : d%10===0 ? 11 : 6;
    cx2.strokeStyle = d%10===0 ? C.text : C.text3; cx2.lineWidth = d%10===0 ? 2 : 1;
    cx2.beginPath(); cx2.moveTo(0, -R); cx2.lineTo(0, -R + len); cx2.stroke();
    if(d%30===0){
      cx2.fillStyle = C.text; cx2.font = '600 17px '+monoFont(); cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
      cx2.fillText({0:'N',90:'E',180:'S',270:'W'}[d] || String(d/10), 0, -R + 32);
    }
    cx2.restore();
  }
  if(opts.bug !== false){
    cx2.save(); cx2.rotate(rad(s.bug - s.hdg));
    cx2.fillStyle = C.accent; cx2.beginPath(); cx2.moveTo(-11, -R - 2); cx2.lineTo(11, -R - 2); cx2.lineTo(11, -R + 8); cx2.lineTo(4, -R + 8); cx2.lineTo(0, -R + 3); cx2.lineTo(-4, -R + 8); cx2.lineTo(-11, -R + 8); cx2.closePath(); cx2.fill();
    cx2.restore();
  }
  if(opts.bearing !== false){
    cx2.save(); cx2.rotate(rad(g.brg - s.hdg));
    cx2.strokeStyle = C.blue; cx2.fillStyle = C.blue; cx2.lineWidth = 2;
    cx2.beginPath(); cx2.moveTo(0, R - 44); cx2.lineTo(0, -R + 52); cx2.stroke();
    cx2.beginPath(); cx2.moveTo(0, -R + 44); cx2.lineTo(7, -R + 58); cx2.lineTo(-7, -R + 58); cx2.closePath(); cx2.fill();
    cx2.restore();
  }
  cx2.save(); cx2.rotate(rad(s.crs - s.hdg));
  const dotPx = 22, dev = Math.max(-10, Math.min(10, g.dev)), barX = dev / 2.5 * dotPx;
  cx2.fillStyle = 'rgba(240,238,230,0.55)';
  for(let i=-4;i<=4;i++){ if(!i) continue; cx2.beginPath(); cx2.arc(i*dotPx, 0, 3.2, 0, Math.PI*2); cx2.fill(); }
  cx2.strokeStyle = C.ok; cx2.fillStyle = C.ok; cx2.lineWidth = 4; cx2.lineCap = 'round';
  cx2.beginPath(); cx2.moveTo(0, -R + 50); cx2.lineTo(0, -92); cx2.stroke();
  cx2.beginPath(); cx2.moveTo(0, -R + 40); cx2.lineTo(10, -R + 60); cx2.lineTo(-10, -R + 60); cx2.closePath(); cx2.fill();
  cx2.beginPath(); cx2.moveTo(0, 92); cx2.lineTo(0, R - 44); cx2.stroke();
  cx2.beginPath(); cx2.moveTo(barX, -82); cx2.lineTo(barX, 82); cx2.stroke();
  cx2.lineCap = 'butt';
  cx2.fillStyle = C.text;
  cx2.beginPath();
  if(g.from){ cx2.moveTo(34, 50); cx2.lineTo(46, 50); cx2.lineTo(40, 62); }
  else { cx2.moveTo(34, -50); cx2.lineTo(46, -50); cx2.lineTo(40, -62); }
  cx2.closePath(); cx2.fill();
  cx2.restore();
  cx2.fillStyle = C.accent;
  cx2.beginPath(); cx2.moveTo(0, -R - 12); cx2.lineTo(7, -R - 24); cx2.lineTo(-7, -R - 24); cx2.closePath(); cx2.fill();
  cx2.strokeStyle = C.text; cx2.lineWidth = 3; cx2.lineCap = 'round';
  cx2.beginPath(); cx2.moveTo(0, -18); cx2.lineTo(0, 16); cx2.moveTo(-18, -2); cx2.lineTo(18, -2); cx2.moveTo(-7, 13); cx2.lineTo(7, 13); cx2.stroke();
  cx2.lineCap = 'butt';
  cx2.restore();
  const ro = (x, y, lab, val, align, color) => {
    cx2.textAlign = align; cx2.font = '10px -apple-system, sans-serif'; cx2.fillStyle = C.text3; cx2.fillText(lab, x, y);
    cx2.font = '600 18px '+monoFont(); cx2.fillStyle = color || C.text; cx2.fillText(val, x, y + 20);
  };
  ro(12, 22, 'CRS', fmt3(s.crs) + '°', 'left', C.ok);
  if(opts.dme !== false) ro(12, 70, 'DME', g.dme.toFixed(1), 'left');
  ro(12, H - 34, 'HDG', fmt3(s.hdg) + '°', 'left', C.accent);
  if(s.gs) ro(W - 12, H - 34, 'GS', s.gs + ' kt', 'right');
  cx2.textAlign = 'center'; cx2.font = '600 12px '+monoFont(); cx2.fillStyle = C.text2;
  cx2.fillText(g.from ? 'FROM' : 'TO', c.x, H - 12);
  cx2.textAlign = 'start';
}
/* Map: north-up around the VOR, fitted to the airplane; `course` draws the target radial line */
function drawMap(s, mini){
  const g = vorGeom(s);
  SCALE = 196 / Math.max(g.dme + 3, 10, s.fit || 0);
  clearScene(); drawCompass();
  for(let r = 5; r*SCALE < RING_R - 10; r += 5){
    cx2.strokeStyle = 'rgba(240,238,230,0.06)'; cx2.lineWidth = 1; cx2.beginPath(); cx2.arc(STN.x, STN.y, r*SCALE, 0, Math.PI*2); cx2.stroke();
  }
  if(s.target !== undefined){
    drawRadial(s.target, C.text, mini ? 4 : 2);
    pill(ptOn(s.target, RING_R - 22), 'R-' + fmt3(s.target));
  }
  if(s.target2 !== undefined){ drawRadial(s.target2, C.text, mini ? 4 : 2); pill(ptOn(s.target2, RING_R - 22), 'R-' + fmt3(s.target2)); }
  drawStation('VOR');
  if(s.trail) drawPath(s.trail.map(P).concat([P(s)]), C.accent, mini ? 6 : 2);
  const q = P(s);
  drawPlane({x: q.x, y: q.y, h: s.hdg}, C.ok, mini ? 2.6 : 1);
}

/* ---------- Animation (Learn) ---------- */
let raf=null;
function stopAnim(){ if(raf){cancelAnimationFrame(raf); raf=null;} }
function animate(pts, drawScene, speed){
  stopAnim();
  let i = 0;
  const step=()=>{
    drawScene();
    drawPath(pts.slice(0, i+1), C.accent, 2.5);
    drawPlane(pts[Math.min(i, pts.length-1)]);
    i += speed || 2;
    if(i < pts.length) raf=requestAnimationFrame(step); else raf=null;
  };
  step();
}
/* Path DSL: {s:len px} straight, {a:deg, r:px} turn (positive = right) */
function buildPath(start, hdg0, segs){
  const pts = [];
  let x=start.x, y=start.y, h=hdg0;
  const push=()=>pts.push({x,y,h:norm(h)});
  push();
  segs.forEach(sg=>{
    if(sg.s !== undefined){
      const steps = Math.max(2, Math.round(sg.s/4));
      for(let i=1;i<=steps;i++){ x += Math.sin(rad(h))*sg.s/steps; y -= Math.cos(rad(h))*sg.s/steps; push(); }
    } else if(Math.abs(sg.a) > 0.01){
      const r = sg.r, dir = sg.a >= 0 ? 1 : -1, total = Math.abs(sg.a);
      const steps = Math.max(4, Math.round(total/3));
      for(let i=1;i<=steps;i++){
        const dh = dir*total/steps;
        const cxp = x + Math.sin(rad(h + dir*90))*r, cyp = y - Math.cos(rad(h + dir*90))*r;
        const a1 = Math.atan2(x-cxp, -(y-cyp)) + rad(dh);
        x = cxp + Math.sin(a1)*r; y = cyp - Math.cos(a1)*r; h += dh; push();
      }
    }
  });
  return pts;
}

/* ---------- LEARN ---------- */
function sceneRadials(){
  clearScene(); drawCompass();
  [0, 60, 120, 180, 240, 300].forEach(b => { arrowOut(b, 16, 185, 'rgba(240,238,230,0.55)'); pill(ptOn(b, 150), 'R-' + fmt3(b)); });
  drawStation('VOR');
}
/* OBS set to `crs`: shade the half where the flag reads TO vs FROM; the course line runs through the VOR */
function sceneObs(crs){
  clearScene(); drawCompass();
  cx2.save(); cx2.beginPath(); cx2.arc(STN.x, STN.y, RING_R, 0, Math.PI*2); cx2.clip();
  const perp = norm(crs + 90);
  const half = (b, color) => {
    cx2.fillStyle = color; cx2.beginPath(); cx2.moveTo(STN.x, STN.y);
    cx2.arc(STN.x, STN.y, RING_R, rad(b - 90 - 90), rad(b - 90 + 90)); cx2.closePath(); cx2.fill();
  };
  half(crs, 'rgba(111,175,106,0.10)');                  // FROM side: ahead of the station along the course
  half(norm(crs + 180), 'rgba(127,179,217,0.10)');      // TO side
  cx2.restore();
  drawRadial(perp, 'rgba(240,238,230,0.25)', 1, [4,5], 0); drawRadial(norm(perp + 180), 'rgba(240,238,230,0.25)', 1, [4,5], 0);
  drawRadial(crs, C.ok, 2, null, 0); drawRadial(norm(crs + 180), C.ok, 2, null, 0);
  arrowOut(crs, 40, 120, C.ok);
  pill(ptOn(norm(crs + 180), 110), 'TO side', C.blue);
  pill(ptOn(crs, 150), 'FROM side', C.ok);
  pill({x: STN.x, y: 28}, 'OBS ' + fmt3(crs), C.ok);
  drawStation('VOR');
}
const LEARN_CRS = 60;
/* Fly a demo with the same physics as Fly mode: `steer(s, g)` sets s.bug (and s.crs); returns map points */
function simPath(pos, hdg, crs, nm, steer){
  const s = { x: pos.x, y: pos.y, hdg, bug: hdg, crs }, pts = [], dt = 1, v = 120/3600;
  for(let d = 0; d < nm; d += v*dt){
    steer(s, vorGeom(s));
    const turn = n180(s.bug - s.hdg); s.hdg = norm(s.hdg + Math.max(-3*dt, Math.min(3*dt, turn)));
    s.x += Math.sin(rad(s.hdg))*v*dt; s.y += Math.cos(rad(s.hdg))*v*dt;
    const q = P(s); pts.push({x: q.x, y: q.y, h: s.hdg});
  }
  return pts;
}
const nmAt = (bearing, d) => ({x: Math.sin(rad(bearing))*d, y: Math.cos(rad(bearing))*d});
/* Intercept: needle far off → hold a 30° intercept; as it comes in (under ~6°) steer onto the course */
const interceptSteer = inbound => (s, g) => {
  s.bug = Math.abs(g.dev) > 6 ? interceptHdg(s.crs, g.radial, inbound, 30) : norm(s.crs + Math.max(-30, Math.min(30, 4*g.dev)));
};
function learnInterceptPath(){
  SCALE = 11;
  return simPath(nmAt(20, 4), 20, LEARN_CRS, 13, interceptSteer(false));
}
function learnPassagePath(){
  SCALE = 11;
  let passed = false;
  return simPath(nmAt(240, 15), 60, 60, 27, (s, g) => {
    if(!passed && g.dme < 1.5 && Math.abs(n180(g.radial - s.hdg)) < 90){ passed = true; s.crs = 90; }
    if(!passed) s.bug = norm(60 + Math.max(-20, Math.min(20, 3*g.dev)));
    else interceptSteer(false)(s, g);
  });
}
const STEPS = [
 {title:'Radials',
  html:'<p>A VOR transmits <strong>360 radials</strong>, each a magnetic course leading <em>away from</em> the station. The 060 radial runs northeast from the VOR; if you are anywhere on it, you are northeast of the station.</p><p>Flying <strong>toward</strong> the VOR along the 060 radial, your course is its reciprocal: <em>240</em>.</p>',
  draw(){ sceneRadials(); }, anim(){ return null; }},
 {title:'The OBS and TO / FROM',
  html:'<p>The <strong>OBS</strong> selects a course. The flag doesn’t care which way you’re pointed — it says whether that course, from where you are, takes you <em>TO</em> the station or leads <em>FROM</em> it.</p><p>With the OBS on 060, anywhere in the blue half reads <strong>TO</strong>, the green half <strong>FROM</strong>. On the dividing line the flag flickers (and at station passage it flips).</p>',
  draw(){ sceneObs(LEARN_CRS); }, anim(){ return null; }},
 {title:'Where am I?',
  html:'<p>Turn the OBS until the needle <strong>centres with a FROM flag</strong>. The OBS now shows the radial you’re on. Centred with a <em>TO</em> flag, the OBS shows the course <em>to</em> the station — the reciprocal of your radial.</p><p>On an HSI the <span style="color:#7fb3d9">bearing pointer</span> does it at a glance: its head is the bearing <em>to</em> the station, its tail the radial you’re on.</p>',
  draw(){ sceneRadials(); const q = ptOn(150, 120); drawPlane({x:q.x, y:q.y, h:330}, C.ok); pill(ptOn(150, 150), 'on R-150 → OBS 150 FROM or 330 TO', C.ok); }, anim(){ return null; }},
 {title:'Intercepting',
  html:'<p>1. <strong>Set the course</strong> on the OBS (TO for inbound, FROM for outbound). 2. <strong>Turn toward the needle</strong> to an intercept heading 30–45° off the course — the needle is on the side the course is. 3. When the needle <em>comes off full scale and starts to move</em>, begin the turn onto the course so you roll out with it centred.</p><p>Closer to the station the needle moves faster: use a smaller intercept angle and lead more.</p>',
  draw(){ clearScene(); drawCompass(); SCALE = 11; drawRadial(LEARN_CRS, C.text, 2); pill(ptOn(LEARN_CRS, RING_R - 22), 'R-060 · OBS 060 FROM'); drawStation('VOR'); },
  anim(){ return learnInterceptPath(); }},
 {title:'Tracking & wind',
  html:'<p>With no wind, hold the course heading and the needle stays put. With wind the needle drifts — <strong>bracket</strong>: turn <em>20° toward the needle</em> until it re-centres, then take <em>half out</em> (10°). If it drifts again, adjust by half again (5°). The heading that keeps it still is your <strong>wind correction angle</strong> — hold it and make small changes.</p><p>Same idea in a hold: find the inbound correction, then fly <em>triple it</em> outbound.</p>',
  draw(){ clearScene(); drawCompass(); SCALE = 11; drawRadial(LEARN_CRS, C.text, 2); drawStation('VOR');
    const pts = buildPath(ptOn(LEARN_CRS, 3*SCALE), LEARN_CRS, [{s:2.5*SCALE},{a:-14,r:6},{s:2.2*SCALE},{a:22,r:6},{s:1.8*SCALE},{a:-12,r:6},{s:1.5*SCALE},{a:6,r:6},{s:4*SCALE}]);
    drawPath(pts, C.blue, 2); pill(ptOn(LEARN_CRS + 14, 120), '20° in · half out', C.blue); },
  anim(){ return null; }},
 {title:'Station passage',
  html:'<p>Nearing the station the needle gets <strong>very sensitive</strong> — hold your heading, don’t chase it. Station passage is the <em>first full reversal of the TO/FROM flag</em>.</p><p>Then set the OBS for the outbound course (FROM), turn to it and intercept as before.</p>',
  draw(){ clearScene(); drawCompass(); SCALE = 11; drawRadial(240, 'rgba(240,238,230,0.5)', 1.5, [5,5]); drawRadial(90, C.text, 2); pill(ptOn(240, RING_R - 22), 'in on R-240'); pill(ptOn(90, RING_R - 22), 'out on R-090'); drawStation('VOR'); },
  anim(){ return learnPassagePath(); }}
];
let learnStep = 0;
function renderLearn(){
  const st = STEPS[learnStep];
  document.getElementById('learnTitle').textContent = st.title;
  document.getElementById('learnBody').innerHTML = st.html;
  document.getElementById('learnPrev').disabled = learnStep===0;
  document.getElementById('learnNext').disabled = learnStep===STEPS.length-1;
  document.getElementById('learnDots').innerHTML = STEPS.map((_,i)=>`<span class="${i===learnStep?'on':''}"></span>`).join('');
  stopAnim(); st.draw();
  const pts = st.anim();
  if(pts) animate(pts, st.draw.bind(st));
}
window.learnStepMove = d => { learnStep = Math.max(0, Math.min(STEPS.length-1, learnStep+d)); renderLearn(); };
window.replayLearn = () => renderLearn();

/* ---------- QUIZ: read the HSI ---------- */
let quiz = null, score = {ok:0,total:0};
try{ score = JSON.parse(localStorage.getItem('vor_score')||'{"ok":0,"total":0}'); }catch(e){}
function makeQuestion(){
  const kind = pick(['radial','radial','intercept','reverse','side']);
  const radial = Math.floor(Math.random()*36)*10, dist = 12;
  const at = { x: Math.sin(rad(radial))*dist, y: Math.cos(rad(radial))*dist };
  if(kind === 'radial'){
    const from = Math.random() < 0.5, crs = from ? radial : norm(radial + 180);
    const hdg = norm(crs + pick([-40,-20,0,20,40,120,180]));
    const s = { ...at, hdg, bug: hdg, crs };
    const opts = [radial, norm(radial + 180), norm(radial + 90), norm(radial - 90)].map(v => 'R-' + fmt3(v));
    return { kind, s, text: `The needle is <strong>centred</strong> with the OBS on <span class="mono">${fmt3(crs)}</span> and a <strong>${from ? 'FROM' : 'TO'}</strong> flag. Which radial are you on?`,
      options: shuffle(opts), answer: 'R-' + fmt3(radial), hsi: {bearing:false},
      why: from ? `Centred with FROM: the OBS shows your radial — R-${fmt3(radial)}.` : `Centred with TO: the OBS is the course to the station, so you're on its reciprocal — R-${fmt3(radial)}.` };
  }
  if(kind === 'intercept'){
    const inbound = Math.random() < 0.6;
    const target = norm(radial + pick([-40,-30,-20,20,30,40]));
    const c = inbound ? norm(target + 180) : target;
    const hdg = norm(c + pick([-90, 90, 150, -150]));
    const s = { ...at, hdg, bug: hdg, crs: c };
    const good = interceptHdg(c, radial, inbound, 30), bad = norm(2*c - good);
    const opts = [good, bad, norm(good + 180), norm(bad + 180)].map(v => fmt3(v) + '°');
    return { kind, s, target, text: `You're cleared to intercept the <span class="mono">${fmt3(target)} radial ${inbound ? 'inbound' : 'outbound'}</span>. OBS is set to <span class="mono">${fmt3(c)}</span>. Using a 30° intercept, which heading?`,
      options: shuffle([...new Set(opts)]), answer: fmt3(good) + '°', hsi: {},
      why: `The needle shows the course is to your ${Math.sign(vorGeom(s).dev) > 0 ? 'right' : 'left'} (with the OBS matching your direction of flight). Turn 30° toward it: ${fmt3(good)}°.` };
  }
  if(kind === 'side'){
    const crs = norm(radial + pick([-30,-15,15,30]));
    const hdg = crs;
    const s = { ...at, hdg, bug: hdg, crs };
    const g = vorGeom(s);
    const ans = g.dev > 0 ? 'Right of me' : 'Left of me';
    return { kind, s, text: `Heading <span class="mono">${fmt3(hdg)}</span>, OBS <span class="mono">${fmt3(crs)}</span> (${g.from ? 'FROM' : 'TO'}). Where is the selected course?`,
      options: ['Left of me', 'Right of me'], answer: ans, hsi: {},
      why: `Heading agrees with the course, so the needle points to it: ${ans.toLowerCase()} — turn that way to intercept.` };
  }
  // reverse sensing (plain CDI): flying roughly opposite to the OBS course
  const crs = norm(radial + pick([-20,20]) + 180);          // OBS set as a TO course…
  const hdg = norm(crs + 180 + pick([-10,0,10]));           // …but flying away from it
  const s = { ...at, hdg, bug: hdg, crs };
  const g = vorGeom(s);
  const needle = g.dev > 0 ? 'right' : 'left', actual = g.dev > 0 ? 'left' : 'right';
  return { kind, s, text: `On an old-style CDI (not an HSI), OBS <span class="mono">${fmt3(crs)}</span> ${g.from ? 'FROM' : 'TO'}, heading <span class="mono">${fmt3(hdg)}</span>. The needle is deflected <strong>${needle}</strong>. Which way do you turn to get to the course line?`,
    options: [`Turn ${needle}`, `Turn ${actual}`], answer: `Turn ${actual}`, hsi: {cdi: true},
    why: `You're flying about 180° from the OBS course — <strong>reverse sensing</strong>: a CDI needle then points away from the course. Set the OBS to match your direction of flight (an HSI never reverses).` };
}
function drawQuizScene(reveal){
  const q = quiz;
  if(!reveal){ drawHSI(q.s, {dme: false, bearing: q.kind !== 'radial', bug: false}); if(q.kind === 'reverse') note('Picture a plain CDI: the needle reads the same, it just doesn’t turn with you.'); return; }
  const s = { ...q.s, target: q.target !== undefined ? q.target : vorGeom(q.s).radial, fit: 16 };
  drawMap(s);
  pill({x: STN.x, y: 28}, `OBS ${fmt3(s.crs)} · you're on R-${fmt3(vorGeom(q.s).radial)}`, C.ok);
}
function note(t){ cx2.font = '12px -apple-system, sans-serif'; cx2.fillStyle = C.text3; cx2.textAlign = 'center'; cx2.fillText(t, W/2, 100); cx2.textAlign = 'start'; }
function nextQuestion(){
  stopAnim();
  quiz = makeQuestion(); quiz.answered = false;
  document.getElementById('quizText').innerHTML = quiz.text;
  const box = document.getElementById('answers'); box.innerHTML = '';
  quiz.options.forEach((o, i) => {
    const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = o;
    b.addEventListener('click', () => window.answer(i)); box.appendChild(b);
  });
  document.getElementById('quizFeedback').className = 'feedback';
  document.getElementById('nextQBtn').style.display = 'none';
  updateScore();
  drawQuizScene(false);
}
window.nextQuestion = nextQuestion;
window.answer = i => {
  if(!quiz || quiz.answered) return;
  quiz.answered = true;
  const right = quiz.options[i] === quiz.answer;
  score.total++; if(right) score.ok++;
  try{ localStorage.setItem('vor_score', JSON.stringify(score)); }catch(e){}
  [...document.querySelectorAll('#answers .btn')].forEach((b, k) => {
    b.disabled = true;
    if(quiz.options[k] === quiz.answer) b.classList.add('good'); else if(k === i) b.classList.add('badpick');
  });
  const fb = document.getElementById('quizFeedback');
  fb.innerHTML = (right ? '<span class="yes">Correct.</span> ' : `<span class="no">Not quite — ${quiz.answer}.</span> `) + quiz.why;
  fb.className = 'feedback show';
  document.getElementById('nextQBtn').style.display = 'inline-block';
  updateScore();
  drawQuizScene(true);
};
function updateScore(){
  document.getElementById('scoreLine').textContent =
    score.total ? `Score: ${score.ok}/${score.total} (${Math.round(score.ok/score.total*100)}%) · the map shows where you were after you answer` : 'No attempts yet.';
}

/* ---------- FLY: intercept / track / direct-to scenarios ---------- */
const fly = { on: false, running: false, speed: 10, view: 'hsi', last: 0, s: null };
window.__vorFly = fly;                   // debug hook: inspect / script the scenario from the console
const TRACK_NM = 4;                      // distance to hold the course once established
function newScenario(){
  const kind = pick(['in','in','out','direct']);
  const R = Math.floor(Math.random()*36)*10, gs = 120;
  let x, y, hdg, crs, text, target = R, target2;
  if(kind === 'in'){
    const d = 10 + Math.random()*10, p = norm(R + pick([-1,1])*(20 + Math.random()*30));
    x = Math.sin(rad(p))*d; y = Math.cos(rad(p))*d;
    hdg = norm(p + 180 + pick([-1,1])*(20 + Math.random()*50));   // roughly toward the station, not on course
    crs = norm(hdg + pick([40, -70, 110]));                          // OBS left on something else
    text = `“Intercept the <span class="mono">${fmt3(R)} radial inbound</span>, track to the VOR.”`;
  } else if(kind === 'out'){
    const d = 3 + Math.random()*5, p = norm(R + pick([-1,1])*(35 + Math.random()*50));
    x = Math.sin(rad(p))*d; y = Math.cos(rad(p))*d;
    hdg = norm(p + pick([-1,1])*(10 + Math.random()*40));              // heading away-ish
    crs = norm(hdg + pick([60, -100, 150]));
    text = `“Intercept the <span class="mono">${fmt3(R)} radial outbound</span>.”`;
  } else {
    const d = 8 + Math.random()*8, p = Math.floor(Math.random()*36)*10;
    x = Math.sin(rad(p))*d; y = Math.cos(rad(p))*d;
    hdg = norm(p + 180 + pick([-1,1])*(40 + Math.random()*80));
    crs = norm(hdg + pick([30, -90, 140]));
    // outbound radial not straight back out the way you came
    target = norm(p + 180 + pick([-1,1])*(40 + Math.random()*60)); target = Math.round(target/10)*10 % 360;
    text = `“Proceed <strong>direct</strong> to the VOR, then outbound on the <span class="mono">${fmt3(target)} radial</span>.”`;
  }
  fly.s = { kind, R: target, x, y, hdg, bug: hdg, crs, gs, target: kind === 'direct' ? undefined : target, target2,
    trail: [{x, y}], t: 0, step: 0, maxDev: 0, trackStart: null, passed: false, done: false, msg: '' };
  const g = vorGeom(fly.s);
  document.getElementById('flyClr').innerHTML = `${text} <span class="fly-pos">You're ${g.dme.toFixed(0)} DME ${word(g.radial)} of the VOR, heading ${fmt3(hdg)}°.</span>`;
  syncKnobs(); updateSteps(); drawFly();
}
const word = r => ['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(norm(r)/45) % 8];
function flySteps(s){
  if(s.kind === 'direct') return [
    'Turn the OBS until the needle <b>centres with a TO flag</b> — that’s your course to the VOR',
    'Turn to that course and keep the needle centred',
    'Hold the heading near the station — wait for the flag to flip to <b>FROM</b> (station passage)',
    `Set the OBS to <b>${fmt3(s.R)}</b> (FROM) and turn to intercept the ${fmt3(s.R)} radial outbound`,
    `Track <b>${fmt3(s.R)}°</b> outbound within 1 dot for ${TRACK_NM} NM`
  ];
  const inbound = s.kind === 'in', c = inbound ? norm(s.R + 180) : s.R;
  return [
    `Set the OBS to <b>${fmt3(c)}</b> (${inbound ? 'TO' : 'FROM'}) for the ${fmt3(s.R)} radial ${inbound ? 'inbound' : 'outbound'}`,
    `Turn toward the needle — an intercept heading about <b>30–45°</b> off ${fmt3(c)}°`,
    'As the needle comes off full scale, turn onto the course and centre it',
    `Track <b>${fmt3(c)}°</b> within 1 dot (2.5°) for ${TRACK_NM} NM`
  ];
}
function evalStep(s, g){
  if(s.kind === 'direct'){
    switch(s.step){
      case 0: return !g.from && Math.abs(g.dev) <= 2.5;
      case 1: return !g.from && Math.abs(g.dev) <= 2.5 && within(s.hdg, s.crs, 12);
      case 2: return s.passed;
      case 3: return within(s.crs, s.R, 2) && g.from && within(g.radial, s.R, 4) && within(s.hdg, s.R, 15);
      case 4: return trackDone(s, g, s.R);
    }
    return false;
  }
  const inbound = s.kind === 'in', c = inbound ? norm(s.R + 180) : s.R;
  switch(s.step){
    case 0: return within(s.crs, c, 2);
    case 1: { const off = n180(s.hdg - c), want = n180(interceptHdg(c, g.radial, inbound, 30) - c);
              return (Math.sign(off) === Math.sign(want) && Math.abs(off) >= 15 && Math.abs(off) <= 90) || (Math.abs(g.dev) <= 2.5 && within(s.hdg, c, 12)); }
    case 2: return Math.abs(g.dev) <= 2.5 && within(s.hdg, c, 12) && within(s.crs, c, 2);
    case 3: return trackDone(s, g, c);
  }
  return false;
}
/* Established once within a dot; hold it for TRACK_NM (inbound: stop 2 NM out). The score is the worst
   deviation after the first half mile (see tick). */
function trackDone(s, g, c){
  if(!s.trackStart) s.trackStart = { x: s.x, y: s.y };
  const flown = Math.hypot(s.x - s.trackStart.x, s.y - s.trackStart.y);
  return flown >= TRACK_NM || (s.kind === 'in' && g.dme < 2);
}
function tick(now){
  if(!fly.on) return;
  const dtReal = fly.last ? Math.min(0.1, (now - fly.last)/1000) : 0;
  fly.last = now;
  const s = fly.s;
  if(fly.running && s && !s.done){
    const dt = dtReal * fly.speed;
    const turn = n180(s.bug - s.hdg), maxTurn = 3*dt;
    s.hdg = norm(s.hdg + Math.max(-maxTurn, Math.min(maxTurn, turn)));
    const v = s.gs/3600*dt;
    s.x += Math.sin(rad(s.hdg))*v; s.y += Math.cos(rad(s.hdg))*v; s.t += dt;
    const lastT = s.trail[s.trail.length-1];
    if(Math.hypot(s.x - lastT.x, s.y - lastT.y) > 0.1) s.trail.push({x: s.x, y: s.y});
    const g = vorGeom(s);
    // station passage: close in, and now on the far side of the station along your heading
    if(s.kind === 'direct' && !s.passed && g.dme < 1.5 && Math.abs(n180(g.radial - s.hdg)) < 90) s.passed = true;
    const tracking = (s.kind === 'direct' && s.step === 4) || (s.kind !== 'direct' && s.step === 3);
    if(tracking){
      if(!s.trackStart) s.trackStart = {x: s.x, y: s.y};
      // score once settled: skip the first half mile after rolling onto the course
      if(Math.hypot(s.x - s.trackStart.x, s.y - s.trackStart.y) > 0.5) s.maxDev = Math.max(s.maxDev, Math.abs(g.dev));
    }
    const n = flySteps(s).length;
    while(s.step < n && evalStep(s, g)) s.step++;
    s.msg = '';
    if(tracking && Math.abs(g.dev) > 2.5) s.msg = `Off course ${Math.abs(g.dev).toFixed(1)}° — turn toward the needle, then take half out`;
    if(s.kind !== 'direct' && g.dme < 0.4){ s.msg = 'Passed over the station — try a new scenario'; fly.running = false; }
    if(g.dme > 45){ s.msg = 'Too far out — try a new scenario'; fly.running = false; }
    if(s.step >= n){ s.done = true; fly.running = false; }
    updateSteps();
  }
  drawFly();
  requestAnimationFrame(tick);
}
function updateSteps(){
  const s = fly.s; if(!s) return;
  const steps = flySteps(s), g = vorGeom(s), n = steps.length;
  document.getElementById('flyStepN').textContent = s.done ? '✓' : `${s.step + 1}/${n}`;
  const el = document.getElementById('flyStep');
  if(s.done){
    const dots = s.maxDev / 2.5;
    const grade = dots <= 0.5 ? 'Nice — rock solid.' : dots <= 1 ? 'Good — within a dot.' : 'Wandered past a dot — make smaller, earlier corrections.';
    el.innerHTML = `Tracked within <b>±${s.maxDev.toFixed(1)}°</b> (${dots.toFixed(1)} dot) · ${Math.floor(s.t/60)}:${String(Math.round(s.t%60)).padStart(2,'0')} flight time. ${grade}`;
  } else el.innerHTML = steps[s.step];
  const st = document.getElementById('flyStatus');
  const tracking = (s.kind === 'direct' && s.step === 4) || (s.kind !== 'direct' && s.step === 3);
  st.textContent = s.msg || (tracking ? `Needle ${g.dev >= 0 ? 'R' : 'L'} ${Math.abs(g.dev).toFixed(1)}° · ${s.trackStart ? Math.max(0, TRACK_NM - Math.hypot(s.x - s.trackStart.x, s.y - s.trackStart.y)).toFixed(1) : TRACK_NM} NM to go` : '');
  st.classList.toggle('warn', !!s.msg);
  document.getElementById('flyPlay').textContent = fly.running ? 'Pause' : (s.done ? 'Done' : 'Play');
  document.getElementById('flyPlay').disabled = s.done;
}
/* Main view + the other one as a mini view in the top-right corner (tap to swap) */
const INSET = { x: W - 176, y: 8, w: 168, h: 168 };
const offCv = document.createElement('canvas');
offCv.width = W*DPR; offCv.height = H*DPR;
const offCx = offCv.getContext('2d');
function drawFly(){
  const s = fly.s; if(!s) return;
  const mapState = { ...s, target: s.kind === 'direct' ? (s.passed || s.step >= 3 ? s.R : undefined) : s.R };
  const main = fly.view === 'map' ? () => drawMap(mapState) : () => drawHSI(s);
  const mini = fly.view === 'map' ? () => drawHSI(s) : () => drawMap(mapState, true);
  const onCx = cx2;
  cx2 = offCx; mini(); cx2 = onCx;
  main();
  const {x, y, w, h} = INSET;
  cx2.save();
  cx2.shadowColor = 'rgba(0,0,0,.55)'; cx2.shadowBlur = 14; cx2.shadowOffsetY = 3;
  cx2.fillStyle = C.bg; cx2.beginPath(); cx2.roundRect(x, y, w, h, 10); cx2.fill();
  cx2.shadowColor = 'transparent';
  cx2.beginPath(); cx2.roundRect(x, y, w, h, 10); cx2.clip();
  cx2.drawImage(offCv, x, y, w, h);
  cx2.restore();
  cx2.strokeStyle = 'rgba(240,238,230,0.28)'; cx2.lineWidth = 1;
  cx2.beginPath(); cx2.roundRect(x + .5, y + .5, w - 1, h - 1, 10); cx2.stroke();
  cx2.font = '600 9px ' + monoFont(); cx2.fillStyle = C.text3; cx2.textAlign = 'right';
  cx2.fillText((fly.view === 'map' ? 'HSI' : 'MAP') + ' ⇄', x + w - 8, y + h - 8); cx2.textAlign = 'start';
}
cv.addEventListener('click', e => {
  if(!fly.on) return;
  const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) * W / r.width, py = (e.clientY - r.top) * H / r.height;
  if(px >= INSET.x && px <= INSET.x + INSET.w && py >= INSET.y && py <= INSET.y + INSET.h) window.flyView(fly.view === 'map' ? 'hsi' : 'map');
});
/* Knobs: drag round (1° per degree), wheel, arrow keys, or the − / + buttons (5°) */
function knob(el, get, set){
  const cap = el.querySelector('.knob-cap');
  let drag = null;
  const ang = e => { const r = cap.getBoundingClientRect(); return deg(Math.atan2(e.clientX - (r.left + r.width/2), -(e.clientY - (r.top + r.height/2)))); };
  cap.addEventListener('pointerdown', e => { drag = { a: ang(e), id: e.pointerId }; try { cap.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
  cap.addEventListener('pointermove', e => {
    if(!drag || e.pointerId !== drag.id) return;
    const a = ang(e), d = n180(a - drag.a); drag.a = a;
    drag.acc = (drag.acc || 0) + d;
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
function syncKnobs(){
  const s = fly.s; if(!s) return;
  document.getElementById('knobHdgV').textContent = fmt3(s.bug);
  document.getElementById('knobCrsV').textContent = fmt3(s.crs);
  document.querySelector('#knobHdg .knob-cap i').style.transform = `rotate(${s.bug}deg)`;
  document.querySelector('#knobCrs .knob-cap i').style.transform = `rotate(${s.crs}deg)`;
}
knob(document.getElementById('knobHdg'), () => fly.s ? fly.s.bug : 0, v => { if(!fly.s) return; fly.s.bug = v; syncKnobs(); if(!fly.running) drawFly(); });
knob(document.getElementById('knobCrs'), () => fly.s ? fly.s.crs : 0, v => { if(!fly.s) return; fly.s.crs = v; syncKnobs(); updateSteps(); if(!fly.running) drawFly(); });
window.flyPlay = () => { if(!fly.s || fly.s.done) return; fly.running = !fly.running; fly.last = 0; updateSteps(); };
window.flyNew = () => { newScenario(); fly.running = true; fly.last = 0; updateSteps(); };
window.flySpeed = v => { fly.speed = v; document.querySelectorAll('#flySpeed button').forEach(b => b.classList.toggle('on', +b.dataset.v === v)); };
window.flyView = v => { fly.view = v; document.querySelectorAll('#flyView button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); drawFly(); };
document.addEventListener('keydown', e => {
  if(!fly.on || !fly.s || e.target.closest('input, .knob')) return;
  const map = { ArrowLeft: ['bug', -1], ArrowRight: ['bug', 1], ArrowDown: ['crs', -1], ArrowUp: ['crs', 1] }[e.key];
  if(!map) return;
  e.preventDefault();
  fly.s[map[0]] = norm(fly.s[map[0]] + map[1] * (e.shiftKey ? 10 : 1));
  syncKnobs(); updateSteps(); if(!fly.running) drawFly();
});
function startFly(){
  fly.on = true; fly.last = 0;
  if(!fly.s){ newScenario(); fly.running = true; }
  updateSteps();
  requestAnimationFrame(tick);
}

/* ---------- Mode switching ---------- */
window.setMode = mode => {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.mode===mode));
  ['learn','practice','fly'].forEach(m => document.getElementById(m + 'Card').style.display = m === mode ? '' : 'none');
  document.getElementById('notesCard').style.display = mode === 'fly' ? 'none' : '';
  stopAnim();
  fly.on = false; fly.running = false;
  if(mode==='learn') renderLearn();
  if(mode==='practice') nextQuestion();
  if(mode==='fly') startFly();
};

renderLearn();
})();
