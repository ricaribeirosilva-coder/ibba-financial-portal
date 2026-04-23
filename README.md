# IBBA Financial Portal

Super app with analytics on the Brazilian financial sector. First product: **Credit Cycle Cockpit**.

## Dev

    npm install
    npm run dev       # http://localhost:5173
    npm run test      # vitest watch
    npm run build     # production build
    npm run preview   # serve dist/

## Data

Mock JSONs live under `public/data/`. Real BCB pipeline comes in Plan 2.

## Deploy

Vercel, build-on-push to `main`. SPA rewrites configured in `vercel.json`.
