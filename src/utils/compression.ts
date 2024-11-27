import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { Scenario } from "../types/scenario";

export const compressScenario = (scenario: Scenario): string => {
  const jsonString = JSON.stringify(scenario);
  return compressToEncodedURIComponent(jsonString);
};

export const decompressScenario = (compressed: string): Scenario | null => {
  try {
    const jsonString = decompressFromEncodedURIComponent(compressed);
    if (!jsonString) return null;
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to decompress scenario:", e);
    return null;
  }
};

export const createShareableLink = (scenario: Scenario): string => {
  const compressed = compressScenario(scenario);
  const basePath = window.location.pathname.replace(/\/$/, "");
  return `${window.location.origin}${basePath}?scenario=${compressed}`;
};
