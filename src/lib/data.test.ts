import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadManifest, loadSeries, loadDivergences, _resetCache } from "./data";

const manifestFixture = {
  version: 1,
  generatedAt: "2026-04-23T00:00:00Z",
  series: [{ id: "a", name: "A", layer: "lagging", unit: "%", sgs: 1, file: "a.json" }],
};

beforeEach(() => {
  _resetCache();
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
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
    expect((globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
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
