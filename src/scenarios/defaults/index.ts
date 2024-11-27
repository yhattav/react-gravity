import { Scenario } from "../../types/scenario";
import { threeStars } from "./threeStars";
import { orbitalDance } from "./orbitalDance";
import { galaxyCollision } from "./galaxyCollision";
import { flowerDance } from "./flowerDance";
import { orbit } from "./orbit";

export const defaultScenarios: Scenario[] = [
  orbit,
  threeStars,
  orbitalDance,
  galaxyCollision,
  flowerDance,
];
