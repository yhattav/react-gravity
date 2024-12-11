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

    // Create horizontal lines
    for (let i = 0; i <= rows; i++) {
      const path = new scope.Path();
      path.strokeColor = new scope.Color(1, 1, 1, 0.1);
      path.strokeWidth = 1;

      // Add points along the horizontal line
      for (let j = 0; j <= cols; j++) {
        const x = j * cellSize;
        const y = i * cellSize;

        // Calculate combined displacement from all gravity points
        let totalDisplacementX = 0;
        let totalDisplacementY = 0;

        gravityPoints.forEach((gravityPoint) => {
          const pointPos = gravityPoint.position;
          const dx = x - pointPos.x;
          const dy = y - pointPos.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.max(Math.sqrt(distSq), 1);

          const strength = 100;
          const falloff = 200;
          const massScale = gravityPoint.mass / 1000000; // Normalize to our test mass

          totalDisplacementX +=
            (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
          totalDisplacementY +=
            (dy / dist) * strength * massScale * Math.exp(-dist / falloff);
        });

        // Add pointer influence if it exists
        if (pointerPos) {
          const strength = 200;
          const falloff = 400;
          const massScale = settings.POINTER_MASS / 1000000;

          const dx = x - (pointerPos.x || 0);
          const dy = y - (pointerPos.y || 0);
          const distSq = dx * dx + dy * dy;
          const dist = Math.max(Math.sqrt(distSq), 1);

          totalDisplacementX +=
            (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
          totalDisplacementY +=
            (dy / dist) * strength * massScale * Math.exp(-dist / falloff);
        }

        // Add particles if they exert gravity
        if (settings.PARTICLES_EXERT_GRAVITY) {
          particles.forEach((particle) => {
            const dx = x - particle.position.x;
            const dy = y - particle.position.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.max(Math.sqrt(distSq), 1);

            const strength = 200;
            const falloff = 400;
            const massScale = particle.mass / 1000000;

            totalDisplacementX +=
              (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
            totalDisplacementY +=
              (dy / dist) * strength * massScale * Math.exp(-dist / falloff);
          });
        }

        const displacement = new scope.Point(
          totalDisplacementX,
          totalDisplacementY
        );

        path.add(new scope.Point(x, y).add(displacement));
      }
    }

    // Create vertical lines
    for (let j = 0; j <= cols; j++) {
      const path = new scope.Path();
      path.strokeColor = new scope.Color(1, 1, 1, 0.1);
      path.strokeWidth = 1;

      // Add points along the vertical line
      for (let i = 0; i <= rows; i++) {
        const x = j * cellSize;
        const y = i * cellSize;

        // Calculate combined displacement from all gravity points
        let totalDisplacementX = 0;
        let totalDisplacementY = 0;

        gravityPoints.forEach((gravityPoint) => {
          const pointPos = gravityPoint.position;
          const dx = x - pointPos.x;
          const dy = y - pointPos.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.max(Math.sqrt(distSq), 1);

          const strength = 200;
          const falloff = 400;
          const massScale = gravityPoint.mass / 1000000; // Normalize to our test mass

          totalDisplacementX +=
            (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
          totalDisplacementY +=
            (dy / dist) * strength * massScale * Math.exp(-dist / falloff);
        });

        // Add pointer influence if it exists
        if (pointerPos) {
          const strength = 200;
          const falloff = 400;
          const massScale = settings.POINTER_MASS / 1000000;

          const dx = x - (pointerPos.x || 0);
          const dy = y - (pointerPos.y || 0);
          const distSq = dx * dx + dy * dy;
          const dist = Math.max(Math.sqrt(distSq), 1);

          totalDisplacementX +=
            (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
          totalDisplacementY +=
            (dy / dist) * strength * massScale * Math.exp(-dist / falloff);
        }

        // Add particles if they exert gravity
        if (settings.PARTICLES_EXERT_GRAVITY) {
          particles.forEach((particle) => {
            const dx = x - particle.position.x;
            const dy = y - particle.position.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.max(Math.sqrt(distSq), 1);

            const strength = 200;
            const falloff = 400;
            const massScale = particle.mass / 1000000;

            totalDisplacementX +=
              (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
            totalDisplacementY +=
              (dy / dist) * strength * massScale * Math.exp(-dist / falloff);
          });
        }

        const displacement = new scope.Point(
          totalDisplacementX,
          totalDisplacementY
        );

        path.add(new scope.Point(x, y).add(displacement));
      }
    }

    scope.view.update();
  }, [
    gravityPoints,
    particles,
    pointerPos,
    settings.SHOW_GRAVITY_VISION,
    settings.GRAVITY_GRID_DENSITY,
    settings.PARTICLES_EXERT_GRAVITY,
    settings.POINTER_MASS,
    containerRef,
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
