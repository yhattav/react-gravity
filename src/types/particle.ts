import { Point } from "paper/dist/paper-core";
import { Vector, Force, Vector2D } from "../utils/types/physics";

export interface ParticleMechanics {
  position: Vector;
  velocity: Vector;
  force?: Force;
  mass: number;
  elasticity: number;
  outgoingForceRatio?: number;
}

export interface TrailPoint {
  position: Vector;
  timestamp: number;
}

export interface Particle extends ParticleMechanics {
  id: string;
  size: number;
  color: string;
  trails: TrailPoint[];
  showVectors?: boolean;
}

// Serializable versions
export interface SerializableParticle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  mass: number;
  elasticity: number;
  outgoingForceRatio?: number;
  size: number;
  color: string;
  showVectors?: boolean;
}

// Conversion utilities
export const toParticle = (p: SerializableParticle): Particle => ({
  id: p.id,
  position: new Point(p.position.x, p.position.y),
  velocity: new Point(p.velocity.x, p.velocity.y),
  mass: p.mass,
  elasticity: p.elasticity,
  outgoingForceRatio: p.outgoingForceRatio,
  size: p.size,
  color: p.color,
  trails: [],
});

export const toSerializableParticle = (p: Particle): SerializableParticle => ({
  id: p.id,
  position: { x: p.position.x, y: p.position.y },
  velocity: { x: p.velocity.x, y: p.velocity.y },
  mass: p.mass,
  elasticity: p.elasticity,
  outgoingForceRatio: p.outgoingForceRatio,
  size: p.size,
  color: p.color,
});
