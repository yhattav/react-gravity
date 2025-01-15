import { Point, Path } from "paper";

export type Vector = InstanceType<typeof Point>;
export type SerializablePath = InstanceType<typeof Path>;

export {
  type Point2D,
  type SerializableGravityPoint,
} from "../../schemas/scenario";
export {
  type WarpPoint,
  type GravityPoint,
  type Force,
} from "../../schemas/physics";

// Keep the conversion utilities
import { type SerializableGravityPoint } from "../../schemas/scenario";
import { type GravityPoint } from "../../schemas/physics";

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
