import { Scenario } from "../../types/scenario";

export const orbitalDance: Scenario = {
  id: "orbital-dance",
  name: "Orbital Dance",
  description:
    "A delicate balance of five stars creating a mesmerizing orbital pattern",
  data: {
    settings: {
      NEW_PARTICLE_MASS: 0.01,
      NEW_PARTICLE_ELASTICITY: 0.8,
      FRICTION: 0.999,
      DELTA_TIME: 0.0166666666666667,
      POINTER_MASS: 250000,
      SHOW_VELOCITY_ARROWS: false,
      SHOW_FORCE_ARROWS: false,
      CONSTANT_FORCE: { x: 0, y: 0 },
      SOLID_BOUNDARIES: true,
    },
    gravityPoints: [
      {
        position: { x: 500, y: 400 },
        label: "Center",
        mass: 80000,
        id: "center-star",
      },
      {
        position: { x: 300, y: 400 },
        label: "Orbit 1",
        mass: 15000,
        id: "orbit-1",
      },
      {
        position: { x: 700, y: 400 },
        label: "Orbit 2",
        mass: 15000,
        id: "orbit-2",
      },
      {
        position: { x: 500, y: 200 },
        label: "Orbit 3",
        mass: 15000,
        id: "orbit-3",
      },
      {
        position: { x: 500, y: 600 },
        label: "Orbit 4",
        mass: 15000,
        id: "orbit-4",
      },
    ],
    particles: [
      {
        id: "p1",
        position: { x: 400, y: 300 },
        velocity: { x: 80, y: 40 },
        mass: 0.01,
        elasticity: 0.8,
        color: "rgb(255, 217, 61, 0.7)",
        size: 8,
        showVectors: true,
      },
    ],
  },
};
