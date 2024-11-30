import { Scenario } from "../../types/scenario";

export const orbit: Scenario = {
  id: "orbit",
  name: "Orbit",
  description:
    "A perfect orbital system with a moon orbiting a planet that orbits a star",
  data: {
    settings: {
      NEW_PARTICLE_MASS: 0.01,
      NEW_PARTICLE_ELASTICITY: 0.8,
      FRICTION: 1,
      DELTA_TIME: 0.0166666666666667,
      POINTER_MASS: 0,
      SHOW_VELOCITY_ARROWS: true,
      SHOW_FORCE_ARROWS: true,
      CONSTANT_FORCE_X: 0,
      CONSTANT_FORCE_Y: 0,
      SOLID_BOUNDARIES: true,
      PARTICLES_EXERT_GRAVITY: true,
    },
    gravityPoints: [
      {
        x: 700,
        y: 400,
        label: "Central Star",
        mass: 1300000,
      },
    ],
    particles: [
      {
        id: "planet",
        position: { x: 700, y: 100 },
        velocity: { x: 20, y: 0 }, // Calculated for circular orbit
        mass: 1,
        elasticity: 0.8,
        color: "rgb(100, 149, 237, 0.8)",
        size: 15,
        showVectors: true,
      },
      {
        id: "moon",
        position: { x: 700, y: 201 },
        velocity: { x: 220, y: 0 }, // Additional velocity to orbit the planet
        mass: 0.01,
        elasticity: 0.8,
        color: "rgb(169, 169, 169, 0.8)",
        size: 8,
        showVectors: true,
      },
    ],
  },
};
