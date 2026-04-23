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
