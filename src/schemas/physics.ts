import { z } from "zod";
import { Point } from "paper";

// Runtime types (these can't be validated with Zod since they're class instances)
export type Vector = InstanceType<typeof Point>;
export type Force = Vector;

// Zod schemas for runtime validation
export const WarpPointSchema = z.object({
  position: z.instanceof(Point),
  effectiveMass: z.number(),
});

export const GravityPointSchema = z.object({
  position: z.instanceof(Point),
  label: z.string(),
  mass: z.number(),
  id: z.string().optional(),
});

export const ParticleMechanicsSchema = z.object({
  position: z.instanceof(Point),
  velocity: z.instanceof(Point),
  force: z.instanceof(Point),
  mass: z.number(),
  elasticity: z.number(),
  outgoingForceRatio: z.number().optional(),
  frozen: z.boolean().optional(),
});

export const ParticleSchema = ParticleMechanicsSchema.extend({
  id: z.string(),
  color: z.string().optional(),
  size: z.number().optional(),
  showVectors: z.boolean().optional(),
});

// Export types
export type WarpPoint = z.infer<typeof WarpPointSchema>;
export type GravityPoint = z.infer<typeof GravityPointSchema>;
export type ParticleMechanics = z.infer<typeof ParticleMechanicsSchema>;
export type Particle = z.infer<typeof ParticleSchema>;
