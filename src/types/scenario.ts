import { SerializableGravityPoint } from "../utils/types/physics";
import { SerializableParticle } from "./particle";
import { PhysicsSettings } from "../constants/physics";
import { SerializableSimulatorPath } from "../utils/types/path";

export interface ScenarioData {
  settings: Partial<PhysicsSettings>;
  gravityPoints: Array<SerializableGravityPoint>;
  particles: Array<SerializableParticle>;
  paths: Array<SerializableSimulatorPath>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  data: ScenarioData;
}
