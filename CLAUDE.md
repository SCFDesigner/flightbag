# CLAUDE.md — Pilot Study Tools (flight training site)

## Project Overview
A static multi-page site of flight-training tools, hosted on GitHub Pages. `index.html` is the home page; every other page links back to it (⌂ Home).

## Data Accuracy Rule (non-negotiable)
All values — airspeeds, weight limits, CG envelopes, checklists, procedures — must come from:
- Aircraft POH / AFM (P2006T, C-152, C-172)
- School-specific maneuvers guide — **US Aviation Academy SEL Maneuvers Guide, Revision 2 (3/16/2025)**,
  source PDF `~/Downloads/USAA-SEL-Maneuvers-Guide-Rev-2-3.16.2025-2.pdf`.
  Transcribed into `maneuvers-data.js`, which carries per-maneuver page numbers so any
  value can be checked against the PDF. Edit that file only against the source.
- School-specific normal and emergency checklists

Never estimate, approximate, or invent values. If a number is in this tool, it has a source document.

## Stack
- Plain HTML / CSS / JavaScript — no frameworks, no build step
- Each page is a self-contained `.html` file
- Design language: the shared theme in `theme/flightbag-theme.css` + `theme/flightbag-theme.js` (mirrors the My Stuff dashboard, `~/Desktop/mystuff`). Every page links both and puts `class="fb"` on `<body>`. Tokens `--fb-*`: page #191918, panels #1f201f, cells #282827, borders #3a3935, rim #302f2c, text #b5b3a9 / dim #85837a / bright #f0eee6, terracotta accent #d97757; status only via --fb-ok/--fb-info/--fb-warn/--fb-bad. UI font = system sans (`--fb-font`), mono (`--fb-mono`) only for numbers/idents/readouts. Containers use `.fb-panel` (overlay grain + top catch-light + dark rim + one page-wide soft light positioned per panel by the script — a `background:` shorthand on the same element would wipe those layers; call `FlightBagTheme.place()` after showing/moving panels). Components: .fb-head/.fb-title, .fb-btn, .fb-tabs/.fb-tab, .fb-input, .fb-row, .fb-home (back link to index.html). No emoji in UI — inline line-style SVG icons. Instruments/charts keep their functional colours.
- Cross-device flight sync via Firebase Realtime Database (`wbsync.js`, project `weight-and-balance-d5044`, no login)

