/* Bakery seed data — transcribed from the Sprouts Bakery Temperature Cheat Sheet
   dated 12.15.2023 (photo of the laminated sheet on the oven).
   thawType: 'none' (frozen → oven), 'overnight' (broken out the night before,
   thaws in the cooler), 'timed' (pulled this morning, slack thawMin minutes).
   proofMin: minutes in the proofer this morning (0 = none).
   steam: seconds of steam (0 = none).  timeLo/timeHi: bake minutes.
   verify: true where glare on the photo made a value uncertain — she should
   check those against the real sheet. */
const BAKERY_CATEGORIES = [
  'Artisan Breads', 'Pastries', 'Breakfast', 'Bread and Rolls', 'Cookies', 'Pies', 'Misc'
];
/* Bake order for the generated task list, from the Opening Shift schedule
   page: artisan first (no thaw), pastries, muffins, the proofed dough items,
   cookies, pies, then Irish soda bread / brownies / cornbread last. */
const BAKERY_CAT_PRIORITY = {
  'Artisan Breads': 1, 'Pastries': 2, 'Breakfast': 3, 'Bread and Rolls': 4,
  'Cookies': 5, 'Pies': 6, 'Misc': 7
};

/* one colour per category — used on timer cards, the mini timer strip and
   task rows so she can tell at a glance which timer is which */
