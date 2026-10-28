/* Diagrams & tables drawn for IFR Atlas. Colors come from CSS tokens so both themes work. */
const VIS = {};
const svgWrap = (vb, body, label) => `<figure class="fig"><button type="button" class="zoomable svgz" aria-label="Enlarge diagram"><svg viewBox="${vb}" role="img" aria-label="${label}" class="dia">${body}</svg></button><figcaption>tap to enlarge</figcaption></figure>`;
const T = (x, y, s, cls = "", extra = "") => `<text x="${x}" y="${y}" class="${cls}" ${extra}>${s}</text>`;

VIS.pitotstatic = () => svgWrap("0 0 560 250", `
  <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10z" class="f-ink"/></marker></defs>
  <rect x="18" y="40" width="70" height="16" rx="8" class="s-ink f-panel"/>${T(53,32,"PITOT TUBE","lbl","text-anchor=middle")}
  ${T(53,74,"ram air","sm","text-anchor=middle")}
  <rect x="18" y="170" width="70" height="26" rx="4" class="s-ink f-panel"/>${T(53,163,"STATIC PORT","lbl","text-anchor=middle")}
  ${T(53,212,"still air","sm","text-anchor=middle")}
  ${T(53,232,"(+ alternate static)","sm","text-anchor=middle")}
  <path d="M88 48 H230 V95" class="pipe pitot" marker-end="url(#ah)"/>
  <path d="M88 183 H190 V150 H230" class="pipe static" marker-end="url(#ah)"/>
  <path d="M190 183 H350 V150" class="pipe static" marker-end="url(#ah)"/>
  <path d="M350 183 H470 V150" class="pipe static" marker-end="url(#ah)"/>
  <circle cx="250" cy="125" r="28" class="gauge"/>${T(250,129,"ASI","g","text-anchor=middle")}
  <circle cx="370" cy="125" r="28" class="gauge"/>${T(370,129,"ALT","g","text-anchor=middle")}
  <circle cx="490" cy="125" r="28" class="gauge"/>${T(490,129,"VSI","g","text-anchor=middle")}
  ${T(140,40,"pitot pressure → ASI only","sm c-pitot")}
  ${T(270,210,"static pressure → ASI · ALT · VSI","sm c-static")}
`, "Pitot feeds only the airspeed indicator; static feeds airspeed, altimeter and VSI");

VIS.holding = () => {
  const fx = 340, fy = 120;
  const ray = (b, len) => { const r = b * Math.PI / 180; return [fx + Math.sin(r) * len, fy - Math.cos(r) * len]; };
  const [a1x, a1y] = ray(20, 125), [a2x, a2y] = ray(200, 150), [a3x, a3y] = ray(90, 170);
  return svgWrap("0 0 560 290", `
  <defs><marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" class="f-accent"/></marker></defs>
  <path d="M${a1x} ${a1y} L${a2x} ${a2y}" class="sector"/><path d="M${fx} ${fy} L${a3x} ${a3y}" class="sector"/>
  <path d="M150 ${fy} H${fx} A40 40 0 0 1 ${fx} ${fy+80} H150 A40 40 0 0 1 150 ${fy}" class="race"/>
  <path d="M190 ${fy} H300" class="race-in" marker-end="url(#ah2)"/>
  <path d="M290 ${fy+80} H200" class="race-in" marker-end="url(#ah2)"/>
  <polygon points="${fx},${fy-8} ${fx+7},${fy+5} ${fx-7},${fy+5}" class="f-ink"/>
  ${T(fx+8,fy+20,"FIX","lbl")}
  ${T(200,fy-8,"inbound 090° · 1 min","sm")}${T(185,fy+98,"outbound 270°","sm")}
  ${T(140,fy+45,"holding side","sm muted")}
  ${T(110,40,"DIRECT","lbl c-green")}${T(110,56,"180° sector","sm")}
  ${T(410,40,"TEARDROP","lbl c-accent")}${T(410,56,"70° · fly 30° offset","sm")}
  ${T(410,215,"PARALLEL","lbl c-mag")}${T(410,231,"110° · outbound on the","sm")}${T(410,245,"non-holding side","sm")}
  ${T(20,280,"Right turns · sector lines pass through the fix at 20°/200° and along the inbound course","sm muted")}
`, "Standard right-hand holding pattern with direct, teardrop and parallel entry sectors"); };