## Git
- Remote: `https://github.com/SCFDesigner/flightbag.git` (repo was renamed from weight-balance-calculator; HTTPS with the repo-local `credential.helper = !gh auth git-credential` — the SSH key isn't authorized on this machine)
- Branch: `main`
- Note: the repo also hosts the unrelated `PEV1/` project on the same branch
- Push after every implementation using `/usr/bin/git`

## File Map
| File | Purpose |
|------|---------|
| `index.html` | Home — "Flight Bag" launcher (reference implementation of the theme: tool panels with .fb-row links, UTC clock) |
| `navsim.js` | Shared flight instruments for the VOR and DME trainers (`window.NavSim`): VOR geometry (`geom` → radial/DME/TO-FROM/CDI dev), `hsi(ctx, s, opts)`, mini-view frame (`offscreen`/`drawInset`/`insetHit`), `knob`. Load before dme.js / vor.js; change the instrument here once. |
| `vor.html` + `vor.js` | VOR Trainer (DME trainer shell). Learn (radials, OBS & TO/FROM halves, where am I, intercepting, tracking & wind bracketing, station passage — demos flown by `simPath` with Fly physics), Quiz (read the HSI: radial from centred needle, 30° intercept heading, course side, CDI reverse sensing; `vor_score`; map reveals position after answering), Fly (intercept inbound / outbound, direct-to then outbound; coached steps; track 4 NM within a dot, scored after 0.5 NM settle). No wind in the sim — bracketing taught in text. `window.__vorFly` debug hook. |
| `dme.html` + `dme.js` | DME Arc Trainer (same shell/phone layout as holds.html). Learn (arc, join from outside/inside, 10-10, leave), Explore (arc from radial → to radial, DME, pick-up DME, GS; lead = GS/200 NM, LR = 60×lead/DME), Quiz (arc heading / join turn / lead radial; `dme_score`), **Fly**: real-time scenario (random ATC arc clearance, airplane already moving inbound from outside or outbound from inside) on an HSI (course pointer + CDI ±10°, TO/FROM, bearing pointer, heading bug) or a map; HDG and CRS knobs (drag / wheel / arrows / ±5 buttons; keyboard ←→ bug, ↑↓ course); 5 coached steps, arc deviation scored. Joining the arc before the first radial (on its approach side) skips the intercept steps. `window.__dmeFly` exposes the sim for console testing. Lead turns in drawn paths are tangent to the arc. |
| `e6b.html` | Standalone E6B flight computer (ported from wb.html's E6B column; anchors #crosswind, #wind, #altitude). Crosswind card (inline script) auto-loads the saved airport (default KDTO) METAR + OurAirports runways.csv on open; uses the METAR peak gust when present, else wind speed; runway chips = designator × 10, auto-pick most headwind among `PREFERRED_ENDS` (KDTO 18L/36R); max demo XW in localStorage `e6bXwMax`. ≤1024px: tab strip (`#e6bTabs`, built from the cards) shows one card at a time in a fixed window (page does not scroll; `#e6b-grid` scrolls); choice in localStorage `e6bTab`, #hash wins. Compass wheel/keys only when the diagram is focused. ≤700px: compact cards sized from the window height (cqh on #e6b-grid). W&B link card (`#wb`, `data-href`) = a tab that opens wb.html; hidden in `?embed=1` (which also hides the header and doesn't save the airport). Phone landscape (max-height 500px): header, METAR and a vertical tab list in a left column, calculator on the right |
| `theme/` | Shared Flight Bag theme (CSS tokens/components + grain/light runtime) |
| `wb.html` | Weight & Balance calculator (C-152 / C-172 / P2006T / custom). Layout order matches the flight school's paper form — do not reorder. Models/configs (2026-09-18 audit vs POH/AFM): `VARIANTS` + `applyVariant()` merge the chosen 172 model (`C172_MODELS` S/P/L) or P2006T MTOW config (`P2006T_CONFIGS` 1180/1230/1290 kg) into `aircraftSpecs[type]`; remembered per type and per tail (localStorage `wb_variant`, `wb_tailVariant`). Performance: one engine (`perfLookup` bilinear PA×OAT, linear between weight tables, flags out-of-table / POH '---'), `CESSNA_CORRECTIONS` / `P2006T_CORRECTIONS` (wind incl. tailwind, surface via the RW Surface select), 172L custom (`c172LPerformance`, 1971 table format). P2006T tables `P2006T_PERF` generated from the AFM (grass tables; 1080/930 kg take-off from A19 with the corrected 3000 ft row). Headwind is signed (− = tailwind; gust not credited as headwind). `checkWBLimits()` flags over-limit weights/CG/baggage/fuel in red. wbsync never autosaves from localhost. Its E6B column (desktop toggle / mobile E6B view) is an iframe of `e6b.html?embed=1&airport=…`, loaded the first time it's visible; airport changes are posted in (`{type:'e6b-airport'}`). e6b.js stays loaded only for `toggleE6BPanel`. |
| `wb.html#fsp=…` | Hand-off from the FSP Dispatch Prep Firefox extension (`~/Desktop/mystuff/extension`): base64url JSON in the hash prefills aircraft type, tail, empty weight/arm/moment and instructor weight/bag (`applyFspImport()`), plus `FSP_IMPORT_DEFAULTS` (2.5 hr, 24.5 gal for C-152). Station arms/CG limits stay POH values. |
| `icons/favicon.svg`, `icons/apple-touch-icon.png` | Tab / home-screen icon for every page (terracotta square, charcoal plane — deliberately the inverse of the My Stuff dashboard's charcoal/terracotta mountain). New pages need both `<link>` tags after `<title>`. |
| `wbsync.js` | Firebase cross-device sync for wb.html (Recent Flights) |
| `e6b.js` | E6B flight computer logic for wb.html (wind/WCA/GS, time-speed-distance, fuel, descent, PA/DA/TAS, conversions) |
| `study.html` | Study hub |
| `p2006t_study.html` | P2006T multi-engine study |
| `mnemonics.html` | Mnemonics reference |
| `general_knowledge.html` | Regs / airspace knowledge |
| `written-exams.html` | FOI + FIA + FII written exam prep (FII figures load from `images/fii/`; add a course with `~/Downloads/FlightTest5-Toolkit/add_course.py`) |
| `p2006t_chairfly.html` | Chairfly trainer, two aircraft: P2006T (G1000 panel) and Cessna 152 (steam six-pack). C-152 set: 27 ASEL maneuvers from the SEL Guide/Airwork Profiles + USAA 152 trifold checklists. `?aircraft=p2006t|c152`. Requires landscape orientation. |
| `maneuvers.html` | SEL maneuvers study & test — reference, flashcards, step-ordering test, ACS limits test, speed/power tables. Aircraft selector (C-152 default / C-172) substitutes V-speeds into procedure text; standard selector (Private / Commercial / CFI) filters maneuvers and picks the ACS column. |
| `maneuvers-data.js` | Verbatim transcription of the SEL Maneuvers Guide Rev 2 — speeds, power tables, procedures, ACS standards. The single source of truth for `maneuvers.html`; every entry cites its guide page. |
| `holds.html` + `holds.js` | Hold Trainer — IFR holding tutorial (anatomy/entries/timing), interactive AIM 70°-rule entry explorer, and entry quiz with animated answers. |
| `navlog.html` | C-152 cross-country planner — POH Fig 5-1/5-6/5-7 data baked in, vertical profile view, wind triangle, fillable Jeppesen VFR nav log. Descent figures are user-set, not POH. |

## Look tuning
- Add `?tune` to any Flight Bag page URL → sliders for the page light and glass readouts (theme/flightbag-theme.js `TUNE`). Saved per browser in localStorage `fbLookTune` (diff vs `DEFAULTS`); "Copy values" gives JSON to bake into `DEFAULTS`. Glass = `.fb-glass` or `window.FB_GLASS` selector: `--fb-glare` (radial at the lamp) + `--fb-sheen` (per-element edge facing the lamp, fading with distance).
