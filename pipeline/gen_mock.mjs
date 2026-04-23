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
