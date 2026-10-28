/* Match a written-test question to IFR Atlas topics (used by written-exams.html and fii-study-2.html).
   window.IFRMatch.match(text) → [{id, t}] best 1–2 topics. Keywords are regex fragments matched on
   lowercased text; the stem counts most, then the correct answer, then the explanation.
   Topic titles come from ifr/data.js, loaded into a private scope so its globals don't touch the host page. */
(() => {
  const KW = {
    "rating-req": ["instrument rating", "61\\.65", "aeronautical experience"],
    "when-ifr": ["instrument rating (?:is )?required", "act as pilot in command under ifr"],
    "currency": ["recent (?:flight )?experience", "instrument currency", "six instrument approaches", "safety pilot", "61\\.57", "preceding 6 (?:calendar )?months", "holding procedures", "intercepting and tracking", "instrument experience"],
    "ipc": ["instrument proficiency check", "\\bipc\\b"],
    "flight-review": ["flight review", "61\\.56"],
    "pax-currency": ["carry passengers", "takeoffs and landings", "preceding 90 days"],
    "logging": ["log(?:ged)? (?:as )?instrument (?:flight )?time", "61\\.51", "logbook"],
    "pilot-docs": ["photo identification", "pilot certificate", "medical certificate"],
    "aircraft-docs": ["airworthiness certificate", "registration certificate"],
    "inspections": ["annual inspection", "100-hour", "91\\.411", "91\\.413", "24 calendar months", "altimeter system and altitude reporting", "static (?:pressure )?system (?:test|inspect)", "\\belt\\b"],
    "vor-check": ["vor (?:receiver |equipment )?(?:accuracy |operational )?check", "operationally checked", "\\bvot\\b", "91\\.171", "airborne checkpoint", "ground checkpoint", "dual vor", "bearing error"],
    "equip-ifr": ["91\\.205", "equipment (?:is )?required", "required (?:flight )?instruments", "gyroscopic (?:rate-of-turn|instruments)"],
    "inop": ["inoperative", "minimum equipment list", "\\bmel\\b", "91\\.213"],
    "transponder": ["transponder", "mode c", "ads-b", "squawk", "\\b7700\\b", "\\b7500\\b", "\\b1200\\b"],
    "imsafe": ["alcohol", "medication", "fatigue", "8 hours", "drugs"],
    "pave": ["personal minimums", "risk management", "aeronautical decision", "hazardous attitude", "anti-?authority", "impulsivity", "invulnerability", "macho", "resignation", "single-pilot resource"],
    "spatial-d": ["spatial disorientation", "illusion", "vestibular", "\\bleans\\b", "graveyard", "coriolis", "somatogravic", "vertigo", "inner ear", "semicircular"],
    "hypoxia": ["hypoxia", "hyperventilation", "carbon monoxide", "night vision"],
    "oxygen": ["supplemental oxygen", "91\\.211", "12,500", "cabin pressure altitude"],
    "dcs": ["scuba", "decompression sickness"],
    "preflight-info": ["91\\.103", "preflight action", "all available information"],
    "flight-plan": ["flight plan", "cancel(?:ing|led)? (?:an |the |your )?ifr", "91\\.173", "file (?:an )?ifr"],
    "alternate": ["alternate airport", "\\balternate\\b", "91\\.169"],
    "alt-mins": ["alternate (?:airport )?minimums", "600[- ]2|600 feet and 2", "800[- ]2|800 feet and 2", "\\bnot authorized\\b"],
    "fuel": ["fuel (?:requirement|reserve)", "91\\.167", "45 minutes"],
    "cruise-alt": ["cruising altitude", "91\\.179", "odd thousand", "even thousand", "magnetic course of \\d"],
    "min-alt": ["91\\.177", "minimum (?:ifr )?altitude", "4 nautical miles", "mountainous"],
    "takeoff-mins": ["takeoff minimums", "91\\.175\\(f\\)"],
    "wx-sources": ["flight service", "fis-b", "hiwas", "\\btweb\\b", "\\befas\\b", "flight watch", "\\batis\\b", "\\basos\\b", "\\bawos\\b", "standard briefing", "outlook briefing", "abbreviated briefing", "weather briefing"],
    "metar": ["\\bmetar\\b", "\\bspeci\\b", "aviation routine weather", "surface (?:aviation )?(?:weather )?observation"],
    "taf": ["\\btaf\\b", "terminal aerodrome forecast", "\\btempo\\b", "\\bbecmg\\b"],
    "pirep": ["\\bpirep", "pilot (?:weather )?report", "\\buua?\\b"],
    "winds-aloft": ["winds aloft", "winds and temperatures aloft", "wind and temperature aloft", "\\bfb\\b forecast"],
    "advisories": ["airmet", "sigmet", "center weather advisory", "\\bcwa\\b"],
    "wx-charts": ["surface analysis", "prognostic", "prog chart", "significant weather", "convective outlook", "weather depiction", "radar summary", "area forecast", "graphical forecast", "\\bgfa\\b", "constant pressure", "tropopause", "isobar", "station model"],
    "thunderstorms": ["thunderstorm", "cumulonimbus", "microburst", "squall line", "convective", "downburst", "wind shear", "\\bhail\\b", "lightning", "unstable", "instability", "lapse rate", "stable air", "cumulus"],
    "icing": ["icing", "\\bice\\b", "freezing rain", "supercooled", "\\brime\\b", "clear ice", "carburetor ice", "\\bfrost\\b", "freezing level", "structural ice", "freezing drizzle", "ice pellets"],
    "fog": ["\\bfog\\b", "dewpoint", "dew point", "temperature/dewpoint spread", "advection", "\\bmist\\b"],
    "sky-cover": ["\\bceiling\\b", "\\bbroken\\b", "\\bovercast\\b", "sky condition", "vertical visibility"],
    "clearance": ["\\bclearance\\b", "cleared as filed", "clearance limit", "abbreviated (?:departure )?clearance", "read ?back"],
    "release": ["void time", "hold for release", "release time", "\\bedct\\b"],
    "dp": ["departure procedure", "\\bodp\\b", "\\bsid\\b", "standard instrument departure", "obstacle departure", "diverse vector", "visual climb over airport", "\\bvcoa\\b"],
    "climb-via": ["climb via", "descend via"],
    "mea-family": ["\\bmea\\b", "minimum en ?route", "\\bmoca\\b", "\\bmra\\b", "\\bmca\\b", "\\bmaa\\b", "minimum obstruction clearance", "minimum reception altitude", "minimum crossing altitude", "\\bmva\\b", "minimum vectoring"],
    "oroca": ["\\boroca\\b", "off route obstruction"],
    "airways": ["victor airway", "\\bairways?\\b", "jet route", "\\bq-route", "\\bt-route", "\\bv\\d{1,3}\\b", "rnav route"],
    "cop": ["changeover point", "\\bcop\\b"],
    "reports": ["compulsory reporting", "nonradar|non-radar", "radar contact (?:is |has been )?lost", "91\\.183", "\\breport (?:to|the)\\b"],
    "position-report": ["position report"],
    "lost-comms": ["two-way radio communications? failure", "radio failure", "lost comm", "communications? failure", "\\b7600\\b", "91\\.185"],
    "vfr-on-top": ["vfr-on-top", "vfr on top", "cruise clearance", "\\bcruise\\b clearance"],
    "speed-reports": ["91\\.117", "250 (?:knots|kts)", "200 (?:knots|kts)", "speed (?:limit|restriction|adjustment)"],
    "star": ["\\bstars?\\b", "standard terminal arrival", "arrival procedure"],
    "holding": ["\\bholding\\b", "\\bhold\\b", "expect further clearance", "\\befc\\b", "parallel entry", "teardrop", "direct entry"],
    "approach-clearance": ["cleared for (?:the )?(?:\\w+ )?approach", "approach clearance", "established on a segment"],
    "pt": ["procedure turn", "\\bnopt\\b", "course reversal", "hold[- ]in[- ]lieu"],
    "taa": ["terminal arrival area", "\\btaa\\b"],
    "msa": ["minimum safe altitude", "\\bmsa\\b", "emergency safe altitude"],
    "approach-types": ["precision approach", "non-?precision", "\\blda\\b", "\\bsdf\\b", "\\basr\\b", "\\bpar\\b", "approach with vertical guidance", "\\bapv\\b"],
    "chart-anatomy": ["approach chart", "plan view", "briefing strip", "profile view", "instrument approach procedure chart"],
    "da-mda": ["decision altitude", "decision height", "minimum descent altitude", "\\bmda\\b", "\\bdh\\b", "\\bda\\b"],
    "descend-below": ["91\\.175", "descend below", "below (?:the )?(?:mda|da|dh)", "visual reference", "runway environment", "operate (?:an aircraft )?below"],
    "vdp": ["visual descent point", "\\bvdp\\b"],
    "minimums": ["landing minimums", "\\bhat\\b", "\\bhaa\\b", "straight-in minimums"],
    "categories": ["approach category", "category [a-e]\\b", "circling", "1\\.3 ?v", "\\bvref\\b"],
    "missed": ["missed approach", "\\bmap\\b", "go[- ]around"],
    "visual-contact": ["visual approach", "contact approach", "charted visual"],
    "cold-temp": ["cold temperature", "temperature correction", "colder than standard"],
    "rvr": ["\\brvr\\b", "runway visual range"],
    "pitot-static": ["\\bpitot", "static port", "static source", "static system"],
    "asi": ["airspeed indicator", "\\basi\\b", "green arc", "white arc", "yellow arc", "red (?:radial )?line"],
    "airspeeds": ["true airspeed", "calibrated airspeed", "indicated airspeed", "equivalent airspeed", "\\bmach\\b", "ground ?speed"],
    "vspeeds": ["maneuvering speed", "never-exceed", "\\bvne\\b", "\\bvno\\b", "\\bvx\\b", "\\bvy\\b", "\\bva\\b", "stall speed"],
    "altimeter": ["altimeter", "kollsman", "29\\.92", "high to low"],
    "altitude-types": ["pressure altitude", "density altitude", "true altitude", "absolute altitude", "indicated altitude"],
    "vsi": ["vertical speed indicator", "\\bvsi\\b", "vertical-speed", "rate-of-climb indicator", "calibrated leak"],
    "pitot-static-errors": ["blocked", "clogged", "obstructed", "alternate static", "drain hole"],
    "gyro-instruments": ["gyroscop", "rigidity in space", "precession", "vacuum", "suction gauge"],
    "ai": ["attitude indicator", "artificial horizon"],
    "dg": ["heading indicator", "directional gyro"],
    "tc": ["turn coordinator", "turn[- ]and[- ]slip", "inclinometer", "\\bball\\b", "standard[- ]rate", "rate of turn"],
    "compass": ["magnetic compass", "\\bcompass\\b", "magnetic dip", "\\bdeviation\\b", "\\bvariation\\b", "acceleration error", "turning error", "northerly turning", "undershoot", "overshoot"],
    "glass": ["\\bpfd\\b", "\\bmfd\\b", "\\bahrs\\b", "air data computer", "glass cockpit", "flight director", "red x"],
    "scan": ["primary instrument", "supporting instrument", "cross-?check", "\\bscan\\b", "fixation", "omission", "emphasis", "control and performance", "pitch instrument", "bank instrument", "power instrument", "unusual attitude", "partial panel"],
    "taxi-check": ["\\btaxi", "before takeoff", "pre-?takeoff", "\\berect\\b"],
    "vor": ["\\bvor\\b", "\\bradial", "\\bobs\\b", "to/from|to-from|from indication|to indication", "course deviation", "\\bcdi\\b", "reverse sensing", "cone of confusion", "vortac", "\\bhsi\\b"],
    "mon": ["minimum operational network", "\\bmon\\b"],
    "dme": ["\\bdme\\b", "slant range", "distance measuring", "dme arc"],
    "ndb": ["\\bndb\\b", "\\badf\\b", "relative bearing", "non-?directional", "\\brmi\\b"],
    "ils": ["\\bils\\b", "localizer", "glide ?slope", "outer marker", "middle marker", "marker beacon", "\\bloc\\b"],
    "loc-bc": ["back ?course"],
    "gps": ["\\bgps\\b", "\\braim\\b", "\\bwaas\\b", "\\bgnss\\b", "satellite", "\\brnav\\b"],
    "gps-approaches": ["\\blpv\\b", "\\blnav\\b", "\\bvnav\\b", "\\blp\\b", "rnav \\(gps\\)", "baro-vnav"],
    "rnp": ["\\brnp\\b", "required navigation performance", "rnav 1"],
    "class-a": ["class a\\b"],
    "class-b": ["class b\\b", "mode c veil"],
    "vfr-mins": ["vfr weather minimums", "basic vfr", "91\\.155", "cloud clearance", "special vfr", "class [c-g] airspace", "flight visibility"],
    "sua": ["restricted area", "prohibited area", "warning area", "\\bmoa\\b", "military operations area", "alert area", "military training route", "special use airspace"],
    "airport-symbols": ["chart supplement", "airport/facility directory", "a/fd"],
    "enroute-symbols": ["en ?route (?:low|high|chart)", "ifr en ?route"],
    "apd": ["airport diagram", "hot spot", "land and hold short", "\\blahso\\b"],
    "als": ["approach light", "\\bvasi\\b", "\\bpapi\\b", "\\bmalsr\\b", "\\balsf", "\\breil\\b", "runway lights"],
    "one-in-60": ["1 in 60|one in sixty|60-to-1", "time to (?:the )?station", "distance to (?:the )?station", "bearing change"],
    "descent-math": ["rate of descent", "descent rate", "feet per minute"],
    "climb-gradient": ["climb gradient", "feet per (?:nautical mile|nm)|ft/nm"],
    "rate-math": ["angle of bank", "bank angle"]
  };
  const RX = Object.entries(KW).map(([id, ks]) => [id, new RegExp(ks.join("|"), "g")]);
  const count = (rx, s) => { rx.lastIndex = 0; let n = 0; while (rx.exec(s)) { if (++n >= 3) break; } return n; };

  /* parts: {stem, answer, exp} — weights 3 / 2 / 1, each part capped so one long explanation can't swamp the stem */
  function score(parts) {
    const s = (parts.stem || "").toLowerCase(), a = (parts.answer || "").toLowerCase(), e = (parts.exp || "").toLowerCase();
    return RX.map(([id, rx]) => [id, 3 * Math.min(2, count(rx, s)) + 2 * Math.min(2, count(rx, a)) + Math.min(3, count(rx, e))])
      .filter(([, v]) => v >= 2).sort((x, y) => y[1] - x[1]);
  }

  let TITLES = {};
  const base = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/[^/]*$/, "") : "ifr/";
  const ready = fetch(base + "data.js").then(r => r.text()).then(src => {
    const nodes = new Function(src + ";return NODES;")();
    nodes.forEach(n => { TITLES[n.id] = n.t; });
  }).catch(() => {});
  const label = id => TITLES[id] || id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  window.IFRMatch = {
    base, ready,
    match(parts) { const r = score(parts); if (!r.length) return [];
      const top = r[0][1]; return r.filter(([, v], i) => i === 0 || (i < 2 && v >= top * 0.6)).map(([id, v]) => ({ id, t: label(id), score: v })); },
    title: label
  };
})();
