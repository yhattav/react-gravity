import { describe, it, expect } from "@jest/globals";
import {
  modulateScenario,
  demodulateScenario,
  compressScenario,
  decompressScenario,
} from "./compression";
import { Scenario } from "../types/scenario";

describe("Scenario Compression", () => {
  const testScenario: Scenario = {
    id: "test-123",
    name: "Test Scenario",
    description: "A test scenario made for testing",
    data: {
      settings: {
        NEW_PARTICLE_MASS: 0.1,
        NEW_PARTICLE_ELASTICITY: 0.8,
        FRICTION: 0.999,
        DELTA_TIME: 0.016666,
        POINTER_MASS: 250000,
        SHOW_VELOCITY_ARROWS: true,
        SHOW_FORCE_ARROWS: false,
        CONSTANT_FORCE_X: 0,
        CONSTANT_FORCE_Y: 0,
        SOLID_BOUNDARIES: true,
        PARTICLES_EXERT_GRAVITY: false,
      },
      gravityPoints: [
        {
          x: 100,
          y: 200,
          label: "Point 1",
          mass: 50000,
          color: "#FF0000",
        },
      ],
      particles: [
        {
          id: "p1",
          position: { x: 300, y: 400 },
          velocity: { x: 1, y: -1 },
          mass: 0.1,
          elasticity: 0.8,
          color: "#00FF00",
          size: 10,
          showVectors: true,
        },
        {
          id: "p2",
          position: { x: 123, y: 400 },
          velocity: { x: 1, y: -20 },
          mass: 0.1,
          elasticity: 0.8,
          color: "#00FF00",
          size: 20,
          showVectors: false,
        },
      ],
    },
  };

  it("should correctly modulate and demodulate a scenario", () => {
    const modulated = modulateScenario(testScenario);
    const demodulated = demodulateScenario(modulated);
    expect(demodulated).toEqual(testScenario);
  });

  it("should correctly compress and decompress a scenario", () => {
    const compressed = compressScenario(testScenario);
    const decompressed = decompressScenario(compressed);
    expect(decompressed).toEqual(testScenario);
  });

  it("should handle empty arrays", () => {
    const emptyScenario = {
      ...testScenario,
      data: {
        ...testScenario.data,
        gravityPoints: [],
        particles: [],
      },
    };
    const modulated = modulateScenario(emptyScenario);
    const demodulated = demodulateScenario(modulated);
    expect(demodulated).toEqual(emptyScenario);
  });

  it("should handle special characters in strings", () => {
    const specialCharsScenario = {
      ...testScenario,
      name: "Test,;|Scenario",
      description: "Description with;|special,chars",
    };
    const modulated = modulateScenario(specialCharsScenario);
    const demodulated = demodulateScenario(modulated);
    expect(demodulated).toEqual(specialCharsScenario);
  });

  it("should follow the complete modulation and compression pipeline", () => {
    // Step 1: Modulation
    const modulated = modulateScenario(testScenario);
    expect(typeof modulated).toBe("string");

    // Step 2: Compression
    const compressed = compressScenario(testScenario);
    // expect(compressed).toEqual(
    //   "C4UwzsC0CMBMDMBuRAVcwAEBlAxiAdgIYBOAlgPbICCGoEGYeRZliADAHTQA0nAHLw4BOEYLbQAbFIndYAVjaK23HsrUreyaItk6ACuVL5MPBUu4BiAGJWlbZAAce8HQBYdPGINUcBFxTYeHkA"
    // );
    // Step 3: Decompression
    const decompressed = decompressScenario(compressed);
    expect(decompressed).not.toBeNull();
    expect(decompressed).toEqual(testScenario);

    // Step 4: Direct modulation/demodulation
    const demodulated = demodulateScenario(modulated);
    expect(demodulated).not.toBeNull();
    expect(demodulated).toEqual(testScenario);

    // Step 5: Verify the compression actually reduces size
    expect(compressed.length).toBeLessThan(JSON.stringify(testScenario).length);
  });
});
