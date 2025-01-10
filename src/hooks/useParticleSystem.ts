import { useState, useCallback, useRef, useEffect } from "react";
import { Point } from "paper";
import { Point2D, Vector, GravityPoint } from "../utils/types/physics";
import { Particle, ParticleMechanics } from "../types/particle";
import {
  calculateTotalForce,
  calculateAcceleration,
  calculateNewVelocity,
  handleBoundaryCollision,
} from "../utils/physics/physicsUtils";
import { PhysicsSettings } from "../constants/physics";
import { SimulatorPath } from "../utils/types/path";

const generatePastelColor = () => {
  const r = Math.floor(Math.random() * 75 + 180);
  const g = Math.floor(Math.random() * 75 + 180);
  const b = Math.floor(Math.random() * 75 + 180);
  return `rgb(${r}, ${g}, ${b})`;
};

export const useParticleSystem = (
  physicsConfig: PhysicsSettings,
  offset: Vector,
  pointerPosRef: React.RefObject<Point2D>,
  gravityPoints: GravityPoint[],
  paths: SimulatorPath[],
  gravityRef: React.RefObject<HTMLDivElement>
) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const updateParticleMechanics = useCallback(
    (
      particle: ParticleMechanics,
      allParticles: Array<ParticleMechanics> = []
    ): ParticleMechanics => {
      const otherParticles = allParticles.filter((p) => p !== particle);
      const calculatedForce = calculateTotalForce(
        particle.position,
        new Point(pointerPosRef?.current || { x: 0, y: 0 }).subtract(
          new Point(offset)
        ),
        gravityPoints,
        physicsConfig.POINTER_MASS,
        otherParticles,
        paths,
        physicsConfig.PARTICLES_EXERT_GRAVITY
      );
      const force = new Point(calculatedForce.x, calculatedForce.y).add(
        new Point(physicsConfig.CONSTANT_FORCE)
      );

      const acceleration = calculateAcceleration(force, particle.mass);
      let newVelocity = calculateNewVelocity(
        particle.velocity,
        acceleration,
        physicsConfig.DELTA_TIME,
        physicsConfig.FRICTION
      );
      let newPosition = new Point(particle.position).add(
        new Point(newVelocity).multiply(physicsConfig.DELTA_TIME)
      );

      if (physicsConfig.SOLID_BOUNDARIES) {
        const collision = handleBoundaryCollision(
          newPosition,
          newVelocity,
          gravityRef,
          particle.elasticity
        );
        newPosition = collision.position;
        newVelocity = collision.velocity;
      }

      return {
        position: newPosition,
        velocity: newVelocity,
        force,
        mass: particle.mass,
        elasticity: particle.elasticity,
      };
    },
    [gravityPoints, paths, physicsConfig, gravityRef, offset, pointerPosRef]
  );

  const createParticle = useCallback(
    (
      position: Point2D,
      options: Partial<Omit<Particle, "position" | "id">> = {}
    ): Particle => {
      const newPosition = new Point(position).subtract(new Point(offset));

      return {
        id: Math.random().toString(36).substr(2, 9),
        position: newPosition,
        velocity: new Point(0, 0),
        force: new Point(0, 0),
        mass: physicsConfig.NEW_PARTICLE_MASS,
        elasticity: physicsConfig.NEW_PARTICLE_ELASTICITY,
        color: generatePastelColor(),
        size: 10,
        showVectors: true,
        ...options,
      };
    },
    [physicsConfig, offset]
  );

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  return {
    particles,
    setParticles,
    particlesRef,
    updateParticleMechanics,
    createParticle,
  };
};
