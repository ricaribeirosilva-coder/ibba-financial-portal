import { Component, type ErrorInfo, type ReactNode, Suspense, lazy, useMemo } from "react";
import type { Layout, Data } from "plotly.js";
import styles from "./ChartShape.module.css";

// Lazy-load plotly and react-plotly.js/factory only when a chart actually renders.
// This keeps the Home / non-chart routes from pulling the ~4.5MB plotly bundle.
const Plot = lazy(async () => {
  const [factoryMod, plotlyMod] = await Promise.all([
    import("react-plotly.js/factory"),
    import("plotly.js-dist-min"),
  ]);
  // Defensive unwrap — Vite's CJS/ESM interop sometimes double-wraps `default`.
  const unwrap = (m: unknown): unknown => {
    const rec = m as Record<string, unknown>;
    const d1 = rec?.default as Record<string, unknown> | undefined;
    if (typeof rec === "function") return rec;
    if (typeof d1 === "function") return d1;
    if (d1 && typeof (d1 as Record<string, unknown>).default === "function") {
      return (d1 as Record<string, unknown>).default;
    }
    return d1 ?? m;
  };
  const factory = unwrap(factoryMod) as (p: unknown) => React.ComponentType<Record<string, unknown>>;
  const Plotly = unwrap(plotlyMod);
  if (typeof factory !== "function") {
    throw new Error("react-plotly.js/factory did not resolve to a function");
  }
  return { default: factory(Plotly) };
});

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

class ChartErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ChartErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Não foi possível renderizar o gráfico: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

export function ChartShape({ traces, shapes, yAxisTitle, height = 420 }: ChartShapeProps) {
  const layout = useMemo<Partial<Layout>>(() => ({
    ...BASE_LAYOUT,
    shapes: shapes as Layout["shapes"],
    yaxis: { ...BASE_LAYOUT.yaxis, title: { text: yAxisTitle ?? "" } },
    height,
  }), [shapes, yAxisTitle, height]);

  return (
    <div className={styles.wrap} style={{ minHeight: height }}>
      <ChartErrorBoundary>
        <Suspense fallback={<div className={styles.loading}>Carregando gráfico…</div>}>
          <Plot
            data={traces}
            layout={layout}
            config={{ displaylogo: false, responsive: true, modeBarButtonsToRemove: ["lasso2d", "select2d"] }}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />
        </Suspense>
      </ChartErrorBoundary>
    </div>
  );
}
