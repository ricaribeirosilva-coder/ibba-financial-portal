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