VIS.altitudes = () => svgWrap("0 0 600 280", `
  <path d="M0 260 L120 238 L220 246 L300 222 L380 200 L430 150 L480 168 L540 120 L600 140 L600 280 L0 280z" class="terrain"/>
  <rect x="40" y="110" width="80" height="60" class="sig"/><rect x="300" y="110" width="80" height="60" class="sig"/>
  ${T(46,190,"≤22 NM of VOR: signal OK","sm c-green")}${T(306,190,"≤22 NM","sm c-green")}
  <line x1="40" y1="110" x2="380" y2="110" class="mea"/>${T(46,102,"MEA 6,000 — signal + obstacles","sm b")}
  <line x1="40" y1="170" x2="380" y2="170" class="moca"/>${T(46,164,"*4,500 MOCA — obstacles only","sm")}
  <line x1="380" y1="62" x2="590" y2="62" class="mea"/>${T(450,54,"MEA 9,000","sm b")}
  <path d="M325 110 L380 80" class="climb"/><line x1="372" y1="80" x2="388" y2="80" class="s-ink"/>
  ${T(392,96,"MCA 8,000 ✕ cross at/above","sm c-mag")}
  <line x1="220" y1="30" x2="220" y2="230" class="fixline"/>${T(226,40,"MRA 7,000 ⓡ","sm c-accent")}${T(226,56,"to receive the cross-radial","sm muted")}
  <circle cx="40" cy="232" r="6" class="nav"/>${T(40,252,"VOR A","sm","text-anchor=middle")}
  <circle cx="380" cy="190" r="6" class="nav"/>${T(392,212,"VOR B","sm")}
  <polygon points="220,226 226,236 214,236" class="f-ink"/>${T(220,250,"INT","sm","text-anchor=middle")}
`, "Enroute minimum altitudes: MEA, MOCA, MRA and MCA along an airway");

VIS.altitudes2 = () => svgWrap("0 0 560 210", `
  <line x1="20" y1="60" x2="540" y2="60" class="fixline"/>${T(24,52,"what you think: 5,000 indicated all the way","sm muted")}
  <path d="M30 60 C200 62 340 95 530 128" class="climb"/>${T(280,150,"what happens: true altitude sinks","sm c-mag")}
  <path d="M0 210 L0 180 L160 186 L330 172 L450 165 L560 160 L560 210z" class="terrain"/>
  ${T(30,32,"HIGH 30.20 / warm","lbl c-green")}${T(390,32,"LOW 29.80 / cold","lbl c-mag")}
  <path d="M520 128 l-14 -5 l0 10z" class="f-mag"/>
  ${T(130,200,"High to low (or hot to cold) — look out below","sm b")}
`, "Flying into lower pressure or colder air makes the altimeter read high");

VIS.oxygen = () => {
  const rows = [[15000, "everyone must be PROVIDED O₂", "c-mag"], [14000, "required crew USES O₂ the whole time", "c-accent"], [12500, "required crew uses O₂ after 30 min", "c-green"]];
  const y = a => 200 - (a - 10000) / 6000 * 180;
  return svgWrap("0 0 520 220", `
  <line x1="70" y1="20" x2="70" y2="200" class="s-line"/>
  ${rows.map(([a, s, c]) => `<line x1="70" y1="${y(a)}" x2="500" y2="${y(a)}" class="mea ${c}"/>${T(64,y(a)+4,a.toLocaleString(),"sm","text-anchor=end")}${T(84,y(a)-6,s,"sm "+c)}`).join("")}
  ${T(64,y(10000)+4,"10,000","sm muted","text-anchor=end")}${T(84,192,"no requirement (Part 91, unpressurized cabin altitude)","sm muted")}
`, "Supplemental oxygen thresholds 12,500, 14,000 and 15,000 feet"); };

