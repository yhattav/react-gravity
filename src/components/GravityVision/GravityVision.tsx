import React, { useEffect, useRef } from "react";
import { Vector, WarpPoint } from "../../utils/types/physics";
import { PhysicsSettings } from "../../constants/physics";

interface GravityVisionProps {
  scope: paper.PaperScope;
  warpPoints: WarpPoint[];
  settings: PhysicsSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  isPausedRef: React.RefObject<boolean>;
}

interface GridLine {
  path: paper.Path;
  points: paper.Point[];
}

export const GravityVision: React.FC<GravityVisionProps> = ({
  scope,
  warpPoints,
  settings,
  containerRef,
  isPausedRef,
}) => {
  const layerRef = useRef<paper.Layer | null>(null);
  const gridLinesRef = useRef<{ horizontal: GridLine[]; vertical: GridLine[] }>(
    {
      horizontal: [],
      vertical: [],
    }
  );
  const lastDensityRef = useRef(settings.GRAVITY_GRID_DENSITY);
  const lastShowVisionRef = useRef(settings.SHOW_GRAVITY_VISION);
  const onFrameHandlerRef = useRef<((event: paper.Event) => void) | null>(null);
  const lastWarpPointsKeyRef = useRef<string>("");
  const averageEffectiveMassRef = useRef<number>(1);

  // Helper function to calculate average mass
  const calculateAverageMass = (points: WarpPoint[]): number => {
    const activePoints = points.filter((point) => point.effectiveMass > 0);
    return activePoints.length > 0
      ? activePoints.reduce(
          (sum, point) => sum + Math.abs(point.effectiveMass),
          0
        ) / activePoints.length
      : 1;
  };

  // Helper function to generate a key from warp points
  const getWarpPointsKey = (points: WarpPoint[]): string => {
    return points
      .filter(
        (point) => point.effectiveMass > 0.01 * averageEffectiveMassRef.current
      )
      .map(
        (point) =>
          `${point.position.x},${point.position.y},${point.effectiveMass}`
      )
      .sort()
      .join("|");
  };

  // Create or recreate grid when density or visibility changes
  useEffect(() => {
    if (!scope || !containerRef.current) return;

    if (
      lastDensityRef.current === settings.GRAVITY_GRID_DENSITY &&
      lastShowVisionRef.current === settings.SHOW_GRAVITY_VISION &&
      layerRef.current
    ) {
      return;
    }

    lastDensityRef.current = settings.GRAVITY_GRID_DENSITY;
    lastShowVisionRef.current = settings.SHOW_GRAVITY_VISION;

    scope.activate();
    if (!layerRef.current) {
      layerRef.current = new scope.Layer();
    }
    layerRef.current.activate();

    const layer = layerRef.current;
    layer.removeChildren();

    if (!settings.SHOW_GRAVITY_VISION) {
      gridLinesRef.current = { horizontal: [], vertical: [] };
      return;
    }

    const { width, height } = containerRef.current.getBoundingClientRect();
    const cellSize = Math.min(width, height) / settings.GRAVITY_GRID_DENSITY;
    const rows = Math.ceil(height / cellSize);
    const cols = Math.ceil(width / cellSize);
    const createGridLines = (isHorizontal: boolean) => {
      const lines: GridLine[] = [];
      const outerLoop = isHorizontal ? rows : cols;
      const innerLoop = isHorizontal ? cols : rows;

      for (let i = 0; i <= outerLoop; i++) {
        const path = new scope.Path();
        path.strokeColor = new scope.Color(1, 1, 1, 0.1);
        path.strokeWidth = 1;

        const points: paper.Point[] = [];
        for (let j = 0; j <= innerLoop; j++) {
          const x = isHorizontal ? j * cellSize : i * cellSize;
          const y = isHorizontal ? i * cellSize : j * cellSize;
          points.push(new scope.Point(x, y));
        }

        path.moveTo(points[0]);
        path.lineTo(points[points.length - 1]);
        layer.addChild(path);
        lines.push({ path, points });
      }
      return lines;
    };

    gridLinesRef.current = {
      horizontal: createGridLines(true),
      vertical: createGridLines(false),
    };

    scope.view.update();
  }, [
    scope,
    settings.GRAVITY_GRID_DENSITY,
    settings.SHOW_GRAVITY_VISION,
    containerRef,
  ]);

  // Set up frame handler
  useEffect(() => {
    if (!scope || !containerRef.current || !settings.SHOW_GRAVITY_VISION) {
      if (onFrameHandlerRef.current) {
        scope?.view.off("frame", onFrameHandlerRef.current);
        onFrameHandlerRef.current = null;
      }
      return;
    }

    const updateGridLines = () => {
      if (isPausedRef.current) return;

      const { horizontal, vertical } = gridLinesRef.current;
      if (horizontal.length === 0 || vertical.length === 0) return;

      // Check if warp points have changed
      const currentKey = getWarpPointsKey(warpPoints);
      if (currentKey === lastWarpPointsKeyRef.current) {
        return; // Skip update if warp points haven't changed
      }

      // Update key and recalculate average mass when points change
      lastWarpPointsKeyRef.current = currentKey;
      averageEffectiveMassRef.current = calculateAverageMass(warpPoints);

      console.log("UPDATE GRID LINES");

      const updateGridLine = (gridLine: GridLine) => {
        const { path, points } = gridLine;
        const displacedPoints: paper.Point[] = [];

        points.forEach((originalPoint) => {
          if (warpPoints.length === 0) {
            displacedPoints.push(originalPoint);
            return;
          }

          let totalDisplacementX = 0;
          let totalDisplacementY = 0;
          let killer: Vector | null = null;

          warpPoints.forEach((warpPoint) => {
            const dx = originalPoint.x - warpPoint.position.x;
            const dy = originalPoint.y - warpPoint.position.y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

            const strength = 200;
            const falloff = 20;
            const massScale =
              warpPoint.effectiveMass / averageEffectiveMassRef.current;

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

          displacedPoints.push(
            killer
              ? new scope.Point((killer as Vector).x, (killer as Vector).y)
              : originalPoint.add(
                  new scope.Point(totalDisplacementX, totalDisplacementY)
                )
          );
        });

        // Update path with new points
        path.removeSegments();
        path.moveTo(displacedPoints[0]);
        for (let i = 1; i < displacedPoints.length - 2; i++) {
          const current = displacedPoints[i];
          const next = displacedPoints[i + 1];
          const midPoint = current.add(next).divide(2);
          path.quadraticCurveTo(current, midPoint);
        }
        if (displacedPoints.length > 2) {
          path.quadraticCurveTo(
            displacedPoints[displacedPoints.length - 2],
            displacedPoints[displacedPoints.length - 1]
          );
        } else if (displacedPoints.length === 2) {
          path.lineTo(displacedPoints[1]);
        }
      };

      // Update all grid lines
      horizontal.forEach(updateGridLine);
      vertical.forEach(updateGridLine);
      scope.view.update();
    };

    // Create and store the frame handler
    onFrameHandlerRef.current = updateGridLines;
    scope.view.on("frame", updateGridLines);

    return () => {
      if (onFrameHandlerRef.current) {
        scope.view.off("frame", onFrameHandlerRef.current);
        onFrameHandlerRef.current = null;
      }
    };
  }, [scope, warpPoints, settings.SHOW_GRAVITY_VISION, containerRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (onFrameHandlerRef.current) {
        scope?.view.off("frame", onFrameHandlerRef.current);
        onFrameHandlerRef.current = null;
      }
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [scope]);

  return null;
};
