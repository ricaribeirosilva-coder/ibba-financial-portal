# Plano 1 — Portal Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a deployed Vercel URL of the IBBA Financial Portal shell with a working Home and the first curated view (`/credit-cycle/3-camadas`) rendering a Plotly chart with divergence bands, cycle/range selectors, KPIs, and URL-state deep linking — all backed by mock data.

**Architecture:** React 18 + Vite 5 + TypeScript + React Router v6 SPA. Plotly.js (dynamic import per view) for charts. CSS modules + CSS variables (no utility-first lib). Static JSON under `public/data/` as data source (mocked in this plan, real in Plan 2). URL query params as the source of truth for view state; tiny `url-state` helper serializes/deserializes typed state. Deploy to Vercel via GitHub integration.

**Tech Stack:** React 18, Vite 5, TypeScript 5, React Router v6, Plotly.js + react-plotly.js, Vitest + @testing-library/react, CSS modules.

**Scope of this plan:**
- In: repo scaffold, shell (TopBar + Sidebar), Home (masthead + product card + coming-soon tiles), one curated view (`3-camadas`) with Plotly + divergences + cycle/range selectors + KPIs + URL state, mock data, Vercel deploy.
- Out: real BCB pipeline (Plan 2), other curated views (Plan 3), Lab tools (Plan 4), Dados export/Home live preview (Plan 5).

---

## File Structure

```
ibba-financial-portal/
├── public/
│   └── data/
│       ├── manifest.json                    # series catalog (mock)
│       ├── divergences.json                 # divergence periods (mock)
│       └── series/
│           ├── compromet_renda_total.json   # mock
│           ├── inadim_pf_total.json         # mock
│           └── selic_meta.json              # mock
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── CreditCycle/
│   │   │   ├── CreditCycleLayout.tsx        # sidebar + <Outlet/>
│   │   │   └── curated/
│   │   │       └── ThreeLayers.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── shell/
│   │   │   ├── TopBar.tsx + .module.css
│   │   │   └── Sidebar.tsx + .module.css
│   │   ├── charts/
│   │   │   ├── ChartShape.tsx               # dynamic Plotly + shared layout
│   │   │   └── buildDivergenceShapes.ts     # pure helper
│   │   └── ui/
│   │       ├── Card.module.css
│   │       ├── Chip.tsx + .module.css
│   │       └── KPI.tsx + .module.css
│   ├── lib/
│   │   ├── url-state.ts                     # serialize/deserialize
│   │   ├── data.ts                          # fetch + cache JSON
│   │   └── types.ts                         # shared types
│   └── styles/
│       ├── tokens.css
│       └── global.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vitest.config.ts
├── package.json
├── .gitignore
├── vercel.json
└── README.md
```

One focused file per responsibility. `url-state.ts`, `data.ts`, and `buildDivergenceShapes.ts` are pure modules with tests. Route components are thin — they compose hooks + UI.

---

## Pre-flight (Ricardo)

Before starting tasks, confirm:
- [ ] Node 20+ installed (`node -v`). If not: install from nodejs.org.
- [ ] Git configured (`git config --global user.name` and `user.email` set).
- [ ] GitHub CLI `gh` installed and authenticated (`gh auth status`). Optional but simplifies Task 13 — otherwise create repo via web UI.
- [ ] Vercel account created (done 2026-04-23, linked to GitHub).

---

## Task 1: Project scaffold (Vite + React + TS)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Initialize Vite project in the existing directory**

From `C:/Users/ricar/projects/ibba-financial-portal/`:

```bash
npm create vite@latest . -- --template react-ts
```

When prompted about non-empty dir (due to `docs/`), answer "Ignore files and continue".

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react-router-dom plotly.js react-plotly.js
npm install -D @types/plotly.js @types/react-plotly.js vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/ui @vitejs/plugin-react
```

- [ ] **Step 3: Replace `.gitignore` with the following**

```
node_modules
dist
dist-ssr
*.local
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.env
.env.*
!.env.example
coverage
.vercel
```

- [ ] **Step 4: Verify dev server runs**

```bash
npm run dev
```

Expected: `VITE vX.X.X ready in Yms / Local: http://localhost:5173/`. Open URL, see default Vite + React page. Kill with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: initial Vite + React + TS scaffold"
```

---

## Task 2: Design tokens and global styles

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Modify: `src/main.tsx`, `index.html`

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  /* Palette — C3 hybrid (editorial voice, clean space) */
  --color-bg: #f7f5f0;
  --color-surface: #fbf9f3;
  --color-surface-strong: #fefcf7;
  --color-text: #17120d;
  --color-text-muted: #7a6c5a;
  --color-text-faint: #a89a82;
  --color-border: rgba(23, 18, 13, 0.12);
  --color-border-strong: rgba(23, 18, 13, 0.30);
  --color-accent: #d84e1d;
  --color-accent-soft: rgba(216, 78, 29, 0.14);

  /* Type */
  --font-serif: "Instrument Serif", Georgia, "Times New Roman", serif;
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;

  /* Scale */
  --step-0: 0.9375rem;   /* 15 */
  --step-1: 1.125rem;    /* 18 */
  --step-2: 1.5rem;      /* 24 */
  --step-3: 2.25rem;     /* 36 */
  --step-4: 3.25rem;     /* 52 */

  /* Layout */
  --topbar-h: 48px;
  --sidebar-w: 240px;
  --sidebar-w-collapsed: 56px;
  --content-max: 1400px;

  /* Motion */
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
*,
*::before,
*::after { box-sizing: border-box; }

html, body, #root { height: 100%; margin: 0; }

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--step-0);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1, h2, h3 { font-family: var(--font-serif); font-weight: 400; letter-spacing: -0.01em; line-height: 1.1; margin: 0; }

a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; padding: 0; }

:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; border-radius: 2px; }

.numeric { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
```

- [ ] **Step 3: Replace `index.html` body/head to load fonts**

In `index.html` `<head>`, add before the title:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Change the `<title>` to `IBBA Financial Portal`.

- [ ] **Step 4: Import styles in `src/main.tsx`**

Replace any existing CSS imports with:

```tsx
import "./styles/tokens.css";
import "./styles/global.css";
```

Also delete `src/App.css` and `src/index.css` if they were created by the template (remove any `import "./App.css"` or `import "./index.css"` lines in `App.tsx` and `main.tsx`).

