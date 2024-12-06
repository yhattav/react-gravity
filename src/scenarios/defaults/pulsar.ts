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
      SHOW_VELOCITY_ARROWS: false,
      SHOW_FORCE_ARROWS: false,
      CONSTANT_FORCE_X: 0,
      CONSTANT_FORCE_Y: 0,
      SOLID_BOUNDARIES: true,
      PARTICLES_EXERT_GRAVITY: true,
    },
    gravityPoints: [],
    particles: [
      {
        id: "pulsar1",
        position: { x: 220, y: 200 },
        velocity: { x: 0, y: 80 },
        mass: 1,
        outgoingForceRatio: 600000000, // Will exert force as if mass was 30000
        elasticity: 1,
        color: "#00ffff",
        size: 15,
        showVectors: true,
      },
      {
        id: "pulsar2",
        position: { x: 200, y: 200 },
        velocity: { x: 0, y: -80 },
        mass: 1,
        outgoingForceRatio: 600000000, // Will exert force as if mass was 30000
        elasticity: 1,
        color: "#ff00ff",
        size: 15,
        showVectors: true,
      },
    ],
  },
};
