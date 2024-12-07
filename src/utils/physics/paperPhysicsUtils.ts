import { Point } from "paper";
import { Point2D, Force, GravityPoint } from "../types/physics";
import { ParticleMechanics } from "../../types/particle";

// Convert only at the public API boundary
const toPoint = (p: Point2D): Point => new Point(p.x, p.y);
const toForce = (p: Point): Force => ({ fx: p.x, fy: p.y });

// Newton's law of universal gravitation (simplified)
const calculateGravityMagnitude = (
  distance: number,
  mass: number,
  G = 0.1,
  minDistance = 10
): number => {
  return (G * mass) / Math.max(distance * distance, minDistance * minDistance);
};

// Force falloff calculation
const calculateForceFalloff = (
  distance: number,
  falloffStartDistance: number
): number => {
  return distance < falloffStartDistance
    ? Math.pow(distance / falloffStartDistance, 0.5)
    : 1;
};

// Calculate gravitational force using Paper.js vectors
const calculateGravitationalForceVector = (
  p1: Point,
  p2: Point,
  mass: number,
  G = 0.1,
  minDistance = 30
): Point => {
  if (!p1.isFinite() || !p2.isFinite()) {
    return new Point(0, 0);
  }

  const direction = p2.subtract(p1);
  const distance = direction.length;

  if (distance === 0) return new Point(0, 0);

  const forceMagnitude = calculateGravityMagnitude(
    distance,
    mass,
    G,
    minDistance
  );
  const normalizedDirection = direction.normalize();
  const force = normalizedDirection.multiply(forceMagnitude);
  const forceFalloff = calculateForceFalloff(distance, minDistance * 2);

  return force.multiply(forceFalloff);
};

// Public API functions that handle the conversions at the boundary
export const calculateTotalForce = (
  selfPosition: Point2D,
  pointerPos: Point2D,
  gravityPoints: GravityPoint[],
  pointerMass = 50000,
  particles: Array<ParticleMechanics> = [],
  particlesExertGravity = false
): Force => {
  // Convert input positions to Paper.js Points
  const pos = toPoint(selfPosition);
  const pointer = toPoint(pointerPos);

  // Calculate forces using Paper.js vectors internally
  const totalForce = new Point(0, 0);

  // Add pointer gravitational pull
  totalForce.add(calculateGravitationalForceVector(pos, pointer, pointerMass));

  // Add gravity points force
  gravityPoints.forEach((point) => {
    const pointPos = new Point(point.x, point.y);
    totalForce.add(
      calculateGravitationalForceVector(pos, pointPos, point.mass)
    );
  });

  // Add particle gravity if enabled
  if (particlesExertGravity) {
    particles.forEach((particle) => {
      const effectiveMass = particle.mass * (particle.outgoingForceRatio ?? 1);
      const particlePos = toPoint(particle.position);
      totalForce.add(
        calculateGravitationalForceVector(pos, particlePos, effectiveMass)
      );
    });
  }

  // Convert back to Force type only at the end
  return toForce(totalForce);
};

export const calculateAcceleration = (force: Force, mass: number): Point2D => {
  const forceVector = new Point(force.fx, force.fy);
  const acceleration = forceVector.divide(mass);
  // Convert to Point2D at API boundary
  return { x: acceleration.x, y: acceleration.y };
};

export const calculateNewVelocity = (
  currentVelocity: Point2D,
  acceleration: Point2D,
  deltaTime: number,
  friction: number
): Point2D => {
  // Convert at boundary
  const velocity = toPoint(currentVelocity);
  const acc = toPoint(acceleration);

  // Do calculations in Paper.js vectors
  const newVelocity = velocity.add(acc.multiply(deltaTime)).multiply(friction);

  // Convert back at boundary
  return { x: newVelocity.x, y: newVelocity.y };
};

export const calculateNewPosition = (
  currentPosition: Point2D,
  velocity: Point2D,
  deltaTime: number
): Point2D => {
  // Convert at boundary
  const position = toPoint(currentPosition);
  const vel = toPoint(velocity);

  // Do calculations in Paper.js vectors
  const newPosition = position.add(vel.multiply(deltaTime));

  // Convert back at boundary
  return { x: newPosition.x, y: newPosition.y };
};