VIS.climb = () => svgWrap("0 0 600 230", `
  <rect x="20" y="196" width="150" height="10" class="rwy"/>${T(95,222,"runway","sm","text-anchor=middle")}
  <line x1="170" y1="196" x2="170" y2="150" class="fixline"/>${T(176,160,"DER","sm b")}
  <path d="M120 196 L170 186 L570 46" class="climb"/>${T(330,96,"200 ft/NM (standard)","sm c-accent b")}
  <path d="M170 196 L570 130" class="moca"/>${T(380,190,"40:1 obstacle surface (152 ft/NM)","sm muted")}
  ${T(176,182,"cross DER ≥ 35 ft","sm")}
  <circle cx="300" cy="140" r="5" class="f-mag"/>${T(292,118,"400 ft above runway → may turn","sm c-mag","text-anchor=end")}
  ${T(20,24,"No DP published? Ensure obstacle clearance by:","sm b")}
`, "Standard departure climb: 35 ft at DER, 200 ft per NM, 400 ft before turning");

VIS.damda = () => svgWrap("0 0 600 250", `
  <rect x="500" y="214" width="90" height="8" class="rwy"/>
  <polygon points="80,40 92,52 80,64 68,52" class="f-ink"/>${T(80,30,"FAF","sm","text-anchor=middle")}
  <path d="M80 52 L470 200" class="climb c-green"/>${T(220,98,"ILS / LPV: glidepath to DA","sm c-green b")}
  <line x1="420" y1="160" x2="600" y2="160" class="moca c-green"/>${T(424,152,"DA 250","sm c-green")}
  <path d="M80 52 L170 52 L210 120 L340 120 L370 182 L560 182" class="race-in c-accent"/>
  ${T(225,140,"stepdown fix","sm c-accent")}${T(300,202,"LOC / LNAV: level at MDA","sm c-accent b")}
  <line x1="300" y1="182" x2="600" y2="182" class="moca c-accent"/>
  ${T(436,240,"V = VDP","sm c-mag")}<text x="448" y="176" class="lbl c-mag">V</text>
  <line x1="560" y1="170" x2="560" y2="222" class="fixline"/>${T(566,206,"MAP","sm")}
`, "Precision descent to a decision altitude compared with non-precision descent to a minimum descent altitude");

VIS.vdp = () => svgWrap("0 0 560 170", `
  <rect x="460" y="140" width="90" height="8" class="rwy"/>
  <line x1="40" y1="60" x2="460" y2="60" class="moca c-accent"/>${T(44,52,"MDA (HAT 600 ft)","sm c-accent")}
  <path d="M300 60 L470 140" class="climb c-green"/>${T(250,44,"V","lbl c-mag")}<line x1="300" y1="60" x2="300" y2="140" class="fixline"/>
  ${T(300,162,"≈ 600 ÷ 300 = 2 NM","sm","text-anchor=middle")}${T(360,120,"normal ~3° descent","sm c-green")}
`, "Visual descent point from the MDA");

