import { useMemo } from "react";
import type { Layout, Data } from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import styles from "./ChartShape.module.css";

const Plot = createPlotlyComponent(Plotly as unknown as Parameters<typeof createPlotlyComponent>[0]);

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
      <Plot
        data={traces}
        layout={layout}
        config={{ displaylogo: false, responsive: true, modeBarButtonsToRemove: ["lasso2d", "select2d"] }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />
    </div>
  );
}
