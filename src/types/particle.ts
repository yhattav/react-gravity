import { Point } from "paper/dist/paper-core";
import { type SerializableParticle } from "../schemas/scenario";
import { type Particle } from "../schemas/physics";

export { type Particle, type ParticleMechanics } from "../schemas/physics";
export { type SerializableParticle } from "../schemas/scenario";

// Keep the conversion utilities
export const toParticle = (p: SerializableParticle): Particle => ({
  id: p.id,
  position: new Point(p.position.x, p.position.y),
  velocity: new Point(p.velocity.x, p.velocity.y),
  mass: p.mass,
  elasticity: p.elasticity,
  outgoingForceRatio: p.outgoingForceRatio,
  size: p.size,
  color: p.color,
  force: new Point(0, 0),
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