- [ ] **Step 5: Run dev server and verify visual baseline**

```bash
npm run dev
```

Open http://localhost:5173. Expected: background is warm off-white (`#f7f5f0`), text is dark warm black. No console errors.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(styles): add design tokens and global baseline"
```

---

## Task 3: Router setup and App shell skeleton

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`
- Create: `src/routes/Home.tsx`, `src/routes/NotFound.tsx`, `src/routes/CreditCycle/CreditCycleLayout.tsx`, `src/routes/CreditCycle/curated/ThreeLayers.tsx`

- [ ] **Step 1: Write stub route components**

`src/routes/Home.tsx`:
```tsx
export default function Home() {
  return <main style={{ padding: 32 }}><h1>Home</h1></main>;
}
```

`src/routes/NotFound.tsx`:
```tsx
export default function NotFound() {
  return <main style={{ padding: 32 }}><h1>Not found</h1></main>;
}
```

`src/routes/CreditCycle/CreditCycleLayout.tsx`:
```tsx
import { Outlet } from "react-router-dom";
export default function CreditCycleLayout() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Credit Cycle</h1>
      <Outlet />
    </main>
  );
}
```

`src/routes/CreditCycle/curated/ThreeLayers.tsx`:
```tsx
export default function ThreeLayers() {
  return <section><h2>3 camadas (stub)</h2></section>;
}
```

