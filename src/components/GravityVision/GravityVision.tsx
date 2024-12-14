import React, { useEffect, useRef } from "react";
import { Vector, WarpPoint } from "../../utils/types/physics";
import { PhysicsSettings } from "../../constants/physics";

// Types
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

// Constants
const GRID_CONSTANTS = {
  STRENGTH: 200,
  FALLOFF: 20,
  MASS_THRESHOLD: 0.01,
  LINE_OPACITY: 0.1,
  LINE_WIDTH: 1,
} as const;

// Helper functions
const calculateDisplacement = (
  originalPoint: paper.Point,
  warpPoint: WarpPoint,
  averageMass: number
): { dx: number; dy: number; isKiller: boolean } => {
  const dx = originalPoint.x - warpPoint.position.x;
  const dy = originalPoint.y - warpPoint.position.y;
  const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

  const massScale = warpPoint.effectiveMass / averageMass;
  let displacementX =
    (dx / dist) *
    GRID_CONSTANTS.STRENGTH *
    massScale *
    Math.exp(-dist / GRID_CONSTANTS.FALLOFF);
  let displacementY =
    (dy / dist) *
    GRID_CONSTANTS.STRENGTH *
    massScale *
    Math.exp(-dist / GRID_CONSTANTS.FALLOFF);

  const isKiller =
    Math.abs(displacementX) > Math.abs(dx) ||
    Math.abs(displacementY) > Math.abs(dy);
  if (isKiller) {
    displacementX = dx;
    displacementY = dy;
  }

  return { dx: -displacementX, dy: -displacementY, isKiller };
};

const createGridLine = (
  scope: paper.PaperScope,
  isHorizontal: boolean,
  i: number,
  cellSize: number,
  dimensions: { cols: number; rows: number }
): GridLine => {
  const { cols, rows } = dimensions;
  const path = new scope.Path({
    strokeColor: new scope.Color(1, 1, 1, GRID_CONSTANTS.LINE_OPACITY),
    strokeWidth: GRID_CONSTANTS.LINE_WIDTH,
  });

  const points: paper.Point[] = [];
  const innerLoop = isHorizontal ? cols : rows;

  for (let j = 0; j <= innerLoop; j++) {
    const x = isHorizontal ? j * cellSize : i * cellSize;
    const y = isHorizontal ? i * cellSize : j * cellSize;
    points.push(new scope.Point(x, y));
  }

  path.moveTo(points[0]);
  path.lineTo(points[points.length - 1]);

  return { path, points };
};

// Additional helper functions
const calculateAverageMass = (points: WarpPoint[]): number => {
  const activePoints = points.filter((point) => point.effectiveMass > 0);
  return activePoints.length > 0
    ? activePoints.reduce(
        (sum, point) => sum + Math.abs(point.effectiveMass),
        0
      ) / activePoints.length
    : 1;
};

const getWarpPointsKey = (points: WarpPoint[], averageMass: number): string => {
  return points
    .filter(
      (point) =>
        point.effectiveMass > GRID_CONSTANTS.MASS_THRESHOLD * averageMass
    )
    .map(
      (point) =>
        `${point.position.x},${point.position.y},${point.effectiveMass}`
    )
    .sort()
    .join("|");
};

