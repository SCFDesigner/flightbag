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
- Design language: warm charcoal palette (#262624 base, #30302e panels, #3b3a37 cells, #45433e borders), single terracotta accent #d97757, muted green/amber/red only for status, no emoji in UI (inline SVG icons), mono reserved for numeric readouts
- Cross-device flight sync via Firebase Realtime Database (`wbsync.js`, project `weight-and-balance-d5044`, no login)

## Git
- Remote: `git@github.com:SCFDesigner/weight-balance-calculator.git` (SSH key not authorized on this machine — push over HTTPS with `-c credential.helper='!gh auth git-credential'`)
- Branch: `main`
- Note: the repo also hosts the unrelated `PEV1/` project on the same branch
- Push after every implementation using `/usr/bin/git`

## File Map
| File | Purpose |
|------|---------|
| `index.html` | Home — Pilot Study Tools launcher |
| `wb.html` | Weight & Balance calculator (C-152 / C-172 / P2006T / custom). Layout order matches the flight school's paper form — do not reorder. |
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