VIS.ils = () => svgWrap("0 0 600 350", `
  ${T(16,22,"TOP VIEW — localizer","lbl")}
  <path d="M90 95 L560 40 L560 150 Z" class="fan"/><path d="M90 95 L560 70 L560 120 Z" class="fan2"/>
  <rect x="40" y="90" width="50" height="10" class="rwy"/>${T(30,84,"LOC antenna (far end)","sm")}
  ${T(400,64,"±10° to 18 NM","sm")}${T(460,40,"±35° to 10 NM","sm")}${T(140,132,"3–6° wide · 700 ft at threshold · full scale ≈ 2.5°","sm c-accent")}
  ${T(16,190,"SIDE VIEW — glideslope","lbl")}
  <line x1="20" y1="300" x2="590" y2="300" class="s-line"/>
  <rect x="40" y="296" width="80" height="6" class="rwy"/>
  <path d="M95 300 L590 210" class="climb c-green"/><path d="M95 300 L590 196 M95 300 L590 224" class="moca c-green"/>
  ${T(300,290,"3° glideslope · 1.4° thick (±0.7°)","sm c-green b")}
  <path d="M95 300 L330 180" class="moca c-mag"/>${T(340,180,"false glideslopes (steeper)","sm c-mag")}
  ${[["IM",150],["MM",230],["OM",470]].map(([m,x])=>`<line x1="${x}" y1="300" x2="${x}" y2="${300-(x-95)*0.182-14}" class="fixline"/>${T(x,318,m,"sm b","text-anchor=middle")}`).join("")}${T(16,340,"IM: CAT II DH · MM: ~3,500 ft out, near CAT I DA · OM: 4–7 NM, glideslope intercept","sm muted")}
`, "ILS localizer coverage from above and glideslope geometry from the side");

