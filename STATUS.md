# Paid — Status

**As of:** 2026-09-10  
**SoT:** [Linear — Paid](https://linear.app/menhir-holdings/project/paid-7842cd6c-e9a5-44a5-b5b3-1e96c175502d)  
**Checkout:** `Menhir Holdings/Flow/Paid`

## Product

**Morning work planner** — not an invoice tool. Stonehenge tagline: *Morning clarity for people who get things done.*

**Bookmark:** [https://paid-menhir-holdings.vercel.app](https://paid-menhir-holdings.vercel.app)

## Shipped

- [MT-206](https://linear.app/menhir-holdings/issue/MT-206) — day-planner chrome to Menhir web standard (paper desk, Clockwise/ClickUp now-line). Removed 308s to `paid.menhir-holdings.com`.
- [MT-19](https://linear.app/menhir-holdings/issue/MT-19) — Solo planner happy path
  1. `/` loads `DayPlanner` immediately
  2. 30-min grid, quick-add blocks, morning note, Rob Ross themes
  3. Auto-persist to `localStorage` (`paid-planner-v1`, `paid-base-v1`, `paid-theme-v1`)
  4. Reload same date restores blocks, note, base, theme

## Backlog

Share-link `/?data=` (MT-20), print layout (MT-21), guide notes polish (MT-23). Legacy invoice issues in Linear are superseded by the planner pivot.

See [TODO.md](./TODO.md) and [docs/HAPPY_PATH.md](./docs/HAPPY_PATH.md).
