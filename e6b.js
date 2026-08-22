/* ===== E6B Flight Computer ===== */
(function () {
  const $ = id => document.getElementById(id);
  const num = id => { const e = $(id); const v = parseFloat(e && e.value); return isNaN(v) ? null : v; };
  const set = (id, txt) => { const e = $(id); if (e) e.textContent = txt; };
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  const fmtTime = mins => {
    if (mins == null || !isFinite(mins)) return '—';
    const h = Math.floor(mins / 60), m = Math.round(mins % 60);
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m} min`;
  };

  /* ---- Wind ---- */
  function e6bWind() {
    const tc = num('e6bCourse'), tas = num('e6bTas'), wd = num('e6bWindDir'), ws = num('e6bWindSpd');
    if (tc == null || tas == null || wd == null || ws == null || tas <= 0) {
      ['e6bOutWca','e6bOutHdg','e6bOutMh','e6bOutGs','e6bOutHw','e6bOutXw'].forEach(i => set(i, '—'));
      return;
    }
    const beta = rad(wd - tc);              // wind-from angle relative to course
    const hw = ws * Math.cos(beta);         // + headwind, - tailwind
    const xw = ws * Math.sin(beta);         // + from right, - from left
    const sinWca = (ws * Math.sin(beta)) / tas;
    if (Math.abs(sinWca) > 1) {             // wind too strong to hold course
      set('e6bOutWca', 'wind > TAS'); set('e6bOutHdg', '—'); set('e6bOutMh', '—'); set('e6bOutGs', '—');
    } else {
      const wca = Math.asin(sinWca);
      const gs = tas * Math.cos(wca) - hw;
      let hdg = (tc + deg(wca)) % 360; if (hdg <= 0) hdg += 360;
      set('e6bOutWca', `${Math.abs(deg(wca)).toFixed(0)}° ${deg(wca) >= 0 ? 'R' : 'L'}`);
      set('e6bOutHdg', `${Math.round(hdg)}°`);
      const variation = num('e6bVar');
      if (variation != null) {
        let mh = (hdg + variation) % 360; if (mh <= 0) mh += 360;
        set('e6bOutMh', `${Math.round(mh)}°`);
      } else {
        set('e6bOutMh', '—');
      }
      set('e6bOutGs', `${gs.toFixed(0)} kts`);
    }
    set('e6bOutHw', `${Math.abs(hw).toFixed(0)} kts ${hw >= 0 ? 'head' : 'tail'}`);
    set('e6bOutXw', `${Math.abs(xw).toFixed(0)} kts from ${xw >= 0 ? 'right' : 'left'}`);
  }

  window.e6bFillWind = function () {
    const wd = document.getElementById('windDirection'), ws = document.getElementById('windSpeed');
    if (wd && wd.value) $('e6bWindDir').value = wd.value;
    if (ws && ws.value) $('e6bWindSpd').value = ws.value;
    e6bWind();
  };

  /* ---- Time / Speed / Distance: any two -> third ---- */
  function e6bTsd() {
    const gs = num('e6bTsdGs'), d = num('e6bTsdDist'), t = num('e6bTsdTime');
    const filled = [gs, d, t].filter(v => v != null).length;
    if (filled < 2) { set('e6bTsdLabel', 'Result'); set('e6bTsdOut', '—'); return; }
    if (gs != null && d != null && t == null && gs > 0) {
      const mins = d / gs * 60;
      set('e6bTsdLabel', 'Time'); set('e6bTsdOut', fmtTime(mins));
    } else if (gs != null && t != null && d == null) {
      set('e6bTsdLabel', 'Distance'); set('e6bTsdOut', `${(gs * t / 60).toFixed(1)} NM`);
    } else if (d != null && t != null && gs == null && t > 0) {
      set('e6bTsdLabel', 'Groundspeed'); set('e6bTsdOut', `${(d / t * 60).toFixed(0)} kts`);
    } else if (filled === 3 && gs > 0) {
      const mins = d / gs * 60;
      set('e6bTsdLabel', 'Time (check)'); set('e6bTsdOut', fmtTime(mins));
    }
  }

  /* ---- Fuel: any two -> third ---- */
  function e6bFuel() {
    const r = num('e6bFuelRate'), t = num('e6bFuelTime'), f = num('e6bFuelAmt');
    const filled = [r, t, f].filter(v => v != null).length;
    let gal = f;
    if (filled < 2) { set('e6bFuelLabel', 'Result'); set('e6bFuelOut', '—'); set('e6bFuelLbs', '—'); return; }
    if (r != null && t != null && f == null) {
      gal = r * t / 60;
      set('e6bFuelLabel', 'Fuel Used'); set('e6bFuelOut', `${gal.toFixed(1)} gal`);
    } else if (r != null && f != null && t == null && r > 0) {
      set('e6bFuelLabel', 'Endurance'); set('e6bFuelOut', fmtTime(f / r * 60));
    } else if (t != null && f != null && r == null && t > 0) {
      set('e6bFuelLabel', 'Burn Rate'); set('e6bFuelOut', `${(f / (t / 60)).toFixed(1)} GPH`);
    } else if (filled === 3) {
      gal = r * t / 60;
      set('e6bFuelLabel', 'Fuel Used (check)'); set('e6bFuelOut', `${gal.toFixed(1)} gal`);
    }
    set('e6bFuelLbs', gal != null ? `${(gal * 6).toFixed(0)} lbs` : '—');
  }

  /* ---- Descent ---- */
  function e6bDescent() {
    const alt = num('e6bDesAlt'), d = num('e6bDesDist'), gs = num('e6bDesGs');
    if (alt == null || d == null || d <= 0) { ['e6bOutGrad','e6bOutFpm','e6bOutDesTime'].forEach(i => set(i, '—')); return; }
    const grad = alt / d; // ft per NM
    set('e6bOutGrad', `${grad.toFixed(0)} ft/NM (${deg(Math.atan(grad / 6076)).toFixed(1)}°)`);
    if (gs != null && gs > 0) {
      set('e6bOutFpm', `${Math.round(grad * gs / 60)} fpm`);
      set('e6bOutDesTime', fmtTime(d / gs * 60));
    } else {
      set('e6bOutFpm', '—'); set('e6bOutDesTime', '—');
    }
  }

  /* ---- Altitude / TAS ---- */
  function e6bAlt() {
    const altim = num('e6bAltim'), elev = num('e6bElev'), oat = num('e6bOat'), cas = num('e6bCas');
    if (altim == null || elev == null) { ['e6bOutPa','e6bOutDa','e6bOutIsaDev','e6bOutTas'].forEach(i => set(i, '—')); return; }
    const pa = (29.92 - altim) * 1000 + elev;
    set('e6bOutPa', `${Math.round(pa)} ft`);
    if (oat != null) {
      const isaTemp = 15 - (pa / 1000) * 2;
      const da = pa + 120 * (oat - isaTemp);
      set('e6bOutDa', `${Math.round(da)} ft`);
      const dev = oat - isaTemp;
      set('e6bOutIsaDev', `ISA ${dev >= 0 ? '+' : ''}${dev.toFixed(0)} °C`);
      set('e6bOutTas', cas != null ? `${Math.round(cas * (1 + 0.02 * da / 1000))} kts` : '—');
    } else {
      set('e6bOutDa', '—'); set('e6bOutIsaDev', '—'); set('e6bOutTas', '—');
    }
  }

  window.e6bFillAlt = function () {
    const a = document.getElementById('altimeter'), e = document.getElementById('fieldElevation'), o = document.getElementById('temperature');
    if (a && a.value) $('e6bAltim').value = a.value;
    if (e && e.value) $('e6bElev').value = e.value;
    if (o && o.value) $('e6bOat').value = o.value;
    e6bAlt();
  };

  /* ---- Conversions (bidirectional pairs) ---- */
  const conv = {
    speed: { toKts: { kts: v => v, mph: v => v / 1.15078 }, fromKts: { kts: v => v, mph: v => v * 1.15078 } },
    dist:  { toKts: { nm: v => v, sm: v => v / 1.15078, km: v => v / 1.852 }, fromKts: { nm: v => v, sm: v => v * 1.15078, km: v => v * 1.852 } },
    fuelw: { toKts: { gal: v => v, lbs: v => v / 6 }, fromKts: { gal: v => v, lbs: v => v * 6 } },
    temp:  { toKts: { c: v => v, f: v => (v - 32) * 5 / 9 }, fromKts: { c: v => v, f: v => v * 9 / 5 + 32 } },
    len:   { toKts: { ft: v => v, m: v => v * 3.28084 }, fromKts: { ft: v => v, m: v => v / 3.28084 } },
    press: { toKts: { hg: v => v, mb: v => v / 33.8639 }, fromKts: { hg: v => v, mb: v => v * 33.8639 } },
    vol:   { toKts: { gal: v => v, l: v => v / 3.78541 }, fromKts: { gal: v => v, l: v => v * 3.78541 } },
    mass:  { toKts: { lb: v => v, kg: v => v * 2.20462 }, fromKts: { lb: v => v, kg: v => v / 2.20462 } }
  };
  function onConv(e) {
    const el = e.target, group = el.dataset.group, unit = el.dataset.unit;
    const v = parseFloat(el.value);
    const peers = document.querySelectorAll(`.e6b-conv[data-group="${group}"]`);
    if (isNaN(v)) { peers.forEach(p => { if (p !== el) p.value = ''; }); return; }
    const base = conv[group].toKts[unit](v);
    peers.forEach(p => {
      if (p === el) return;
      const out = conv[group].fromKts[p.dataset.unit](base);
      p.value = Math.round(out * 100) / 100;
    });
  }


  /* ---- Cloud base & freezing level (field estimates) ---- */
  function e6bCloud() {
    const temp = num('e6bCbTemp'), dew = num('e6bCbDew'), elev = num('e6bCbElev');
    if (temp == null || dew == null || dew > temp) {
      ['e6bOutCbAgl','e6bOutCbMsl','e6bOutFrz'].forEach(i => set(i, '—'));
      return;
    }
    const agl = (temp - dew) / 2.5 * 1000;
    set('e6bOutCbAgl', `${Math.round(agl / 100) * 100} ft`);
    set('e6bOutCbMsl', elev != null ? `${Math.round((agl + elev) / 100) * 100} ft` : '—');
    if (temp > 0) {
      const frzAgl = temp / 2 * 1000;
      set('e6bOutFrz', elev != null ? `${Math.round((frzAgl + elev) / 100) * 100} ft MSL` : `${Math.round(frzAgl / 100) * 100} ft AGL`);
    } else {
      set('e6bOutFrz', 'at/below surface');
    }
  }

  window.e6bFillCloud = function () {
    const tf = document.getElementById('temperature'), df = document.getElementById('dewpoint'), ef = document.getElementById('fieldElevation');
    if (tf && tf.value) $('e6bCbTemp').value = tf.value;
    if (df && df.value) $('e6bCbDew').value = df.value;
    if (ef && ef.value) $('e6bCbElev').value = ef.value;
    e6bCloud();
  };

  /* ---- Climb gradient: GS + (ft/NM or fpm) -> the other ---- */
  function e6bClimb() {
    const gs = num('e6bClbGs'), grad = num('e6bClbGrad'), fpm = num('e6bClbFpm');
    if (gs == null || gs <= 0 || (grad == null && fpm == null)) {
      set('e6bClbLabel', 'Result'); set('e6bClbOut', '—'); return;
    }
    if (grad != null && fpm == null) {
      set('e6bClbLabel', 'Required Rate'); set('e6bClbOut', `${Math.round(grad * gs / 60)} fpm`);
    } else if (fpm != null && grad == null) {
      set('e6bClbLabel', 'Achieved Gradient'); set('e6bClbOut', `${Math.round(fpm * 60 / gs)} ft/NM`);
    } else {
      const need = grad * gs / 60;
      const ok = fpm >= need;
      set('e6bClbLabel', ok ? 'Meets Requirement' : 'Below Requirement');
      set('e6bClbOut', `need ${Math.round(need)} fpm`);
    }
  }

  /* ---- Glide range ---- */
  function e6bGlide() {
    const alt = num('e6bGldAlt'), ratio = num('e6bGldRatio');
    if (alt == null || ratio == null || ratio <= 0) { set('e6bOutGld', '—'); return; }
    set('e6bOutGld', `${(alt / 1000 * ratio).toFixed(1)} NM`);
  }

  /* ---- Panel toggle (desktop) ---- */
  window.toggleE6BPanel = function () {
    const layout = document.querySelector('.desktop-layout');
    if (layout) layout.classList.toggle('e6b-open');
  };

  function init() {
    const panels = { wind: e6bWind, tsd: e6bTsd, fuel: e6bFuel, descent: e6bDescent, alt: e6bAlt, cloud: e6bCloud, climb: e6bClimb, glide: e6bGlide };
    document.querySelectorAll('.e6b-field').forEach(el => {
      el.addEventListener('input', () => { const fn = panels[el.dataset.panel]; if (fn) fn(); });
    });
    document.querySelectorAll('.e6b-conv').forEach(el => el.addEventListener('input', onConv));

    // Prefill fuel burn from the selected aircraft when known
    const at = document.getElementById('aircraftType');
    if (at) at.addEventListener('change', () => {
      try {
        const specs = (typeof aircraftSpecs !== 'undefined') && aircraftSpecs[at.value];
        const rate = $('e6bFuelRate');
        if (specs && specs.fuelBurnRate && rate && !rate.value) { rate.value = specs.fuelBurnRate; e6bFuel(); }
      } catch (e) {}
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