- [ ] **Step 2: Replace `src/App.tsx` with router**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./routes/Home";
import NotFound from "./routes/NotFound";
import CreditCycleLayout from "./routes/CreditCycle/CreditCycleLayout";
import ThreeLayers from "./routes/CreditCycle/curated/ThreeLayers";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/credit-cycle" element={<CreditCycleLayout />}>
          <Route index element={<Navigate to="3-camadas" replace />} />
          <Route path="3-camadas" element={<ThreeLayers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Ensure `src/main.tsx` renders App**

Confirm `src/main.tsx` looks like:
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Verify routes manually**

```bash
npm run dev
```

Visit in browser:
- http://localhost:5173/ → shows "Home"
- http://localhost:5173/credit-cycle → redirects to `/credit-cycle/3-camadas`, shows "Credit Cycle" + "3 camadas (stub)"
- http://localhost:5173/nonexistent → shows "Not found"

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(router): set up React Router with stub routes"
```

---

## Task 4: Shell — TopBar component

**Files:**
- Create: `src/components/shell/TopBar.tsx`, `src/components/shell/TopBar.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write `TopBar.module.css`**

```css
.bar {
  height: var(--topbar-h);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  font-family: var(--font-serif);
  font-size: var(--step-1);
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 16px;
}

.product {
  font-family: var(--font-sans);
  font-size: var(--step-0);
  color: var(--color-text-muted);
}

.spacer { flex: 1; }
```

- [ ] **Step 2: Write `TopBar.tsx`**

```tsx
import { Link, useLocation } from "react-router-dom";
import styles from "./TopBar.module.css";

function productNameFor(pathname: string): string | null {
  if (pathname.startsWith("/credit-cycle")) return "Ciclo de Crédito";
  return null;
}

export default function TopBar() {
  const { pathname } = useLocation();
  const product = productNameFor(pathname);
  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.brand}>IBBA Financial Portal</Link>
      {product && (
        <>
          <span className={styles.divider} aria-hidden />
          <span className={styles.product}>{product}</span>
        </>
      )}
      <div className={styles.spacer} />
    </header>
  );
}
```

- [ ] **Step 3: Render TopBar in App**

In `src/App.tsx`, wrap `<Routes>`:

```tsx
import TopBar from "./components/shell/TopBar";
// ...
export default function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <Routes>
        {/* ... */}
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Verify manually**

```bash
npm run dev
```

Navigate to `/` → TopBar shows only brand. Navigate to `/credit-cycle/3-camadas` → TopBar shows `IBBA Financial Portal | Ciclo de Crédito`. Click brand → returns to `/`.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(shell): add TopBar with brand and product name"
```

---

## Task 5: Home page (masthead + product card + coming-soon tiles)

**Files:**
- Create: `src/routes/Home.module.css`
- Modify: `src/routes/Home.tsx`

- [ ] **Step 1: Write `Home.module.css`**

```css
.page {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 72px 24px 120px;
}

.masthead { margin-bottom: 56px; }
.wordmark {
  font-family: var(--font-serif);
  font-size: var(--step-4);
  line-height: 1;
  letter-spacing: -0.02em;
}
.tagline {
  margin-top: 12px;
  color: var(--color-text-muted);
  max-width: 52ch;
}

.productCard {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 32px;
  margin-bottom: 48px;
}

.productTitle {
  font-family: var(--font-serif);
  font-size: var(--step-3);
  margin-bottom: 12px;
}
.productDesc { color: var(--color-text-muted); margin-bottom: 24px; max-width: 48ch; }

.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-accent);
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: transform 0.18s var(--ease);
}
.cta:hover { transform: translateY(-1px); }

.preview {
  background: var(--color-surface-strong);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-faint);
  font-size: 0.875rem;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.tile {
  border: 1px dashed var(--color-border-strong);
  border-radius: 10px;
  padding: 24px;
  color: var(--color-text-muted);
}
.tileLabel {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  margin-bottom: 8px;
}
.tileName {
  font-family: var(--font-serif);
  font-size: var(--step-2);
  color: var(--color-text);
}

@media (max-width: 768px) {
  .productCard { grid-template-columns: 1fr; }
  .wordmark { font-size: var(--step-3); }
}
```

- [ ] **Step 2: Write `Home.tsx`**

```tsx
import { Link } from "react-router-dom";
import styles from "./Home.module.css";

const COMING_SOON = [
  { name: "M&A Financials" },
  { name: "Consumer & Inflação" },
  { name: "Pagamentos & Fintech" },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.masthead}>
        <h1 className={styles.wordmark}>IBBA Financial Portal</h1>
        <p className={styles.tagline}>
          Análises e ferramentas sobre o setor financeiro brasileiro. Dados públicos tratados, interação direta.
        </p>
      </section>

      <article className={styles.productCard}>
        <div>
          <h2 className={styles.productTitle}>Ciclo de Crédito</h2>
          <p className={styles.productDesc}>
            Leading, coincident e lagging indicators do crédito bancário brasileiro. Divergências entre camadas destacadas no tempo.
          </p>
          <Link to="/credit-cycle/3-camadas" className={styles.cta}>
            Abrir produto →
          </Link>
        </div>
        <div className={styles.preview} aria-hidden>preview ao vivo (Plano 5)</div>
      </article>

      <section className={styles.tiles} aria-label="Produtos em breve">
        {COMING_SOON.map((p) => (
          <div key={p.name} className={styles.tile}>
            <div className={styles.tileLabel}>Em breve</div>
            <div className={styles.tileName}>{p.name}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify manually**

```bash
npm run dev
```

At `/`: masthead, product card with CTA button (laranja Itaú), 3 dashed tiles. Click "Abrir produto →" → navigates to `/credit-cycle/3-camadas`. Resize window below 768px → grid collapses to single column.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(home): add masthead, product card and coming-soon tiles"
```

---

## Task 6: Sidebar component and CreditCycle layout

**Files:**
- Create: `src/components/shell/Sidebar.tsx`, `src/components/shell/Sidebar.module.css`, `src/routes/CreditCycle/CreditCycleLayout.module.css`
- Modify: `src/routes/CreditCycle/CreditCycleLayout.tsx`

- [ ] **Step 1: Write `Sidebar.module.css`**

```css
.aside {
  width: var(--sidebar-w);
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 20px 12px;
  position: sticky;
  top: var(--topbar-h);
  height: calc(100vh - var(--topbar-h));
  overflow-y: auto;
}

.section { margin-bottom: 28px; }
.sectionLabel {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  padding: 0 10px 8px;
}

.item {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  transition: background 0.12s var(--ease), color 0.12s var(--ease);
}
.item:hover { background: rgba(23, 18, 13, 0.04); color: var(--color-text); }
.itemActive { color: var(--color-accent); background: var(--color-accent-soft); }
.itemActive:hover { background: var(--color-accent-soft); color: var(--color-accent); }

.disabled { color: var(--color-text-faint); cursor: not-allowed; }
.disabled:hover { background: transparent; color: var(--color-text-faint); }

@media (max-width: 768px) {
  .aside { display: none; }
}
```

- [ ] **Step 2: Write `Sidebar.tsx`**

```tsx
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

type Item = { label: string; to?: string; disabled?: boolean };

const SECTIONS: { label: string; items: Item[] }[] = [
  {
    label: "Análises",
    items: [
      { label: "3 camadas", to: "/credit-cycle/3-camadas" },
      { label: "Juros vs Amortização", disabled: true },
      { label: "Concessões PF/PJ", disabled: true },
      { label: "Ciclos históricos", disabled: true },
    ],
  },
  {
    label: "Lab",
    items: [
      { label: "Explorador", disabled: true },
      { label: "Correlação & Lag", disabled: true },
      { label: "Comparador", disabled: true },
      { label: "Simulador", disabled: true },
    ],
  },
  {
    label: "Dados",
    items: [{ label: "Séries & export", disabled: true }],
  },
];

export default function Sidebar() {
  return (
    <aside className={styles.aside}>
      {SECTIONS.map((s) => (
        <div key={s.label} className={styles.section}>
          <div className={styles.sectionLabel}>{s.label}</div>
          {s.items.map((it) =>
            it.disabled || !it.to ? (
              <span key={it.label} className={`${styles.item} ${styles.disabled}`} title="Em breve">
                {it.label}
              </span>
            ) : (
              <NavLink
                key={it.label}
                to={it.to}
                className={({ isActive }) =>
                  isActive ? `${styles.item} ${styles.itemActive}` : styles.item
                }
              >
                {it.label}
              </NavLink>
            )
          )}
        </div>
      ))}
    </aside>
  );
}
```

- [ ] **Step 3: Write `CreditCycleLayout.module.css`**

```css
.wrap {
  display: flex;
  align-items: stretch;
  min-height: calc(100vh - var(--topbar-h));
}
.content {
  flex: 1;
  min-width: 0;
  padding: 32px 40px;
  max-width: var(--content-max);
}
@media (max-width: 768px) {
  .content { padding: 20px; }
}
```

- [ ] **Step 4: Rewrite `CreditCycleLayout.tsx`**

```tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/shell/Sidebar";
import styles from "./CreditCycleLayout.module.css";

export default function CreditCycleLayout() {
  return (
    <div className={styles.wrap}>
      <Sidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify manually**

```bash
npm run dev
```

At `/credit-cycle/3-camadas`: sidebar on the left with three section labels. "3 camadas" highlighted in orange (active). Other items grayed out. Hover works. Navigate via sidebar works (only "3 camadas" is enabled). Below 768px viewport → sidebar hides.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(shell): add Sidebar and CreditCycle layout"
```

---

## Task 7: URL state helper (TDD)

**Files:**
- Create: `src/lib/url-state.ts`, `src/lib/url-state.test.ts`, `src/lib/types.ts`, `vitest.config.ts`, `src/test-setup.ts`

- [ ] **Step 1: Configure Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
  },
});
```

Create `src/test-setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

Also install the vite react plugin if not already present:
```bash
npm install -D @vitejs/plugin-react
```

- [ ] **Step 2: Define shared types**

`src/lib/types.ts`:
```ts
export type HistoricalCycle = "2013-14" | "2015-16" | "2020" | "2022-23";

export type RangePreset = "2Y" | "5Y" | "10Y" | "MAX" | "CUSTOM";

export interface ThreeLayersState {
  range: RangePreset;
  rangeFrom?: string;   // YYYY-MM, only when range === "CUSTOM"
  rangeTo?: string;     // YYYY-MM, only when range === "CUSTOM"
  overlayCycle?: HistoricalCycle;
  divergences: boolean;
}

export const DEFAULT_THREE_LAYERS_STATE: ThreeLayersState = {
  range: "5Y",
  divergences: true,
};
```

- [ ] **Step 3: Write failing tests**

