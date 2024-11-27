import { Point2D, Force } from "../utils/types/physics";

export interface ParticleMechanics {
  position: Point2D;
  velocity: Point2D;
  force: Force;
  mass: number;
  elasticity: number;
}

export interface TrailPoint extends Point2D {
  timestamp: number;
}

export interface Particle extends ParticleMechanics {
  id: string;
  color: string;
  size: number;
  showVectors: boolean;
  trails: TrailPoint[];
}