const updateGridPath = (
  path: paper.Path,
  displacedPoints: paper.Point[]
): void => {
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

// Grid Management Hooks
const useGridCreation = (
  scope: paper.PaperScope,
  settings: PhysicsSettings,
  containerRef: React.RefObject<HTMLDivElement>,
  layerRef: React.MutableRefObject<paper.Layer>,
  gridLinesRef: React.MutableRefObject<{
    horizontal: GridLine[];
    vertical: GridLine[];
  }>,
  lastDensityRef: React.MutableRefObject<number>,
  lastShowVisionRef: React.MutableRefObject<boolean>,
  lastWarpPointsKeyRef: React.MutableRefObject<string>
) => {
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
    lastWarpPointsKeyRef.current = "";
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

    const createLines = (isHorizontal: boolean) => {
      const lines: GridLine[] = [];
      const outerLoop = isHorizontal ? rows : cols;

      for (let i = 0; i <= outerLoop; i++) {
        const gridLine = createGridLine(scope, isHorizontal, i, cellSize, {
          cols,
          rows,
        });
        layer.addChild(gridLine.path);
        lines.push(gridLine);
      }
      return lines;
    };

    gridLinesRef.current = {
      horizontal: createLines(true),
      vertical: createLines(false),
    };

    scope.view.update();
  }, [
    scope,
    settings.GRAVITY_GRID_DENSITY,
    settings.SHOW_GRAVITY_VISION,
    containerRef,
  ]);
};

const useGridUpdates = (
  scope: paper.PaperScope,
  warpPoints: WarpPoint[],
  settings: PhysicsSettings,
  containerRef: React.RefObject<HTMLDivElement>,
  isPausedRef: React.RefObject<boolean>,
  gridLinesRef: React.MutableRefObject<{
    horizontal: GridLine[];
    vertical: GridLine[];
  }>,
  lastWarpPointsKeyRef: React.MutableRefObject<string>,
  averageEffectiveMassRef: React.MutableRefObject<number>,
  onFrameHandlerRef: React.MutableRefObject<
    ((event: paper.Event) => void) | null
  >
) => {
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

      const currentKey = getWarpPointsKey(
        warpPoints,
        averageEffectiveMassRef.current
      );
      if (currentKey === lastWarpPointsKeyRef.current) {
        return;
      }

      lastWarpPointsKeyRef.current = currentKey;
      averageEffectiveMassRef.current = calculateAverageMass(warpPoints);

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
            const { dx, dy, isKiller } = calculateDisplacement(
              originalPoint,
              warpPoint,
              averageEffectiveMassRef.current
            );

            if (isKiller) {
              killer = warpPoint.position;
            } else {
              totalDisplacementX += dx;
              totalDisplacementY += dy;
            }
          });

          displacedPoints.push(
            killer
              ? new scope.Point((killer as Vector).x, (killer as Vector).y)
              : originalPoint.add(
                  new scope.Point(totalDisplacementX, totalDisplacementY)
                )
          );
        });

        updateGridPath(path, displacedPoints);
      };

      horizontal.forEach(updateGridLine);
      vertical.forEach(updateGridLine);
      scope.view.update();
    };

    onFrameHandlerRef.current = updateGridLines;
    scope.view.on("frame", updateGridLines);

    return () => {
      if (onFrameHandlerRef.current) {
        scope.view.off("frame", onFrameHandlerRef.current);
        onFrameHandlerRef.current = null;
      }
    };
  }, [scope, warpPoints, settings.SHOW_GRAVITY_VISION, containerRef]);
};

// Main Component
export const GravityVision: React.FC<GravityVisionProps> = ({
  scope,
  warpPoints,
  settings,
  containerRef,
  isPausedRef,
}) => {
  // Refs - using null! to make them mutable
  const layerRef = useRef<paper.Layer>(null!);
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

  // Use custom hooks
  useGridCreation(
    scope,
    settings,
    containerRef,
    layerRef,
    gridLinesRef,
    lastDensityRef,
    lastShowVisionRef,
    lastWarpPointsKeyRef
  );
  useGridUpdates(
    scope,
    warpPoints,
    settings,
    containerRef,
    isPausedRef,
    gridLinesRef,
    lastWarpPointsKeyRef,
    averageEffectiveMassRef,
    onFrameHandlerRef
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (onFrameHandlerRef.current) {
        scope?.view.off("frame", onFrameHandlerRef.current);
        onFrameHandlerRef.current = null;
      }
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null!;
      }
    };
  }, [scope]);

  return null;
};