`src/lib/url-state.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseThreeLayersState, serializeThreeLayersState } from "./url-state";
import { DEFAULT_THREE_LAYERS_STATE } from "./types";

describe("parseThreeLayersState", () => {
  it("returns defaults for empty params", () => {
    const result = parseThreeLayersState(new URLSearchParams(""));
    expect(result).toEqual(DEFAULT_THREE_LAYERS_STATE);
  });

  it("parses a known range preset", () => {
    const result = parseThreeLayersState(new URLSearchParams("range=10Y"));
    expect(result.range).toBe("10Y");
  });

  it("falls back to default when range is invalid", () => {
    const result = parseThreeLayersState(new URLSearchParams("range=bogus"));
    expect(result.range).toBe(DEFAULT_THREE_LAYERS_STATE.range);
  });

  it("parses custom range with from/to", () => {
    const result = parseThreeLayersState(
      new URLSearchParams("range=CUSTOM&from=2013-01&to=2015-12")
    );
    expect(result).toMatchObject({ range: "CUSTOM", rangeFrom: "2013-01", rangeTo: "2015-12" });
  });

  it("parses overlayCycle when valid", () => {
    const result = parseThreeLayersState(new URLSearchParams("overlay=2013-14"));
    expect(result.overlayCycle).toBe("2013-14");
  });

  it("ignores unknown overlay cycle", () => {
    const result = parseThreeLayersState(new URLSearchParams("overlay=1999"));
    expect(result.overlayCycle).toBeUndefined();
  });

  it("parses divergences flag (0 = off)", () => {
    const result = parseThreeLayersState(new URLSearchParams("div=0"));
    expect(result.divergences).toBe(false);
  });
});

describe("serializeThreeLayersState", () => {
  it("omits default values to keep URLs clean", () => {
    const params = serializeThreeLayersState(DEFAULT_THREE_LAYERS_STATE);
    expect(params.toString()).toBe("");
  });

  it("emits non-default range", () => {
    const params = serializeThreeLayersState({ ...DEFAULT_THREE_LAYERS_STATE, range: "10Y" });
    expect(params.get("range")).toBe("10Y");
  });

  it("emits custom range bounds", () => {
    const params = serializeThreeLayersState({
      ...DEFAULT_THREE_LAYERS_STATE,
      range: "CUSTOM",
      rangeFrom: "2013-01",
      rangeTo: "2015-12",
    });
    expect(params.get("range")).toBe("CUSTOM");
    expect(params.get("from")).toBe("2013-01");
    expect(params.get("to")).toBe("2015-12");
  });

  it("emits overlay and div=0 when set", () => {
    const params = serializeThreeLayersState({
      ...DEFAULT_THREE_LAYERS_STATE,
      overlayCycle: "2020",
      divergences: false,
    });
    expect(params.get("overlay")).toBe("2020");
    expect(params.get("div")).toBe("0");
  });

  it("round-trips", () => {
    const input: import("./types").ThreeLayersState = {
      range: "CUSTOM",
      rangeFrom: "2013-01",
      rangeTo: "2015-12",
      overlayCycle: "2013-14",
      divergences: false,
    };
    const roundTripped = parseThreeLayersState(serializeThreeLayersState(input));
    expect(roundTripped).toEqual(input);
  });
});
```

- [ ] **Step 4: Run tests to confirm failure**

```bash
npm run test:run -- src/lib/url-state.test.ts
```

Expected: fails with "cannot find module './url-state'" or similar.

- [ ] **Step 5: Implement `url-state.ts`**

```ts
import {
  DEFAULT_THREE_LAYERS_STATE,
  HistoricalCycle,
  RangePreset,
  ThreeLayersState,
} from "./types";

const RANGE_PRESETS: RangePreset[] = ["2Y", "5Y", "10Y", "MAX", "CUSTOM"];
const CYCLES: HistoricalCycle[] = ["2013-14", "2015-16", "2020", "2022-23"];
const MONTH_RE = /^\d{4}-\d{2}$/;

export function parseThreeLayersState(params: URLSearchParams): ThreeLayersState {
  const rangeRaw = params.get("range");
  const range: RangePreset = RANGE_PRESETS.includes(rangeRaw as RangePreset)
    ? (rangeRaw as RangePreset)
    : DEFAULT_THREE_LAYERS_STATE.range;

  const overlayRaw = params.get("overlay");
  const overlayCycle: HistoricalCycle | undefined = CYCLES.includes(overlayRaw as HistoricalCycle)
    ? (overlayRaw as HistoricalCycle)
    : undefined;

  const divRaw = params.get("div");
  const divergences = divRaw === "0" ? false : DEFAULT_THREE_LAYERS_STATE.divergences;

  const fromRaw = params.get("from");
  const toRaw = params.get("to");
  const rangeFrom = range === "CUSTOM" && fromRaw && MONTH_RE.test(fromRaw) ? fromRaw : undefined;
  const rangeTo = range === "CUSTOM" && toRaw && MONTH_RE.test(toRaw) ? toRaw : undefined;

  return { range, rangeFrom, rangeTo, overlayCycle, divergences };
}

export function serializeThreeLayersState(state: ThreeLayersState): URLSearchParams {
  const p = new URLSearchParams();
  if (state.range !== DEFAULT_THREE_LAYERS_STATE.range) p.set("range", state.range);
  if (state.range === "CUSTOM") {
    if (state.rangeFrom) p.set("from", state.rangeFrom);
    if (state.rangeTo) p.set("to", state.rangeTo);
  }
  if (state.overlayCycle) p.set("overlay", state.overlayCycle);
  if (state.divergences !== DEFAULT_THREE_LAYERS_STATE.divergences) {
    p.set("div", state.divergences ? "1" : "0");
  }
  return p;
}
```

- [ ] **Step 6: Run tests to confirm pass**

```bash
npm run test:run -- src/lib/url-state.test.ts
```

Expected: 10 passing tests.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(lib): add URL state serialize/parse with tests"
```

---

## Task 8: Mock data and data loader (TDD)

**Files:**
- Create: `public/data/manifest.json`, `public/data/divergences.json`, `public/data/series/compromet_renda_total.json`, `public/data/series/inadim_pf_total.json`, `public/data/series/selic_meta.json`, `src/lib/data.ts`, `src/lib/data.test.ts`

- [ ] **Step 1: Write mock series JSONs**

Each series file is `[{"d":"YYYY-MM","v":number}, ...]`. Generate monthly data from 2005-01 through 2026-02 (254 points) with realistic-ish values.

`public/data/series/compromet_renda_total.json` — comprometimento de renda, Lagging. Use a sinusoidal + trend pattern centered around 24%. Example first few entries:
```json
[
  {"d":"2005-01","v":22.1},
  {"d":"2005-02","v":22.3},
  {"d":"2005-03","v":22.4}
]
```

To avoid hand-typing 254 rows, create a one-off Node script `pipeline/gen_mock.mjs`:

```js
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

