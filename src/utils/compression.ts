import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { Scenario, ScenarioData } from "../types/scenario";
import { SerializableGravityPoint } from "./types/physics";
import { SerializableParticle } from "../types/particle";
import { SerializableSimulatorPath, PathPoint } from "../utils/types/path";

const SEPARATORS = ["\u0001", "\u0002", "\u0003", "|"] as const;

const modPathPoint = (point: PathPoint): string => {
  const string = `${point.x}|${point.y}`;
  if (!point.handleIn && !point.handleOut) return string;
  const handleInAddition =
    "|" +
    (point.handleIn
      ? `${point.handleIn.x || "0"}|${point.handleIn.y || "0"}`
      : "");
  const handleOutAddition =
    "|" +
    (point.handleOut
      ? `${point.handleOut.x || "0"}|${point.handleOut.y || "0"}`
      : "");
  return `${point.x}|${point.y}${handleInAddition}${handleOutAddition}`;
};

// Modulation helpers
const modSettings = (settings: ScenarioData["settings"]): string => {
  return [
    settings.NEW_PARTICLE_MASS,
    settings.NEW_PARTICLE_ELASTICITY,
    settings.FRICTION,
    settings.DELTA_TIME,
    settings.POINTER_MASS,
    settings.SHOW_VELOCITY_ARROWS ? 1 : 0,
    settings.SHOW_FORCE_ARROWS ? 1 : 0,
    settings.CONSTANT_FORCE?.x || 0,
    settings.CONSTANT_FORCE?.y || 0,
    settings.SOLID_BOUNDARIES ? 1 : 0,
    settings.PARTICLES_EXERT_GRAVITY ? 1 : 0,
    settings.PARTICLE_TRAIL_LENGTH,
    settings.SHOW_GRAVITY_VISION ? 1 : 0,
    settings.GRAVITY_GRID_DENSITY,
  ].join(SEPARATORS[2]);
};

const modGravityPoint = (point: SerializableGravityPoint): string => {
  return `${point.x}|${point.y}|${point.label}|${point.mass}`;
};

const modParticle = (particle: SerializableParticle): string => {
  return [
    particle.id,
    particle.position.x,
    particle.position.y,
    particle.velocity.x,
    particle.velocity.y,
    particle.mass,
    particle.elasticity,
    particle.color,
    particle.size,
    particle.showVectors ? 1 : 0,
  ].join(SEPARATORS[2]);
};

const modPath = (path: SerializableSimulatorPath): string => {
  return [
    path.id,
    path.points.map(modPathPoint).join(SEPARATORS[1]),
    path.closed ? 1 : 0,
    path.position.x,
    path.position.y,
    path.label,
    path.mass,
    path.strokeColor,
    path.fillColor,
    path.strokeWidth,
    path.opacity,
  ].join(SEPARATORS[2]);
};

const demodSettings = (str: string): ScenarioData["settings"] => {
  const [
    mass,
    elasticity,
    friction,
    deltaTime,
    pointerMass,
    showVelocity,
    showForce,
    constantForceX,
    constantForceY,
    solidBoundaries,
    particlesExertGravity,
    particleTrailLength,
    showGravityVision,
    gravityGridDensity,
  ] = str.split(SEPARATORS[2]);

  return {
    NEW_PARTICLE_MASS: Number(mass),
    NEW_PARTICLE_ELASTICITY: Number(elasticity),
    FRICTION: Number(friction),
    DELTA_TIME: Number(deltaTime),
    POINTER_MASS: Number(pointerMass),
    SHOW_VELOCITY_ARROWS: showVelocity === "1",
    SHOW_FORCE_ARROWS: showForce === "1",
    CONSTANT_FORCE: {
      x: Number(constantForceX),
      y: Number(constantForceY),
    },
    SOLID_BOUNDARIES: solidBoundaries === "1",
    PARTICLES_EXERT_GRAVITY: particlesExertGravity === "1",
    PARTICLE_TRAIL_LENGTH: Number(particleTrailLength),
    SHOW_GRAVITY_VISION: showGravityVision === "1",
    GRAVITY_GRID_DENSITY: Number(gravityGridDensity),
  };
};

