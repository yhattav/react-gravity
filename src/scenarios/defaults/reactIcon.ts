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
      CONSTANT_FORCE_X: 0,
      CONSTANT_FORCE_Y: 0,
      SOLID_BOUNDARIES: true,
      PARTICLES_EXERT_GRAVITY: false,
    },
    gravityPoints: [
      {
        x: 25,
        y: 25,
        label: "Nucleus",
        mass: 100000,
        color: "#61dafb",
      },
    ],
    particles: [
      {
        id: "electron-1",
        position: { x: 35, y: 25 },
        velocity: { x: 0, y: -15 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 2,
        showVectors: false,
      },
      {
        id: "electron-2",
        position: { x: 20, y: 33 },
        velocity: { x: 13, y: 7.5 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 2,
        showVectors: false,
      },
      {
        id: "electron-3",
        position: { x: 20, y: 17 },
        velocity: { x: 13, y: -7.5 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 2,
        showVectors: false,
      },
    ],
  },
};
