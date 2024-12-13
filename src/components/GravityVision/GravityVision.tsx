import React, { useEffect, useRef } from "react";
import Paper from "paper";
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
  const scopeRef = useRef<paper.PaperScope>();

  // Initialize Paper.js scope
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Create a new Paper.js scope for this canvas
    const scope = new Paper.PaperScope();
    scopeRef.current = scope;

    // Get container dimensions
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const pixelRatio = 1;

    canvasRef.current.width = rect.width * pixelRatio;
    canvasRef.current.height = rect.height * pixelRatio;

    // Setup with explicit scope
    scope.setup(canvasRef.current);
    scope.view.viewSize = new scope.Size(rect.width, rect.height);
    scope.view.scale(pixelRatio, pixelRatio);

    const handleResize = () => {
      if (!container || !canvasRef.current || !scope.view) return;
      scope.activate(); // Activate this scope before operations
      const newRect = container.getBoundingClientRect();
      canvasRef.current.width = newRect.width * pixelRatio;
      canvasRef.current.height = newRect.height * pixelRatio;
      scope.view.viewSize = new scope.Size(newRect.width, newRect.height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      scope.activate();
      scope.project?.clear();
    };
  }, [simulatorId]); // Add simulatorId dependency like other components

  // Update grid
  useEffect(() => {
    const scope = scopeRef.current;
    if (
      !scope ||
      !scope.project ||
      !containerRef.current ||
      !settings.SHOW_GRAVITY_VISION
    )
      return;

    scope.activate();

    const { width, height } = containerRef.current.getBoundingClientRect();

    // Clear previous content
    scope.project.activeLayer.removeChildren();

    // Create grid
    const cellSize = Math.min(width, height) / settings.GRAVITY_GRID_DENSITY;
    const rows = Math.ceil(height / cellSize);
    const cols = Math.ceil(width / cellSize);

    // Create horizontal and vertical lines with displacement
    const createGridLines = (isHorizontal: boolean) => {
      const outerLoop = isHorizontal ? rows : cols;
      const innerLoop = isHorizontal ? cols : rows;
      const averageEffectiveMass =
        warpPoints.length > 0
          ? warpPoints.reduce(
              (sum, point) => sum + Math.abs(point.effectiveMass),
              0
            ) / warpPoints.length
          : 1;

      for (let i = 0; i <= outerLoop; i++) {
        const path = new scope.Path();
        path.strokeColor = new scope.Color(1, 1, 1, 0.1);
        path.strokeWidth = 1;

        // Collect points first
        const points: paper.Point[] = [];
        for (let j = 0; j <= innerLoop; j++) {
          const x = isHorizontal ? j * cellSize : i * cellSize;
          const y = isHorizontal ? i * cellSize : j * cellSize;

          let totalDisplacementX = 0;
          let totalDisplacementY = 0;
          let killer: WarpPoint | null = null;

          // Calculate displacement from all warp points
          warpPoints.forEach((warpPoint) => {
            const dx = x - warpPoint.position.x;
            const dy = y - warpPoint.position.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.max(Math.sqrt(distSq), 1);

            const strength = 200;
            const falloff = 20;
            const massScale = warpPoint.effectiveMass / averageEffectiveMass;

            // Calculate displacement
            let displacementX =
              (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
            let displacementY =
              (dy / dist) * strength * massScale * Math.exp(-dist / falloff);

            // Clamp displacement to prevent crossing over the warp point
            if (Math.abs(displacementX) > Math.abs(dx)) {
              displacementX = dx;
              killer = warpPoint;
            }
            if (Math.abs(displacementY) > Math.abs(dy)) {
              displacementY = dy;
              killer = warpPoint;
            }

            totalDisplacementX -= displacementX;
            totalDisplacementY -= displacementY;
          });

          points.push(
            killer
              ? new scope.Point(
                  (killer as WarpPoint).position.x,
                  (killer as WarpPoint).position.y
                )
              : new scope.Point(x, y).add(
                  new scope.Point(totalDisplacementX, totalDisplacementY)
                )
          );
        }

        // Create a smooth path through the points
        path.moveTo(points[0]);
        for (let j = 1; j < points.length - 2; j++) {
          const current = points[j];
          const next = points[j + 1];
          const midPoint = current.add(next).divide(2);
          path.quadraticCurveTo(current, midPoint);
        }
        // Add the last two points
        if (points.length > 2) {
          path.quadraticCurveTo(
            points[points.length - 2],
            points[points.length - 1]
          );
        } else if (points.length === 2) {
          path.lineTo(points[1]);
        }
      }
    };

    // Create both horizontal and vertical lines
    createGridLines(true);
    createGridLines(false);

    scope.view.update(); // Use update instead of draw
  }, [
    warpPoints,
    settings.SHOW_GRAVITY_VISION,
    settings.GRAVITY_GRID_DENSITY,
    containerRef,
    simulatorId, // Add simulatorId dependency
  ]);

  if (!settings.SHOW_GRAVITY_VISION) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`gravity-vision-${simulatorId}`} // Use className instead of id
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};
