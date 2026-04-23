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
