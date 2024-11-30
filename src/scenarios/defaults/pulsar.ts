import { Scenario } from "../../types/scenario";

export const pulsar: Scenario = {
  id: "pulsar",
  name: "Binary Pulsar",
  description:
    "Two massive neutron stars orbiting each other at high velocity, creating a mesmerizing pulsar effect",
  data: {
    settings: {
      NEW_PARTICLE_MASS: 0.01,
      NEW_PARTICLE_ELASTICITY: 1,
      FRICTION: 1,
      DELTA_TIME: 0.0166666666666667,
      POINTER_MASS: 0,
      SHOW_VELOCITY_ARROWS: true,
      SHOW_FORCE_ARROWS: true,
      CONSTANT_FORCE_X: 0,
      CONSTANT_FORCE_Y: 0,
      SOLID_BOUNDARIES: true,
      PARTICLES_EXERT_GRAVITY: true, // Important for particle interaction
    },
    gravityPoints: [], // No fixed gravity points needed
    particles: [
      {
        id: "pulsar1",
        position: { x: 414, y: 300 },
        velocity: { x: 0, y: 40 }, // Initial velocity for orbital motion
        mass: 5000, // High mass for strong gravitational effect
        elasticity: 1,
        color: "#00ffff",
        size: 15,
        showVectors: true,
      },
      {
        id: "pulsar2",
        position: { x: 415, y: 400 },
        velocity: { x: 0, y: -40 }, // Opposite velocity for counter-rotation
        mass: 5000,
        elasticity: 1,
        color: "#ff00ff",
        size: 15,
        showVectors: true,
      },
    ],
  },
};
