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
      SOLID_BOUNDARIES: false,
      PARTICLES_EXERT_GRAVITY: false,
    },
    gravityPoints: [
      {
        x: 275,
        y: 300,
        label: "Nucleus",
        mass: 800000,
        color: "#61dafb",
      },
    ],
    particles: [
      {
        id: "electron-1",
        position: { x: 327.1090878601779, y: 308.19363950007363 },
        velocity: { x: -51.06975523070216, y: -127.73897999102888 },
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 8,
        showVectors: false,
      },
      {
        id: "electron-2",
        position: { x: 250, y: 350 }, // Bottom electron
        velocity: { x: 136, y: -30 }, // Rotated 120 degrees
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 8,
        showVectors: false,
      },
      {
        id: "electron-3",
        position: { x: 250, y: 250 }, // Top electron
        velocity: { x: -85, y: -110 }, // Rotated 240 degrees
        mass: 0.016,
        elasticity: 1,
        color: "#61dafb",
        size: 8,
        showVectors: false,
      },
    ],
  },
};
