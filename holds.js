/* ===== Hold Trainer — hold anatomy, entries, and quiz ===== */
(function(){
const cv = document.getElementById('holdCanvas');
const cx2 = cv.getContext('2d');
/* Logical 540×540 scene, drawn at device resolution so text stays crisp */
const W = 540, H = 540;
const DPR = Math.min(2, window.devicePixelRatio || 1);
cv.width = W*DPR; cv.height = H*DPR;
cx2.setTransform(DPR,0,0,DPR,0,0);
const FIX = {x: W/2, y: H/2};
const SECT_R = 200;       // entry-sector pie radius (px)
const RING_R = 214;       // compass ring radius (px)
const LEG = 108;          // inbound/outbound leg length (px)
const R   = 40;           // turn radius (px)
const C = { bg:'#282827', line:'#45433e', text:'#f0eee6', text2:'#b5b3a9', text3:'#918f84',
            accent:'#d97757', warn:'#d9a545', blue:'#7fb3d9', ok:'#6faf6a' };

const rad = d => d*Math.PI/180;
const norm = d => ((d%360)+360)%360;
const fmt3 = d => String(Math.round(norm(d))).padStart(3,'0');

/* ---------- Path DSL ----------
   Build a polyline by flying segments from a start point/heading.
   Headings are compass-style relative to the canvas: 0 = up, 90 = right.
   {s:len} straight; {a:deg, r:radius} arc (positive = right turn). */
function buildPath(start, hdg0, segs){
  const pts = [];
  let x=start.x, y=start.y, h=hdg0;
  const push=()=>pts.push({x,y,h:norm(h)});
  push();
  segs.forEach(sg=>{
    if(sg.s !== undefined){
      const steps = Math.max(2, Math.round(sg.s/4));
      for(let i=1;i<=steps;i++){
        x += Math.sin(rad(h)) * sg.s/steps;
        y -= Math.cos(rad(h)) * sg.s/steps;
        push();
      }
    } else if(Math.abs(sg.a) > 0.01){
      const r = sg.r || R, dir = sg.a >= 0 ? 1 : -1, total = Math.abs(sg.a);
      const steps = Math.max(4, Math.round(total/6));
      for(let i=1;i<=steps;i++){
        const dh = dir*total/steps;
        // move along the arc: rotate about the turn center
        const cxp = x + Math.sin(rad(h + dir*90))*r;
        const cyp = y - Math.cos(rad(h + dir*90))*r;
        const a0 = Math.atan2(x-cxp, -(y-cyp));
        const a1 = a0 + rad(dh);
        x = cxp + Math.sin(a1)*r;
        y = cyp - Math.cos(a1)*r;
        h += dh;
        push();
      }
    }
  });
  return pts;
}

/* Racetrack path in "hold frame" (inbound course = up, right turns put the
   pattern on the right). dir = +1 right turns, -1 left. Starts at the fix. */
function racetrack(dir){
  return buildPath(FIX, 0, [
    {a:dir*180}, {s:LEG}, {a:dir*180}, {s:LEG}
  ]);
}
function shortestTurn(from, to){ return ((to - from + 540)%360) - 180; }

/* End point of a segment list flown from segStart (hold frame). */
function endOf(segs){ const b = buildPath(segStart.pos, segStart.hdg, segs); return b[b.length-1]; }

/* From a 45° intercept heading (315 when right of the course, 045 when left),
   fly straight just long enough that one 45° turn rolls out exactly on the
   inbound course, tangent to it — no S-jog — then ride the course to the fix. */
function interceptToFix(segs){
  const e = endOf(segs);
  const x = e.x - FIX.x, side = Math.sign(x) || 1;
  let r2 = 30;
  const lead = r2*(1 - Math.cos(rad(45)));          // lateral distance the 45° turn covers
  let d = (Math.abs(x) - lead) / Math.sin(rad(45));
  if(d < 0){ r2 = Math.abs(x)/(1 - Math.cos(rad(45))); d = 0; }
  const out = segs.concat(d > 1 ? [{s:d}] : [], [{a:side*45, r:r2}]);
  const rem = endOf(out).y - FIX.y;
  return rem > 1 ? out.concat({s:rem}) : out;
}
/* Straight segment then a pattern-direction turn to the inbound heading (0),
   radius picked so the turn rolls out tangent on the course line. */
function turnOntoCourse(segs, dir, turn){
  const e = endOf(segs), h = e.h;
  // lateral shift of an arc from heading h to 0: right = r(cos h − 1), left = r(1 − cos h)
  const k = dir > 0 ? Math.cos(rad(h)) - 1 : 1 - Math.cos(rad(h));
  const r = (FIX.x - e.x) / k;
  const out = segs.concat({a:turn, r});
  const rem = endOf(out).y - FIX.y;
  return rem > 1 ? out.concat({s:rem}) : out;
}

/* Entry path built FROM the aircraft's actual arrival direction.
   rel = arrival heading relative to the inbound course (hold frame). */
let segStart = {pos:{x:0,y:0}, hdg:0};
function entryPathFrom(rel, entry, dir){
  const APPROACH = 170;
  segStart = {
    pos: { x: FIX.x - Math.sin(rad(rel))*APPROACH,
           y: FIX.y + Math.cos(rad(rel))*APPROACH },
    hdg: rel
  };
  let segs;
  if(entry==='DIRECT'){
    // cross the fix and turn (in the pattern direction) onto the outbound leg
    const turn = dir>0 ? norm(180 - rel) : -norm(rel - 180);
    segs = [{s:APPROACH}, {a:turn}, {s:LEG}, {a:dir*180}, {s:LEG}];
  } else if(entry==='TEARDROP'){
    // cross the fix, take up the 30°-offset teardrop heading on the holding
    // side for one minute, then one pattern-direction turn (210°) that rolls
    // out on the inbound course
    const tdH = dir>0 ? 150 : 210;
    segs = turnOntoCourse([{s:APPROACH}, {a:shortestTurn(rel, tdH), r:26}, {s:LEG}], dir, dir*210);
  } else {
    // parallel: outbound on the reciprocal (non-holding side) for one minute,
    // turn toward the holding side through 225° to a 45° intercept, then
    // intercept the inbound course back to the fix
    segs = interceptToFix([{s:APPROACH}, {a:shortestTurn(rel, 180), r:26}, {s:LEG}, {a:-dir*225, r:34}]);
  }
  return buildPath(segStart.pos, segStart.hdg, segs);
}

/* ---------- Drawing ---------- */
/* View rotation: 0 = north up. The quiz can fly heading-up (like an HSI): the whole scene turns so your
   heading points up. clearScene() sets the rotation for the scene; text is always drawn upright. */
let VIEW = 0;
function upPt(x, y){        // scene point → unrotated canvas point
  if(!VIEW) return {x, y};
  const a = -rad(VIEW), dx = x - FIX.x, dy = y - FIX.y;
  return {x: FIX.x + dx*Math.cos(a) - dy*Math.sin(a), y: FIX.y + dx*Math.sin(a) + dy*Math.cos(a)};
}
function upright(fn){ cx2.save(); cx2.setTransform(DPR,0,0,DPR,0,0); fn(); cx2.restore(); }
function clearScene(){
  cx2.setTransform(DPR,0,0,DPR,0,0);
  cx2.clearRect(0,0,W,H);
  cx2.fillStyle = C.bg; cx2.fillRect(0,0,W,H);
  cx2.strokeStyle = 'rgba(255,255,255,0.04)'; cx2.lineWidth = 1;
  for(let x=0;x<W;x+=46){cx2.beginPath();cx2.moveTo(x,0);cx2.lineTo(x,H);cx2.stroke();}
  for(let y=0;y<H;y+=46){cx2.beginPath();cx2.moveTo(0,y);cx2.lineTo(W,y);cx2.stroke();}
  if(VIEW){ cx2.translate(FIX.x, FIX.y); cx2.rotate(-rad(VIEW)); cx2.translate(-FIX.x, -FIX.y); }
  drawCompass();
}
/* Compass card around the pie: ticks every 5°, numbers every 30° (aviation
   style — N 3 6 E 12 15 S 21 24 W 30 33). Turns with the view; labels stay upright. */
function drawCompass(){
  cx2.strokeStyle = C.line; cx2.lineWidth = 1;
  cx2.beginPath(); cx2.arc(FIX.x, FIX.y, RING_R, 0, Math.PI*2); cx2.stroke();
  for(let d=0; d<360; d+=5){
    const len = d%30===0 ? 11 : d%10===0 ? 7 : 4;
    const s = Math.sin(rad(d)), c = Math.cos(rad(d));
    cx2.strokeStyle = d%30===0 ? C.text2 : C.text3;
    cx2.lineWidth = d%30===0 ? 1.5 : 1;
    cx2.beginPath();
    cx2.moveTo(FIX.x + s*RING_R, FIX.y - c*RING_R);
    cx2.lineTo(FIX.x + s*(RING_R+len), FIX.y - c*(RING_R+len));
    cx2.stroke();
  }
  const names = {0:'N', 90:'E', 180:'S', 270:'W'};
  upright(() => {
    cx2.font = '600 12px '+monoFont();
    cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
    for(let d=0; d<360; d+=30){
      const r = RING_R + 23, q = upPt(FIX.x + Math.sin(rad(d))*r, FIX.y - Math.cos(rad(d))*r);
      cx2.fillStyle = d===0 ? C.accent : names[d] ? C.text : C.text2;
      cx2.fillText(names[d] || String(d/10), q.x, q.y);
    }
  });
}
/* The inbound leg's bearing line: from the compass ring along the holding
   radial (course + 180) into the fix, arrowhead at the fix. `tag` labels it. */
function drawInbound(course, tag){
  const b = norm(course + 180), s = Math.sin(rad(b)), c = Math.cos(rad(b));
  const at = r => ({x: FIX.x + s*r, y: FIX.y - c*r});
  const p0 = at(RING_R), p1 = at(15);
  cx2.strokeStyle = C.text; cx2.globalAlpha = 0.85; cx2.lineWidth = 2;
  cx2.beginPath(); cx2.moveTo(p0.x, p0.y); cx2.lineTo(p1.x, p1.y); cx2.stroke();
  // arrowhead pointing at the fix (direction of flight on the inbound leg)
  cx2.save(); cx2.translate(p1.x, p1.y); cx2.rotate(rad(course));
  cx2.fillStyle = C.text;
  cx2.beginPath(); cx2.moveTo(0,-2); cx2.lineTo(5,9); cx2.lineTo(-5,9); cx2.closePath(); cx2.fill();
  cx2.restore(); cx2.globalAlpha = 1;
  // bright tick where the radial meets the ring
  const t0 = at(RING_R - 6), t1 = at(RING_R + 13);
  cx2.strokeStyle = C.text; cx2.lineWidth = 3;
  cx2.beginPath(); cx2.moveTo(t0.x, t0.y); cx2.lineTo(t1.x, t1.y); cx2.stroke();
  if(tag) pill(at(166), tag);
}
function monoFont(){ return getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace'; }
/* Small label with a backing plate, so it reads over lines and sectors */
function pill(p, txt){ upright(() => pillFlat(upPt(p.x, p.y), txt)); }
function pillFlat(p, txt){
  cx2.font = '600 11px '+monoFont();
  const w = cx2.measureText(txt).width + 14, h = 20;
  const x = Math.max(4, Math.min(W - w - 4, p.x - w/2)), y = p.y - h/2;
  cx2.fillStyle = 'rgba(25,25,24,0.92)';
  cx2.strokeStyle = 'rgba(240,238,230,0.45)'; cx2.lineWidth = 1;
  cx2.beginPath(); cx2.roundRect(x, y, w, h, 5); cx2.fill(); cx2.stroke();
  cx2.fillStyle = C.text; cx2.textAlign = 'left'; cx2.textBaseline = 'middle';
  cx2.fillText(txt, x + 7, y + h/2 + 0.5);
  cx2.textAlign = 'start'; cx2.textBaseline = 'alphabetic';
}
function drawFix(label){
  cx2.fillStyle = C.text;
  cx2.beginPath();
  const s=7;
  cx2.moveTo(FIX.x, FIX.y-s); cx2.lineTo(FIX.x+s, FIX.y+s*0.8); cx2.lineTo(FIX.x-s, FIX.y+s*0.8);
  cx2.closePath(); cx2.fill();
  upright(() => {
    cx2.fillStyle = C.text3; cx2.font = '11px '+monoFont();
    cx2.textAlign='center';
    cx2.fillText(label || 'FIX', FIX.x, FIX.y + 22);
  });
}
function drawPath(pts, color, width, dash){
  if(!pts.length) return;
  cx2.strokeStyle = color; cx2.lineWidth = width || 2;
  if(dash) cx2.setLineDash(dash);
  cx2.beginPath(); cx2.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p=>cx2.lineTo(p.x,p.y));
  cx2.stroke(); cx2.setLineDash([]);
}
function drawPlane(p, color){
  cx2.save();
  cx2.translate(p.x, p.y); cx2.rotate(rad(p.h));
  cx2.fillStyle = color || C.text;
  cx2.beginPath();
  cx2.moveTo(0,-10); cx2.lineTo(7,6); cx2.lineTo(0,2); cx2.lineTo(-7,6);
  cx2.closePath(); cx2.fill();
  cx2.restore();
}
function labelAt(x,y,txt,color,size){
  const q = upPt(x, y);
  upright(() => {
    cx2.fillStyle = color || C.text2;
    cx2.font = (size||11)+'px -apple-system, sans-serif';
    cx2.textAlign='center'; cx2.fillText(txt, q.x, q.y);
  });
}
/* Sector fan around the fix. Sector angles are absolute canvas headings
   ("from" direction of arrival tracks). */
function drawSectors(course, dir, rot){
  const defs = sectorDefs(dir);
  defs.forEach(d=>{
    // paint the APPROACH side: a sector holds arrival headings, so the
    // region the traffic comes from is 180° opposite those headings
    const a0 = rad(norm(course + d.from + 180) + (rot||0) - 90);
    const a1 = rad(norm(course + d.from + 180) + d.span + (rot||0) - 90);
    cx2.fillStyle = d.fill;
    cx2.beginPath();
    cx2.moveTo(FIX.x, FIX.y);
    cx2.arc(FIX.x, FIX.y, SECT_R, a0, a1);
    cx2.closePath(); cx2.fill();
  });
}
/* Sectors expressed as arrival-heading ranges relative to the inbound course.
   heading rel = (heading - course). Right turns: teardrop (110..180],
   parallel (180..290], direct otherwise. Left mirrors. */
function sectorDefs(dir){
  if(dir>0) return [
    {name:'TEARDROP', from:110, span:70,  fill:'rgba(217,165,69,0.14)'},
    {name:'PARALLEL', from:180, span:110, fill:'rgba(127,179,217,0.12)'},
    {name:'DIRECT',   from:290, span:180, fill:'rgba(217,119,87,0.10)'}
  ];
  return [
    {name:'PARALLEL', from:70,  span:110, fill:'rgba(127,179,217,0.12)'},
    {name:'TEARDROP', from:180, span:70,  fill:'rgba(217,165,69,0.14)'},
    {name:'DIRECT',   from:250, span:180, fill:'rgba(217,119,87,0.10)'}
  ];
}
function entryFor(heading, course, dir){
  const b = norm(heading - course);
  if(dir>0){
    if(b>110 && b<=180) return 'TEARDROP';
    if(b>180 && b<=290) return 'PARALLEL';
    return 'DIRECT';
  }
  if(b>=70 && b<180) return 'PARALLEL';
  if(b>=180 && b<250) return 'TEARDROP';
  return 'DIRECT';
}

/* ---------- Animation ---------- */
let raf=null, animPts=null, animI=0, animDone=null, staticDraw=null;
function stopAnim(){ if(raf){cancelAnimationFrame(raf); raf=null;} }
function animate(pts, drawScene, done){
  stopAnim();
  animPts=pts; animI=0; animDone=done||null; staticDraw=drawScene;
  const step=()=>{
    drawScene();
    drawPath(animPts.slice(0, animI+1), C.accent, 2.5);
    drawPlane(animPts[Math.min(animI, animPts.length-1)]);
    animI += 2;
    if(animI < animPts.length){ raf=requestAnimationFrame(step); }
    else { raf=null; if(animDone) animDone(); }
  };
  step();
}

/* ---------- LEARN ---------- */
const STEPS = [
 {title:'What is a hold?',
  html:'<p>A holding pattern is a <strong>racetrack</strong> flown at a <strong>fix</strong> — a VOR, an intersection, or a GPS waypoint. It parks you in a known block of airspace while you wait.</p><p>The pattern has four parts: cross the fix, <em>outbound turn</em>, <em>outbound leg</em>, <em>inbound turn</em>, then the <em>inbound leg</em> back to the fix along the holding course.</p>',
  draw(){ sceneRacetrack(1, true); },
  anim(){ return racetrack(1); }},
 {title:'Standard vs nonstandard',
  html:'<p>A <strong>standard</strong> hold uses <em>right turns</em> — assume right turns unless told otherwise. A <strong>nonstandard</strong> hold uses left turns and will be stated ("left turns").</p><p>Legs are timed: <strong>1 minute inbound</strong> at or below 14,000 MSL, 1½ minutes above.</p>',
  draw(){ sceneRacetrack(-1, true); },
  anim(){ return racetrack(-1); }},
 {title:'Direct entry',
  html:'<p>Arriving from the <em>direct sector</em> (the wide 180° side): cross the fix and simply <strong>turn to the outbound heading</strong> — you fall straight into the pattern.</p><p>This is the entry for roughly half of all arrivals.</p>',
  draw(){ sceneRacetrack(1, false, true); },
  anim(){ return entryPathFrom(0, 'DIRECT', 1); }},
 {title:'Teardrop entry',
  html:'<p>Arriving within the narrow <em>70° teardrop sector</em>: cross the fix, fly <strong>outbound offset 30°</strong> toward the holding side for one minute, then turn toward the inbound course and intercept it back to the fix.</p>',
  draw(){ sceneRacetrack(1, false, true); },
  anim(){ return entryPathFrom(150, 'TEARDROP', 1); }},
 {title:'Parallel entry',
  html:'<p>Arriving from the <em>110° parallel sector</em>: cross the fix, <strong>parallel the course outbound</strong> on the non-holding side for one minute, then turn <em>through more than 180°</em> back toward the fix to intercept the inbound course.</p>',
  draw(){ sceneRacetrack(1, false, true); },
  anim(){ return entryPathFrom(230, 'PARALLEL', 1); }},
 {title:'The 70° rule',
  html:'<p>The sectors come from one line drawn through the fix at <strong>70° to the inbound course</strong>. It splits the "arriving from ahead" half into the <em>teardrop</em> (70°) and <em>parallel</em> (110°) sectors; everything else is <em>direct</em> (180°).</p><p>These are guides, not regulations — pick the entry that keeps you closest to the pattern.</p>',
  draw(){ sceneRacetrack(1, false, true); drawSectorEdges(); },
  anim(){ return null; }},
 {title:'Timing & wind',
  html:'<p><strong>Timing:</strong> start the outbound clock wings-level or abeam the fix, whichever comes later. If the inbound leg came out short, extend the outbound leg; long, shorten it — aim for <em>1 minute inbound</em>.</p><p><strong>Wind:</strong> find the crab angle that holds the inbound course, then apply <em>triple that correction</em> on the outbound leg, into the wind.</p>',
  draw(){ sceneRacetrack(1, true); labelAt(FIX.x + 118, FIX.y + LEG/2 + 8, 'time this leg', C.warn, 11); labelAt(FIX.x + 2*R, FIX.y - R - 12, 'start clock abeam the fix', C.text3, 10); },
  anim(){ return racetrack(1); }}
];
let learnStep = 0;

function drawSectorEdges(){
  [110, 290].forEach(a=>{
    cx2.strokeStyle = 'rgba(240,238,230,0.35)'; cx2.lineWidth = 1.5; cx2.setLineDash([4,5]);
    cx2.beginPath(); cx2.moveTo(FIX.x, FIX.y);
    cx2.lineTo(FIX.x + Math.sin(rad(a))*SECT_R, FIX.y - Math.cos(rad(a))*SECT_R);
    cx2.stroke();
  });
  cx2.setLineDash([]);
  labelAt(FIX.x+150, FIX.y+90, '70°', C.text, 13);
}
function sceneRacetrack(dir, withLabels, withSectors){
  clearScene();
  if(withSectors) drawSectors(0, dir);
  drawPath(racetrack(dir), 'rgba(240,238,230,0.35)', 2, [7,6]);
  drawInbound(0, 'INBOUND 360° · R-180');
  drawFix('FIX');
  if(withLabels){
    const side = dir>0 ? 1 : -1;
    labelAt(FIX.x + side*(2*R+14), FIX.y + LEG/2 + 4, 'outbound', C.text3, 11);
    labelAt(FIX.x - side*36, FIX.y + LEG/2 + 4, 'inbound', C.text2, 11);
    labelAt(FIX.x, FIX.y - R - 22, dir>0 ? 'STANDARD · RIGHT TURNS' : 'NONSTANDARD · LEFT TURNS', dir>0 ? C.text2 : C.warn, 11);
  }
}
function renderLearn(){
  const st = STEPS[learnStep];
  document.getElementById('learnTitle').textContent = st.title;
  document.getElementById('learnBody').innerHTML = st.html;
  document.getElementById('learnPrev').disabled = learnStep===0;
  document.getElementById('learnNext').disabled = learnStep===STEPS.length-1;
  const dots = document.getElementById('learnDots');
  dots.innerHTML = STEPS.map((_,i)=>`<span class="${i===learnStep?'on':''}"></span>`).join('');
  stopAnim();
  st.draw();
  const pts = st.anim();
  if(pts) animate(pts, st.draw.bind(st));
}
window.learnStepMove = d => { learnStep = Math.max(0, Math.min(STEPS.length-1, learnStep+d)); renderLearn(); };
window.replayLearn = () => renderLearn();

/* ---------- ENTRIES (explorer) ---------- */
let exCourse = 360, exHeading = 45, exDir = 1;
function renderEntries(animPath){
  clearScene();
  // rotate the whole scene so the inbound course points its true direction
  cx2.save();
  cx2.translate(FIX.x, FIX.y); cx2.rotate(rad(exCourse)); cx2.translate(-FIX.x, -FIX.y);
  drawPath(racetrack(exDir), 'rgba(240,238,230,0.4)', 2, [7,6]);
  cx2.restore();
  drawSectors(exCourse, exDir);
  drawInbound(exCourse, 'INBOUND '+fmt3(exCourse)+'° · R-'+fmt3(exCourse+180));
  drawFix('FIX');
  // arrival arrow along your heading TO the fix
  const hd = exHeading;
  const ax = FIX.x - Math.sin(rad(hd))*185, ay = FIX.y + Math.cos(rad(hd))*185;
  cx2.strokeStyle = C.ok; cx2.lineWidth = 2.5;
  cx2.beginPath(); cx2.moveTo(ax,ay); cx2.lineTo(FIX.x - Math.sin(rad(hd))*24, FIX.y + Math.cos(rad(hd))*24); cx2.stroke();
  drawPlane({x:FIX.x - Math.sin(rad(hd))*40, y:FIX.y + Math.cos(rad(hd))*40, h:hd}, C.ok);
  labelAt(ax, ay-8, 'YOU · hdg '+fmt3(hd)+'°', C.ok, 11);
  const entry = entryFor(exHeading, exCourse, exDir);
  document.getElementById('entryName').textContent = entry;
}
window.setTurns = t => {
  exDir = t==='R' ? 1 : -1;
  document.getElementById('segR').classList.toggle('on', t==='R');
  document.getElementById('segL').classList.toggle('on', t==='L');
  renderEntries();
};
window.flyEntry = () => {
  const entry = entryFor(exHeading, exCourse, exDir);
  const rel = norm(exHeading - exCourse);
  const pts = entryPathFrom(rel, entry, exDir).map(p=>{
    // rotate the hold-frame path to the actual course
    const dx=p.x-FIX.x, dy=p.y-FIX.y, a=rad(exCourse);
    return {x: FIX.x + dx*Math.cos(a) - dy*Math.sin(a),
            y: FIX.y + dx*Math.sin(a) + dy*Math.cos(a),
            h: p.h + exCourse};
  });
  animate(pts, ()=>renderEntries());
};

/* ---------- PRACTICE ---------- */
const VORS = ['ABI','FTW','ADM','TXO','SPS','GGG','UIM','BUJ','TTT','FUZ'];
let quiz=null, score={ok:0,total:0};
try{ score = JSON.parse(localStorage.getItem('holds_score')||'{"ok":0,"total":0}'); }catch(e){}
// Hide the racetrack while answering, to practise picturing it from just the radial and your position.
// It is always revealed with the answer.
let showPattern = true;
try{ showPattern = localStorage.getItem('holds_showPattern') !== '0'; }catch(e){}
// Heading-up (default): the scene turns so your heading points up, like the HSI; off = north up.
let headingUp = true;
try{ headingUp = localStorage.getItem('holds_headingUp') !== '0'; }catch(e){}
function nextQuestion(){
  const radial = Math.floor(Math.random()*36)*10;
  const dir = Math.random()<0.7 ? 1 : -1;             // standard more common
  const heading = Math.floor(Math.random()*36)*10;
  const course = norm(radial+180);                    // hold ON the radial: inbound = reciprocal
  const cardinals=['north','NE','east','SE','south','SW','west','NW'];
  const cardinal = cardinals[Math.round(norm(radial)/45)%8];
  quiz = {radial, dir, heading, course, vor: VORS[Math.floor(Math.random()*VORS.length)],
          answer: entryFor(heading, course, dir), cardinal};
  document.getElementById('quizText').innerHTML =
    `Hold ${quiz.cardinal} of the <span class="mono">${quiz.vor}</span> VOR on the ` +
    `<span class="mono">${fmt3(radial)} radial</span>${dir<0?', <strong>left turns</strong>':''}. ` +
    `You are heading <span class="mono">${fmt3(heading)}°</span> direct to the fix.<br>Which entry?`;
  ['ansDirect','ansTeardrop','ansParallel'].forEach(id=>{
    const b=document.getElementById(id); b.disabled=false; b.classList.remove('good','badpick');
  });
  document.getElementById('quizFeedback').className='feedback';
  document.getElementById('nextQBtn').style.display='none';
  updateScore();
  quiz.answered = false;
  drawQuizQuestion();
}
/* Question scene: radial + your arrival; the hold itself only when "Show pattern" is on. Sectors stay
   hidden until answered. */
function drawQuizQuestion(){
  VIEW = headingUp ? quiz.heading : 0;
  clearScene();
  if(showPattern){
    cx2.save();
    cx2.translate(FIX.x, FIX.y); cx2.rotate(rad(quiz.course)); cx2.translate(-FIX.x, -FIX.y);
    drawPath(racetrack(quiz.dir), 'rgba(240,238,230,0.4)', 2, [7,6]);
    cx2.restore();
  }
  drawInbound(quiz.course, 'R-'+fmt3(quiz.radial));
  drawFix(quiz.vor);
  const hd=quiz.heading;
  drawPlane({x:FIX.x - Math.sin(rad(hd))*150, y:FIX.y + Math.cos(rad(hd))*150, h:hd}, C.ok);
  labelAt(FIX.x - Math.sin(rad(hd))*150, FIX.y + Math.cos(rad(hd))*150 + 24, 'hdg '+fmt3(hd)+'°', C.ok, 11);
}
window.nextQuestion = nextQuestion;
window.setShowPattern = on => {
  showPattern = !!on;
  try{ localStorage.setItem('holds_showPattern', on ? '1' : '0'); }catch(e){}
  document.getElementById('patOn').classList.toggle('on', showPattern);
  document.getElementById('patOff').classList.toggle('on', !showPattern);
  if(quiz && !quiz.answered){ stopAnim(); drawQuizQuestion(); }
};
window.setHeadingUp = on => {
  headingUp = !!on;
  try{ localStorage.setItem('holds_headingUp', on ? '1' : '0'); }catch(e){}
  document.getElementById('viewHdg').classList.toggle('on', headingUp);
  document.getElementById('viewNorth').classList.toggle('on', !headingUp);
  if(!quiz) return;
  VIEW = headingUp ? quiz.heading : 0;
  if(!quiz.answered){ stopAnim(); drawQuizQuestion(); }
  else if(staticDraw){ stopAnim(); staticDraw(); drawPath(animPts, C.accent, 2.5); drawPlane(animPts[animPts.length-1]); }
};
window.answer = pick => {
  if(!quiz || quiz.answered) return;
  quiz.answered = true;
  const right = pick === quiz.answer;
  score.total++; if(right) score.ok++;
  try{ localStorage.setItem('holds_score', JSON.stringify(score)); }catch(e){}
  const map={DIRECT:'ansDirect',TEARDROP:'ansTeardrop',PARALLEL:'ansParallel'};
  document.getElementById(map[quiz.answer]).classList.add('good');
  if(!right) document.getElementById(map[pick]).classList.add('badpick');
  ['ansDirect','ansTeardrop','ansParallel'].forEach(id=>document.getElementById(id).disabled=true);
  const fb=document.getElementById('quizFeedback');
  const b=norm(quiz.heading - quiz.course);
  fb.innerHTML = (right?'<span class="yes">Correct.</span> ':'<span class="no">Not quite — it\'s '+quiz.answer+'.</span> ')+
    `Inbound course <span style="font-family:var(--mono)">${fmt3(quiz.course)}°</span> (reciprocal of the ${fmt3(quiz.radial)} radial). `+
    `Your heading is ${b}° off the inbound course, which lands in the ${quiz.answer.toLowerCase()} sector.`;
  fb.className='feedback show';
  document.getElementById('nextQBtn').style.display='inline-block';
  updateScore();
  // reveal sectors + fly the correct entry
  const drawQuizScene=()=>{
    clearScene();
    cx2.save();
    cx2.translate(FIX.x, FIX.y); cx2.rotate(rad(quiz.course)); cx2.translate(-FIX.x, -FIX.y);
    drawPath(racetrack(quiz.dir), 'rgba(240,238,230,0.4)', 2, [7,6]);
    cx2.restore();
    drawSectors(quiz.course, quiz.dir);
    drawInbound(quiz.course, 'R-'+fmt3(quiz.radial)+' · INBOUND '+fmt3(quiz.course)+'°');
    drawFix(quiz.vor);
  };
  const pts = entryPathFrom(norm(quiz.heading - quiz.course), quiz.answer, quiz.dir).map(p=>{
    const dx=p.x-FIX.x, dy=p.y-FIX.y, a=rad(quiz.course);
    return {x: FIX.x + dx*Math.cos(a) - dy*Math.sin(a),
            y: FIX.y + dx*Math.sin(a) + dy*Math.cos(a),
            h: p.h + quiz.course};
  });
  animate(pts, drawQuizScene);
};
function updateScore(){
  document.getElementById('scoreLine').textContent =
    score.total ? `Score: ${score.ok}/${score.total} (${Math.round(score.ok/score.total*100)}%)` : 'No attempts yet.';
}

/* ---------- Mode switching ---------- */
window.setMode = mode => {
  VIEW = 0;                                   // learn / entries are always north-up
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.mode===mode));
  document.getElementById('learnCard').style.display    = mode==='learn'   ? '' : 'none';
  document.getElementById('entriesCard').style.display  = mode==='entries' ? '' : 'none';
  document.getElementById('practiceCard').style.display = mode==='practice'? '' : 'none';
  stopAnim();
  if(mode==='learn') renderLearn();
  if(mode==='entries') renderEntries();
  if(mode==='practice') nextQuestion();
};

/* ---------- Controls ---------- */
document.getElementById('ctlCourse').addEventListener('input', e=>{
  exCourse = norm(parseInt(e.target.value)) || 360;
  document.getElementById('valCourse').textContent = fmt3(exCourse)+'°';
  renderEntries();
});
document.getElementById('ctlHeading').addEventListener('input', e=>{
  exHeading = norm(parseInt(e.target.value));
  document.getElementById('valHeading').textContent = fmt3(exHeading)+'°';
  renderEntries();
});

renderLearn();
})();
