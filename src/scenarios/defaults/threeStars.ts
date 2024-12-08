import { Scenario } from "../../types/scenario";

export const threeStars: Scenario = {
  id: "three-stars",
  name: "Three Stars",
  description: "A classic setup with three stars of different masses",
  data: {
    settings: {
      NEW_PARTICLE_MASS: 0.01,
      NEW_PARTICLE_ELASTICITY: 0.8,
      FRICTION: 0.999,
      DELTA_TIME: 0.0166666666666667,
      POINTER_MASS: 250000,
      SHOW_VELOCITY_ARROWS: false,
      SHOW_FORCE_ARROWS: false,
      CONSTANT_FORCE_X: 0,
      CONSTANT_FORCE_Y: 0,
      SOLID_BOUNDARIES: true,
    },
    gravityPoints: [
      {
        x: 700,
        y: 700,
        label: "Heavy",
        mass: 50000,
        color: "#FF6B6B",
      },
      {
        x: 500,
        y: 150,
        label: "Medium",
        mass: 30000,
        color: "#4ECDC4",
      },
      {
        x: 350,
        y: 250,
        label: "Light",
        mass: 10000,
        color: "#45B7D1",
      },
    ],
    particles: [
      {
        id: "eq1yy5csv",
        position: { x: 733.57230867967, y: 139.49931883490225 },
        velocity: { x: 113.91853909196708, y: 53.684561005581706 },
        mass: 0.01,
        elasticity: 0.8,
        color: "rgb(224, 192, 198)",
        size: 10,
        showVectors: true,
      },
    ],
  },
};
