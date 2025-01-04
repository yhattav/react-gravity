import { StarTemplate } from "../types/star";
import { GravityPoint, Point2D } from "../utils/types/physics";
import { Point } from "paper";

export interface SliderSettingMetadata {
  type: "slider";
  isDev: boolean;
  min: number;
  max: number;
  step: number;
}

export interface BooleanSettingMetadata {
  type: "boolean";
  isDev: boolean;
}

export interface VectorSettingMetadata {
  type: "vector";
  isDev: boolean;
  max: Point2D;
  min: Point2D;
  label?: string;
}

export interface ColorSettingMetadata {
  type: "color";
  isDev: boolean;
}

export interface SelectSettingMetadata {
  type: "select";
  isDev: boolean;
  options: string[];
}

type SettingMetadata =
  | SliderSettingMetadata
  | BooleanSettingMetadata
  | VectorSettingMetadata
  | ColorSettingMetadata
  | SelectSettingMetadata;

export interface PhysicsSettings {
  NEW_PARTICLE_MASS: number;
  NEW_PARTICLE_ELASTICITY: number;
  FRICTION: number;
  DELTA_TIME: number;
  POINTER_MASS: number;
  SHOW_VELOCITY_ARROWS: boolean;
  SHOW_FORCE_ARROWS: boolean;
  CONSTANT_FORCE: Point2D;
  SOLID_BOUNDARIES: boolean;
  PARTICLES_EXERT_GRAVITY: boolean;
  PARTICLE_TRAIL_LENGTH: number;
  SHOW_GRAVITY_VISION: boolean;
  GRAVITY_GRID_DENSITY: number;
  MASTER_VOLUME: number;
  AMBIENT_VOLUME: number;
  PARTICLE_VOLUME: number;
  GRAVITY_VISION_OPACITY: number;
  GRAVITY_VISION_STROKE_OPACITY: number;
  GRAVITY_VISION_STROKE_WIDTH: number;
  GRAVITY_VISION_STROKE_COLOR: string;
  GRAVITY_VISION_COLOR_SCHEME: string;
  GRAVITY_VISION_INVERT_COLORS: boolean;
  GRAVITY_VISION_GRID_SIZE: number;
  GRAVITY_VISION_CONTOUR_LEVELS: number;
  GRAVITY_VISION_THROTTLE_MS: number;
  GRAVITY_VISION_TRANSITION_MS: number;
  GRAVITY_VISION_STRENGTH: number;
  GRAVITY_VISION_FALLOFF: number;
  GRAVITY_VISION_MASS_THRESHOLD: number;
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsSettings = {
  NEW_PARTICLE_MASS: 0.3,
  NEW_PARTICLE_ELASTICITY: 0.8,
  FRICTION: 1,
  DELTA_TIME: 1 / 60,
  POINTER_MASS: 500000,
  SHOW_VELOCITY_ARROWS: false,
  SHOW_FORCE_ARROWS: false,
  CONSTANT_FORCE: { x: 0, y: 0 },
  SOLID_BOUNDARIES: true,
  PARTICLES_EXERT_GRAVITY: false,
  PARTICLE_TRAIL_LENGTH: 30,
  SHOW_GRAVITY_VISION: true,
  GRAVITY_GRID_DENSITY: 20,
  MASTER_VOLUME: 0.8,
  AMBIENT_VOLUME: 0.6,
  PARTICLE_VOLUME: 0.3,
  GRAVITY_VISION_OPACITY: 1,
  GRAVITY_VISION_STROKE_OPACITY: 0.1,
  GRAVITY_VISION_STROKE_WIDTH: 2,
  GRAVITY_VISION_STROKE_COLOR: "#ffffff",
  GRAVITY_VISION_COLOR_SCHEME: "interpolateInferno",
  GRAVITY_VISION_INVERT_COLORS: false,
  GRAVITY_VISION_GRID_SIZE: 100,
  GRAVITY_VISION_CONTOUR_LEVELS: 20,
  GRAVITY_VISION_THROTTLE_MS: 32,
  GRAVITY_VISION_TRANSITION_MS: 100,
  GRAVITY_VISION_STRENGTH: 500,
  GRAVITY_VISION_FALLOFF: 100,
  GRAVITY_VISION_MASS_THRESHOLD: 0.01,
} as const;

export const SETTINGS_METADATA: Record<
  keyof typeof DEFAULT_PHYSICS_CONFIG,
  SettingMetadata
> = {
  NEW_PARTICLE_MASS: {
    type: "slider",
    isDev: false,
    min: -0.5,
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
  CONSTANT_FORCE: {
    type: "vector",
    isDev: false,
    max: { x: 2, y: 2 },
    min: { x: -2, y: -2 },
  },
  SOLID_BOUNDARIES: {
    type: "boolean",
    isDev: false,
  },
  PARTICLES_EXERT_GRAVITY: {
    type: "boolean",
    isDev: false,
  },
  PARTICLE_TRAIL_LENGTH: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 100,
    step: 1,
  },
  SHOW_GRAVITY_VISION: {
    type: "boolean",
    isDev: false,
  },
  GRAVITY_GRID_DENSITY: {
    type: "slider",
    isDev: false,
    min: 10,
    max: 40,
    step: 1,
  },
  MASTER_VOLUME: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 1,
    step: 0.01,
  },
  AMBIENT_VOLUME: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 1,
    step: 0.01,
  },
  PARTICLE_VOLUME: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 1,
    step: 0.01,
  },
  GRAVITY_VISION_OPACITY: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 1,
    step: 0.1,
  },
  GRAVITY_VISION_STROKE_OPACITY: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 1,
    step: 0.1,
  },
  GRAVITY_VISION_STROKE_WIDTH: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 5,
    step: 0.5,
  },
  GRAVITY_VISION_STROKE_COLOR: {
    type: "color",
    isDev: false,
  },
  GRAVITY_VISION_COLOR_SCHEME: {
    type: "select",
    isDev: false,
    options: [
      "interpolateInferno",
      "interpolateViridis",
      "interpolateMagma",
      "interpolatePlasma",
      "interpolateWarm",
      "interpolateCool",
    ],
  },
  GRAVITY_VISION_INVERT_COLORS: {
    type: "boolean",
    isDev: false,
  },
  GRAVITY_VISION_GRID_SIZE: {
    type: "slider",
    isDev: false,
    min: 50,
    max: 200,
    step: 10,
  },
  GRAVITY_VISION_CONTOUR_LEVELS: {
    type: "slider",
    isDev: false,
    min: 5,
    max: 50,
    step: 5,
  },
  GRAVITY_VISION_THROTTLE_MS: {
    type: "slider",
    isDev: false,
    min: 16,
    max: 100,
    step: 16,
  },
  GRAVITY_VISION_TRANSITION_MS: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 500,
    step: 50,
  },
  GRAVITY_VISION_STRENGTH: {
    type: "slider",
    isDev: false,
    min: 100,
    max: 1000,
    step: 50,
  },
  GRAVITY_VISION_FALLOFF: {
    type: "slider",
    isDev: false,
    min: 50,
    max: 200,
    step: 10,
  },
  GRAVITY_VISION_MASS_THRESHOLD: {
    type: "slider",
    isDev: false,
    min: 0,
    max: 0.1,
    step: 0.01,
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
  { position: new Point(500, 400), label: "Heavy", mass: 1000000 },
  { position: new Point(500, 150), label: "Medium", mass: 300000 },
  { position: new Point(350, 250), label: "Light", mass: 100000 },
];
