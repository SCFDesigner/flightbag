/* ===== Cross-device flight sync (Firebase Realtime Database) ===== */
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCJNQslFf0_mGwRHFyx1aqtnfdgAk2tfao",
    authDomain: "weight-and-balance-d5044.firebaseapp.com",
    databaseURL: "https://weight-and-balance-d5044-default-rtdb.firebaseio.com",
    projectId: "weight-and-balance-d5044",
    storageBucket: "weight-and-balance-d5044.firebasestorage.app",
    messagingSenderId: "532975437284",
    appId: "1:532975437284:web:428a4ca28490ee7814f3f1"
  };

  // Flight input fields to snapshot (left-panel data entry only — not settings/builder)
  const FLIGHT_FIELD_IDS = [
    'airportCode','tailNumber','aircraftType','weight','arm','moment',
    'myWeight','myBag','instructorWeight','instructorBag','baggage1','baggage2',
    'fuel','time','hr50','hr100','ad1','ad2','annual','regist',
    'weatherObs','windDirection','windSpeed','visibility','weather','temperature',
    'dewpoint','altimeter','headwind','crosswind','fieldElevation',
    'pressureAltitude','densityAltitude','runwayHeading','runwayLength',
    'takeoffGR','fiftyFtObst','landingGR','landingDist50'
  ];

  // Fields that indicate a "real" flight entry (ignore auto-filled weather/airport defaults)
  const CORE_FIELDS = ['tailNumber','aircraftType','weight','myWeight','instructorWeight','baggage1','baggage2','fuel'];

  const CACHE_KEY = 'wb_recent_flights_cache';
  const DISMISS_KEY = 'wb_resume_dismissed_at';

  let db = null;
  let flightsRef = null;
  let currentRef = null;
  let autoSaveTimer = null;
  let applyingSnapshot = false;   // guard so programmatic field sets don't retrigger autosave
  let pendingResume = null;       // {savedAt, fields} from another device

  function el(id){ return document.getElementById(id); }

  function deviceLabel() {
    const ua = navigator.userAgent;
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Android/.test(ua)) return 'Android';
    if (/Macintosh/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows';
    return 'a device';
  }

  function collectFields() {
    const out = {};
    FLIGHT_FIELD_IDS.forEach(id => {
      const e = el(id);
      if (e && e.value !== '' && e.value != null) out[id] = e.value;
    });
    return out;
  }

  function hasAnyFlightData(fields) {
    if (!fields) return false;
    return CORE_FIELDS.some(k => fields[k] != null && String(fields[k]).trim() !== '');
  }

  function applyFields(fields) {
    if (!fields) return;
    applyingSnapshot = true;
    try {
      // aircraft type first so type-dependent UI updates before other values
      if (fields.aircraftType) {
        const at = el('aircraftType');
        if (at) { at.value = fields.aircraftType; at.dispatchEvent(new Event('change', {bubbles:true})); }
      }
      FLIGHT_FIELD_IDS.forEach(id => {
        if (id === 'aircraftType') return;
        const e = el(id);
        if (!e) return;
        e.value = (fields[id] != null) ? fields[id] : '';
        e.dispatchEvent(new Event('input', {bubbles:true}));
        e.dispatchEvent(new Event('change', {bubbles:true}));
      });
    } finally {
      applyingSnapshot = false;
    }
    try { if (typeof updateDisplays === 'function') updateDisplays(); } catch(e){}
    try { if (typeof updateWeightBalanceCalculations === 'function') updateWeightBalanceCalculations(); } catch(e){}
  }

  function buildLabel(fields) {
    const tail = (fields.tailNumber || '').trim().toUpperCase();
    const type = (fields.aircraftType || '').trim();
    const apt = (fields.airportCode || '').trim().toUpperCase();
    const parts = [];
    if (tail) parts.push(tail.startsWith('N') ? tail : 'N' + tail);
    if (type) parts.push(type);
    if (apt) parts.push(apt);
    return parts.length ? parts.join(' · ') : 'Flight';
  }

  function fmtTime(ms) {
    try {
      const d = new Date(ms);
      return d.toLocaleString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
    } catch(e){ return ''; }
  }

  function setSync(state, text) {
    const dot = el('wbSyncDot'), txt = el('wbSyncText');
    const colors = { ok:'#4CAF50', off:'#FF9800', err:'#f44336', wait:'#888' };
    if (dot) dot.style.background = colors[state] || '#888';
    if (txt) txt.textContent = text;
  }

  function status(msg, type) {
    if (typeof showSettingsStatus === 'function') showSettingsStatus(msg, type || 'info');
  }

  function renderList(flights) {
    const box = el('recentFlightsList');
    if (!box) return;
    if (!flights || !flights.length) {
      box.innerHTML = '<div style="color:#777;font-size:12px;text-align:center;padding:8px;">No saved flights yet.</div>';
      return;
    }
    flights.sort((a,b) => (b.savedAt||0) - (a.savedAt||0));
    box.innerHTML = '';
    flights.forEach(f => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);border:1px solid #3a3a3a;border-radius:8px;padding:8px 10px;';
      const info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0;';
      const title = document.createElement('div');
      title.style.cssText = 'color:#e0e0e0;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      title.textContent = f.label || 'Flight';
      const sub = document.createElement('div');
      sub.style.cssText = 'color:#888;font-size:11px;';
      sub.textContent = fmtTime(f.savedAt) + (f.device ? ' · ' + f.device : '');
      info.appendChild(title); info.appendChild(sub);
      const loadBtn = document.createElement('button');
      loadBtn.textContent = 'Load';
      loadBtn.style.cssText = 'background:rgba(33,150,243,0.2);color:#fff;border:1px solid #2196F3;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer;';
      loadBtn.onclick = function(){ window.wbLoadFlight(f.id); };
      const delBtn = document.createElement('button');
      delBtn.textContent = '\u{1F5D1}';
      delBtn.title = 'Delete';
      delBtn.style.cssText = 'background:none;color:#c66;border:1px solid #633;border-radius:6px;padding:6px 8px;font-size:12px;cursor:pointer;';
      delBtn.onclick = function(){ window.wbDeleteFlight(f.id); };
      row.appendChild(info); row.appendChild(loadBtn); row.appendChild(delBtn);
      box.appendChild(row);
    });
  }

  function cacheList(flights) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(flights || [])); } catch(e){}
  }
  function loadCachedList() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'); } catch(e){ return []; }
  }

  function snapshotToArray(snap) {
    const out = [];
    snap.forEach(child => { const v = child.val() || {}; v.id = child.key; out.push(v); });
    return out;
  }

  function saveLocalOnly(record) {
    const list = loadCachedList();
    record.id = 'local_' + record.savedAt;
    list.push(record);
    cacheList(list);
    renderList(list);
  }

  window.wbSaveCurrentFlight = function () {
    const fields = collectFields();
    if (!hasAnyFlightData(fields)) { status('Enter some flight info first.', 'error'); return; }
    const record = { savedAt: Date.now(), label: buildLabel(fields), device: deviceLabel(), fields: fields };
    if (flightsRef) {
      flightsRef.push(record)
        .then(() => status('Flight saved & synced.', 'success'))
        .catch(err => { console.error(err); saveLocalOnly(record); status('Saved on this device — will sync when online.', 'info'); });
    } else {
      saveLocalOnly(record);
      status('Saved on this device (cloud not connected).', 'info');
    }
  };

  window.wbLoadFlight = function (id) {
    if (id && id.indexOf('local_') === 0) {
      const f = loadCachedList().find(x => x.id === id);
      if (f) { applyFields(f.fields); status('Flight loaded.', 'success'); }
      return;
    }
    if (!flightsRef) { status('Cloud not connected.', 'error'); return; }
    flightsRef.child(id).once('value').then(snap => {
      const f = snap.val();
      if (f) { applyFields(f.fields); status('Flight loaded.', 'success'); }
      else status('Flight not found.', 'error');
    }).catch(err => { console.error(err); status('Could not load flight.', 'error'); });
  };

  window.wbDeleteFlight = function (id) {
    if (id && id.indexOf('local_') === 0) {
      const list = loadCachedList().filter(x => x.id !== id);
      cacheList(list); renderList(list); return;
    }
    if (!flightsRef) return;
    flightsRef.child(id).remove().catch(err => console.error(err));
  };

  window.wbResumeLastFlight = function () {
    if (pendingResume && pendingResume.fields) {
      applyFields(pendingResume.fields);
      status('Resumed your last flight.', 'success');
    }
    window.wbDismissResume();
  };

  window.wbDismissResume = function () {
    const b = el('wbResumeBanner'); if (b) b.style.display = 'none';
    try { localStorage.setItem(DISMISS_KEY, String(pendingResume ? pendingResume.savedAt : Date.now())); } catch(e){}
    pendingResume = null;
  };

  function scheduleAutoSave() {
    if (applyingSnapshot || !currentRef) return;
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      const fields = collectFields();
      if (!hasAnyFlightData(fields)) return;
      currentRef.set({ savedAt: Date.now(), device: deviceLabel(), fields: fields }).catch(()=>{});
    }, 1500);
  }

  function init() {
    // Instant render from cache (works offline / before cloud responds)
    renderList(loadCachedList());

    if (typeof firebase === 'undefined') {
      setSync('off', 'Offline');
      return;
    }
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      flightsRef = db.ref('recentFlights');
      currentRef = db.ref('currentFlight');
    } catch (e) {
      console.error('Firebase init failed:', e);
      setSync('err', 'Sync off');
      return;
    }

    try {
      db.ref('.info/connected').on('value', s => {
        if (s.val() === true) setSync('ok', 'Synced');
        else setSync('off', 'Offline');
      });
    } catch(e){}

    flightsRef.orderByChild('savedAt').limitToLast(25).on('value', snap => {
      const arr = snapshotToArray(snap);
      cacheList(arr);
      renderList(arr);
    }, err => { console.error(err); setSync('err', 'Sync error'); });

    currentRef.once('value').then(snap => {
      const cur = snap.val();
      if (!cur || !cur.fields) return;
      let dismissedAt = 0;
      try { dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10) || 0; } catch(e){}
      const local = collectFields();
      if (cur.savedAt > dismissedAt && !hasAnyFlightData(local)) {
        pendingResume = cur;
        const banner = el('wbResumeBanner'), txt = el('wbResumeText');
        if (txt) txt.textContent = 'Unsaved flight from ' + (cur.device || 'another device') + ' · ' + fmtTime(cur.savedAt) + '.';
        if (banner) banner.style.display = 'block';
      }
    }).catch(()=>{});

    FLIGHT_FIELD_IDS.forEach(id => {
      const e = el(id);
      if (e) { e.addEventListener('input', scheduleAutoSave); e.addEventListener('change', scheduleAutoSave); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
