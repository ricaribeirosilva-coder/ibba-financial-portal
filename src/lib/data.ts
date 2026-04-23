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