function* months(fromY, fromM, toY, toM) {
  let y = fromY, m = fromM;
  while (y < toY || (y === toY && m <= toM)) {
    yield `${y}-${String(m).padStart(2, "0")}`;
    m++;
    if (m > 12) { m = 1; y++; }
  }
}

function gen(file, baseline, amp, periodMonths, noise, trendPerYear) {
  const rows = [];
  let i = 0;
  for (const d of months(2005, 1, 2026, 2)) {
    const t = i / periodMonths * 2 * Math.PI;
    const years = i / 12;
    const v = baseline + amp * Math.sin(t) + trendPerYear * years + (Math.sin(i * 13.37) * noise);
    rows.push({ d, v: Number(v.toFixed(2)) });
    i++;
  }
  const path = `public/data/series/${file}`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(rows));
}

// Lagging — comprometimento de renda total (%)
gen("compromet_renda_total.json", 24, 2.5, 96, 0.3, 0.05);
// Lagging — inadim PF total (%)
gen("inadim_pf_total.json", 5, 1.2, 72, 0.15, 0.02);
// Coincident-ish — SELIC meta (% a.a.)
gen("selic_meta.json", 10, 4, 60, 0.0, -0.1);

console.log("mock series written");
```

Run it:
```bash
node pipeline/gen_mock.mjs
```

Expected: "mock series written" and 3 files in `public/data/series/`.

- [ ] **Step 2: Write `public/data/manifest.json`**

```json
{
  "version": 1,
  "generatedAt": "2026-04-23T00:00:00Z",
  "series": [
    {
      "id": "compromet_renda_total",
      "name": "Comprometimento de renda — total",
      "layer": "lagging",
      "unit": "% da renda",
      "sgs": 29263,
      "file": "compromet_renda_total.json"
    },
    {
      "id": "inadim_pf_total",
      "name": "Inadimplência PF — total",
      "layer": "lagging",
      "unit": "%",
      "sgs": 21082,
      "file": "inadim_pf_total.json"
    },
    {
      "id": "selic_meta",
      "name": "SELIC meta",
      "layer": "coincident",
      "unit": "% a.a.",
      "sgs": 432,
      "file": "selic_meta.json"
    }
  ]
}
```

- [ ] **Step 3: Write `public/data/divergences.json`**

```json
{
  "version": 1,
  "periods": [
    { "id": "d-2012", "from": "2012-06", "to": "2013-12", "kind": "PTC+compromet_alto", "label": "PTC positiva com comprometimento elevado" },
    { "id": "d-2015", "from": "2015-03", "to": "2016-09", "kind": "IOF_down+PTC-", "label": "IOF caindo + PTC negativa" },
    { "id": "d-2022", "from": "2022-03", "to": "2023-06", "kind": "PTC-+compromet_falling", "label": "PTC negativa com comprometimento caindo" }
  ]
}
```

- [ ] **Step 4: Add types to `src/lib/types.ts`**

Append:
```ts
export type Layer = "leading" | "coincident" | "lagging";

export interface SeriesMeta {
  id: string;
  name: string;
  layer: Layer;
  unit: string;
  sgs: number;
  file: string;
}

export interface Manifest {
  version: number;
  generatedAt: string;
  series: SeriesMeta[];
}

export interface SeriesPoint { d: string; v: number; }

export interface DivergencePeriod {
  id: string;
  from: string;
  to: string;
  kind: string;
  label: string;
}

export interface DivergenceFile {
  version: number;
  periods: DivergencePeriod[];
}
```

- [ ] **Step 5: Write failing `data.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadManifest, loadSeries, loadDivergences, _resetCache } from "./data";

const manifestFixture = {
  version: 1,
  generatedAt: "2026-04-23T00:00:00Z",
  series: [{ id: "a", name: "A", layer: "lagging", unit: "%", sgs: 1, file: "a.json" }],
};

beforeEach(() => {
  _resetCache();
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/data/manifest.json")) return new Response(JSON.stringify(manifestFixture));
    if (url.endsWith("/data/series/a.json")) return new Response(JSON.stringify([{ d: "2020-01", v: 1 }]));
    if (url.endsWith("/data/divergences.json")) return new Response(JSON.stringify({ version: 1, periods: [] }));
    throw new Error("unexpected url " + url);
  }) as never;
});

