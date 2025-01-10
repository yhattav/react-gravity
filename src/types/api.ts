import { GravityPoint } from "../utils/types/physics";
import { Particle } from "./particle";
import { Scenario } from "./scenario";
import { PhysicsSettings } from "../constants/physics";
import { Point2D } from "../utils/types/physics";

export interface GravitySimulatorApi {
  // Simulation Control
  play: () => void;
  pause: () => void;
  reset: () => void;

  // Display Control
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
  invertColors: (invert: boolean) => void;

  // Particle Management
  addParticle: (
    position: Point2D,
    options?: Partial<Omit<Particle, "position" | "id">>
  ) => void;
  removeAllParticles: () => void;

  // Gravity Points Management
  addGravityPoint: (point: Omit<GravityPoint, "id">) => void;
  removeGravityPoint: (index: number) => void;
  removeAllGravityPoints: () => void;

  // Scenario Management
  loadScenario: (scenario: Scenario) => void;
  exportCurrentScenario: () => Scenario;

  // Settings
  updateSettings: (settings: Partial<PhysicsSettings>) => void;
  getSettings: () => PhysicsSettings;

  // State Queries
  isPlaying: () => boolean;
  isFullscreen: () => boolean;
  getParticleCount: () => number;
  getGravityPointsCount: () => number;
}
