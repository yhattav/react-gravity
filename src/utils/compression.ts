import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { Scenario, ScenarioData } from "../types/scenario";
import { SerializableGravityPoint } from "./types/physics";
import { SerializableParticle } from "../types/particle";

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
  ].join("|");
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
  ].join("|");
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
  ] = str.split("|");

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
  };
};

const demodGravityPoint = (str: string): SerializableGravityPoint => {
  const [x, y, label, mass] = str.split("|");
  return {
    x: Number(x),
    y: Number(y),
    label,
    mass: Number(mass),
  };
};

const demodParticle = (str: string): SerializableParticle => {
  const [id, px, py, vx, vy, mass, elasticity, color, size, showVectors] =
    str.split("|");
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

export const modulateScenario = (scenario: Scenario): string => {
  const parts = [
    scenario.id,
    scenario.name,
    scenario.description,
    modSettings(scenario.data.settings),
    scenario.data.gravityPoints?.map(modGravityPoint).join("\u0001"),
    scenario.data.particles?.map(modParticle).join("\u0001"),
  ];
  return parts.join("\u0001\u0001");
};

export const demodulateScenario = (str: string): Scenario | null => {
  try {
    const [id, name, description, settings, gravityPoints, particles] =
      str.split("\u0001\u0001");

    return {
      id,
      name,
      description,
      data: {
        settings: demodSettings(settings),
        gravityPoints: gravityPoints
          ? gravityPoints.split("\u0001").map(demodGravityPoint)
          : undefined,
        particles: particles
          ? particles.split("\u0001").map(demodParticle)
          : undefined,
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
