import { describe, it, expect } from "vitest";
import { parseThreeLayersState, serializeThreeLayersState } from "./url-state";
import { DEFAULT_THREE_LAYERS_STATE } from "./types";

describe("parseThreeLayersState", () => {
  it("returns defaults for empty params", () => {
    const result = parseThreeLayersState(new URLSearchParams(""));
    expect(result).toEqual(DEFAULT_THREE_LAYERS_STATE);
  });

  it("parses a known range preset", () => {
    const result = parseThreeLayersState(new URLSearchParams("range=10Y"));
    expect(result.range).toBe("10Y");
  });

  it("falls back to default when range is invalid", () => {
    const result = parseThreeLayersState(new URLSearchParams("range=bogus"));
    expect(result.range).toBe(DEFAULT_THREE_LAYERS_STATE.range);
  });

  it("parses custom range with from/to", () => {
    const result = parseThreeLayersState(
      new URLSearchParams("range=CUSTOM&from=2013-01&to=2015-12")
    );
    expect(result).toMatchObject({ range: "CUSTOM", rangeFrom: "2013-01", rangeTo: "2015-12" });
  });

  it("parses overlayCycle when valid", () => {
    const result = parseThreeLayersState(new URLSearchParams("overlay=2013-14"));
    expect(result.overlayCycle).toBe("2013-14");
  });

  it("ignores unknown overlay cycle", () => {
    const result = parseThreeLayersState(new URLSearchParams("overlay=1999"));
    expect(result.overlayCycle).toBeUndefined();
  });

  it("parses divergences flag (0 = off)", () => {
    const result = parseThreeLayersState(new URLSearchParams("div=0"));
    expect(result.divergences).toBe(false);
  });
});

describe("serializeThreeLayersState", () => {
  it("omits default values to keep URLs clean", () => {
    const params = serializeThreeLayersState(DEFAULT_THREE_LAYERS_STATE);
    expect(params.toString()).toBe("");
  });

  it("emits non-default range", () => {
    const params = serializeThreeLayersState({ ...DEFAULT_THREE_LAYERS_STATE, range: "10Y" });
    expect(params.get("range")).toBe("10Y");
  });

  it("emits custom range bounds", () => {
    const params = serializeThreeLayersState({
      ...DEFAULT_THREE_LAYERS_STATE,
      range: "CUSTOM",
      rangeFrom: "2013-01",
      rangeTo: "2015-12",
    });
    expect(params.get("range")).toBe("CUSTOM");
    expect(params.get("from")).toBe("2013-01");
    expect(params.get("to")).toBe("2015-12");
  });

  it("emits overlay and div=0 when set", () => {
    const params = serializeThreeLayersState({
      ...DEFAULT_THREE_LAYERS_STATE,
      overlayCycle: "2020",
      divergences: false,
    });
    expect(params.get("overlay")).toBe("2020");
    expect(params.get("div")).toBe("0");
  });

  it("round-trips", () => {
    const input: import("./types").ThreeLayersState = {
      range: "CUSTOM",
      rangeFrom: "2013-01",
      rangeTo: "2015-12",
      overlayCycle: "2013-14",
      divergences: false,
    };
    const roundTripped = parseThreeLayersState(serializeThreeLayersState(input));
    expect(roundTripped).toEqual(input);
  });
});
