import { Scenario } from "../../types/scenario";

export const react: Scenario = {
  id: "react-atom",
  name: "React",
  description:
    "A particle orbiting in an electron-like pattern, mimicking the React logo",
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
        x: 275,
        y: 300,
        label: "Nucleus",
        mass: 100000,
      },
    ],
    particles: [
      {
        id: "electron-1",
        position: { x: 295, y: 300 },
        velocity: { x: 0, y: -30 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 4,
        showVectors: false,
      },
      {
        id: "electron-2",
        position: { x: 265, y: 317 },
        velocity: { x: 26, y: 15 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 4,
        showVectors: false,
      },
      {
        id: "electron-3",
        position: { x: 265, y: 283 },
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
