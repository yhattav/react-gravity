import { Path, Point, Segment } from "paper";
import { Vector, SerializablePath } from "./physics";

// Represents a point in a path with optional curve data
export interface PathPoint {
  x: number;
  y: number;
  handleIn?: { x: number; y: number }; // Control point for curves coming in
  handleOut?: { x: number; y: number }; // Control point for curves going out
}

// The serializable version of a SimulatorPath
export interface SerializableSimulatorPath {
  id: string;
  points: PathPoint[];
  closed: boolean;
  position: { x: number; y: number }; // Center/reference point
  label: string;
  mass: number;
  // Additional styling properties
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
}

// The runtime version using Paper.js objects
export interface SimulatorPath {
  id: string;
  path: SerializablePath; // Paper.js Path object
  position: Vector; // Center/reference point as Paper.js Point
  label: string;
  mass: number;
}

// Conversion functions
export const toSimulatorPath = (
  serialized: SerializableSimulatorPath
): SimulatorPath => {
  // Create a new Paper.js path
  const path = new Path({
    segments: serialized.points.map((point) => {
      return new Segment(
        new Point(point.x, point.y),
        point.handleIn ? new Point(point.handleIn) : undefined,
        point.handleOut ? new Point(point.handleOut) : undefined
      );
    }),
    closed: serialized.closed,
    strokeColor: serialized.strokeColor || "#ff0000",
    fillColor: serialized.fillColor,
    strokeWidth: serialized.strokeWidth || 5,
    opacity: serialized.opacity || 1,
  });

  // Debug: Log the created path
  console.log("Created path:", {
    segments: path.segments.length,
    visible: path.visible,
    strokeColor: path.strokeColor,
  });

  return {
    id: serialized.id || Math.random().toString(36).substr(2, 9),
    path,
    position: new Point(serialized.position),
    label: serialized.label,
    mass: serialized.mass,
  };
};

export const toSerializableSimulatorPath = (
  simulatorPath: SimulatorPath
): SerializableSimulatorPath => {
  const points: PathPoint[] = simulatorPath.path.segments.map((segment) => ({
    x: segment.point.x,
    y: segment.point.y,
    handleIn: segment.handleIn
      ? { x: segment.handleIn.x, y: segment.handleIn.y }
      : undefined,
    handleOut: segment.handleOut
      ? { x: segment.handleOut.x, y: segment.handleOut.y }
      : undefined,
  }));

  return {
    id: simulatorPath.id,
    points,
    closed: simulatorPath.path.closed,
    position: { x: simulatorPath.position.x, y: simulatorPath.position.y },
    label: simulatorPath.label,
    mass: simulatorPath.mass,
    strokeColor: simulatorPath.path.strokeColor?.toCSS(true),
    fillColor: simulatorPath.path.fillColor?.toCSS(true),
    strokeWidth: simulatorPath.path.strokeWidth,
    opacity: simulatorPath.path.opacity,
  };
};

// Helper functions to create common shapes
export const createCirclePath = (
  center: Vector,
  radius: number,
  label: string,
  mass: number
): SerializableSimulatorPath => {
  const points: PathPoint[] = [];
  const segments = 4; // For a circle, we need 4 segments with handles

  for (let i = 0; i < segments; i++) {
    const angle = ((i * 360) / segments) * (Math.PI / 180);
    const handleLength = radius * 0.552284749831; // Magic number for perfect circle

    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
      handleIn: {
        x: -handleLength * Math.sin(angle),
        y: handleLength * Math.cos(angle),
      },
      handleOut: {
        x: handleLength * Math.sin(angle),
        y: -handleLength * Math.cos(angle),
      },
    });
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    points,
    closed: true,
    position: { x: center.x, y: center.y },
    label,
    mass,
    strokeColor: "#ffffff",
    fillColor: "rgba(255, 255, 255, 0.1)",
  };
};

export const createRectanglePath = (
  topLeft: Vector,
  width: number,
  height: number,
  label: string,
  mass: number
): SerializableSimulatorPath => {
  const center = new Point(topLeft.x + width / 2, topLeft.y + height / 2);

  return {
    id: Math.random().toString(36).substr(2, 9),
    points: [
      { x: topLeft.x, y: topLeft.y },
      { x: topLeft.x + width, y: topLeft.y },
      { x: topLeft.x + width, y: topLeft.y + height },
      { x: topLeft.x, y: topLeft.y + height },
    ],
    closed: true,
    position: { x: center.x, y: center.y },
    label,
    mass,
    strokeColor: "#ffffff",
    fillColor: "rgba(255, 255, 255, 0.1)",
  };
};
