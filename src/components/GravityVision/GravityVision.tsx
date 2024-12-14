import React, { useEffect, useRef } from "react";
import Paper from "paper";
import { Vector, WarpPoint } from "../../utils/types/physics";
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
  const isInitializedRef = useRef(false);

  // Initialize Paper.js scope
  useEffect(() => {
    if (isInitializedRef.current || !canvasRef.current || !containerRef.current)
      return;

    console.log("GravityVision initializing new scope");

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
      scope.activate();
      const newRect = container.getBoundingClientRect();
      canvasRef.current.width = newRect.width * pixelRatio;
      canvasRef.current.height = newRect.height * pixelRatio;
      scope.view.viewSize = new scope.Size(newRect.width, newRect.height);
    };

    window.addEventListener("resize", handleResize);
    isInitializedRef.current = true;

    return () => {
      console.log("GravityVision cleanup");
      window.removeEventListener("resize", handleResize);
      if (scope && scope.project) {
        scope.activate();
        scope.project.clear();
      }
      isInitializedRef.current = false;
    };
  }, [containerRef]);

  // Update grid
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || !scope.project || !containerRef.current) {
      console.log("GravityVision missing requirements:", {
        hasScope: !!scope,
        hasProject: !!scope?.project,
        hasContainer: !!containerRef.current,
      });
      return;
    }

    console.log("GravityVision drawing grid:", {
      showGravityVision: settings.SHOW_GRAVITY_VISION,
      warpPoints: warpPoints.length,
    });

    scope.activate();
    scope.project.activeLayer.removeChildren();

    if (!settings.SHOW_GRAVITY_VISION) {
      scope.view.update();
      return;
    }

    const { width, height } = containerRef.current.getBoundingClientRect();

    // Create grid
    const cellSize = Math.min(width, height) / settings.GRAVITY_GRID_DENSITY;
    const rows = Math.ceil(height / cellSize);
    const cols = Math.ceil(width / cellSize);

    // Calculate average mass only if there are warp points
    const averageEffectiveMass =
      warpPoints.length > 0
        ? warpPoints.reduce(
            (sum, point) => sum + Math.abs(point.effectiveMass),
            0
          ) / warpPoints.length
        : 1;

    const createGridLines = (isHorizontal: boolean) => {
      const outerLoop = isHorizontal ? rows : cols;
      const innerLoop = isHorizontal ? cols : rows;

      // If no warp points, create straight grid lines
      if (warpPoints.length === 0) {
        for (let i = 0; i <= outerLoop; i++) {
          const path = new scope.Path();
          path.strokeColor = new scope.Color(1, 1, 1, 0.1);
          path.strokeWidth = 1;

          if (isHorizontal) {
            path.moveTo(new scope.Point(0, i * cellSize));
            path.lineTo(new scope.Point(width, i * cellSize));
          } else {
            path.moveTo(new scope.Point(i * cellSize, 0));
            path.lineTo(new scope.Point(i * cellSize, height));
          }
        }
        return;
      }

      // Create horizontal and vertical lines with displacement
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
          let killer: Vector | null = null;

          // Calculate displacement from all warp points
          warpPoints.forEach((warpPoint) => {
            const dx = x - warpPoint.position.x;
            const dy = y - warpPoint.position.y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

            const strength = 200;
            const falloff = 20;
            const massScale = warpPoint.effectiveMass / averageEffectiveMass;

            let displacementX =
              (dx / dist) * strength * massScale * Math.exp(-dist / falloff);
            let displacementY =
              (dy / dist) * strength * massScale * Math.exp(-dist / falloff);

            if (Math.abs(displacementX) > Math.abs(dx)) {
              displacementX = dx;
              killer = warpPoint.position;
            }
            if (Math.abs(displacementY) > Math.abs(dy)) {
              displacementY = dy;
              killer = warpPoint.position;
            }

            totalDisplacementX -= displacementX;
            totalDisplacementY -= displacementY;
          });

          points.push(
            killer
              ? new scope.Point(killer.x, killer.y)
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

    scope.view.update();
  }, [
    warpPoints,
    settings.SHOW_GRAVITY_VISION,
    settings.GRAVITY_GRID_DENSITY,
    containerRef,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`gravity-vision-${simulatorId}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: settings.SHOW_GRAVITY_VISION ? 1 : 0,
      }}
    />
  );
};
