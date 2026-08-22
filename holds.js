/* ===== Hold Trainer — hold anatomy, entries, and quiz ===== */
(function(){
const cv = document.getElementById('holdCanvas');
const cx2 = cv.getContext('2d');
const W = cv.width, H = cv.height;
const FIX = {x: W/2, y: H/2 - 14};
const LEG = 108;          // inbound/outbound leg length (px)
const R   = 40;           // turn radius (px)
const C = { bg:'#2b2a28', line:'#45433e', text:'#f0eee6', text2:'#b5b3a9', text3:'#918f84',
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
    } else {
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

/* Fly from the current end of a path back to the fix: turn to parallel the
   inbound course, cut toward the course line at 35°, then ride it in. */
function closeToFix(segs, dir){
  // build what we have so far to find the endpoint
  const built = buildPath(segStart.pos, segStart.hdg, segs);
  const end = built[built.length-1];
  const addl = [];
  let h = end.h;
  // 1. turn (shortest) to inbound-course heading (0 in hold frame)
  const d0 = shortestTurn(h, 0);
  if(Math.abs(d0) > 2) addl.push({a:d0, r:30});
  // recompute endpoint after that turn
  const b2 = buildPath(segStart.pos, segStart.hdg, segs.concat(addl));
  const e2 = b2[b2.length-1];
  const dx = FIX.x - e2.x;
  const dy = e2.y - FIX.y;   // must be positive (fix ahead/above)
  if(Math.abs(dx) > 6 && dy > 30){
    const icpt = 35 * Math.sign(dx);
    const run = Math.min(Math.abs(dx)/Math.sin(rad(35)), Math.max(20, dy-30));
    addl.push({a:icpt, r:24}, {s:run}, {a:-icpt, r:24});
  }
  const b3 = buildPath(segStart.pos, segStart.hdg, segs.concat(addl));
  const e3 = b3[b3.length-1];
  const rem = e3.y - FIX.y;
  if(rem > 4) addl.push({s:rem});
  return segs.concat(addl);
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
    // side, one minute out, then a pattern-direction turn back to intercept
    const tdH = dir>0 ? 150 : 210;
    segs = closeToFix([{s:APPROACH}, {a:shortestTurn(rel, tdH), r:26}, {s:LEG*1.1}, {a:dir*195, r:R}], dir);
  } else {
    // parallel: outbound on the reciprocal, then reverse toward the holding
    // side through more than 180° and come back to the course
    segs = closeToFix([{s:APPROACH}, {a:shortestTurn(rel, 180), r:26}, {s:LEG}, {a:-dir*205, r:34}], dir);
  }
  return buildPath(segStart.pos, segStart.hdg, segs);
}

/* ---------- Drawing ---------- */
function clearScene(){
  cx2.clearRect(0,0,W,H);
  cx2.fillStyle = C.bg; cx2.fillRect(0,0,W,H);
  cx2.strokeStyle = 'rgba(255,255,255,0.04)'; cx2.lineWidth = 1;
  for(let x=0;x<W;x+=46){cx2.beginPath();cx2.moveTo(x,0);cx2.lineTo(x,H);cx2.stroke();}
  for(let y=0;y<H;y+=46){cx2.beginPath();cx2.moveTo(0,y);cx2.lineTo(W,y);cx2.stroke();}
}
function drawFix(label){
  cx2.fillStyle = C.text;
  cx2.beginPath();
  const s=7;
  cx2.moveTo(FIX.x, FIX.y-s); cx2.lineTo(FIX.x+s, FIX.y+s*0.8); cx2.lineTo(FIX.x-s, FIX.y+s*0.8);
  cx2.closePath(); cx2.fill();
  cx2.fillStyle = C.text3; cx2.font = '11px '+getComputedStyle(document.body).getPropertyValue('--mono');
  cx2.textAlign='center';
  cx2.fillText(label || 'FIX', FIX.x, FIX.y + 22);
  cx2.textAlign='start';
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
function drawCourseArrow(){
  // inbound course arrow pointing at the fix from below
  const y0 = FIX.y + LEG + 26;
  cx2.strokeStyle = C.text3; cx2.lineWidth = 1.5; cx2.setLineDash([6,5]);
  cx2.beginPath(); cx2.moveTo(FIX.x, y0); cx2.lineTo(FIX.x, FIX.y+12); cx2.stroke();
  cx2.setLineDash([]);
  cx2.fillStyle = C.text3;
  cx2.beginPath();
  cx2.moveTo(FIX.x, FIX.y+12); cx2.lineTo(FIX.x-4, FIX.y+20); cx2.lineTo(FIX.x+4, FIX.y+20);
  cx2.closePath(); cx2.fill();
}
function labelAt(x,y,txt,color,size){
  cx2.fillStyle = color || C.text2;
  cx2.font = (size||11)+'px -apple-system, sans-serif';
  cx2.textAlign='center'; cx2.fillText(txt, x, y); cx2.textAlign='start';
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
    cx2.arc(FIX.x, FIX.y, 205, a0, a1);
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
  draw(){ sceneRacetrack(-1, true); labelAt(FIX.x, 30, 'NONSTANDARD — LEFT TURNS', C.warn, 12); },
  anim(){ return racetrack(-1); }},
 {title:'Direct entry',
  html:'<p>Arriving from the <em>direct sector</em> (the wide 180° side): cross the fix and simply <strong>turn to the outbound heading</strong> — you fall straight into the pattern.</p><p>This is the entry for roughly half of all arrivals.</p>',
  draw(){ sceneRacetrack(1, false); drawSectors(0, 1); },
  anim(){ return entryPathFrom(0, 'DIRECT', 1); }},
 {title:'Teardrop entry',
  html:'<p>Arriving within the narrow <em>70° teardrop sector</em>: cross the fix, fly <strong>outbound offset 30°</strong> toward the holding side for one minute, then turn toward the inbound course and intercept it back to the fix.</p>',
  draw(){ sceneRacetrack(1, false); drawSectors(0, 1); },
  anim(){ return entryPathFrom(150, 'TEARDROP', 1); }},
 {title:'Parallel entry',
  html:'<p>Arriving from the <em>110° parallel sector</em>: cross the fix, <strong>parallel the course outbound</strong> on the non-holding side for one minute, then turn <em>through more than 180°</em> back toward the fix to intercept the inbound course.</p>',
  draw(){ sceneRacetrack(1, false); drawSectors(0, 1); },
  anim(){ return entryPathFrom(230, 'PARALLEL', 1); }},
 {title:'The 70° rule',
  html:'<p>The sectors come from one line drawn through the fix at <strong>70° to the inbound course</strong>. It splits the "arriving from ahead" half into the <em>teardrop</em> (70°) and <em>parallel</em> (110°) sectors; everything else is <em>direct</em> (180°).</p><p>These are guides, not regulations — pick the entry that keeps you closest to the pattern.</p>',
  draw(){ sceneRacetrack(1, false); drawSectors(0, 1); drawSectorEdges(); },
  anim(){ return null; }},
 {title:'Timing & wind',
  html:'<p><strong>Timing:</strong> start the outbound clock wings-level or abeam the fix, whichever comes later. If the inbound leg came out short, extend the outbound leg; long, shorten it — aim for <em>1 minute inbound</em>.</p><p><strong>Wind:</strong> find the crab angle that holds the inbound course, then apply <em>triple that correction</em> on the outbound leg, into the wind.</p>',
  draw(){ sceneRacetrack(1, true); labelAt(FIX.x + 118, FIX.y + LEG/2 + 8, 'time this leg', C.warn, 11); labelAt(FIX.x, FIX.y + LEG + 44, 'start clock abeam the fix', C.text3, 10); },
  anim(){ return racetrack(1); }}
];
let learnStep = 0;

function drawSectorEdges(){
  [110, 290].forEach(a=>{
    cx2.strokeStyle = 'rgba(240,238,230,0.35)'; cx2.lineWidth = 1.5; cx2.setLineDash([4,5]);
    cx2.beginPath(); cx2.moveTo(FIX.x, FIX.y);
    cx2.lineTo(FIX.x + Math.sin(rad(a))*205, FIX.y - Math.cos(rad(a))*205);
    cx2.stroke();
  });
  cx2.setLineDash([]);
  labelAt(FIX.x+150, FIX.y+90, '70°', C.text, 13);
}
function sceneRacetrack(dir, withLabels){
  clearScene();
  drawCourseArrow();
  drawPath(racetrack(dir), 'rgba(240,238,230,0.35)', 2, [7,6]);
  drawFix('FIX');
  if(withLabels){
    const side = dir>0 ? 1 : -1;
    labelAt(FIX.x + side*(2*R+14), FIX.y + LEG/2 + 4, 'outbound', C.text3, 11);
    labelAt(FIX.x - side*14 - (side>0?0:0), FIX.y + LEG/2 + 4, '', C.text3, 11);
    labelAt(FIX.x - side*36, FIX.y + LEG/2 + 4, 'inbound', C.text2, 11);
    labelAt(FIX.x, FIX.y - 34, (dir>0?'RIGHT':'LEFT')+' TURNS', C.text2, 11);
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
  drawFix('FIX');
  // north tick
  labelAt(FIX.x, 16, 'N', C.text3, 12);
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
  // scene: hold drawn, sectors hidden until answered
  clearScene();
  cx2.save();
  cx2.translate(FIX.x, FIX.y); cx2.rotate(rad(quiz.course)); cx2.translate(-FIX.x, -FIX.y);
  drawPath(racetrack(quiz.dir), 'rgba(240,238,230,0.4)', 2, [7,6]);
  cx2.restore();
  drawFix(quiz.vor);
  labelAt(FIX.x, 16, 'N', C.text3, 12);
  const hd=quiz.heading;
  drawPlane({x:FIX.x - Math.sin(rad(hd))*150, y:FIX.y + Math.cos(rad(hd))*150, h:hd}, C.ok);
  labelAt(FIX.x - Math.sin(rad(hd))*150, FIX.y + Math.cos(rad(hd))*150 + 24, 'hdg '+fmt3(hd)+'°', C.ok, 11);
}
window.nextQuestion = nextQuestion;
window.answer = pick => {
  if(!quiz) return;
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
    drawFix(quiz.vor);
    labelAt(FIX.x, 16, 'N', C.text3, 12);
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
