export const galaxyCollision: Scenario = {
  id: "galaxy-collision",
  name: "Galaxy Collision",
  description:
    "Two star clusters on a collision course, creating chaos and beauty",
  data: {
    settings: {
      NEW_PARTICLE_MASS: 0.01,
      NEW_PARTICLE_ELASTICITY: 0.8,
      FRICTION: 0.999,
      DELTA_TIME: 0.0166666666666667,
      POINTER_MASS: 250000,
      SHOW_VELOCITY_ARROWS: true,
      SHOW_FORCE_ARROWS: false,
      CONSTANT_FORCE: { x: 0, y: 0 },
      SOLID_BOUNDARIES: true,
    },
    gravityPoints: [
      // First galaxy
      {
        x: 200,
        y: 200,
        label: "Galaxy 1 Core",
        mass: 100000,
        color: "#FF6B6B",
      },
      {
        x: 250,
        y: 150,
        label: "Star 1",
        mass: 20000,
        color: "#FF8E8E",
      },
      {
        x: 150,
        y: 250,
        label: "Star 2",
        mass: 20000,
        color: "#FF8E8E",
      },
      // Second galaxy
      {
        x: 800,
        y: 600,
        label: "Galaxy 2 Core",
        mass: 100000,
        color: "#4ECDC4",
      },
      {
        x: 750,
        y: 650,
        label: "Star 3",
        mass: 20000,
        color: "#6BE5DC",
      },
      {
        x: 850,
        y: 550,
        label: "Star 4",
        mass: 20000,
        color: "#6BE5DC",
      },
    ],
    particles: [
      {
        id: "p1",
        position: { x: 300, y: 300 },
        velocity: { x: 40, y: 20 },
        mass: 0.01,
        elasticity: 0.8,
        color: "rgb(255, 107, 107, 0.7)",
        size: 8,
        showVectors: true,
      },
      {
        id: "p2",
        position: { x: 700, y: 500 },
        velocity: { x: -30, y: -15 },
        mass: 0.01,
        elasticity: 0.8,
        color: "rgb(78, 205, 196, 0.7)",
        size: 8,
        showVectors: true,
      },
    ],
  },
};
