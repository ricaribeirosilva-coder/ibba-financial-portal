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
