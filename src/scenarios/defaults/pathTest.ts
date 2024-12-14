import { Scenario } from "../../types/scenario";
import { SerializableSimulatorPath } from "../../utils/types/path";

const createCurvedDiagonalPath = (): SerializableSimulatorPath => {
  return {
    id: "curved-diagonal",
    points: [
      {
        x: 100,
        y: 100,
        handleOut: { x: 100, y: 0 },
      },
      {
        x: 300,
        y: 300,
        handleIn: { x: -100, y: 0 },
        handleOut: { x: 100, y: 0 },
      },
      {
        x: 500,
        y: 500,
        handleIn: { x: -100, y: 0 },
      },
    ],
    closed: false,
    position: { x: 300, y: 300 },
    label: "Curved Path",
    mass: 50000,
    strokeColor: "#ff0000",
    strokeWidth: 5,
    opacity: 1,
  };
};

export const pathTest: Scenario = {
  id: "path-test",
  name: "Path Test",
  description:
    "A test scenario with a curved diagonal path that exerts gravity",
  data: {
    settings: {
      SHOW_VELOCITY_ARROWS: true,
      SHOW_FORCE_ARROWS: true,
      NEW_PARTICLE_MASS: 0.01,
      NEW_PARTICLE_ELASTICITY: 0.8,
      POINTER_MASS: 0,
      FRICTION: 1,
      PARTICLES_EXERT_GRAVITY: false,
      SOLID_BOUNDARIES: true,
    },
    gravityPoints: [],
    particles: [
      {
        id: "test-particle",
        position: { x: 50, y: 50 },
        velocity: { x: 3, y: 0 },
        mass: 0.1,
        elasticity: 0.8,
        color: "#ffffff",
        size: 5,
      },
    ],
    paths: [createCurvedDiagonalPath()],
  },
};
