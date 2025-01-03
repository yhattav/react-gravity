import React, { useEffect, useRef } from "react";
import { WarpPoint } from "../../utils/types/physics";
import { PhysicsSettings } from "../../constants/physics";
import * as d3 from "d3";

// Types
interface PaperGravityVisionProps {
  warpPoints: WarpPoint[];
  settings: PhysicsSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  isPausedRef: React.RefObject<boolean>;
}

interface QualitySettings {
  readonly GRID_SIZE: number;
  readonly CONTOUR_LEVELS: number;
}

// Constants
const CONTOUR_CONSTANTS = {
  HIGH_QUALITY: {
    GRID_SIZE: 100,
    CONTOUR_LEVELS: 20,
  } as QualitySettings,
  LOW_QUALITY: {
    GRID_SIZE: 50,
    CONTOUR_LEVELS: 10,
  } as QualitySettings,
  STRENGTH: 500,
  FALLOFF: 100,
  MASS_THRESHOLD: 0.01,
  THROTTLE_MS: 32, // ~30fps
  QUALITY_SWITCH_THRESHOLD_MS: 200,
  OPACITY: 0.05,
} as const;

// Helper functions
const calculateGravityField = (
  width: number,
  height: number,
  warpPoints: WarpPoint[],
  averageMass: number,
  gridSize: number
): number[][] => {
  const field: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(0));

  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = j * cellWidth + cellWidth / 2;
      const y = i * cellHeight + cellHeight / 2;

      let totalPotential = 0;

      warpPoints.forEach((warpPoint) => {
        const dx = x - warpPoint.position.x;
        const dy = y - warpPoint.position.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

        const massScale = warpPoint.effectiveMass / averageMass;
        const potential =
          CONTOUR_CONSTANTS.STRENGTH *
          massScale *
          (1 / (1 + dist / CONTOUR_CONSTANTS.FALLOFF));

        totalPotential += potential;
      });

      field[i][j] = totalPotential;
    }
  }

  return field;
};

const calculateAverageMass = (points: WarpPoint[]): number => {
  const activePoints = points.filter((point) => point.effectiveMass > 0);
  return activePoints.length > 0
    ? activePoints.reduce(
        (sum, point) => sum + Math.abs(point.effectiveMass),
        0
      ) / activePoints.length
    : 1;
};

const generateThresholds = (
  minVal: number,
  maxVal: number,
  levels: number
): number[] => {
  const base = Math.pow(maxVal / Math.max(minVal, 1), 1 / levels);
  return Array.from(
    { length: levels },
    (_, i) => Math.max(minVal, 1) * Math.pow(base, i)
  );
};

const getWarpPointsKey = (points: WarpPoint[], averageMass: number): string => {
  return points
    .filter(
      (point) =>
        point.effectiveMass > CONTOUR_CONSTANTS.MASS_THRESHOLD * averageMass
    )
    .map(
      (point) =>
        `${point.position.x},${point.position.y},${point.effectiveMass}`
    )
    .sort()
    .join("|");
};

// Main Component
export const PaperGravityVision: React.FC<PaperGravityVisionProps> = ({
  warpPoints,
  settings,
  containerRef,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const averageEffectiveMassRef = useRef<number>(1);
  const lastUpdateTimeRef = useRef<number>(0);
  const lastQualityCheckRef = useRef<number>(0);
  const qualityRef = useRef<QualitySettings>(CONTOUR_CONSTANTS.LOW_QUALITY);
  const lastWarpPointsKeyRef = useRef<string>("");

  const updateVisualization = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    field: number[][],
    width: number,
    height: number,
    quality: QualitySettings
  ) => {
    // Find min/max values for better threshold distribution
    const values = field.flat();
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Create contour generator with dynamic thresholds
    const contours = d3
      .contours()
      .size([quality.GRID_SIZE, quality.GRID_SIZE])
      .smooth(true)
      .thresholds(generateThresholds(minVal, maxVal, quality.CONTOUR_LEVELS));

    // Create color scale using interpolation
    const colorScale = d3
      .scaleSequential()
      .domain([maxVal, minVal])
      .interpolator(d3.interpolateInferno);

    // Generate contours
    const contourPaths = contours(field.flat());

    // Calculate stroke width based on scale
    const scaleX = width / quality.GRID_SIZE;
    const scaleY = height / quality.GRID_SIZE;
    const averageScale = (scaleX + scaleY) / 2;
    const adjustedStrokeWidth = 2 / averageScale;

    // Get or create the group element
    let g = svg.select<SVGGElement>("g");
    if (g.empty()) {
      g = svg.append("g");
    }

    // Update paths using the enter/update/exit pattern
    const paths = g
      .selectAll<SVGPathElement, d3.ContourMultiPolygon>("path")
      .data(contourPaths);

    // Remove old paths
    paths.exit().remove();

    // Update existing paths
    paths
      .attr("d", d3.geoPath())
      .attr("fill", (d) => colorScale(d.value))
      .attr("transform", `scale(${scaleX}, ${scaleY})`);

    // Add new paths
    paths
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", (d) => colorScale(d.value))
      .attr("fill-opacity", CONTOUR_CONSTANTS.OPACITY)
      .attr("stroke", "#fff")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", adjustedStrokeWidth)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("transform", `scale(${scaleX}, ${scaleY})`);

    // Update all paths with new stroke width (might change with scale)
    g.selectAll("path").attr("stroke-width", adjustedStrokeWidth);
  };

  useEffect(() => {
    if (
      !containerRef.current ||
      !svgRef.current ||
      !settings.SHOW_GRAVITY_VISION
    )
      return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

    // Throttle updates
    if (timeSinceLastUpdate < CONTOUR_CONSTANTS.THROTTLE_MS) {
      return;
    }

    // Check if warp points actually changed
    averageEffectiveMassRef.current = calculateAverageMass(warpPoints);
    const currentKey = getWarpPointsKey(
      warpPoints,
      averageEffectiveMassRef.current
    );
    if (currentKey === lastWarpPointsKeyRef.current) {
      return;
    }
    lastWarpPointsKeyRef.current = currentKey;

    // Check if we should switch quality (less frequently than updates)
    if (
      now - lastQualityCheckRef.current >
      CONTOUR_CONSTANTS.QUALITY_SWITCH_THRESHOLD_MS
    ) {
      qualityRef.current =
        timeSinceLastUpdate > CONTOUR_CONSTANTS.QUALITY_SWITCH_THRESHOLD_MS
          ? CONTOUR_CONSTANTS.HIGH_QUALITY
          : CONTOUR_CONSTANTS.LOW_QUALITY;
      lastQualityCheckRef.current = now;
    }

    lastUpdateTimeRef.current = now;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    // Setup SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Calculate gravity field
    const field = calculateGravityField(
      width,
      height,
      warpPoints,
      averageEffectiveMassRef.current,
      qualityRef.current.GRID_SIZE
    );

    updateVisualization(svg, field, width, height, qualityRef.current);
  }, [warpPoints, settings.SHOW_GRAVITY_VISION, containerRef]);

  // Remove console.log effects
  if (!settings.SHOW_GRAVITY_VISION) return null;

  return (
    <svg
      ref={svgRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  );
};
