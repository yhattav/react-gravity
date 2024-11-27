export interface ScenarioData {
  settings: {
    NEW_PARTICLE_MASS: number;
    NEW_PARTICLE_ELASTICITY: number;
    FRICTION: number;
    DELTA_TIME: number;
    POINTER_MASS: number;
    SHOW_VELOCITY_ARROWS: boolean;
    SHOW_FORCE_ARROWS: boolean;
    CONSTANT_FORCE_X: number;
    CONSTANT_FORCE_Y: number;
    SOLID_BOUNDARIES: boolean;
    PARTICLES_EXERT_GRAVITY: boolean;
  };
  gravityPoints: Array<{
    x: number;
    y: number;
    label: string;
    mass: number;
    color: string;
  }>;
  particles: Array<{
    id: string;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    mass: number;
    elasticity: number;
    color: string;
    size: number;
    showVectors: boolean;
  }>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  data: ScenarioData;
}
