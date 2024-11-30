import { Scenario } from "../../types/scenario";
import { threeStars } from "./threeStars";
import { orbitalDance } from "./orbitalDance";
import { galaxyCollision } from "./galaxyCollision";
import { flowerDance } from "./flowerDance";
import { orbit } from "./orbit";
import { react } from "./react";
import { pulsar } from "./pulsar";

export const defaultScenarios: Scenario[] = [
  react,
  orbit,
  threeStars,
  orbitalDance,
  galaxyCollision,
  flowerDance,
  pulsar,
];
