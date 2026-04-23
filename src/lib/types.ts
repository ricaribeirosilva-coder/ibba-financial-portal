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
