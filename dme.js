/* ===== DME Arc Trainer — learn, explore, quiz, and fly an arc in real time on an HSI =====
   Scene: the VOR/DME at the centre, north up, compass card around it. SCALE (px per NM) is chosen per
   plan so the arc and the starting point both fit; turn leads (≈ GS/200 NM, a standard-rate turn
   radius) are drawn to the same scale. */
(function(){
const cv = document.getElementById('arcCanvas');
let cx2 = cv.getContext('2d');          // swapped to an offscreen context while drawing the Fly mini view
const W = 540, H = 540;
const DPR = Math.min(2, window.devicePixelRatio || 1);
cv.width = W*DPR; cv.height = H*DPR;
cx2.setTransform(DPR,0,0,DPR,0,0);
const STN = {x: W/2, y: H/2};
const RING_R = 214;       // compass ring
const C = { bg:'#282827', line:'#45433e', text:'#f0eee6', text2:'#b5b3a9', text3:'#918f84',
            accent:'#d97757', warn:'#d9a545', blue:'#7fb3d9', ok:'#6faf6a', bad:'#c0584c' };

const rad = d => d*Math.PI/180;
const deg = r => r*180/Math.PI;
const norm = d => ((d%360)+360)%360;
const n180 = d => ((d%360)+540)%360 - 180;
const fmt3 = d => String(Math.round(norm(d)) || 360).padStart(3,'0');
const monoFont = () => getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace';
const WORDS = ['north','northeast','east','southeast','south','southwest','west','northwest'];
const word8 = h => WORDS[Math.round(norm(h)/45) % 8];

let SCALE = 15;                          // px per NM for the current drawing
const arcR = dme => dme * SCALE;
const ptOn = (bearing, distPx) => ({x: STN.x + Math.sin(rad(bearing))*distPx, y: STN.y - Math.cos(rad(bearing))*distPx});

/* ---------- Arc maths ---------- */
const turnRadiusNm = gs => gs / 200;                      // standard-rate turn radius ≈ GS/188; GS/200 is the rule of thumb
const leadDeg = (gs, dme) => 60 * turnRadiusNm(gs) / dme;  // lead radial, degrees before the final radial
/* Arc from radial A to radial B the short way: dir +1 = clockwise (radials increasing), −1 = counterclockwise.
   start = the DME where you pick up radial A — beyond the arc you fly inbound, inside it outbound. */
function arcPlan(from, to, dme, gs, start){
  const d = norm(to - from);
  const dir = d <= 180 ? 1 : -1;
  const sweep = dir > 0 ? d : 360 - d;
  const lr = leadDeg(gs, dme);
  if(start === undefined) start = dme + 8;
  const inbound = start > dme;
  return { from, to, dme, gs, dir, sweep, start, inbound, lead: turnRadiusNm(gs), lr,
           joinTurn: (inbound ? -dir : dir) > 0 ? 'Right' : 'Left',
           joinAt: inbound ? dme + turnRadiusNm(gs) : dme - turnRadiusNm(gs),
           lrRadial: norm(to - dir*lr),                  // start the turn inbound here
           arcHdg: norm(from + dir*90),                  // heading when established on the arc
           final: norm(to + 180),                        // inbound course on the final radial
           arcWord: word8(norm(from + dir*sweep/2 + dir*90)),   // "Arc northeast…" = direction of travel
           lengthNm: 2*Math.PI*dme*sweep/360 };
}
function fitScale(p){ SCALE = Math.min(150 / p.dme, 196 / Math.max(p.start + 1, p.dme + 2)); }

/* ---------- Path DSL: headings 0 = up; {s:len} straight, {a:deg, r} arc (positive = right turn) ---------- */
function buildPath(start, hdg0, segs){
  const pts = [];
  let x=start.x, y=start.y, h=hdg0;
  const push=()=>pts.push({x,y,h:norm(h)});
  push();
  segs.forEach(sg=>{
    if(sg.s !== undefined){
      if(sg.s <= 0) return;
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
/* Pick up radial A (inbound from outside the arc, or outbound from inside it), lead-turn onto the arc,
   fly it, lead-turn inbound on radial B, continue to 2 NM. Each lead turn's circle is tangent to the
   arc (outside it when joining inbound, inside it otherwise), so the path rolls out exactly on the arc
   and exactly on the final radial. */
function arcPath(p){
  const px = SCALE, r = p.lead, D = p.dme;
  const dIn = p.inbound ? Math.sqrt((D + r)**2 - r*r) : Math.sqrt(Math.max(0.01, (D - r)**2 - r*r));
  const jIn = deg(Math.atan(r / dIn));
  const dOut = Math.sqrt(Math.max(0.01, (D - r)**2 - r*r)), jOut = deg(Math.atan(r / dOut));
  const join = p.inbound
    ? [{s: (p.start - dIn)*px}, {a: -p.dir*(90 - jIn), r: r*px}]
    : [{s: (dIn - p.start)*px}, {a:  p.dir*(90 + jIn), r: r*px}];
  return buildPath(ptOn(p.from, p.start*px), p.inbound ? norm(p.from + 180) : p.from, join.concat([
    {a: p.dir*Math.max(0, p.sweep - jIn - jOut), r: D*px},
    {a: p.dir*(90 + jOut), r: r*px},
    {s: (dOut - 2)*px}
  ]));
}

/* ---------- Drawing ---------- */
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
  cx2.strokeRect(STN.x-8, STN.y-8, 16, 16);
  cx2.beginPath();
  for(let i=0;i<6;i++){ const a = rad(60*i+30); const x = STN.x + Math.cos(a)*6, y = STN.y + Math.sin(a)*6; i ? cx2.lineTo(x,y) : cx2.moveTo(x,y); }
  cx2.closePath(); cx2.stroke();
  cx2.fillStyle = C.text; cx2.beginPath(); cx2.arc(STN.x, STN.y, 1.6, 0, Math.PI*2); cx2.fill();
  if(label){ cx2.fillStyle = C.text3; cx2.font = '11px '+monoFont(); cx2.textAlign = 'center'; cx2.fillText(label, STN.x, STN.y + 24); cx2.textAlign = 'start'; }
}
function drawArcRing(dme, from, to, dir){
  const R = arcR(dme);
  cx2.strokeStyle = 'rgba(240,238,230,0.14)'; cx2.lineWidth = 1; cx2.setLineDash([4,6]);
  cx2.beginPath(); cx2.arc(STN.x, STN.y, R, 0, Math.PI*2); cx2.stroke(); cx2.setLineDash([]);
  if(from !== undefined){
    cx2.strokeStyle = 'rgba(240,238,230,0.45)'; cx2.lineWidth = 2; cx2.setLineDash([7,6]);
    cx2.beginPath(); cx2.arc(STN.x, STN.y, R, rad(from - 90), rad(to - 90), dir < 0); cx2.stroke(); cx2.setLineDash([]);
  }
  const q = ptOn(from === undefined ? 45 : dir < 0 ? norm(from + 40) : norm(from - 40), R + 12);
  labelAt(q.x, q.y + 4, dme + ' DME', C.text3, 11);
}
function drawRadial(bearing, color, width, dash, fromR){
  const a = ptOn(bearing, fromR || 12), b = ptOn(bearing, RING_R);
  cx2.strokeStyle = color; cx2.lineWidth = width || 1.5; if(dash) cx2.setLineDash(dash);
  cx2.beginPath(); cx2.moveTo(a.x, a.y); cx2.lineTo(b.x, b.y); cx2.stroke(); cx2.setLineDash([]);
}
function drawPath(pts, color, width, dash){
  if(!pts.length) return;
  cx2.strokeStyle = color; cx2.lineWidth = width || 2; if(dash) cx2.setLineDash(dash);
  cx2.beginPath(); cx2.moveTo(pts[0].x, pts[0].y); pts.forEach(p=>cx2.lineTo(p.x,p.y)); cx2.stroke(); cx2.setLineDash([]);
}
function drawPlane(p, color){
  cx2.save(); cx2.translate(p.x, p.y); cx2.rotate(rad(p.h));
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
/* Full plan scene: radial A, arc, lead radial, final radial + labels */
function drawPlan(p, opts){
  opts = opts || {};
  fitScale(p);
  clearScene(); drawCompass();
  if(opts.arc === false) drawArcRing(p.dme); else drawArcRing(p.dme, p.from, p.to, p.dir);
  drawRadial(p.from, 'rgba(240,238,230,0.35)', 1.5, [5,5]);
  drawRadial(p.to, C.text, 2);
  if(opts.lead !== false){ drawRadial(p.lrRadial, C.warn, 1.5, [3,5], arcR(p.dme) - 30); pill(ptOn(p.lrRadial, RING_R - 22), 'LR-' + fmt3(p.lrRadial), C.warn); }
  pill(ptOn(p.from, RING_R - 22), 'R-' + fmt3(p.from));
  pill(ptOn(p.to, RING_R - 50), 'R-' + fmt3(p.to) + ' · IN ' + fmt3(p.final) + '°');
  drawStation('VOR');
}

/* ---------- Animation ---------- */
let raf=null, animPts=null, animI=0;
function stopAnim(){ if(raf){cancelAnimationFrame(raf); raf=null;} }
function animate(pts, drawScene, speed){
  stopAnim();
  animPts=pts; animI=0;
  const step=()=>{
    drawScene();
    drawPath(animPts.slice(0, animI+1), C.accent, 2.5);
    drawPlane(animPts[Math.min(animI, animPts.length-1)]);
    animI += speed || 2;
    if(animI < animPts.length) raf=requestAnimationFrame(step); else raf=null;
  };
  step();
}

/* ---------- LEARN ---------- */
// "Arc northeast at 20 DME from the 180 radial to the 090 radial" — picked up inbound at 30 DME
const DEMO = arcPlan(180, 90, 20, 120, 30);
const DEMO_OUT = arcPlan(180, 90, 20, 120, 6);
const STEPS = [
 {title:'What is a DME arc?',
  html:'<p>A DME arc is a curved course flown at a <strong>constant distance</strong> from a VOR/DME — say the <em>20 DME arc</em>. ATC and approach charts use arcs to move you around the station onto a final course without flying over it: <em>“arc northeast at 20 DME from the 180 radial to the 090 radial.”</em></p><p>You always know where you are on the arc from the <strong>radial</strong> you are crossing.</p>',
  draw(){ drawPlan(DEMO, {lead:false}); },
  anim(){ return arcPath(DEMO); }},
 {title:'Joining from outside',
  html:'<p>Usually you are <strong>farther out</strong> than the arc: set the OBS to the <em>reciprocal</em> of the radial (180 radial → <strong>360 TO</strong>), intercept it and fly <strong>inbound</strong>.</p><p>The arc is 90° to your course. Turn <em>before</em> the DME by about your turn radius — <strong>lead ≈ GS ÷ 200 NM</strong> (0.6 NM at 120 kts) — the short way toward the final radial, to a heading of <strong>radial ± 90°</strong>.</p><p>Coming in off to the side (say from the 210 radial) you may reach the arc first — then just turn onto it and fly through the 180 radial.</p>',
  draw(){ drawPlan(DEMO, {lead:false}); },
  anim(){ return arcPath(DEMO).slice(0, 70); }},
 {title:'Joining from inside',
  html:'<p>If you are <strong>closer</strong> than the arc (say 6 DME), set the OBS to the radial itself (<strong>180 FROM</strong>), intercept it and fly <strong>outbound</strong> until just before the arc, then turn the other way — here a <em>left</em> turn — onto it.</p>',
  draw(){ drawPlan(DEMO_OUT, {lead:false}); },
  anim(){ return arcPath(DEMO_OUT).slice(0, 70); }},
 {title:'Flying the arc: 10-10',
  html:'<p>Established, the station is off your <strong>wingtip</strong> (bearing pointer at 90°). Flying straight drifts you outward, so fly short legs: when the pointer falls about <em>10° behind the wingtip</em>, <strong>turn 10° toward the station</strong> — “turn 10, twist 10”.</p><p>Outside the arc? Turn a little more toward the station. Inside? Turn away.</p>',
  draw(){ drawPlan(DEMO, {lead:false}); drawTenTen(DEMO); },
  anim(){ return null; }},
 {title:'Leaving the arc',
  html:'<p>Set the OBS to the <strong>final inbound course</strong> (the 090 radial → <em>270 TO</em>) and watch the needle come alive. Start the turn at the <strong>lead radial</strong>: <strong>LR ≈ 60 × lead ÷ DME</strong> degrees early — about 2° at 120 kts on a 20 DME arc. Many approach charts publish the LR.</p>',
  draw(){ drawPlan(DEMO); },
  anim(){ return arcPath(DEMO); }}
];
let learnStep = 0;
function drawTenTen(p){
  const R = arcR(p.dme), pts = [];
  for(let i = 0; i <= p.sweep + 0.1; i += 10) pts.push(ptOn(p.from + p.dir*i, R));
  cx2.strokeStyle = C.blue; cx2.lineWidth = 1.5;
  cx2.beginPath(); pts.forEach((q,i)=> i ? cx2.lineTo(q.x,q.y) : cx2.moveTo(q.x,q.y)); cx2.stroke();
  pts.forEach(q=>{ cx2.fillStyle = C.blue; cx2.beginPath(); cx2.arc(q.x,q.y,2.5,0,Math.PI*2); cx2.fill(); });
  pill(ptOn(p.from + p.dir*p.sweep/2, R - 28), 'turn 10° every 10°', C.blue);
}
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

/* ---------- EXPLORE ---------- */
const ex = { from: 180, to: 90, dme: 20, gs: 120, start: 30 };
function explorePlan(){ return arcPlan(ex.from, ex.to, ex.dme, ex.gs, ex.start); }
function renderExplore(){
  const p = explorePlan();
  stopAnim();
  drawPlan(p);
  const set = (id, t) => document.getElementById(id).textContent = t;
  set('oDir', 'Arc ' + p.arcWord);
  set('oJoin', `${p.joinTurn} @ ${p.joinAt.toFixed(1)}`);
  set('oHdg', fmt3(p.arcHdg) + '°');
  set('oLr', 'R-' + fmt3(p.lrRadial));
  set('oFinal', fmt3(p.final) + '°');
  set('oLen', p.lengthNm.toFixed(1) + ' NM');
  return p;
}
window.flyArc = () => { const p = renderExplore(); if(p.sweep < 20) return; animate(arcPath(p), () => drawPlan(p), 2); };
[['ctlFrom','valFrom',v=>fmt3(v)+'°','from'],['ctlTo','valTo',v=>fmt3(v)+'°','to'],['ctlDme','valDme',v=>v+' NM','dme'],
 ['ctlStart','valStart',v=>v+' NM','start'],['ctlGs','valGs',v=>v+' kt','gs']].forEach(([id,out,f,k])=>{
  const el = document.getElementById(id);
  el.addEventListener('input', () => { ex[k] = +el.value; document.getElementById(out).textContent = f(ex[k]); renderExplore(); });
});

/* ---------- PRACTICE (quiz) ---------- */
const VORS = ['ABI','FTW','ADM','TXO','SPS','GGG','UIM','BUJ','TTT','FUZ'];
let quiz = null, score = {ok:0,total:0};
try{ score = JSON.parse(localStorage.getItem('dme_score')||'{"ok":0,"total":0}'); }catch(e){}
const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
function makeQuestion(){
  const vor = pick(VORS), dme = pick([10,12,15,18,20]);
  const kind = pick(['heading','join','join','lead']);
  if(kind === 'heading'){
    const radial = Math.floor(Math.random()*36)*10, dir = Math.random()<0.5 ? 1 : -1;
    const ans = norm(radial + dir*90);
    const opts = [ans, norm(radial - dir*90), norm(radial + 180), radial].map(v=>fmt3(v)+'°');
    return { kind, vor, dme, radial, dir,
      text: `You're established on the <span class="mono">${dme} DME</span> arc of <span class="mono">${vor}</span>, flying <strong>${dir>0?'clockwise':'counterclockwise'}</strong>, crossing the <span class="mono">${fmt3(radial)} radial</span>. Heading with no wind?`,
      options: shuffle([...new Set(opts)]), answer: fmt3(ans)+'°',
      why: `On the arc the station is off your wingtip: ${dir>0?'clockwise = radial + 90':'counterclockwise = radial − 90'} → ${fmt3(ans)}°.` };
  }
  if(kind === 'join'){
    const from = Math.floor(Math.random()*36)*10, to = norm(from + pick([1,-1])*pick([60,70,80,90,100,110,120]));
    const inbound = Math.random() < 0.65;
    const start = inbound ? dme + pick([6,8,10,12]) : pick([3,4,5,6]);
    const p = arcPlan(from, to, dme, 120, start);
    const other = p.joinTurn === 'Right' ? 'Left' : 'Right', wrongHdg = norm(from - p.dir*90);
    const ans = `${p.joinTurn} to ${fmt3(p.arcHdg)}°`;
    const opts = [ans, `${other} to ${fmt3(wrongHdg)}°`, `${other} to ${fmt3(p.arcHdg)}°`, `${p.joinTurn} to ${fmt3(wrongHdg)}°`];
    return { kind, vor, dme, plan: p,
      text: `“Arc ${p.arcWord} at <span class="mono">${dme} DME</span> from the <span class="mono">${fmt3(from)} radial</span> to the <span class="mono">${fmt3(to)} radial</span>.” You're ${inbound ? 'inbound' : 'outbound'} on the ${fmt3(from)} radial at <span class="mono">${start} DME</span>. Turn onto the arc?`,
      options: shuffle(opts), answer: ans,
      why: `${inbound ? 'Inbound (heading ' + fmt3(from + 180) + '°)' : 'Outbound (heading ' + fmt3(from) + '°)'}, the arc to the ${fmt3(to)} radial runs ${p.dir>0?'clockwise':'counterclockwise'}: heading radial ${p.dir>0?'+':'−'} 90 = ${fmt3(p.arcHdg)}°, a ${p.joinTurn.toLowerCase()} turn.` };
  }
  const gs = pick([90,100,110,120,140,150,160,180]);
  const to = Math.floor(Math.random()*36)*10, dir = Math.random()<0.5 ? 1 : -1;
  const from = norm(to - dir*pick([70,90,110]));
  const p = arcPlan(from, to, dme, gs, dme + 8);
  const lr = Math.max(1, Math.round(p.lr));
  const ans = 'R-' + fmt3(to - dir*lr);
  const opts = [ans, 'R-' + fmt3(to + dir*lr), 'R-' + fmt3(to - dir*lr*3), 'R-' + fmt3(to)];
  return { kind, vor, dme, gs, plan: p, lr,
    text: `On the <span class="mono">${dme} DME</span> arc of <span class="mono">${vor}</span> at <span class="mono">${gs} kts</span>, ${dir>0?'clockwise':'counterclockwise'}, to turn inbound on the <span class="mono">${fmt3(to)} radial</span>. Lead radial?`,
    options: shuffle([...new Set(opts)]), answer: ans,
    why: `Lead ≈ ${gs}/200 = ${(gs/200).toFixed(2)} NM; 60 × ${(gs/200).toFixed(2)} ÷ ${dme} ≈ ${lr}° before R-${fmt3(to)} (in the direction you're flying) → ${ans}.` };
}
function drawQuestion(reveal){
  const q = quiz;
  if(q.kind === 'heading'){
    SCALE = 150 / q.dme;
    clearScene(); drawCompass(); drawArcRing(q.dme, norm(q.radial - q.dir*40), norm(q.radial + q.dir*40), q.dir);
    drawRadial(q.radial, C.text, 2); pill(ptOn(q.radial, RING_R - 22), 'R-' + fmt3(q.radial));
    drawStation(q.vor);
    const pos = ptOn(q.radial, arcR(q.dme));
    if(reveal) drawPlane({x: pos.x, y: pos.y, h: norm(q.radial + q.dir*90)}, C.ok);
    else { cx2.fillStyle = C.ok; cx2.beginPath(); cx2.arc(pos.x, pos.y, 6, 0, Math.PI*2); cx2.fill(); }
    const ahead = ptOn(norm(q.radial + q.dir*22), arcR(q.dme) + 16);
    labelAt(ahead.x, ahead.y, q.dir > 0 ? '↻ clockwise' : '↺ counterclockwise', C.ok, 11);
    return;
  }
  const p = q.plan;
  // before answering, the highlighted arc would give the join direction away, and the lead radial the LR answer
  drawPlan(p, {lead: reveal, arc: reveal || q.kind !== 'join'});
  if(q.kind === 'join'){
    const pos = ptOn(p.from, p.start*SCALE);
    drawPlane({x: pos.x, y: pos.y, h: p.inbound ? norm(p.from + 180) : p.from}, C.ok);
  } else {
    const b = norm(p.to - p.dir*28), pos = ptOn(b, arcR(p.dme));
    drawPlane({x: pos.x, y: pos.y, h: norm(b + p.dir*90)}, C.ok);
  }
}
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
  drawQuestion(false);
}
window.nextQuestion = nextQuestion;
window.answer = i => {
  if(!quiz || quiz.answered) return;
  quiz.answered = true;
  const picked = quiz.options[i], right = picked === quiz.answer;
  score.total++; if(right) score.ok++;
  try{ localStorage.setItem('dme_score', JSON.stringify(score)); }catch(e){}
  [...document.querySelectorAll('#answers .btn')].forEach((b, k) => {
    b.disabled = true;
    if(quiz.options[k] === quiz.answer) b.classList.add('good');
    else if(k === i) b.classList.add('badpick');
  });
  const fb = document.getElementById('quizFeedback');
  fb.innerHTML = (right ? '<span class="yes">Correct.</span> ' : `<span class="no">Not quite — it's ${quiz.answer}.</span> `) + quiz.why;
  fb.className = 'feedback show';
  document.getElementById('nextQBtn').style.display = 'inline-block';
  updateScore();
  drawQuestion(true);
  if(quiz.plan) animate(arcPath(quiz.plan), () => drawQuestion(true), 3);
};
function updateScore(){
  document.getElementById('scoreLine').textContent =
    score.total ? `Score: ${score.ok}/${score.total} (${Math.round(score.ok/score.total*100)}%)` : 'No attempts yet.';
}

/* ---------- FLY: real-time scenario on an HSI ----------
   Position in NM from the station (x east, y north). The heading bug steers: the airplane turns toward it
   at standard rate. The OBS (CRS) drives the course pointer / CDI (±10° full scale, TO/FROM). Time runs
   faster than real so an arc takes a couple of minutes. */
const fly = { on: false, running: false, speed: 10, view: 'hsi', last: 0, s: null };
window.__dmeFly = fly;                   // debug hook: inspect / script the scenario from the console
function newScenario(){
  const D = pick([10,12,15,18,20]), A = Math.floor(Math.random()*36)*10;
  const dir = Math.random() < 0.5 ? 1 : -1, sweep = pick([60,70,80,90,100,110,120]);
  const B = norm(A + dir*sweep), gs = 120;
  const inbound = Math.random() < 0.7;
  const startD = inbound ? D + 7 + Math.random()*8 : 2.5 + Math.random()*Math.max(1, D - 8);
  // Not on the radial yet. Start on the approach side of it (before A in the arc's direction) so reaching
  // the arc early still leaves the whole arc to fly.
  const off = -dir * (10 + Math.random()*25);
  const r0 = norm(A + off);
  const hdg = inbound ? norm(r0 + 180) : r0;                                   // direct to / away from the station
  const plan = arcPlan(A, B, D, gs, startD);
  fly.s = { plan, D, A, B, dir, gs, inbound,
    x: Math.sin(rad(r0))*startD, y: Math.cos(rad(r0))*startD,
    hdg, bug: hdg, crs: inbound ? norm(r0 + 180) : r0,                         // OBS still set for direct-to
    trail: [], t: 0, step: 0, maxDev: 0, done: false, msg: '' };
  fly.s.trail.push({x: fly.s.x, y: fly.s.y});
  document.getElementById('flyClr').innerHTML =
    `“Arc <strong>${plan.arcWord}</strong> at <span class="mono">${D} DME</span> from the <span class="mono">${fmt3(A)} radial</span> to the <span class="mono">${fmt3(B)} radial</span>, then inbound on the ${fmt3(B)}.” <span class="fly-pos">You're ${startD.toFixed(0)} DME ${inbound ? 'out' : 'in'}, heading ${fmt3(hdg)}°.</span>`;
  syncKnobs(); updateSteps(); drawFly();
}
function flySteps(s){
  const p = s.plan, c1 = s.inbound ? norm(s.A + 180) : s.A;
  return [
    `Set the OBS to <b>${fmt3(c1)}</b> (${s.inbound ? 'TO' : 'FROM'}) for the ${fmt3(s.A)} radial`,
    `Intercept the ${fmt3(s.A)} radial and track it ${s.inbound ? 'inbound' : 'outbound'} (${fmt3(c1)}°) — or join the arc directly if you reach it first`,
    `At about <b>${p.joinAt.toFixed(1)} DME</b> turn ${p.joinTurn.toLowerCase()} to about <b>${fmt3(p.arcHdg)}°</b>`,
    `Fly the arc ${s.dir > 0 ? 'clockwise' : 'counterclockwise'} — hold <b>${s.D} DME ±1</b> (turn 10, twist 10)`,
    `OBS <b>${fmt3(s.B + 180)}</b>; turn inbound at <b>R-${fmt3(p.lrRadial)}</b>, track ${fmt3(s.B + 180)}° to the VOR`
  ];
}
function flyGeom(s){
  const dme = Math.hypot(s.x, s.y), radial = norm(deg(Math.atan2(s.x, s.y)));
  const diff = n180(radial - s.crs), from = Math.abs(diff) < 90;
  const dev = from ? -diff : n180(radial - norm(s.crs + 180));          // + = course is to the right
  return { dme, radial, from, dev, brg: norm(radial + 180) };
}
function evalStep(s, g){
  const p = s.plan, c1 = s.inbound ? norm(s.A + 180) : s.A;
  const within = (a, b, t) => Math.abs(n180(a - b)) <= t;
  // Reaching the arc before the first radial (e.g. from the 210 radial for an arc from the 180): joining it
  // directly and flying through the radial is fine — skip the intercept steps.
  const onArc = Math.abs(g.dme - s.D) <= 1.2 && within(s.hdg, norm(g.radial + s.dir*90), 25);
  if(s.step < 3 && onArc && s.dir * n180(g.radial - s.A) <= 5) { s.step = 3; return false; }
  switch(s.step){
    case 0: return within(s.crs, c1, 2);
    case 1: return within(g.radial, s.A, 3) && within(s.hdg, c1, 25);
    case 2: return Math.abs(g.dme - s.D) <= 1.2 && within(s.hdg, norm(g.radial + s.dir*90), 25);
    case 3: return s.dir * n180(g.radial - s.A) >= p.sweep - p.lr - 1.5;
    case 4: return within(s.crs, norm(s.B + 180), 2) && within(g.radial, s.B, 3) && within(s.hdg, norm(s.B + 180), 20);
  }
  return false;
}
function tick(now){
  if(!fly.on) return;
  const dtReal = fly.last ? Math.min(0.1, (now - fly.last)/1000) : 0;
  fly.last = now;
  const s = fly.s;
  if(fly.running && s && !s.done){
    const dt = dtReal * fly.speed;
    const turn = n180(s.bug - s.hdg), maxTurn = 3*dt;                  // standard rate
    s.hdg = norm(s.hdg + Math.max(-maxTurn, Math.min(maxTurn, turn)));
    const v = s.gs/3600*dt;
    s.x += Math.sin(rad(s.hdg))*v; s.y += Math.cos(rad(s.hdg))*v; s.t += dt;
    const lastT = s.trail[s.trail.length-1];
    if(Math.hypot(s.x - lastT.x, s.y - lastT.y) > 0.15) s.trail.push({x: s.x, y: s.y});
    const g = flyGeom(s);
    if(s.step === 3) s.maxDev = Math.max(s.maxDev, Math.abs(g.dme - s.D));
    while(s.step < 5 && evalStep(s, g)) s.step++;
    s.msg = '';
    if(s.step === 3 && Math.abs(g.dme - s.D) > 1) s.msg = g.dme > s.D ? 'Outside the arc — turn toward the station' : 'Inside the arc — turn away from the station';
    if(g.dme < 0.4){ s.msg = 'Passed over the station — try a new scenario'; fly.running = false; }
    if(g.dme > s.D + 30){ s.msg = 'Too far out — try a new scenario'; fly.running = false; }
    if(s.step >= 5){ s.done = true; fly.running = false; }
    updateSteps();
  }
  drawFly();
  requestAnimationFrame(tick);
}
function updateSteps(){
  const s = fly.s; if(!s) return;
  const steps = flySteps(s), g = flyGeom(s);
  document.getElementById('flyStepN').textContent = s.done ? '✓' : `${s.step + 1}/5`;
  const el = document.getElementById('flyStep');
  if(s.done){
    const grade = s.maxDev <= 0.5 ? 'Nice — tight arc.' : s.maxDev <= 1 ? 'Good — within ±1 NM.' : 'Outside ±1 NM at times — lead the 10° turns earlier.';
    el.innerHTML = `Established inbound. Arc held within <b>±${s.maxDev.toFixed(1)} NM</b> · ${Math.floor(s.t/60)}:${String(Math.round(s.t%60)).padStart(2,'0')} flight time. ${grade}`;
  } else el.innerHTML = steps[s.step];
  const st = document.getElementById('flyStatus');
  st.textContent = s.msg || (s.step === 3 ? `DME ${g.dme.toFixed(1)} (${g.dme - s.D >= 0 ? '+' : ''}${(g.dme - s.D).toFixed(1)})` : '');
  st.classList.toggle('warn', !!s.msg);
  document.getElementById('flyPlay').textContent = fly.running ? 'Pause' : (s.done ? 'Done' : 'Play');
  document.getElementById('flyPlay').disabled = s.done;
}

/* HSI: card turns with heading; course pointer + CDI bar, TO/FROM, bearing pointer to the VOR, heading bug */
function drawHSI(s){
  clearScene();
  const g = flyGeom(s), R = 196, c = STN;
  cx2.fillStyle = '#1b1b1a'; cx2.beginPath(); cx2.arc(c.x, c.y, R + 8, 0, Math.PI*2); cx2.fill();
  cx2.strokeStyle = C.line; cx2.lineWidth = 1.5; cx2.stroke();
  cx2.save(); cx2.translate(c.x, c.y);
  // compass card
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
  // heading bug
  cx2.save(); cx2.rotate(rad(s.bug - s.hdg));
  cx2.fillStyle = C.accent; cx2.beginPath(); cx2.moveTo(-11, -R - 2); cx2.lineTo(11, -R - 2); cx2.lineTo(11, -R + 8); cx2.lineTo(4, -R + 8); cx2.lineTo(0, -R + 3); cx2.lineTo(-4, -R + 8); cx2.lineTo(-11, -R + 8); cx2.closePath(); cx2.fill();
  cx2.restore();
  // bearing pointer to the station
  cx2.save(); cx2.rotate(rad(g.brg - s.hdg));
  cx2.strokeStyle = C.blue; cx2.fillStyle = C.blue; cx2.lineWidth = 2;
  cx2.beginPath(); cx2.moveTo(0, R - 44); cx2.lineTo(0, -R + 52); cx2.stroke();
  cx2.beginPath(); cx2.moveTo(0, -R + 44); cx2.lineTo(7, -R + 58); cx2.lineTo(-7, -R + 58); cx2.closePath(); cx2.fill();
  cx2.restore();
  // course pointer + CDI
  cx2.save(); cx2.rotate(rad(s.crs - s.hdg));
  const dotPx = 22, dev = Math.max(-10, Math.min(10, g.dev)), barX = dev / 2.5 * dotPx;   // 2.5° per dot, 4 dots = full scale
  cx2.fillStyle = 'rgba(240,238,230,0.55)';
  for(let i=-4;i<=4;i++){ if(!i) continue; cx2.beginPath(); cx2.arc(i*dotPx, 0, 3.2, 0, Math.PI*2); cx2.fill(); }
  cx2.strokeStyle = C.ok; cx2.fillStyle = C.ok; cx2.lineWidth = 4; cx2.lineCap = 'round';
  cx2.beginPath(); cx2.moveTo(0, -R + 50); cx2.lineTo(0, -92); cx2.stroke();                    // head shaft
  cx2.beginPath(); cx2.moveTo(0, -R + 40); cx2.lineTo(10, -R + 60); cx2.lineTo(-10, -R + 60); cx2.closePath(); cx2.fill();
  cx2.beginPath(); cx2.moveTo(0, 92); cx2.lineTo(0, R - 44); cx2.stroke();                       // tail
  cx2.beginPath(); cx2.moveTo(barX, -82); cx2.lineTo(barX, 82); cx2.stroke();                   // CDI bar
  cx2.lineCap = 'butt';
  // TO / FROM flag
  cx2.fillStyle = C.text;
  cx2.beginPath();
  if(g.from){ cx2.moveTo(34, 50); cx2.lineTo(46, 50); cx2.lineTo(40, 62); }
  else { cx2.moveTo(34, -50); cx2.lineTo(46, -50); cx2.lineTo(40, -62); }
  cx2.closePath(); cx2.fill();
  cx2.restore();
  // fixed airplane + lubber line
  cx2.fillStyle = C.accent;
  cx2.beginPath(); cx2.moveTo(0, -R - 12); cx2.lineTo(7, -R - 24); cx2.lineTo(-7, -R - 24); cx2.closePath(); cx2.fill();
  cx2.strokeStyle = C.text; cx2.lineWidth = 3; cx2.lineCap = 'round';
  cx2.beginPath(); cx2.moveTo(0, -18); cx2.lineTo(0, 16); cx2.moveTo(-18, -2); cx2.lineTo(18, -2); cx2.moveTo(-7, 13); cx2.lineTo(7, 13); cx2.stroke();
  cx2.lineCap = 'butt';
  cx2.restore();
  // readouts in the corners
  const ro = (x, y, lab, val, align, color) => {
    cx2.textAlign = align; cx2.font = '10px -apple-system, sans-serif'; cx2.fillStyle = C.text3; cx2.fillText(lab, x, y);
    cx2.font = '600 18px '+monoFont(); cx2.fillStyle = color || C.text; cx2.fillText(val, x, y + 20);
  };
  ro(12, 22, 'CRS', fmt3(s.crs) + '°', 'left', C.ok);
  ro(12, 70, 'DME', g.dme.toFixed(1), 'left');                        // top-right corner holds the mini view
  ro(12, H - 34, 'HDG', fmt3(s.hdg) + '°', 'left', C.accent);
  ro(W - 12, H - 34, 'GS', s.gs + ' kt', 'right');
  cx2.textAlign = 'center'; cx2.font = '600 12px '+monoFont(); cx2.fillStyle = C.text2;
  cx2.fillText(g.from ? 'FROM' : 'TO', c.x, H - 12);                  // flag in words too
  cx2.textAlign = 'start';
}
/* Map: north-up, fitted to the arc and the airplane */
function drawMap(s, mini){
  const g = flyGeom(s), p = s.plan;
  SCALE = 196 / Math.max(s.D + 4, g.dme + 2, 8);
  clearScene(); drawCompass();
  drawArcRing(s.D, s.A, s.B, s.dir);
  drawRadial(s.A, 'rgba(240,238,230,0.5)', 1.5, [5,5]);
  drawRadial(s.B, C.text, 2);
  drawRadial(p.lrRadial, C.warn, 1.2, [3,5], arcR(s.D) - 25);
  pill(ptOn(s.A, RING_R - 22), 'R-' + fmt3(s.A));
  pill(ptOn(s.B, RING_R - 22), 'R-' + fmt3(s.B));
  drawStation('VOR');
  const P = t => ({x: STN.x + t.x*SCALE, y: STN.y - t.y*SCALE});
  drawPath(s.trail.map(P).concat([P(s)]), C.accent, mini ? 6 : 2);
  const q = P(s);
  if(mini){ cx2.save(); cx2.translate(q.x, q.y); cx2.scale(2.6, 2.6); cx2.translate(-q.x, -q.y); }   // readable once scaled down
  drawPlane({x: q.x, y: q.y, h: s.hdg}, C.ok);
  if(mini) cx2.restore();
}
/* Fly draws the chosen view full size and the other one as a mini view in the top-right corner
   (tap it to swap). The mini view is rendered offscreen at full size, then scaled into the inset. */
const INSET = { x: W - 176, y: 8, w: 168, h: 168 };
const offCv = document.createElement('canvas');
offCv.width = W*DPR; offCv.height = H*DPR;
const offCx = offCv.getContext('2d');
function drawFly(){
  if(!fly.s) return;
  const main = fly.view === 'map' ? drawMap : drawHSI, mini = fly.view === 'map' ? drawHSI : drawMap;
  const onCx = cx2;
  cx2 = offCx; mini(fly.s, true); cx2 = onCx;
  main(fly.s);
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
// tap the mini view to swap
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
// keyboard: ←/→ heading bug, ↑/↓ course (Shift = 10°) while flying and no field is focused
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
  ['learn','entries','practice','fly'].forEach(m => document.getElementById(m + 'Card').style.display = m === mode ? '' : 'none');
  document.getElementById('notesCard').style.display = mode === 'fly' ? 'none' : '';   // Fly: the arc window gets the room
  stopAnim();
  fly.on = false;
  if(fly.running){ fly.running = false; }                  // leaving Fly pauses it
  if(mode==='learn') renderLearn();
  if(mode==='entries') renderExplore();
  if(mode==='practice') nextQuestion();
  if(mode==='fly') startFly();
};

renderLearn();
})();
