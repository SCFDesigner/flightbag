/* ===== DME Arc Trainer — joining, flying and leaving an arc, plus a quiz =====
   Scene: the VOR/DME at the centre, north up, compass card around it. Distances are scaled so the arc
   sits at ARC_PX whatever its DME, so turn leads (≈ GS/200 NM, a standard-rate turn radius) are drawn
   to the same scale as the arc. */
(function(){
const cv = document.getElementById('arcCanvas');
const cx2 = cv.getContext('2d');
const W = 540, H = 540;
const DPR = Math.min(2, window.devicePixelRatio || 1);
cv.width = W*DPR; cv.height = H*DPR;
cx2.setTransform(DPR,0,0,DPR,0,0);
const STN = {x: W/2, y: H/2};
const ARC_PX = 150;       // the arc's radius on screen
const RING_R = 214;       // compass ring
const C = { bg:'#282827', line:'#45433e', text:'#f0eee6', text2:'#b5b3a9', text3:'#918f84',
            accent:'#d97757', warn:'#d9a545', blue:'#7fb3d9', ok:'#6faf6a' };

const rad = d => d*Math.PI/180;
const norm = d => ((d%360)+360)%360;
const fmt3 = d => String(Math.round(norm(d)) || 360).padStart(3,'0');
const monoFont = () => getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace';

/* ---------- Arc maths ---------- */
const turnRadiusNm = gs => gs / 200;                      // standard-rate turn radius ≈ GS/188; GS/200 is the rule of thumb
const leadDeg = (gs, dme) => 60 * turnRadiusNm(gs) / dme;  // lead radial, degrees before the final radial
/* Arc from radial A to radial B the short way: dir +1 = clockwise (radials increasing), −1 = counterclockwise */
function arcPlan(from, to, dme, gs){
  const d = norm(to - from);
  const dir = d <= 180 ? 1 : -1;
  const sweep = dir > 0 ? d : 360 - d;
  const lr = leadDeg(gs, dme);
  return { from, to, dme, gs, dir, sweep, lead: turnRadiusNm(gs), lr,
           lrRadial: norm(to - dir*lr),                  // start the turn inbound here
           arcHdg: norm(from + dir*90),                  // heading when established on the arc
           final: norm(to + 180),                        // inbound course on the final radial
           lengthNm: 2*Math.PI*dme*sweep/360 };
}

/* ---------- Path DSL (same as the Hold Trainer): headings 0 = up; {s:len} straight, {a:deg, r} arc ---------- */
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
/* Outbound on `from`, lead-turn onto the arc, fly it, lead-turn inbound on `to`, continue to 2 NM.
   The lead turns are sized so their circle just touches the arc (centre DME − r from the station), so
   the airplane rolls out exactly on the arc, tangent to it, and later exactly on the final radial. */
function arcPath(p){
  const px = ARC_PX / p.dme;                          // px per NM
  const r = p.lead, start = 1.5;                      // NM; start 1.5 NM out on the radial
  const d0 = Math.sqrt(Math.max(0.01, (p.dme - r)**2 - r*r));   // straight run before the join turn
  const j = Math.atan(r / d0) * 180/Math.PI;          // bearing gained during each lead turn
  const arcSweep = Math.max(0, p.sweep - 2*j);
  return buildPath(ptOn(p.from, start*px), p.from, [
    {s: (d0 - start)*px},
    {a: p.dir*(90 + j), r: r*px},
    {a: p.dir*arcSweep, r: ARC_PX},
    {a: p.dir*(90 + j), r: r*px},
    {s: (d0 - 2)*px}
  ]);
}
const ptOn = (bearing, dist) => ({x: STN.x + Math.sin(rad(bearing))*dist, y: STN.y - Math.cos(rad(bearing))*dist});

/* ---------- Drawing ---------- */
function clearScene(){
  cx2.setTransform(DPR,0,0,DPR,0,0);
  cx2.clearRect(0,0,W,H);
  cx2.fillStyle = C.bg; cx2.fillRect(0,0,W,H);
  cx2.strokeStyle = 'rgba(255,255,255,0.04)'; cx2.lineWidth = 1;
  for(let x=0;x<W;x+=46){cx2.beginPath();cx2.moveTo(x,0);cx2.lineTo(x,H);cx2.stroke();}
  for(let y=0;y<H;y+=46){cx2.beginPath();cx2.moveTo(0,y);cx2.lineTo(W,y);cx2.stroke();}
  drawCompass();
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
  // VOR/DME: hexagon in a square
  cx2.strokeStyle = C.text; cx2.lineWidth = 1.5;
  cx2.strokeRect(STN.x-8, STN.y-8, 16, 16);
  cx2.beginPath();
  for(let i=0;i<6;i++){ const a = rad(60*i+30); const x = STN.x + Math.cos(a)*6, y = STN.y + Math.sin(a)*6; i ? cx2.lineTo(x,y) : cx2.moveTo(x,y); }
  cx2.closePath(); cx2.stroke();
  cx2.fillStyle = C.text; cx2.beginPath(); cx2.arc(STN.x, STN.y, 1.6, 0, Math.PI*2); cx2.fill();
  if(label){ cx2.fillStyle = C.text3; cx2.font = '11px '+monoFont(); cx2.textAlign = 'center'; cx2.fillText(label, STN.x, STN.y + 24); cx2.textAlign = 'start'; }
}
function drawArcRing(dme, from, to, dir){
  // the whole DME circle faint, the flown part bright
  cx2.strokeStyle = 'rgba(240,238,230,0.14)'; cx2.lineWidth = 1; cx2.setLineDash([4,6]);
  cx2.beginPath(); cx2.arc(STN.x, STN.y, ARC_PX, 0, Math.PI*2); cx2.stroke(); cx2.setLineDash([]);
  if(from !== undefined){
    const a0 = rad(from - 90), a1 = rad(to - 90);
    cx2.strokeStyle = 'rgba(240,238,230,0.45)'; cx2.lineWidth = 2; cx2.setLineDash([7,6]);
    cx2.beginPath(); cx2.arc(STN.x, STN.y, ARC_PX, a0, a1, dir < 0); cx2.stroke(); cx2.setLineDash([]);
  }
  const q = ptOn(from === undefined ? 45 : dir < 0 ? norm(from + 40) : norm(from - 40), ARC_PX + 12);
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
/* Full plan scene: outbound radial, arc, lead radial, final radial + labels */
function drawPlan(p, opts){
  opts = opts || {};
  clearScene();
  if(opts.arc === false) drawArcRing(p.dme); else drawArcRing(p.dme, p.from, p.to, p.dir);
  drawRadial(p.from, 'rgba(240,238,230,0.35)', 1.5, [5,5]);
  drawRadial(p.to, C.text, 2);
  if(opts.lead !== false){ drawRadial(p.lrRadial, C.warn, 1.5, [3,5], ARC_PX - 30); pill(ptOn(p.lrRadial, RING_R - 22), 'LR-' + fmt3(p.lrRadial), C.warn); }
  pill(ptOn(p.from, RING_R - 22), 'R-' + fmt3(p.from));
  pill(ptOn(p.to, RING_R - 50), 'R-' + fmt3(p.to) + ' · IN ' + fmt3(p.final) + '°');
  drawStation('VOR');
}

/* ---------- Animation ---------- */
let raf=null, animPts=null, animI=0, staticDraw=null;
function stopAnim(){ if(raf){cancelAnimationFrame(raf); raf=null;} }
function animate(pts, drawScene, speed){
  stopAnim();
  animPts=pts; animI=0; staticDraw=drawScene;
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
const DEMO = arcPlan(90, 180, 10, 110);
const STEPS = [
 {title:'What is a DME arc?',
  html:'<p>A DME arc is a curved course flown at a <strong>constant distance</strong> from a VOR/DME — say the <em>10 DME arc</em>. Approaches and departures use arcs to move you around the station to the final approach course without flying over it.</p><p>You always know where you are on the arc from the <strong>radial</strong> you are crossing.</p>',
  draw(){ drawPlan(DEMO, {lead:false}); },
  anim(){ return arcPath(DEMO); }},
 {title:'Joining the arc',
  html:'<p>Flying <strong>outbound on a radial</strong>, the arc is 90° to your course. Start the turn <em>before</em> reaching the DME by about your turn radius: <strong>lead ≈ GS ÷ 200 NM</strong> — ½ NM at 100 kts, ¾ NM at 150.</p><p>Turn the short way toward the final course; you roll out on a heading of <strong>radial ± 90°</strong>.</p>',
  draw(){ drawPlan(DEMO, {lead:false}); },
  anim(){ return arcPath(DEMO).slice(0, 80); }},
 {title:'Flying the arc: 10-10',
  html:'<p>Established, the station is off your <strong>wingtip</strong> (RMI/bearing pointer at 90°). An airplane flying straight drifts away from the arc, so fly it as a series of short legs: when the pointer falls about <em>10° behind the wingtip</em>, <strong>turn 10° toward the station</strong>.</p><p>Drifting outside the arc? Turn a little more toward the station. Inside? Turn away. Wind shifts where the pointer sits, not the idea.</p>',
  draw(){ drawPlan(DEMO, {lead:false}); drawTenTen(DEMO); },
  anim(){ return null; }},
 {title:'Leaving the arc',
  html:'<p>Start the turn inbound on the final radial <em>early</em>, at the <strong>lead radial</strong>: <strong>LR ≈ 60 × lead ÷ DME</strong> degrees before it — at 110 kts on a 10 DME arc about <em>3°</em>. Many approach charts publish the LR.</p><p>Roll out on the final course: the <strong>reciprocal of the radial</strong>, inbound to the station.</p>',
  draw(){ drawPlan(DEMO); },
  anim(){ return arcPath(DEMO); }}
];
let learnStep = 0;
/* 10-10 legs along the demo arc: chords that each turn 10° */
function drawTenTen(p){
  const pts = [];
  for(let b = p.from; p.dir > 0 ? b <= p.from + p.sweep + 0.1 : b >= p.from - p.sweep - 0.1; b += p.dir*10) pts.push(ptOn(b, ARC_PX));
  cx2.strokeStyle = C.blue; cx2.lineWidth = 1.5;
  cx2.beginPath(); pts.forEach((q,i)=> i ? cx2.lineTo(q.x,q.y) : cx2.moveTo(q.x,q.y)); cx2.stroke();
  pts.forEach(q=>{ cx2.fillStyle = C.blue; cx2.beginPath(); cx2.arc(q.x,q.y,2.5,0,Math.PI*2); cx2.fill(); });
  const mid = ptOn(p.from + p.dir*p.sweep/2, ARC_PX - 28);
  pill(mid, 'turn 10° every 10°', C.blue);
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
const ex = { from: 90, to: 180, dme: 10, gs: 110 };
function explorePlan(){ return arcPlan(ex.from, ex.to, ex.dme, ex.gs); }
function renderExplore(){
  const p = explorePlan();
  stopAnim();
  drawPlan(p);
  const set = (id, t) => document.getElementById(id).textContent = t;
  set('oDir', p.dir > 0 ? 'Clockwise' : 'Counter-CW');
  set('oHdg', fmt3(p.arcHdg) + '°');
  set('oLead', p.lead.toFixed(1) + ' NM');
  set('oLr', 'R-' + fmt3(p.lrRadial));
  set('oFinal', fmt3(p.final) + '°');
  set('oLen', p.lengthNm.toFixed(1) + ' NM');
  return p;
}
window.flyArc = () => { const p = renderExplore(); if(p.sweep < 20) return; animate(arcPath(p), () => drawPlan(p), 2); };
[['ctlFrom','valFrom',v=>fmt3(v)+'°','from'],['ctlTo','valTo',v=>fmt3(v)+'°','to'],['ctlDme','valDme',v=>v+' NM','dme'],['ctlGs','valGs',v=>v+' kt','gs']].forEach(([id,out,f,k])=>{
  const el = document.getElementById(id);
  el.addEventListener('input', () => { ex[k] = +el.value; document.getElementById(out).textContent = f(ex[k]); renderExplore(); });
});

/* ---------- PRACTICE ---------- */
const VORS = ['ABI','FTW','ADM','TXO','SPS','GGG','UIM','BUJ','TTT','FUZ'];
let quiz = null, score = {ok:0,total:0};
try{ score = JSON.parse(localStorage.getItem('dme_score')||'{"ok":0,"total":0}'); }catch(e){}
const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
/* Three kinds of question: heading on the arc, which way to turn onto it, and the lead radial */
function makeQuestion(){
  const vor = pick(VORS), dme = pick([7,8,10,12,13,15,16,18,20]);
  const kind = pick(['heading','join','lead']);
  if(kind === 'heading'){
    const radial = Math.floor(Math.random()*36)*10, dir = Math.random()<0.5 ? 1 : -1;
    const ans = norm(radial + dir*90);
    const opts = [ans, norm(radial - dir*90), norm(radial + 180), radial].map(v=>fmt3(v)+'°');
    return { kind, vor, dme, radial, dir,
      text: `You're established on the <span class="mono">${dme} DME</span> arc of <span class="mono">${vor}</span>, flying <strong>${dir>0?'clockwise':'counterclockwise'}</strong>, crossing the <span class="mono">${fmt3(radial)} radial</span>. Heading with no wind?`,
      options: shuffle([...new Set(opts)]).slice(0,4), answer: fmt3(ans)+'°',
      why: `On the arc the station is off your wingtip: ${dir>0?'clockwise = radial + 90':'counterclockwise = radial − 90'} → ${fmt3(ans)}°.` };
  }
  if(kind === 'join'){
    const from = Math.floor(Math.random()*36)*10, to = norm(from + pick([1,-1])*pick([60,70,80,90,100,110,120]));
    const p = arcPlan(from, to, dme, 120);
    const ans = `${p.dir>0?'Right':'Left'} to ${fmt3(p.arcHdg)}°`;
    const opts = [ans, `${p.dir>0?'Left':'Right'} to ${fmt3(norm(from - p.dir*90))}°`, `${p.dir>0?'Left':'Right'} to ${fmt3(p.arcHdg)}°`, `${p.dir>0?'Right':'Left'} to ${fmt3(norm(from - p.dir*90))}°`];
    return { kind, vor, dme, plan: p,
      text: `Outbound on the <span class="mono">${fmt3(from)} radial</span> of <span class="mono">${vor}</span> to join the <span class="mono">${dme} DME</span> arc, then inbound on the <span class="mono">${fmt3(to)} radial</span>. Which turn onto the arc?`,
      options: shuffle(opts), answer: ans,
      why: `Go the short way from R-${fmt3(from)} to R-${fmt3(to)}: ${p.dir>0?'clockwise, a right turn':'counterclockwise, a left turn'} to radial ${p.dir>0?'+':'−'} 90 = ${fmt3(p.arcHdg)}°.` };
  }
  const gs = pick([90,100,110,120,140,150,160,180]);
  const to = Math.floor(Math.random()*36)*10, dir = Math.random()<0.5 ? 1 : -1;
  const from = norm(to - dir*pick([70,90,110]));
  const p = arcPlan(from, to, dme, gs);
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
    clearScene(); drawArcRing(q.dme, norm(q.radial - q.dir*40), norm(q.radial + q.dir*40), q.dir);
    drawRadial(q.radial, C.text, 2); pill(ptOn(q.radial, RING_R - 22), 'R-' + fmt3(q.radial));
    drawStation(q.vor);
    const pos = ptOn(q.radial, ARC_PX);
    // before the answer the plane is a dot; after, it points along the arc
    if(reveal) drawPlane({x: pos.x, y: pos.y, h: norm(q.radial + q.dir*90)}, C.ok);
    else { cx2.fillStyle = C.ok; cx2.beginPath(); cx2.arc(pos.x, pos.y, 6, 0, Math.PI*2); cx2.fill(); }
    // direction of travel along the arc
    const ahead = ptOn(norm(q.radial + q.dir*22), ARC_PX + 16);
    labelAt(ahead.x, ahead.y, q.dir > 0 ? '↻ clockwise' : '↺ counterclockwise', C.ok, 11);
    return;
  }
  const p = q.plan;
  // the highlighted arc would give the join direction away, and the lead radial the LR answer
  drawPlan(p, {lead: reveal, arc: reveal || q.kind !== 'join'});
  if(q.kind === 'join'){
    const pos = ptOn(p.from, ARC_PX*0.55);
    drawPlane({x: pos.x, y: pos.y, h: p.from}, C.ok);
  } else {
    const pos = ptOn(norm(p.to - p.dir*28), ARC_PX);
    drawPlane({x: pos.x, y: pos.y, h: norm(p.to - p.dir*28 + p.dir*90)}, C.ok);
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

/* ---------- Mode switching ---------- */
window.setMode = mode => {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.mode===mode));
  document.getElementById('learnCard').style.display    = mode==='learn'   ? '' : 'none';
  document.getElementById('entriesCard').style.display  = mode==='entries' ? '' : 'none';
  document.getElementById('practiceCard').style.display = mode==='practice'? '' : 'none';
  stopAnim();
  if(mode==='learn') renderLearn();
  if(mode==='entries') renderExplore();
  if(mode==='practice') nextQuestion();
};

renderLearn();
})();