const tbl = (head, rows, cls = "") => `<div class="tbl-wrap"><table class="tbl ${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

VIS.blockage = () => tbl(["Blocked", "Airspeed", "Altimeter", "VSI"], [
  ["Pitot ram inlet; drain open", "drops to zero", "normal", "normal"],
  ["Pitot inlet + drain", "acts like an altimeter (rises in climb)", "normal", "normal"],
  ["Static port", "low in climb, high in descent", "frozen", "zero"],
  ["Using alternate static", "reads high", "reads high", "momentary climb"]]);

VIS.primary = () => tbl(["Maneuver", "Pitch", "Bank", "Power"], [
  ["Straight & level", "<b>ALT</b> · AI, VSI", "<b>DG</b> · AI, TC", "<b>ASI</b> · tach"],
  ["S&L, changing speed", "<b>ALT</b> · AI, VSI", "<b>DG</b> · AI, TC", "<b>Tach/MP</b> · ASI"],
  ["Entering climb/descent", "<b>AI</b> · ASI, ALT, VSI", "<b>DG</b> · AI, TC", "<b>Tach/MP</b> · ASI"],
  ["Constant-speed climb/descent", "<b>ASI</b> · AI, VSI", "<b>DG</b> · AI, TC", "<b>Tach/MP</b> · ASI"],
  ["Entering a turn", "<b>ALT</b> · AI, VSI", "<b>AI</b> · TC", "<b>ASI</b> · tach"],
  ["Standard-rate turn", "<b>ALT</b> · AI, VSI", "<b>TC</b> · AI", "<b>ASI</b> · tach"]]) + `<p class="cap">Bold = primary. The rest are supporting.</p>`;

VIS.vfrmins = () => tbl(["Airspace", "Visibility", "Cloud clearance"], [
  ["Class A", "—", "IFR only"],
  ["Class B", "3 SM", "clear of clouds"],
  ["Class C, D, E (below 10,000 MSL)", "3 SM", "500 below · 1,000 above · 2,000 horiz"],
  ["Class E at/above 10,000 MSL", "5 SM", "1,000 below · 1,000 above · 1 SM horiz"],
  ["Class G ≤1,200 AGL — day", "1 SM", "clear of clouds"],
  ["Class G ≤1,200 AGL — night", "3 SM", "500 / 1,000 / 2,000 (1 SM & clear of clouds in the pattern within ½ NM)"],
  ["Class G >1,200 AGL, <10,000 MSL — day", "1 SM", "500 / 1,000 / 2,000"],
  ["Class G >1,200 AGL, <10,000 MSL — night", "3 SM", "500 / 1,000 / 2,000"],
  ["Class G >1,200 AGL & ≥10,000 MSL", "5 SM", "1,000 / 1,000 / 1 SM"]]);

VIS.speeds = () => tbl(["Where", "Max KIAS"], [
  ["Below 10,000 MSL", "250"],["Under a Class B shelf or in a VFR corridor", "200"],
  ["At/below 2,500 AGL within 4 NM of the primary Class C/D airport", "200"],
  ["Holding ≤6,000 · 6,001–14,000 · >14,000", "200 · 230 · 265"],["Procedure turn", "200"]]);

VIS.rvr = () => tbl(["RVR (ft)", "Visibility (SM)"], [["1600", "¼"],["1800–2600 (2400)", "½"],["3000–3500 (3200)", "⅝"],["4000", "¾"],["4500", "⅞"],["5000–5500", "1"],["6000", "1¼"]]) + `<p class="cap">Plates show RVR in hundreds: "1540/24" = MDA 1,540 MSL, RVR 2,400.</p>`;

VIS.circling = () => tbl(["Circling MDA (MSL)", "A", "B", "C", "D", "E"], [
  ["≤1,000", "1.3", "1.7", "2.7", "3.6", "4.5"],["1,001–3,000", "1.3", "1.8", "2.8", "3.7", "4.6"],["3,001–5,000", "1.3", "1.8", "2.9", "3.8", "4.8"],
  ["5,001–7,000", "1.3", "1.9", "3.0", "4.0", "5.0"],["7,001–9,000", "1.4", "2.0", "3.2", "4.2", "5.3"],["≥9,001", "1.4", "2.1", "3.3", "4.4", "5.5"],
  ["<i>Standard (no 'C' symbol)</i>", "1.3", "1.5", "1.7", "2.3", "4.5"]], "num") + `<p class="cap">Expanded circling radii (NM) from the runway thresholds. Category speeds: A &lt;91 · B 91–120 · C 121–140 · D 141–165 · E 166+ kt.</p>`;

VIS.currency = () => `<div class="track">
  <div class="seg ok"><b>0–6 cal. months</b><span>Current if 6 HIT done</span></div>
  <div class="seg warn"><b>6–12 months</b><span>Not current. Regain with safety pilot, CFII or sim</span></div>
  <div class="seg bad"><b>12+ months</b><span>IPC required</span></div></div>`;

VIS.inop = () => `<div class="flow">
  <div class="fbox q">Approved MEL for this airplane?</div>
  <div class="fsplit"><div><span class="yn">Yes</span><div class="fbox">Follow the MEL</div></div>
  <div><span class="yn">No</span><div class="fbox q">Required by 91.205, an AD, the equipment list/KOEL, or the type certificate?</div>
    <div class="fsplit"><div><span class="yn">Yes</span><div class="fbox bad">Grounded — special flight permit only</div></div>
    <div><span class="yn">No</span><div class="fbox ok">Remove or deactivate + placard INOP; pilot/mechanic determines safe</div></div></div></div></div></div>`;

VIS.alternate = () => `<div class="flow">
  <div class="fbox q">Destination has an instrument approach?</div>
  <div class="fsplit"><div><span class="yn">No</span><div class="fbox bad">Alternate required</div></div>
  <div><span class="yn">Yes</span><div class="fbox q">ETA ±1 hr: ceiling ≥ 2,000 and vis ≥ 3 SM?</div>
   <div class="fsplit"><div><span class="yn">Yes</span><div class="fbox ok">No alternate needed</div></div><div><span class="yn">No</span><div class="fbox bad">Alternate required</div></div></div></div></div>
  <div class="fbox q">Alternate has an approach you can use (no A NA)?</div>
  <div class="fsplit"><div><span class="yn">Yes</span><div class="fbox">Published alternate mins, or 600-2 precision / 800-2 non-precision</div></div>
  <div><span class="yn">No</span><div class="fbox">Forecast must allow descent from MEA and landing under basic VFR</div></div></div></div>`;

const tokens = (arr) => `<div class="tok">${arr.map(([t, m]) => `<button class="tk" type="button" data-m="${m.replace(/"/g, "&quot;")}">${t}</button>`).join("")}</div><p class="tok-out cap">Tap a group to decode it.</p>`;
VIS.metar = () => tokens([["METAR","routine report"],["KOKC","Oklahoma City"],["121853Z","12th day, 1853 UTC"],["18012G20KT","wind 180° at 12 gusting 20 kt"],["4SM","visibility 4 statute miles"],["-RA BR","light rain, mist"],["BKN008","broken 800 ft — the ceiling"],["OVC015","overcast 1,500 ft"],["14/12","temp 14°C, dewpoint 12°C — spread 2°, fog risk"],["A2992","altimeter 29.92"],["RMK AO2","remarks: automated station with precip sensor"]]);
VIS.taf = () => tokens([["TAF KTUL","forecast for Tulsa"],["121130Z","issued 12th at 1130Z"],["1212/1312","valid 12th 1200Z to 13th 1200Z"],["17010KT P6SM SCT030","wind 170/10, vis more than 6 SM, scattered 3,000"],["TEMPO 1215/1218 3SM -SHRA BKN025","temporarily 1500–1800Z: 3 SM, light rain showers, ceiling 2,500"],["FM130000 20015G25KT 5SM BR OVC008","from 0000Z on the 13th: wind 200/15G25, 5 SM mist, ceiling 800"],["PROB30 1306/1309 1SM FG VV002","30% chance 0600–0900Z: 1 SM fog, sky obscured, VV 200 ft"]]);
VIS.clearance = () => `<p class="clr">“Cessna 518FT, <mark class="c1">cleared to Atlantic City airport</mark>, <mark class="c2">radar vectors PALEO, Victor 44, Sea Isle, direct</mark>. <mark class="c3">Maintain 2,000, expect 7,000 ten minutes after departure</mark>. <mark class="c4">Departure frequency 125.65</mark>, <mark class="c5">squawk 4211</mark>.”</p>
  <div class="legend"><span class="c1">C limit</span><span class="c2">R route</span><span class="c3">A altitude</span><span class="c4">F frequency</span><span class="c5">T transponder</span></div>`;
VIS.fpl = () => `<div class="fpl">${[["7 · Aircraft ID","N518FT"],["8 · Rules / type","I / G"],["9 · Type / wake","C172 / L"],["10 · Equipment","SBG / C"],["13 · Departure / time","KCGS 1450"],["15 · Speed / level","N0100 A070"],["15 · Route","PALEO V44 SIE"],["16 · Destination / EET","KACY 0115"],["16 · Alternate","KPHL"],["19 · Endurance","0400"]].map(([l,v])=>`<div><span>${l}</span><b>${v}</b></div>`).join("")}</div><p class="cap">ICAO format items as filed by EFBs. Speed N0100 = 100 kt TAS; A070 = 7,000 ft.</p>`;
VIS.lostcomm = () => tbl(["Segment", "Minimum (M)", "Expected (E)", "Assigned (A)", "Fly"], [
  ["Takeoff → 10 min", "2,000", "—", "3,000", "<b>3,000</b>"], ["10 min → airway", "2,000", "6,000", "3,000", "<b>6,000</b>"], ["On V44 (MEA 7,000)", "7,000", "6,000", "3,000", "<b>7,000</b>"]]) + `<p class="cap">Example: cleared 3,000, expect 6,000 ten minutes after departure, airway MEA 7,000. Re-check the highest of M-E-A on every segment.</p>`;

function renderVis(key) {
  if (!key) return "";
  const [kind, id] = key.split(":");
  if (kind === "img") return `<figure class="fig img"><button type="button" class="zoomable" data-img="${id}" aria-label="Enlarge image"><img src="img/${id}.png" alt="Chart Users' Guide excerpt" loading="lazy"></button><figcaption>FAA Chart Users' Guide · tap to enlarge</figcaption></figure>`;
  return VIS[id] ? VIS[id]() : "";
}