describe("data loaders", () => {
  it("loads the manifest", async () => {
    const m = await loadManifest();
    expect(m.series).toHaveLength(1);
  });

  it("caches manifest across calls", async () => {
    await loadManifest();
    await loadManifest();
    expect((global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it("loads a series by id", async () => {
    const points = await loadSeries("a");
    expect(points).toEqual([{ d: "2020-01", v: 1 }]);
  });

  it("throws if series id is unknown", async () => {
    await expect(loadSeries("zzz")).rejects.toThrow(/unknown series/i);
  });

  it("loads divergences", async () => {
    const d = await loadDivergences();
    expect(d.periods).toEqual([]);
  });
});
```

Run:
```bash
npm run test:run -- src/lib/data.test.ts
```

Expected: fails ("cannot find module './data'").

- [ ] **Step 6: Implement `src/lib/data.ts`**

```ts
import { Manifest, SeriesPoint, DivergenceFile } from "./types";

const BASE = "/data";

let manifestPromise: Promise<Manifest> | null = null;
let divergencesPromise: Promise<DivergenceFile> | null = null;
const seriesCache = new Map<string, Promise<SeriesPoint[]>>();

export function _resetCache() {
  manifestPromise = null;
  divergencesPromise = null;
  seriesCache.clear();
}

export function loadManifest(): Promise<Manifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(`${BASE}/manifest.json`).then((r) => r.json());
  }
  return manifestPromise;
}

export function loadDivergences(): Promise<DivergenceFile> {
  if (!divergencesPromise) {
    divergencesPromise = fetch(`${BASE}/divergences.json`).then((r) => r.json());
  }
  return divergencesPromise;
}

export async function loadSeries(id: string): Promise<SeriesPoint[]> {
  const existing = seriesCache.get(id);
  if (existing) return existing;

  const p = (async () => {
    const manifest = await loadManifest();
    const meta = manifest.series.find((s) => s.id === id);
    if (!meta) throw new Error(`unknown series: ${id}`);
    const resp = await fetch(`${BASE}/series/${meta.file}`);
    return (await resp.json()) as SeriesPoint[];
  })();

  seriesCache.set(id, p);
  return p;
}
```

- [ ] **Step 7: Run tests to confirm pass**

```bash
npm run test:run -- src/lib/data.test.ts
```

Expected: 5 passing tests.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(data): add mock JSON fixtures and loader with cache"
```

---

## Task 9: Divergence shapes helper (TDD)

**Files:**
- Create: `src/components/charts/buildDivergenceShapes.ts`, `src/components/charts/buildDivergenceShapes.test.ts`

- [ ] **Step 1: Write failing tests**

`src/components/charts/buildDivergenceShapes.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildDivergenceShapes } from "./buildDivergenceShapes";
import type { DivergencePeriod } from "../../lib/types";

const periods: DivergencePeriod[] = [
  { id: "d1", from: "2013-01", to: "2014-06", kind: "k", label: "L1" },
  { id: "d2", from: "2020-03", to: "2020-09", kind: "k", label: "L2" },
];

describe("buildDivergenceShapes", () => {
  it("returns empty array when disabled", () => {
    expect(buildDivergenceShapes(periods, false)).toEqual([]);
  });

  it("produces one rectangle per period with x-range spanning the full plot", () => {
    const shapes = buildDivergenceShapes(periods, true);
    expect(shapes).toHaveLength(2);
    expect(shapes[0]).toMatchObject({
      type: "rect",
      xref: "x",
      yref: "paper",
      y0: 0,
      y1: 1,
      x0: "2013-01-01",
      x1: "2014-06-30",
    });
    expect(shapes[0].fillcolor).toBe("rgba(216, 78, 29, 0.14)");
    expect(shapes[0].line?.width).toBe(0);
  });
});
```

Run:
```bash
npm run test:run -- src/components/charts/buildDivergenceShapes.test.ts
```
Expected: fails.

- [ ] **Step 2: Implement**

`src/components/charts/buildDivergenceShapes.ts`:
```ts
import type { DivergencePeriod } from "../../lib/types";

export interface DivergenceShape {
  type: "rect";
  xref: "x";
  yref: "paper";
  x0: string;
  x1: string;
  y0: 0;
  y1: 1;
  fillcolor: string;
  line: { width: 0 };
  layer: "below";
}

function endOfMonthISO(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${ym}-${String(last).padStart(2, "0")}`;
}

export function buildDivergenceShapes(
  periods: DivergencePeriod[],
  enabled: boolean
): DivergenceShape[] {
  if (!enabled) return [];
  return periods.map((p) => ({
    type: "rect",
    xref: "x",
    yref: "paper",
    x0: `${p.from}-01`,
    x1: endOfMonthISO(p.to),
    y0: 0,
    y1: 1,
    fillcolor: "rgba(216, 78, 29, 0.14)",
    line: { width: 0 },
    layer: "below",
  }));
}
```

- [ ] **Step 3: Run tests to confirm pass**

```bash
npm run test:run -- src/components/charts/buildDivergenceShapes.test.ts
```
Expected: 2 passing.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(charts): add divergence rectangle shape builder"
```

---

## Task 10: ChartShape wrapper with dynamic Plotly

**Files:**
- Create: `src/components/charts/ChartShape.tsx`, `src/components/charts/ChartShape.module.css`

- [ ] **Step 1: Write `ChartShape.module.css`**

```css
.wrap {
  width: 100%;
  min-height: 380px;
  position: relative;
}
.loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-faint);
  font-size: 0.875rem;
}
```

- [ ] **Step 2: Write `ChartShape.tsx`**

```tsx
import { Suspense, lazy, useMemo } from "react";
import type { Layout, Data } from "plotly.js";
import styles from "./ChartShape.module.css";

const Plot = lazy(() => import("react-plotly.js"));

export interface ChartShapeProps {
  traces: Data[];
  shapes?: Partial<Layout>["shapes"];
  yAxisTitle?: string;
  height?: number;
}

const BASE_LAYOUT: Partial<Layout> = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { family: "Inter, system-ui, sans-serif", color: "#17120d", size: 12 },
  margin: { l: 56, r: 24, t: 16, b: 40 },
  xaxis: {
    gridcolor: "rgba(23, 18, 13, 0.08)",
    linecolor: "rgba(23, 18, 13, 0.30)",
    tickcolor: "rgba(23, 18, 13, 0.30)",
  },
  yaxis: {
    gridcolor: "rgba(23, 18, 13, 0.08)",
    linecolor: "rgba(23, 18, 13, 0.30)",
    tickcolor: "rgba(23, 18, 13, 0.30)",
  },
  showlegend: true,
  legend: { orientation: "h", y: -0.2 },
  hovermode: "x unified",
};

export function ChartShape({ traces, shapes, yAxisTitle, height = 420 }: ChartShapeProps) {
  const layout = useMemo<Partial<Layout>>(() => ({
    ...BASE_LAYOUT,
    shapes: shapes as Layout["shapes"],
    yaxis: { ...BASE_LAYOUT.yaxis, title: { text: yAxisTitle ?? "" } },
    height,
  }), [shapes, yAxisTitle, height]);

  return (
    <div className={styles.wrap} style={{ minHeight: height }}>
      <Suspense fallback={<div className={styles.loading}>Carregando gráfico…</div>}>
        <Plot
          data={traces}
          layout={layout}
          config={{ displaylogo: false, responsive: true, modeBarButtonsToRemove: ["lasso2d", "select2d"] }}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
        />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(charts): add ChartShape wrapper with dynamic Plotly import"
```

(No direct test — verified via ThreeLayers smoke test next task.)

---

## Task 11: ThreeLayers view (real implementation)

**Files:**
- Create: `src/components/ui/Chip.tsx`, `src/components/ui/Chip.module.css`, `src/components/ui/KPI.tsx`, `src/components/ui/KPI.module.css`, `src/routes/CreditCycle/curated/ThreeLayers.module.css`
- Modify: `src/routes/CreditCycle/curated/ThreeLayers.tsx`

- [ ] **Step 1: Write `Chip.module.css`**

```css
.row { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  padding: 5px 12px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  transition: all 0.12s var(--ease);
}
.chip:hover { border-color: var(--color-border-strong); color: var(--color-text); }
.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
.active:hover { color: #fff; }
```

- [ ] **Step 2: Write `Chip.tsx`**

```tsx
import styles from "./Chip.module.css";

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.active : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
```

- [ ] **Step 3: Write `KPI.module.css`**

```css
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.layer {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}
.value {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 1.5rem;
  color: var(--color-text);
}
.delta { font-size: 0.8125rem; color: var(--color-text-muted); }
.deltaUp { color: #a43c12; }
.deltaDown { color: #3d6b3b; }
```

- [ ] **Step 4: Write `KPI.tsx`**

```tsx
import styles from "./KPI.module.css";

export interface KPIProps {
  layer: "Leading" | "Coincident" | "Lagging";
  label: string;
  value: number | null;
  unit: string;
  deltaPct6m?: number | null;
}

function formatDelta(d: number): string {
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(2)}pp vs 6m`;
}

