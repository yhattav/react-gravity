import React, { useEffect, useRef } from "react";
import paper from "paper";
import { WarpPoint } from "../../utils/types/physics";
import { PhysicsSettings } from "../../constants/physics";

interface GravityVisionProps {
  warpPoints: WarpPoint[];
  settings: PhysicsSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  simulatorId: string;
}

export const GravityVision: React.FC<GravityVisionProps> = ({
  warpPoints,
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

    // Create horizontal and vertical lines with displacement
    const createGridLines = (isHorizontal: boolean) => {
      const outerLoop = isHorizontal ? rows : cols;
      const innerLoop = isHorizontal ? cols : rows;

      for (let i = 0; i <= outerLoop; i++) {
        const path = new scope.Path();
        path.strokeColor = new scope.Color(1, 1, 1, 0.1);
        path.strokeWidth = 1;

        for (let j = 0; j <= innerLoop; j++) {
          const x = isHorizontal ? j * cellSize : i * cellSize;
          const y = isHorizontal ? i * cellSize : j * cellSize;

          let totalDisplacementX = 0;
          let totalDisplacementY = 0;

          // Calculate displacement from all warp points
          warpPoints.forEach((warpPoint) => {
            const dx = x - warpPoint.position.x;
            const dy = y - warpPoint.position.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.max(Math.sqrt(distSq), 1);

            const strength = 200;
            const falloff = 400;
            const massScale = warpPoint.effectiveMass / 1000000;

            totalDisplacementX -=
              (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
            totalDisplacementY -=
              (dy / dist) * strength * massScale * Math.exp(-dist / falloff);
          });

          const displacement = new scope.Point(
            totalDisplacementX,
            totalDisplacementY
          );

          path.add(new scope.Point(x, y).add(displacement));
        }
      }
    };

    // Create both horizontal and vertical lines
    createGridLines(true);
    createGridLines(false);

    scope.view.update();
  }, [
    warpPoints,
    settings.SHOW_GRAVITY_VISION,
    settings.GRAVITY_GRID_DENSITY,
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