const demodGravityPoint = (str: string): SerializableGravityPoint => {
  const [x, y, label, mass] = str.split(SEPARATORS[2]);
  return {
    x: Number(x),
    y: Number(y),
    label,
    mass: Number(mass),
  };
};

const demodParticle = (str: string): SerializableParticle => {
  const [id, px, py, vx, vy, mass, elasticity, color, size, showVectors] =
    str.split(SEPARATORS[2]);
  return {
    id,
    position: { x: Number(px), y: Number(py) },
    velocity: { x: Number(vx), y: Number(vy) },
    mass: Number(mass),
    elasticity: Number(elasticity),
    color,
    size: Number(size),
    showVectors: showVectors === "1",
  };
};

const demodPath = (str: string): SerializableSimulatorPath => {
  const [
    id,
    pointsStr,
    closed,
    posX,
    posY,
    label,
    mass,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
  ] = str.split(SEPARATORS[2]);

  const points = pointsStr.split(SEPARATORS[1]).map((pointStr) => {
    const [x, y, handleInX, handleInY, handleOutX, handleOutY] = pointStr.split(
      SEPARATORS[3]
    );
    return {
      x: Number(x),
      y: Number(y),
      handleIn: handleInX
        ? { x: Number(handleInX), y: Number(handleInY) }
        : undefined,
      handleOut: handleOutX
        ? { x: Number(handleOutX), y: Number(handleOutY) }
        : undefined,
    };
  });
  console.log("demodPath", {
    id,
    points,
    closed: closed === "1",
    position: { x: Number(posX), y: Number(posY) },
    label,
    mass: Number(mass),
    strokeColor,
    ...(fillColor ? { fillColor } : {}),
    strokeWidth: strokeWidth ? Number(strokeWidth) : undefined,
    opacity: opacity ? Number(opacity) : undefined,
  });
  return {
    id,
    points,
    closed: closed === "1",
    position: { x: Number(posX), y: Number(posY) },
    label,
    mass: Number(mass),
    strokeColor,
    fillColor,
    strokeWidth: strokeWidth ? Number(strokeWidth) : undefined,
    opacity: opacity ? Number(opacity) : undefined,
  };
};

export const modulateScenario = (scenario: Scenario): string => {
  const parts = [
    scenario.id,
    scenario.name,
    scenario.description,
    modSettings(scenario.data.settings),
    scenario.data.gravityPoints?.map(modGravityPoint).join(SEPARATORS[0]),
    scenario.data.particles?.map(modParticle).join(SEPARATORS[0]),
    scenario.data.paths?.map(modPath).join(SEPARATORS[0]),
  ];
  return parts.join(SEPARATORS[0] + SEPARATORS[0]);
};

export const demodulateScenario = (str: string): Scenario | null => {
  try {
    const [id, name, description, settings, gravityPoints, particles, paths] =
      str.split(SEPARATORS[0] + SEPARATORS[0]);

    return {
      id,
      name,
      description,
      data: {
        settings: demodSettings(settings),
        gravityPoints: gravityPoints
          ? gravityPoints.split(SEPARATORS[0]).map(demodGravityPoint)
          : undefined,
        particles: particles
          ? particles.split(SEPARATORS[0]).map(demodParticle)
          : undefined,
        paths: paths ? paths.split(SEPARATORS[0]).map(demodPath) : undefined,
      },
    };
  } catch (e) {
    console.error("Failed to demodulate scenario:", e);
    return null;
  }
};

export const compressScenario = (scenario: Scenario): string => {
  const modulated = modulateScenario(scenario);
  return compressToEncodedURIComponent(modulated);
};

export const decompressScenario = (compressed: string): Scenario | null => {
  try {
    const modulated = decompressFromEncodedURIComponent(compressed);
    if (!modulated) return null;
    return demodulateScenario(modulated);
  } catch (e) {
    console.error("Failed to decompress scenario:", e);
    return null;
  }
};

export const createShareableLink = (scenario: Scenario): string => {
  const compressed = compressScenario(scenario);
  const basePath = window.location.pathname.replace(/\/$/, "");
  return `${window.location.origin}${basePath}?scenario=${compressed}`;
};
