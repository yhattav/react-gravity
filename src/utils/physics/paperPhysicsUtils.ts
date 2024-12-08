import { Point } from "paper";
import { Vector, Force, GravityPoint } from "../types/physics";
import { ParticleMechanics } from "../../types/particle";

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
  p1: Vector,
  p2: Vector,
  mass: number,
  G = 0.1,
  minDistance = 30
): Force => {
  if (
    !isFinite(p1.x) ||
    !isFinite(p1.y) ||
    !isFinite(p2.x) ||
    !isFinite(p2.y)
  ) {
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

// Calculate total force using Paper.js vectors
export const calculateTotalForce = (
  selfPosition: Vector,
  pointerPos: Vector,
  gravityPoints: GravityPoint[],
  pointerMass = 50000,
  particles: Array<ParticleMechanics> = [],
  particlesExertGravity = false
): Force => {
  let totalForce = new Point(0, 0);

  // Add pointer gravitational pull
  const gravitationalForce = calculateGravitationalForceVector(
    selfPosition,
    pointerPos,
    pointerMass
  );

  totalForce = totalForce.add(gravitationalForce);

  // Add gravity points force
  gravityPoints.forEach((point) => {
    const pointForce = calculateGravitationalForceVector(
      selfPosition,
      point.position,
      point.mass
    );
    totalForce = totalForce.add(pointForce);
  });

  // Add particle gravity if enabled
  if (particlesExertGravity) {
    particles.forEach((particle) => {
      const effectiveMass = particle.mass * (particle.outgoingForceRatio ?? 1);
      totalForce = totalForce.add(
        calculateGravitationalForceVector(
          selfPosition,
          particle.position,
          effectiveMass
        )
      );
    });
  }

  return totalForce;
};

// Calculate acceleration using Paper.js vectors
export const calculateAcceleration = (force: Force, mass: number): Vector => {
  return force.divide(mass);
};

// Calculate new velocity using Paper.js vectors
export const calculateNewVelocity = (
  currentVelocity: Vector,
  acceleration: Vector,
  deltaTime: number,
  friction: number
): Vector => {
  return currentVelocity
    .add(acceleration.multiply(deltaTime))
    .multiply(friction);
};

// Calculate new position using Paper.js vectors
export const calculateNewPosition = (
  currentPosition: Vector,
  velocity: Vector,
  deltaTime: number
): Vector => {
  return currentPosition.add(velocity.multiply(deltaTime));
};

export const handleBoundaryCollision = (
  position: Vector,
  velocity: Vector,
  containerRef: React.RefObject<HTMLDivElement>,
  elasticity: number
): { position: Vector; velocity: Vector } => {
  if (!containerRef.current) return { position, velocity };

  const bounds = containerRef.current.getBoundingClientRect();
  const newPosition = position.clone();
  let newVelocity = velocity.clone();

  // Check horizontal boundaries
  if (position.x <= 0) {
    newPosition.x = 0;
    // Reflect velocity along x-axis
    newVelocity = new Point(Math.abs(velocity.x) * elasticity, velocity.y);
  } else if (position.x >= bounds.width) {
    newPosition.x = bounds.width;
    // Reflect velocity along x-axis
    newVelocity = new Point(-Math.abs(velocity.x) * elasticity, velocity.y);
  }

  // Check vertical boundaries
  if (position.y <= 0) {
    newPosition.y = 0;
    // Reflect velocity along y-axis
    newVelocity = new Point(newVelocity.x, Math.abs(velocity.y) * elasticity);
  } else if (position.y >= bounds.height) {
    newPosition.y = bounds.height;
    // Reflect velocity along y-axis
    newVelocity = new Point(newVelocity.x, -Math.abs(velocity.y) * elasticity);
  }

  return { position: newPosition, velocity: newVelocity };
};
