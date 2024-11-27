import { GravityPoint } from "../utils/types/physics";
import { Particle } from "./particle";
import { PhysicsSettings } from "../constants/physics";

export interface ScenarioData {
  settings: PhysicsSettings;
  gravityPoints: Array<GravityPoint>;
  particles: Array<Omit<Particle, "trails" | "force">>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  data: ScenarioData;
}
