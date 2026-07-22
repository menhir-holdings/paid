# Paid — happy path checklist

Manual verification for [MT-19](https://linear.app/menhir-holdings/issue/MT-19).

| Step | Check |
|------|-------|
| Cold load `/` | Planner visible, today's date selected, grid rendered |
| Add block | Quick-add or slot click creates a block |
| Morning note | Text persists after reload |
| Theme | Toggle theme; survives reload |
| Base value | Change base; quick-add labels update and persist |
| Reopen | Hard refresh — same date restores blocks + note + base + theme |

Storage keys: `paid-planner-v1`, `paid-base-v1`, `paid-theme-v1` (browser local only).
