import React, { useEffect, useRef } from "react";
import { Vector, WarpPoint } from "../../utils/types/physics";
import { PhysicsSettings } from "../../constants/physics";

interface GravityVisionProps {
  scope: paper.PaperScope;
  warpPoints: WarpPoint[];
  settings: PhysicsSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  simulatorId: string;
}

export const GravityVision: React.FC<GravityVisionProps> = ({
  scope,
  warpPoints,
  settings,
  containerRef,
  simulatorId,
}) => {
  const layerRef = useRef<paper.Layer | null>(null);

  // Update grid
  useEffect(() => {
    if (!scope || !containerRef.current || !settings.SHOW_GRAVITY_VISION)
      return;

    scope.activate();

    // Create or get our layer
    if (!layerRef.current) {
      layerRef.current = new scope.Layer();
    }

    const layer = layerRef.current;
    layer.removeChildren();

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
          layer.addChild(path);
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

        layer.addChild(path);
      }
    };

    // Create both horizontal and vertical lines
    createGridLines(true);
    createGridLines(false);

    scope.view.update();

    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [scope, warpPoints, settings, containerRef]);

  return null;
};
