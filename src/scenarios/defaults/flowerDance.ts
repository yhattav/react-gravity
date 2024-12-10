import { Scenario } from "../../types/scenario";

export const flowerDance: Scenario = {
  id: "flower-dance",
  name: "Flower Dance",
  description:
    "A brown dwarf star with orbiting particles creating a mesmerizing flower pattern",
  data: {
    settings: {
      NEW_PARTICLE_MASS: 0.001,
      NEW_PARTICLE_ELASTICITY: 0.8,
      FRICTION: 1,
      DELTA_TIME: 0.0166666666666667,
      POINTER_MASS: 0,
      SHOW_VELOCITY_ARROWS: false,
      SHOW_FORCE_ARROWS: false,
      CONSTANT_FORCE: { x: 0, y: 0 },
      SOLID_BOUNDARIES: true,
    },
    gravityPoints: [
      {
        x: 466,
        y: 403,
        label: "Brown Dwarf",
        mass: 600302.2939903878,
      },
    ],
    particles: [
      {
        id: "bejosl0t2",
        position: { x: 465.62979272714, y: 463.9360911309487 },
        velocity: { x: -142.0758733784827, y: -390.82192646863973 },
        mass: 0.001,
        elasticity: 0.8,
        color: "rgb(181, 200, 185)",
        size: 10,
        showVectors: true,
      },
      {
        id: "map6ka2c6",
        position: { x: 463.9837238243995, y: 465.0528975472681 },
        velocity: { x: 67.26062544328882, y: -511.96055162656444 },
        mass: 0.001,
        elasticity: 0.8,
        color: "rgb(241, 210, 187)",
        size: 10,
        showVectors: true,
      },
      {
        id: "ux4mcjfe9",
        position: { x: 482.21092798388753, y: 439.45951264010336 },
        velocity: { x: -422.9999020984984, y: -1375.4869161495026 },
        mass: 0.001,
        elasticity: 0.8,
        color: "rgb(223, 241, 247)",
        size: 10,
        showVectors: true,
      },
    ],
  },
};
