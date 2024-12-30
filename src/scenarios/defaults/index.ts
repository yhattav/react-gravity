import { Scenario } from "../../types/scenario";
import { flowerDance } from "./flowerDance";
import { orbit } from "./orbit";
import { react } from "./react";
import { pulsar } from "./pulsar";
import { negativeMass } from "./negativeMass";
import { pathTest } from "./pathTest";

export const defaultScenarios: Scenario[] = [
  pathTest,
  react,
  orbit,
  negativeMass,
  // threeStars,
  // orbitalDance,
  // galaxyCollision,
  flowerDance,
  pulsar,
];
