import { SerializableGravityPoint } from "../utils/types/physics";
import { SerializableParticle } from "./particle";
import { PhysicsSettings } from "../constants/physics";

export interface ScenarioData {
  settings: Partial<PhysicsSettings>;
  gravityPoints: Array<SerializableGravityPoint>;
  particles: Array<SerializableParticle>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  data: ScenarioData;
}
