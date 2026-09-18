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
| `e6b.html` | Standalone E6B flight computer (ported from wb.html's E6B column; anchors #crosswind, #wind, #altitude). Crosswind card (inline script) auto-loads the saved airport (default KDTO) METAR + OurAirports runways.csv on open; uses the METAR peak gust when present, else wind speed; runway chips = designator × 10, auto-pick most headwind among `PREFERRED_ENDS` (KDTO 18L/36R); max demo XW in localStorage `e6bXwMax` |
| `theme/` | Shared Flight Bag theme (CSS tokens/components + grain/light runtime) |
| `wb.html` | Weight & Balance calculator (C-152 / C-172 / P2006T / custom). Layout order matches the flight school's paper form — do not reorder. |
| `wb.html#fsp=…` | Hand-off from the FSP Dispatch Prep Firefox extension (`~/Desktop/mystuff/extension`): base64url JSON in the hash prefills aircraft type, tail, empty weight/arm/moment and instructor weight/bag (`applyFspImport()`), plus `FSP_IMPORT_DEFAULTS` (2.5 hr, 24.5 gal for C-152). Station arms/CG limits stay POH values. |
| `icons/favicon.svg`, `icons/apple-touch-icon.png` | Tab / home-screen icon for every page (terracotta square, charcoal plane — deliberately the inverse of the My Stuff dashboard's charcoal/terracotta mountain). New pages need both `<link>` tags after `<title>`. |
| `wbsync.js` | Firebase cross-device sync for wb.html (Recent Flights) |
| `e6b.js` | E6B flight computer logic for wb.html (wind/WCA/GS, time-speed-distance, fuel, descent, PA/DA/TAS, conversions) |
| `study.html` | Study hub |
| `p2006t_study.html` | P2006T multi-engine study |
| `mnemonics.html` | Mnemonics reference |
| `general_knowledge.html` | Regs / airspace knowledge |
| `written-exams.html` | FOI + FIA written exam prep |
| `p2006t_chairfly.html` | Chairfly trainer, two aircraft: P2006T (G1000 panel) and Cessna 152 (steam six-pack). C-152 set: 27 ASEL maneuvers from the SEL Guide/Airwork Profiles + USAA 152 trifold checklists. `?aircraft=p2006t|c152`. Requires landscape orientation. |
| `maneuvers.html` | SEL maneuvers study & test — reference, flashcards, step-ordering test, ACS limits test, speed/power tables. Aircraft selector (C-152 default / C-172) substitutes V-speeds into procedure text; standard selector (Private / Commercial / CFI) filters maneuvers and picks the ACS column. |
| `maneuvers-data.js` | Verbatim transcription of the SEL Maneuvers Guide Rev 2 — speeds, power tables, procedures, ACS standards. The single source of truth for `maneuvers.html`; every entry cites its guide page. |
| `holds.html` + `holds.js` | Hold Trainer — IFR holding tutorial (anatomy/entries/timing), interactive AIM 70°-rule entry explorer, and entry quiz with animated answers. |
| `navlog.html` | C-152 cross-country planner — POH Fig 5-1/5-6/5-7 data baked in, vertical profile view, wind triangle, fillable Jeppesen VFR nav log. Descent figures are user-set, not POH. |
