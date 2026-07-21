# Paid

Personal morning work-day planner. Map time blocks when you arrive at work — stored locally in your browser.

Themes are compiled from the shared **Rob Ross** genome — [`Menhir Holdings/Color/Rob-Ross`](../../Color/Rob-Ross/) ([github.com/ledoit/Rob-Ross](https://github.com/ledoit/Rob-Ross)).

After keeping IDE palettes there, sync into this app:

```bash
cd "../../Color/Rob-Ross"
python cli.py web sync paid
```

## Local dev

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

Project name: **Paid**

```bash
npx vercel link    # name the project "Paid" when prompted
npm run build
npx vercel --prod
```

Plans persist in `localStorage` only — no backend, no accounts.


## License

All Rights Reserved © Menhir Holdings
