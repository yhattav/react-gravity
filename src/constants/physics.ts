import { StarTemplate, GravityPoint } from "../types/star";

interface SliderSettingMetadata {
  type: "slider";
  isDev: boolean;
  min: number;
  max: number;
  step: number;
}

interface BooleanSettingMetadata {
  type: "boolean";
  isDev: boolean;
}

type SettingMetadata = SliderSettingMetadata | BooleanSettingMetadata;
export interface PhysicsSettings {
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
}
export const DEFAULT_PHYSICS_CONFIG: PhysicsSettings = {
  NEW_PARTICLE_MASS: 0.1,
  NEW_PARTICLE_ELASTICITY: 0.8,
  FRICTION: 1,
  DELTA_TIME: 1 / 60,
  POINTER_MASS: 500000,
  SHOW_VELOCITY_ARROWS: true,
  SHOW_FORCE_ARROWS: true,
  CONSTANT_FORCE_X: 0,
  CONSTANT_FORCE_Y: 0,
  SOLID_BOUNDARIES: true,
  PARTICLES_EXERT_GRAVITY: false,
} as const;

export const SETTINGS_METADATA: Record<
  keyof typeof DEFAULT_PHYSICS_CONFIG,
  SettingMetadata
> = {
  NEW_PARTICLE_MASS: {
    type: "slider",
    isDev: false,
    min: 0.001,
    max: 0.5,
    step: 0.001,
  },
  NEW_PARTICLE_ELASTICITY: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 1,
    step: 0.1,
  },
  FRICTION: {
    type: "slider",
    isDev: false,
    min: 0.0,
    max: 1,
    step: 0.001,
  },
  DELTA_TIME: {
    type: "slider",
    isDev: true,
    min: 1 / 120,
    max: 1 / 30,
    step: 1 / 120,
  },
  POINTER_MASS: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 1000000,
    step: 10000,
  },
  SHOW_VELOCITY_ARROWS: {
    type: "boolean",
    isDev: false,
  },
  SHOW_FORCE_ARROWS: {
    type: "boolean",
    isDev: false,
  },
  CONSTANT_FORCE_X: {
    type: "slider",
    isDev: false,
    min: -10,
    max: 10,
    step: 0.1,
  },
  CONSTANT_FORCE_Y: {
    type: "slider",
    isDev: false,
    min: -10,
    max: 10,
    step: 0.1,
  },
  SOLID_BOUNDARIES: {
    type: "boolean",
    isDev: false,
  },
  PARTICLES_EXERT_GRAVITY: {
    type: "boolean",
    isDev: false,
  },
} as const;

export const PARTICLE_MODES = {
  NORMAL: { mass: 0.1, size: 20, color: "#666" },
  HEAVY: { mass: 1.0, size: 30, color: "#FF5252" },
  LIGHT: { mass: 0.05, size: 15, color: "#4CAF50" },
} as const;

export const SimulatedSolarMass = 30000;

export const STAR_TEMPLATES: StarTemplate[] = [
  {
    label: "Brown Dwarf",
    mass: 5000,
    size: 30,
  },
  // {
  //   label: "Red Dwarf",
  //   mass: 20000,
  //   size: 35,
  // },
  // {
  //   label: "Yellow Dwarf",
  //   mass: 50000,
  //   size: 40,
  // },
  // {
  //   label: "Blue Giant",
  //   mass: 100000,
  //   size: 50,
  // },
  // {
  //   label: "Blue Supergiant",
  //   mass: 500000,
  //   size: 60,
  // },
  // {
  //   label: "Blue Hypergiant",
  //   mass: 1000000,
  //   size: 70,
  // },
  // {
  //   label: "Neutron Star",
  //   mass: 500000,
  //   size: 25,
  // },
  // {
  //   label: "Black Hole",
  //   mass: 2500000,
  //   size: 45,
  // },
];

export const INITIAL_GRAVITY_POINTS: GravityPoint[] = [
  { x: 700, y: 700, label: "Heavy", mass: 50000, color: "#FF6B6B" },
  { x: 500, y: 150, label: "Medium", mass: 30000, color: "#4ECDC4" },
  { x: 350, y: 250, label: "Light", mass: 10000, color: "#45B7D1" },
];
