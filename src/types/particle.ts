import { Point } from "paper/dist/paper-core";
import { Vector, Point2D } from "../utils/types/physics";

export interface ParticleMechanics {
  position: Vector;
  velocity: Vector;
  force: Vector;
  mass: number;
  elasticity: number;
  outgoingForceRatio?: number;
}

export interface Particle extends ParticleMechanics {
  id: string;
  color?: string;
  size?: number;
  showVectors?: boolean;
}

// Serializable versions
export interface SerializableParticle {
  id: string;
  position: Point2D;
  velocity: Point2D;
  mass: number;
  elasticity: number;
  outgoingForceRatio?: number;
  size?: number;
  color?: string;
  showVectors?: boolean;
}

// Conversion utilities
export const toParticle = (
  p: SerializableParticle
): Omit<Particle, "force"> => ({
  id: p.id,
  position: new Point(p.position.x, p.position.y),
  velocity: new Point(p.velocity.x, p.velocity.y),
  mass: p.mass,
  elasticity: p.elasticity,
  outgoingForceRatio: p.outgoingForceRatio,
  size: p.size,
  color: p.color,
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
  showVectors: p.showVectors,
});
