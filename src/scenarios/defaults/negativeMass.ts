import { Scenario } from "../../types/scenario";
import { DEFAULT_PHYSICS_CONFIG } from "../../constants/physics";

const centerX = 500;
const centerY = 400;
const ringRadius = 150;
const numStars = 12; // Using 12 stars for a balanced ring
const starMass = 30000;

// Create stars in a ring
const stars = Array.from({ length: numStars }).map((_, i) => {
  const angle = (i * 2 * Math.PI) / numStars;
  return {
    position: {
      x: centerX + ringRadius * Math.cos(angle),
      y: centerY + ringRadius * Math.sin(angle),
    },
    label: `Star ${i + 1}`,
    mass: starMass,
    id: `star-${i + 1}`,
  };
});

export const negativeMass: Scenario = {
  id: "negative-mass",
  name: "Negative Mass",
  description: "Watch how a negative mass particle behaves in a ring of stars",
  data: {
    settings: {
      ...DEFAULT_PHYSICS_CONFIG,
      NEW_PARTICLE_MASS: 0.1,
      NEW_PARTICLE_ELASTICITY: 0.8,
      FRICTION: 1,
      DELTA_TIME: 1 / 60,
      POINTER_MASS: 500000,
      SHOW_VELOCITY_ARROWS: true,
      SHOW_FORCE_ARROWS: true,
      CONSTANT_FORCE: { x: 0, y: 0 },
      SOLID_BOUNDARIES: true,
      PARTICLES_EXERT_GRAVITY: false,
    },
    gravityPoints: stars,
    particles: [
      {
        id: "negative-particle",
        position: { x: centerX + 100, y: centerY },
        velocity: { x: 0, y: 20 },
        mass: -0.01,
        elasticity: 0.8,
        color: "#FF69B4",
        size: 12,
        showVectors: true,
      },
    ],
  },
};
