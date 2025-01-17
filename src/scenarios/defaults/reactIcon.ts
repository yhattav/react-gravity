import { Scenario } from "../../types/scenario";

export const reactIcon: Scenario = {
  id: "react-icon",
  name: "React Icon",
  description: "A miniature React logo simulation",
  data: {
    settings: {
      NEW_PARTICLE_MASS: 0.016,
      NEW_PARTICLE_ELASTICITY: 1,
      FRICTION: 1,
      DELTA_TIME: 0.016666,
      POINTER_MASS: 0,
      SHOW_VELOCITY_ARROWS: false,
      SHOW_FORCE_ARROWS: false,
      CONSTANT_FORCE: { x: 0, y: 0 },
      SOLID_BOUNDARIES: false,
      PARTICLES_EXERT_GRAVITY: false,
      SHOW_D3_GRAVITY_VISION: false,
    },
    gravityPoints: [
      {
        position: { x: 25, y: 25 },
        label: "Nucleus",
        mass: 100000,
        id: "nucleus",
      },
    ],
    particles: [
      {
        id: "electron-1",
        position: { x: 45, y: 25 },
        velocity: { x: 0, y: -30 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 4,
        showVectors: false,
      },
      {
        id: "electron-2",
        position: { x: 15, y: 42 },
        velocity: { x: 26, y: 15 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 4,
        showVectors: false,
      },
      {
        id: "electron-3",
        position: { x: 15, y: 8 },
        velocity: { x: 26, y: -15 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 4,
        showVectors: false,
      },
    ],
  },
};
