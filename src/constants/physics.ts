import { StarTemplate, GravityPoint } from "../types/star";

type SettingType = "slider" | "boolean";

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

export const PHYSICS_CONFIG = {
  NEW_PARTICLE_MASS: 0.1,
  NEW_PARTICLE_ELASTICITY: 0.8,
  FRICTION: 0.001,
  DELTA_TIME: 1 / 60,
  POINTER_MASS: 100000,
  SHOW_VELOCITY_ARROWS: true,
  SHOW_FORCE_ARROWS: true,
  CONSTANT_FORCE_X: 0,
  CONSTANT_FORCE_Y: 0,
  SOLID_BOUNDARIES: true,
} as const;

export const SETTINGS_METADATA: Record<
  keyof typeof PHYSICS_CONFIG,
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
    min: 10000,
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
} as const;

export const PARTICLE_MODES = {
  NORMAL: { mass: 0.1, size: 20, color: "#666" },
  HEAVY: { mass: 1.0, size: 30, color: "#FF5252" },
  LIGHT: { mass: 0.05, size: 15, color: "#4CAF50" },
} as const;

export const STAR_TEMPLATES: StarTemplate[] = [
  {
    label: "Supergiant",
    mass: 50000,
    color: "#FF6B6B",
    size: 24,
    icon: "★",
  },
  {
    label: "Giant",
    mass: 30000,
    color: "#4ECDC4",
    size: 20,
    icon: "⭐",
  },
  {
    label: "Dwarf",
    mass: 10000,
    color: "#45B7D1",
    size: 16,
    icon: "✦",
  },
];

export const INITIAL_GRAVITY_POINTS: GravityPoint[] = [
  { x: 700, y: 700, label: "Heavy", mass: 50000, color: "#FF6B6B" },
  { x: 500, y: 150, label: "Medium", mass: 30000, color: "#4ECDC4" },
  { x: 350, y: 250, label: "Light", mass: 10000, color: "#45B7D1" },
];
