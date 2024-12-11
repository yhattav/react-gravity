import { Point } from "paper";

// Basic vector type for x,y coordinates (JSON serializable)
export interface Point2D {
  x: number;
  y: number;
}
export interface WarpPoint {
  position: Vector;
  effectiveMass: number;
}
// Paper.js Point type - use the actual instance type
export type Vector = InstanceType<typeof Point>;
export type Force = Vector;

export interface GravityPoint {
  position: Vector;
  label: string;
  mass: number;
  id?: string;
}

// Serializable version of GravityPoint
export interface SerializableGravityPoint {
  x: number;
  y: number;
  label: string;
  mass: number;
  id?: string;
}

export const toGravityPoint = (p: SerializableGravityPoint): GravityPoint => ({
  position: new Point(p.x, p.y),
  label: p.label,
  mass: p.mass,
  id: p.id,
});

export const toSerializableGravityPoint = (
  p: GravityPoint
): SerializableGravityPoint => ({
  x: p.position.x,
  y: p.position.y,
  label: p.label,
  mass: p.mass,
  id: p.id,
});
