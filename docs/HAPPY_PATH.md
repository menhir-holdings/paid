# Paid — happy path checklist

Manual verification for today’s billed-day desk ([MT-214](https://linear.app/menhir-holdings/issue/MT-214)).

| Step | Check |
|------|-------|
| Cold load `/` | One paper sheet. No theme switcher. Today selected. Now-line if within 8am–6pm. |
| Rate | Change $/h; billed and leftover money update. Survives reload (`paid-base-v1`). |
| Name a block | Who + hours (or 0.5h / 1h / 1.5h / 2h) + Add. Row shows $, hours, amount. |
| Day strip | Click an hour to set start; named block appears on the now-line day. |
| Totals | Billed vs leftover match the ledger total. |
| Reopen | Hard refresh — same date restores blocks + rate. No `paid-theme-v1`. |

Storage keys: `paid-planner-v1`, `paid-base-v1` (browser local only). Theme key is removed on load.