const BAKERY_CAT_COLORS = {
  'Artisan Breads': '#f5d34a', 'Bread and Rolls': '#ff9a3c', 'Breakfast': '#5b9dff',
  'Pastries': '#c88bff', 'Cookies': '#3fd6c4', 'Pies': '#ff6b81', 'Misc': '#9aa3ad'
};
function bakeryCatColor(cat) {
  if (BAKERY_CAT_COLORS[cat]) return BAKERY_CAT_COLORS[cat];
  let h = 0; for (const ch of String(cat)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 'hsl(' + (h % 360) + ' 70% 65%)';
}
/* what the alarm voice says — short, repeated. "Muffins #1 — Banana Nut…"
   becomes "Muffins", "Croissants Butter" becomes "Croissants" */
function bakeryDefaultSay(it) {
  const byCat = { 'Breakfast': 'Muffins', 'Cookies': 'Cookies', 'Pies': 'Pies', 'Artisan Breads': 'Artisan bread' };
  if (byCat[it.cat]) return byCat[it.cat];
  let n = String(it.name || '').replace(/\(.*?\)/g, '').split(/—|,|\s-\s|\s(?:and|or|&|with)\s/i)[0].trim();
  n = n.replace(/^LDF\s+/i, '').replace(/\s+#\d+$/, '');
  const w = n.split(/\s+/).filter(Boolean);
  return (w.length > 2 ? w.slice(0, 2).join(' ') : n) || 'Timer';
}

function bakeryDefaultSteps(it) {
  const s = [];
  if (it.thawType === 'none') s.push('Pull from freezer');
  else if (it.thawType === 'overnight') s.push('Pull from cooler (broken out last night)');
  else s.push('Pull from freezer, slack ' + it.thawMin + ' min (tacky to the touch)');
  s.push('Pan on lined sheets, load the oven rack');
  if (it.proofMin) s.push('Proof ' + it.proofMin + ' min');
  if (it.cat === 'Bread and Rolls') s.push('Score after proofing — use a cut glove');
  const temp = it.temp ? it.temp + '°' : '';
  const time = it.timeLo ? (it.timeLo === it.timeHi ? it.timeLo : it.timeLo + '-' + it.timeHi) + ' min' : '';
  s.push(('Bake ' + temp + ' ' + time).trim() + (it.steam ? ', steam ' + it.steam : ''));
  s.push('Cool, package, label');
  return s;
}

const BAKERY_SEED_ROWS = [
  // cat, name, thawType, thawMin, proofMin, temp, steam, timeLo, timeHi, verify
  ['Artisan Breads', 'Artisan Loaves', 'none', 0, 0, 385, 0, 14, 16],

  ['Bread and Rolls', 'French Bread', 'overnight', 0, 0, 380, 20, 30, 33],
  ['Bread and Rolls', 'Baguette', 'overnight', 0, 0, 380, 20, 25, 28],
  ['Bread and Rolls', 'Rye and Pumpernickel', 'overnight', 0, 0, 380, 20, 30, 35],
  ['Bread and Rolls', 'Cocktail Rye', 'overnight', 0, 0, 380, 20, 25, 30],
  ['Bread and Rolls', 'Focaccia Tomato & Parmesan', 'overnight', 0, 0, 360, 20, 20, 22],
  ['Bread and Rolls', 'Focaccia Jalapeño & Cheddar', 'overnight', 0, 0, 360, 20, 20, 22],
  ['Bread and Rolls', 'Chop Bread Jalapeño & Cheddar', 'overnight', 0, 0, 360, 20, 28, 30],
  ['Bread and Rolls', 'Focaccia Muffin Jalapeño & Cheddar', 'overnight', 0, 0, 360, 20, 20, 22],
  ['Bread and Rolls', 'Irish Soda Bread', 'overnight', 0, 0, 330, 0, 40, 50],
  ['Bread and Rolls', 'Dinner Rolls Wheat or Golden', 'overnight', 0, 0, 360, 10, 16, 18],
  ['Bread and Rolls', 'Bolillo Rolls', 'overnight', 0, 0, 380, 20, 18, 20],
  ['Bread and Rolls', 'Kaiser Rolls', 'overnight', 0, 0, 380, 20, 18, 20],
  ['Bread and Rolls', 'Telera Rolls White or Wheat', 'overnight', 0, 0, 380, 20, 18, 20],
  ['Bread and Rolls', 'Telera Rolls Jalapeño & Cheddar', 'overnight', 0, 0, 380, 20, 18, 20],
  ['Bread and Rolls', 'French Hoagie Rolls (Philadelphia only)', 'overnight', 0, 0, 380, 20, 23, 23, false, false],

  ['Breakfast', 'Muffins #1 — Banana Nut, Pistachio, Raisin Bran, Seasonal', 'timed', 60, 0, 365, 0, 28, 33],
  ['Breakfast', 'Muffins #2 — Blueberry, Cran Orange, Dbl Choc Chip', 'timed', 60, 0, 365, 0, 33, 35],

  ['Pastries', 'LDF Cinnamon Rolls', 'overnight', 0, 25, 350, 0, 15, 20],
  ['Pastries', 'LDF Cinnamon Roll Single', 'overnight', 0, 25, 350, 0, 13, 18],
  ['Pastries', 'Twists Chocolate Custard', 'timed', 30, 0, 360, 0, 16, 18],
  ['Pastries', 'LDF Almond Bear Claw', 'overnight', 0, 12, 375, 0, 12, 15],
  ['Pastries', 'Cream Cheese Danish', 'none', 0, 0, 350, 0, 15, 15],
  ['Pastries', 'Mini Danish Maple Pecan', 'none', 0, 0, 360, 0, 16, 18],
  ['Pastries', 'LDF Strudel Bites', 'none', 0, 0, 375, 0, 20, 25],
  ['Pastries', 'LDF Turnovers', 'none', 0, 0, 375, 0, 20, 25],
  ['Pastries', 'LDF Parisian Twists', 'none', 0, 0, 375, 0, 18, 20],
  ['Pastries', 'LDF Mini Strudel', 'none', 0, 0, 375, 0, 20, 25],
  ['Pastries', 'Croissants Butter', 'timed', 30, 0, 360, 5, 16, 18],
  ['Pastries', 'Croissants Hazelnut or Raspberry', 'timed', 30, 0, 350, 5, 17, 20],
  ['Pastries', 'Scones', 'none', 0, 0, 350, 0, 19, 22],

  ['Cookies', '12ct Cookies', 'timed', 10, 0, 350, 0, 9, 12],
  ['Cookies', 'Large Cookies', 'timed', 10, 0, 350, 0, 12, 14],

  ['Pies', 'Fruit Pies', 'none', 0, 0, 400, 0, 32, 35],
  ['Pies', 'NSA Fruit Pies', 'none', 0, 0, 400, 0, 35, 40],

  ['Misc', 'Brownies 8x8', 'overnight', 0, 0, 330, 0, 30, 35],
  ['Misc', 'Brownie Sheet', 'overnight', 0, 0, 330, 0, 50, 55, true],
  ['Misc', 'Corn Bread Sheet', 'overnight', 0, 0, 330, 0, 60, 70, true],
  ['Misc', 'Corn Bread 8x8', 'overnight', 0, 0, 330, 0, 30, 35, true],
  ['Misc', 'Crostinis', 'none', 0, 0, 370, 0, 7, 10, true],
  ['Misc', 'Stuffing Cubes', 'none', 0, 0, 225, 0, 0, 0, false, true, 'Bake at 225°-250° until completely dry']
];

function bakerySlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function bakerySeedItems() {
  const out = {};
  BAKERY_SEED_ROWS.forEach((r, i) => {
    const it = {
      id: bakerySlug(r[1]), name: r[1], cat: r[0],
      thawType: r[2], thawMin: r[3], proofMin: r[4], temp: r[5], steam: r[6],
      timeLo: r[7], timeHi: r[8],
      verify: !!r[9],
      enabled: r[10] === undefined ? true : !!r[10],
      par: null,          // how many should be on the floor — she fills this in
      parBy: r[0] === 'Artisan Breads' || r[0] === 'Breakfast' || r[0] === 'Pastries' ? '7' : '9',
      batch: 1,           // pieces per baking sheet — she fills this in
      shelfDays: null,    // shelf life in days — she fills this in
      order: i,
      note: r[11] || '',
      steps: [],
      say: ''
    };
    it.steps = bakeryDefaultSteps(it);
    it.say = bakeryDefaultSay(it);
    out[it.id] = it;
  });
  return out;
}