export function KPI({ layer, label, value, unit, deltaPct6m }: KPIProps) {
  const deltaClass = deltaPct6m == null ? "" : deltaPct6m > 0 ? styles.deltaUp : styles.deltaDown;
  return (
    <div className={styles.card}>
      <span className={styles.layer}>{layer}</span>
      <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{label}</span>
      <span className={styles.value}>
        {value == null ? "—" : `${value.toFixed(2)} ${unit}`}
      </span>
      {deltaPct6m != null && (
        <span className={`${styles.delta} ${deltaClass}`}>{formatDelta(deltaPct6m)}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Write `ThreeLayers.module.css`**

```css
.page { display: flex; flex-direction: column; gap: 24px; }

.header { display: flex; flex-direction: column; gap: 10px; }
.title { font-family: var(--font-serif); font-size: var(--step-3); }
.subtitle { color: var(--color-text-muted); max-width: 60ch; }

.controls {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 14px 0;
}
.controlGroup { display: flex; gap: 10px; align-items: center; }
.controlLabel {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .kpis { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: Write `ThreeLayers.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Data } from "plotly.js";
import { ChartShape } from "../../../components/charts/ChartShape";
import { buildDivergenceShapes } from "../../../components/charts/buildDivergenceShapes";
import { Chip, ChipRow } from "../../../components/ui/Chip";
import { KPI } from "../../../components/ui/KPI";
import { loadSeries, loadDivergences, loadManifest } from "../../../lib/data";
import { parseThreeLayersState, serializeThreeLayersState } from "../../../lib/url-state";
import type {
  HistoricalCycle,
  Manifest,
  RangePreset,
  SeriesPoint,
  DivergencePeriod,
} from "../../../lib/types";
import styles from "./ThreeLayers.module.css";

const CYCLES: HistoricalCycle[] = ["2013-14", "2015-16", "2020", "2022-23"];
const RANGES: RangePreset[] = ["2Y", "5Y", "10Y", "MAX"];

function rangeStartDate(range: RangePreset, from?: string): string | undefined {
  const now = new Date();
  if (range === "CUSTOM") return from ? `${from}-01` : undefined;
  if (range === "MAX") return undefined;
  const years = range === "2Y" ? 2 : range === "5Y" ? 5 : 10;
  const d = new Date(Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth(), 1));
  return d.toISOString().slice(0, 10);
}

function last<T>(arr: T[]): T | undefined { return arr[arr.length - 1]; }

function valueNMonthsAgo(points: SeriesPoint[], n: number): number | null {
  const idx = points.length - 1 - n;
  return idx >= 0 ? points[idx].v : null;
}

export default function ThreeLayers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseThreeLayersState(searchParams), [searchParams]);

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [leading, setLeading] = useState<SeriesPoint[]>([]);
  const [coincident, setCoincident] = useState<SeriesPoint[]>([]);
  const [lagging, setLagging] = useState<SeriesPoint[]>([]);
  const [divergences, setDivergences] = useState<DivergencePeriod[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, div, a, b, c] = await Promise.all([
          loadManifest(),
          loadDivergences(),
          loadSeries("compromet_renda_total"),
          loadSeries("inadim_pf_total"),
          loadSeries("selic_meta"),
        ]);
        if (cancelled) return;
        setManifest(m);
        setDivergences(div.periods);
        setLagging(a);
        // MVP mock: treat inadim_pf as leading proxy, selic_meta as coincident
        setLeading(b);
        setCoincident(c);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = (patch: Partial<typeof state>) => {
    const next = { ...state, ...patch };
    setSearchParams(serializeThreeLayersState(next), { replace: false });
  };

  const xRangeStart = rangeStartDate(state.range, state.rangeFrom);
  const xRangeEnd = state.range === "CUSTOM" && state.rangeTo ? `${state.rangeTo}-28` : undefined;

  const traces = useMemo<Data[]>(() => {
    const mk = (id: string, pts: SeriesPoint[], color: string, yaxis?: string): Data => ({
      type: "scatter",
      mode: "lines",
      name: manifest?.series.find((s) => s.id === id)?.name ?? id,
      x: pts.map((p) => `${p.d}-15`),
      y: pts.map((p) => p.v),
      line: { color, width: 1.8 },
      yaxis,
    });
    const out: Data[] = [];
    if (leading.length) out.push(mk("inadim_pf_total", leading, "#b8651e"));
    if (coincident.length) out.push(mk("selic_meta", coincident, "#6b5a3d", "y2"));
    if (lagging.length) out.push(mk("compromet_renda_total", lagging, "#17120d"));
    return out;
  }, [leading, coincident, lagging, manifest]);

  const shapes = useMemo(
    () => buildDivergenceShapes(divergences, state.divergences),
    [divergences, state.divergences]
  );

  const kLagging = last(lagging);
  const kLeading = last(leading);
  const kCoincident = last(coincident);

  if (error) return <div style={{ color: "var(--color-text-muted)" }}>Erro ao carregar: {error}</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>3 camadas do ciclo</h1>
        <p className={styles.subtitle}>
          Indicadores leading, coincident e lagging sobrepostos. Faixas verticais marcam períodos de divergência entre camadas.
        </p>
      </header>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Ciclo</span>
          <ChipRow>
            {CYCLES.map((c) => (
              <Chip
                key={c}
                label={c}
                active={state.overlayCycle === c}
                onClick={() => update({ overlayCycle: state.overlayCycle === c ? undefined : c })}
              />
            ))}
          </ChipRow>
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Janela</span>
          <ChipRow>
            {RANGES.map((r) => (
              <Chip
                key={r}
                label={r}
                active={state.range === r}
                onClick={() => update({ range: r, rangeFrom: undefined, rangeTo: undefined })}
              />
            ))}
          </ChipRow>
        </div>
      </div>

      <ChartShape
        traces={traces}
        shapes={shapes}
        yAxisTitle="%"
      />

      <div className={styles.kpis}>
        <KPI
          layer="Leading"
          label="Inadimplência PF"
          value={kLeading?.v ?? null}
          unit="%"
          deltaPct6m={
            kLeading && leading.length > 6
              ? kLeading.v - (valueNMonthsAgo(leading, 6) ?? kLeading.v)
              : null
          }
        />
        <KPI
          layer="Coincident"
          label="SELIC meta"
          value={kCoincident?.v ?? null}
          unit="% a.a."
          deltaPct6m={
            kCoincident && coincident.length > 6
              ? kCoincident.v - (valueNMonthsAgo(coincident, 6) ?? kCoincident.v)
              : null
          }
        />
        <KPI
          layer="Lagging"
          label="Comprometimento de renda"
          value={kLagging?.v ?? null}
          unit="%"
          deltaPct6m={
            kLagging && lagging.length > 6
              ? kLagging.v - (valueNMonthsAgo(lagging, 6) ?? kLagging.v)
              : null
          }
        />
      </div>

      <div className={styles.footer}>
        <span>
          {xRangeStart && `Janela: ${xRangeStart.slice(0, 7)} → ${xRangeEnd ? xRangeEnd.slice(0, 7) : "hoje"}`}
        </span>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={state.divergences}
            onChange={(e) => update({ divergences: e.target.checked })}
          />
          Divergências
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify manually**

```bash
npm run dev
```

Visit http://localhost:5173/credit-cycle/3-camadas:
- Title and subtitle render.
- Two chip rows: Ciclo (4 chips) and Janela (4 chips); `5Y` chip is active by default.
- Plotly chart renders with three lines (Inadim PF, SELIC meta, Comprometimento) and 3 orange vertical bands (divergences).
- Three KPI cards below with current values and deltas.
- Click `10Y` → URL updates to `?range=10Y`, chip highlights move; reload preserves.
- Click `2013-14` cycle chip → URL adds `overlay=2013-14` (chart overlay is MVP-minimal; cycle overlay logic is Plan 3 but URL state already flows).
- Toggle "Divergências" checkbox → orange bands disappear and URL gains `div=0`. Toggle back → URL loses `div`.
- Copy URL `http://localhost:5173/credit-cycle/3-camadas?range=10Y&overlay=2020&div=0`, paste in new tab → same state restored.

- [ ] **Step 8: Run all tests**

```bash
npm run test:run
```
Expected: all previously-written tests still pass.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat(credit-cycle): ThreeLayers view with chart, divergences, KPIs and URL state"
```

---

## Task 12: Production build smoke test

**Files:**
- Create: `vercel.json`, `README.md`

- [ ] **Step 1: Write `vercel.json` for SPA rewrites**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Write minimal `README.md`**

```markdown
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
```

- [ ] **Step 3: Run production build**

```bash
npm run build
```
Expected: build succeeds, `dist/` directory appears with `index.html` and hashed assets. No TS errors.

- [ ] **Step 4: Preview the build locally**

```bash
npm run preview
```
Open the printed URL. Exercise Home, navigate to `/credit-cycle/3-camadas`, verify chart renders. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: add Vercel config and README"
```

---

## Task 13: GitHub repo and push

**Files:** none

- [ ] **Step 1: Create GitHub repo**

Option A (with `gh`):
```bash
gh repo create ibba-financial-portal --public --source=. --remote=origin --description "IBBA Financial Portal — super app on the Brazilian financial sector"
```

Option B (via browser):
1. Go to https://github.com/new
2. Name: `ibba-financial-portal`, Public, no README/license/gitignore (we already have them).
3. Create. Copy the remote URL.
4. Back in terminal:
```bash
git remote add origin https://github.com/<your-user>/ibba-financial-portal.git
```

- [ ] **Step 2: Push**

```bash
git branch -M main
git push -u origin main
```

Expected: all commits uploaded. Repo visible on GitHub.

---

## Task 14: Vercel deploy

**Files:** none

- [ ] **Step 1: Import the repo into Vercel**

1. Log in to https://vercel.com (GitHub SSO).
2. Add New → Project → pick `ibba-financial-portal`.
3. Framework Preset: Vite (auto-detected).
4. Root Directory: leave as `./`.
5. Build Command: `npm run build` (default).
6. Output Directory: `dist` (default).
7. Deploy.

- [ ] **Step 2: Verify the deployed URL**

Once build finishes, open the `*.vercel.app` URL Vercel shows.
- Home renders with masthead + product card + 3 tiles.
- Click "Abrir produto →" → `/credit-cycle/3-camadas` loads with sidebar + chart + KPIs.
- Reload `/credit-cycle/3-camadas?range=10Y&div=0` directly → state restored. (SPA rewrite works.)
- Test on a mobile viewport (Chrome devtools) → sidebar hidden, home grid collapses.

- [ ] **Step 3: Record the public URL in the project notes**

Paste the URL into Contexto.md under a new Sessao entry and into Planos Futuros.md in place of the "Criar conta Vercel" / "Executar Plano 1" items.

---

## Done — MVP acceptance for Plan 1

Plan 1 is complete when:
- [x] Public Vercel URL renders Home and `/credit-cycle/3-camadas`.
- [x] ThreeLayers view: chart, 3 KPIs, cycle chips, range chips, divergence toggle.
- [x] URL state round-trips (copy URL → new tab = same view).
- [x] All tests pass (`npm run test:run`).
- [x] Production build clean (no TS errors, no runtime console errors on the deployed page).

Plan 2 picks up the real BCB pipeline and replaces the three mock JSONs.
