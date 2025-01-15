import { z } from "zod";

export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const PathPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  handleIn: Point2DSchema.optional(),
  handleOut: Point2DSchema.optional(),
});

export const SerializableGravityPointSchema = z.object({
  position: Point2DSchema,
  label: z.string(),
  mass: z.number(),
  id: z.string().optional(),
});

export const SerializableParticleSchema = z.object({
  id: z.string(),
  position: Point2DSchema,
  velocity: Point2DSchema,
  mass: z.number(),
  elasticity: z.number(),
  outgoingForceRatio: z.number().optional(),
  size: z.number().optional(),
  color: z.string().optional(),
  showVectors: z.boolean().optional(),
});

export const SerializableSimulatorPathSchema = z.object({
  id: z.string(),
  points: z.array(PathPointSchema),
  closed: z.boolean(),
  position: Point2DSchema,
  label: z.string(),
  mass: z.number(),
  strokeColor: z.string().optional(),
  fillColor: z.string().optional(),
  strokeWidth: z.number().optional(),
  opacity: z.number().optional(),
});

export const PhysicsSettingsSchema = z.object({
  NEW_PARTICLE_MASS: z.number().optional(),
  NEW_PARTICLE_ELASTICITY: z.number().optional(),
  FRICTION: z.number().optional(),
  DELTA_TIME: z.number().optional(),
  POINTER_MASS: z.number().optional(),
  SHOW_VELOCITY_ARROWS: z.boolean().optional(),
  SHOW_FORCE_ARROWS: z.boolean().optional(),
  CONSTANT_FORCE: Point2DSchema.optional(),
  SOLID_BOUNDARIES: z.boolean().optional(),
  PARTICLES_EXERT_GRAVITY: z.boolean().optional(),
  PARTICLE_TRAIL_LENGTH: z.number().optional(),
  SHOW_GRAVITY_VISION: z.boolean().optional(),
  GRAVITY_GRID_DENSITY: z.number().optional(),
  SHOW_D3_GRAVITY_VISION: z.boolean().optional(),
  GRAVITY_VISION_OPACITY: z.number().optional(),
  GRAVITY_VISION_STROKE_OPACITY: z.number().optional(),
  GRAVITY_VISION_STROKE_WIDTH: z.number().optional(),
  GRAVITY_VISION_STROKE_COLOR: z.string().optional(),
  GRAVITY_VISION_COLOR_SCHEME: z.string().optional(),
  GRAVITY_VISION_INVERT_COLORS: z.boolean().optional(),
  GRAVITY_VISION_GRID_SIZE: z.number().optional(),
  GRAVITY_VISION_CONTOUR_LEVELS: z.number().optional(),
  GRAVITY_VISION_THROTTLE_MS: z.number().optional(),
  GRAVITY_VISION_TRANSITION_MS: z.number().optional(),
  GRAVITY_VISION_STRENGTH: z.number().optional(),
  GRAVITY_VISION_FALLOFF: z.number().optional(),
  GRAVITY_VISION_MASS_THRESHOLD: z.number().optional(),
  GRAVITY_VISION_BLUR: z.number().optional(),
  MASTER_VOLUME: z.number().optional(),
  AMBIENT_VOLUME: z.number().optional(),
  PARTICLE_VOLUME: z.number().optional(),
});

export const ScenarioDataSchema = z.object({
  settings: PhysicsSettingsSchema,
  gravityPoints: z.array(SerializableGravityPointSchema).optional(),
  particles: z.array(SerializableParticleSchema).optional(),
  paths: z.array(SerializableSimulatorPathSchema).optional(),
});

export const ScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  data: ScenarioDataSchema,
});

// Export types derived from schemas
export type Point2D = z.infer<typeof Point2DSchema>;
export type PathPoint = z.infer<typeof PathPointSchema>;
export type SerializableGravityPoint = z.infer<
  typeof SerializableGravityPointSchema
>;
export type SerializableParticle = z.infer<typeof SerializableParticleSchema>;
export type SerializableSimulatorPath = z.infer<
  typeof SerializableSimulatorPathSchema
>;
export type PhysicsSettings = z.infer<typeof PhysicsSettingsSchema>;
export type ScenarioData = z.infer<typeof ScenarioDataSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
