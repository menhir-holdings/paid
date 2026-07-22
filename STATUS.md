# Paid — Status

**As of:** 2026-07-22  
**SoT:** [Linear — Paid](https://linear.app/menhir-holdings/project/paid-7842cd6c-e9a5-44a5-b5b3-1e96c175502d)

## Product

**Morning work planner** — not an invoice tool. Stonehenge tagline: *Morning clarity for people who get things done.*

Live: [paid.menhir-holdings.com](https://paid.menhir-holdings.com)

## Shipped happy path ([MT-19](https://linear.app/menhir-holdings/issue/MT-19))

1. **Landing / open** — `/` loads `DayPlanner` immediately
2. **Plan** — 30-min grid, quick-add blocks, morning note, Rob Ross themes
3. **Save** — auto-persist to `localStorage` (`paid-planner-v1`, `paid-base-v1`, `paid-theme-v1`)
4. **Reopen** — reload same date restores blocks, note, base, theme

## Backlog

Share-link `/?data=` (MT-20), print layout (MT-21), guide notes polish (MT-23). Legacy invoice issues in Linear are superseded by the planner pivot.

See [TODO.md](./TODO.md) and [docs/HAPPY_PATH.md](./docs/HAPPY_PATH.md).
