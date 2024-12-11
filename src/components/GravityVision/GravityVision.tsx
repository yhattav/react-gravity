import React, { useEffect, useRef } from "react";
import paper from "paper";
import { GravityPoint } from "../../utils/types/physics";
import { Particle } from "../../types/particle";
import { calculateTotalForce } from "../../utils/physics/physicsUtils";
import { PhysicsSettings } from "../../constants/physics";
import { Position } from "@yhattav/react-component-cursor";
import { Point } from "paper/dist/paper-core";

interface GravityVisionProps {
  gravityPoints: GravityPoint[];
  particles: Particle[];
  pointerPos: Position | null;
  settings: PhysicsSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  simulatorId: string;
}

export const GravityVision: React.FC<GravityVisionProps> = ({
  gravityPoints,
  particles,
  pointerPos,
  settings,
  containerRef,
  simulatorId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperScopeRef = useRef<paper.PaperScope>();

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize Paper.js
    const canvas = canvasRef.current;
    const scope = new paper.PaperScope();
    paperScopeRef.current = scope;

    // Set up canvas dimensions
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const pixelRatio = 1;

    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;

    // Setup with explicit scope
    scope.setup(canvas);
    scope.view.viewSize = new scope.Size(rect.width, rect.height);
    scope.view.scale(pixelRatio, pixelRatio);

    return () => {
      if (paperScopeRef.current) {
        paperScopeRef.current.project.clear();
      }
    };
  }, []);

  useEffect(() => {
    if (
      !paperScopeRef.current ||
      !containerRef.current ||
      !settings.SHOW_GRAVITY_VISION
    )
      return;

    const scope = paperScopeRef.current;
    scope.activate();

    const { width, height } = containerRef.current.getBoundingClientRect();

    // Clear previous content
    scope.project.clear();

    // Create grid
    const cellSize = Math.min(width, height) / settings.GRAVITY_GRID_DENSITY;
    const rows = Math.ceil(height / cellSize);
    const cols = Math.ceil(width / cellSize);

    // Create grid points
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const x = j * cellSize;
        const y = i * cellSize;
        const point = new scope.Point(x, y);

        // Calculate gravity force at this point
        const force = calculateTotalForce(
          new Point({ x, y }),
          new Point({ x: pointerPos?.x || 0, y: pointerPos?.y || 0 }),
          gravityPoints,
          settings.POINTER_MASS,
          settings.PARTICLES_EXERT_GRAVITY ? particles : [],
          settings.PARTICLES_EXERT_GRAVITY
        );

        // Calculate displacement based on force
        const displacement = new scope.Point(
          force.x * 0.00001, // Adjust these multipliers to control the effect strength
          force.y * 0.00001
        );

        // Create path segment
        if (i < rows && j < cols) {
          const path = new scope.Path();
          path.strokeColor = new scope.Color(1, 1, 1, 0.1);
          path.strokeWidth = 1;

          // Add the four points of the grid cell with displacement
          path.add(point.add(displacement));
          path.add(new scope.Point(x + cellSize, y).add(displacement));
          path.add(
            new scope.Point(x + cellSize, y + cellSize).add(displacement)
          );
          path.add(new scope.Point(x, y + cellSize).add(displacement));
          path.closed = true;
        }
      }
    }

    scope.view.update();
  }, [
    gravityPoints,
    containerRef,
    particles,
    pointerPos,
    settings.SHOW_GRAVITY_VISION,
    settings.GRAVITY_GRID_DENSITY,
    settings.PARTICLES_EXERT_GRAVITY,
    settings.POINTER_MASS,
  ]);

  if (!settings.SHOW_GRAVITY_VISION) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      id={`gravity-vision-${simulatorId}`}
    />
  );
};
