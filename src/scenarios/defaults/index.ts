import { Scenario } from "../../types/scenario";
import { threeStars } from "./threeStars";
import { orbitalDance } from "./orbitalDance";
import { galaxyCollision } from "./galaxyCollision";
import { flowerDance } from "./flowerDance";

export const defaultScenarios: Scenario[] = [
  threeStars,
  orbitalDance,
  galaxyCollision,
  flowerDance,
];
