# CLAUDE.md — Pilot Study Tools (flight training site)

## Project Overview
A static multi-page site of flight-training tools, hosted on GitHub Pages. `index.html` is the home page; every other page links back to it (⌂ Home).

## Data Accuracy Rule (non-negotiable)
All values — airspeeds, weight limits, CG envelopes, checklists, procedures — must come from:
- Aircraft POH / AFM (P2006T, C-152, C-172)
- School-specific maneuvers guide
- School-specific normal and emergency checklists

Never estimate, approximate, or invent values. If a number is in this tool, it has a source document.

## Stack
- Plain HTML / CSS / JavaScript — no frameworks, no build step
- Each page is a self-contained `.html` file
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
| `study.html` | Study hub |
| `p2006t_study.html` | P2006T multi-engine study |
| `mnemonics.html` | Mnemonics reference |
| `general_knowledge.html` | Regs / airspace knowledge |
| `written-exams.html` | FOI + FIA written exam prep |
| `p2006t_chairfly.html` | Chairfly trainer with G1000 simulation |
| `navlog.html` | C-152 cross-country planner — POH Fig 5-1/5-6/5-7 data baked in, vertical profile view, wind triangle, fillable Jeppesen VFR nav log. Descent figures are user-set, not POH. |
