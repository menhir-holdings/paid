# Paid — Agent guide

Today’s billed work. Timesheet desk: now-line, named blocks (who + hours), rate, billed vs leftover. Browser `localStorage` (`paid-planner-v1`, `paid-base-v1`). Drop `paid-theme-v1` on load. Redeploys do not wipe planner/rate data.

## Commands

```bash
npm run dev
npm run build
```

Preview deploys: `npx vercel@54 deploy --yes --scope menhir-holdings` (Hobby cannot GitHub-deploy this private repo). Do not `--prod` unless asked.

## GitHub / Vercel

- Repo: `menhir-holdings/paid`
- Bookmark: [https://paid-menhir-holdings.vercel.app](https://paid-menhir-holdings.vercel.app)

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
