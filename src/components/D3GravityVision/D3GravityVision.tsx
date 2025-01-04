import React, { useEffect, useRef } from "react";
import { WarpPoint } from "../../utils/types/physics";
import { PhysicsSettings } from "../../constants/physics";
import * as d3 from "d3";

// Types
interface D3GravityVisionProps {
  warpPoints: WarpPoint[];
  settings: PhysicsSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  isPausedRef: React.RefObject<boolean>;
}

interface QualitySettings {
  readonly GRID_SIZE: number;
  readonly CONTOUR_LEVELS: number;
}

// Helper functions
const calculateGravityField = (
  width: number,
  height: number,
  warpPoints: WarpPoint[],
  averageMass: number,
  gridSize: number,
  settings: PhysicsSettings
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
          settings.GRAVITY_VISION_STRENGTH *
          massScale *
          (1 / (1 + dist / settings.GRAVITY_VISION_FALLOFF));

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

const getWarpPointsKey = (
  points: WarpPoint[],
  averageMass: number,
  settings: PhysicsSettings
): string => {
  return points
    .filter(
      (point) =>
        point.effectiveMass >
        settings.GRAVITY_VISION_MASS_THRESHOLD * averageMass
    )
    .map(
      (point) =>
        `${point.position.x},${point.position.y},${point.effectiveMass}`
    )
    .sort()
    .join("|");
};

// Main Component
export const D3GravityVision: React.FC<D3GravityVisionProps> = ({
  warpPoints,
  settings,
  containerRef,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const averageEffectiveMassRef = useRef<number>(1);
  const lastUpdateTimeRef = useRef<number>(0);
  const qualityRef = useRef<QualitySettings>({
    GRID_SIZE: settings.GRAVITY_VISION_LOW_QUALITY_GRID_SIZE,
    CONTOUR_LEVELS: settings.GRAVITY_VISION_LOW_QUALITY_CONTOURS,
  });
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
      .domain(
        settings.GRAVITY_VISION_INVERT_COLORS
          ? [minVal, maxVal]
          : [maxVal, minVal]
      )
      .interpolator(
        d3[settings.GRAVITY_VISION_COLOR_SCHEME as keyof typeof d3] as (
          t: number
        ) => string
      );

    // Generate contours
    const contourPaths = contours(field.flat());

    // Calculate stroke width based on scale
    const scaleX = width / quality.GRID_SIZE;
    const scaleY = height / quality.GRID_SIZE;
    const averageScale = (scaleX + scaleY) / 2;
    const adjustedStrokeWidth =
      settings.GRAVITY_VISION_STROKE_WIDTH / averageScale;

    // Get or create the group element
    let g = svg.select<SVGGElement>("g");
    if (g.empty()) {
      g = svg.append("g");
    }

    // Create a transition
    const t = d3
      .transition()
      .duration(settings.GRAVITY_VISION_TRANSITION_MS)
      .ease(d3.easeLinear);

    // Update paths using the enter/update/exit pattern
    const paths = g
      .selectAll<SVGPathElement, d3.ContourMultiPolygon>("path")
      .data(contourPaths);

    // Remove old paths with fade out
    paths.exit().transition(t).style("opacity", 0).remove();

    // Update existing paths
    const updatePaths = paths.style("opacity", settings.GRAVITY_VISION_OPACITY);

    // Immediately set the new path and fill
    updatePaths
      .attr("d", d3.geoPath())
      .attr("fill", (d) => colorScale(d.value))
      .attr("transform", `scale(${scaleX}, ${scaleY})`)
      .attr("stroke-width", adjustedStrokeWidth);

    // Add new paths
    const enterPaths = paths
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", (d) => colorScale(d.value))
      .attr("fill-opacity", settings.GRAVITY_VISION_OPACITY)
      .attr("stroke", settings.GRAVITY_VISION_STROKE_COLOR)
      .attr("stroke-opacity", settings.GRAVITY_VISION_STROKE_OPACITY)
      .attr("stroke-width", adjustedStrokeWidth)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("transform", `scale(${scaleX}, ${scaleY})`)
      .style("opacity", 0);

    // Fade in new paths
    enterPaths.transition(t).style("opacity", settings.GRAVITY_VISION_OPACITY);
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
    if (timeSinceLastUpdate < settings.GRAVITY_VISION_THROTTLE_MS) {
      return;
    }

    // Check if warp points actually changed
    averageEffectiveMassRef.current = calculateAverageMass(warpPoints);
    const currentKey = getWarpPointsKey(
      warpPoints,
      averageEffectiveMassRef.current,
      settings
    );
    if (currentKey === lastWarpPointsKeyRef.current) {
      return;
    }
    lastWarpPointsKeyRef.current = currentKey;

    // Update quality if auto-quality is enabled
    if (settings.GRAVITY_VISION_AUTO_QUALITY) {
      const useHighQuality =
        timeSinceLastUpdate > settings.GRAVITY_VISION_QUALITY_SWITCH_MS;
      qualityRef.current = {
        GRID_SIZE: useHighQuality
          ? settings.GRAVITY_VISION_HIGH_QUALITY_GRID_SIZE
          : settings.GRAVITY_VISION_LOW_QUALITY_GRID_SIZE,
        CONTOUR_LEVELS: useHighQuality
          ? settings.GRAVITY_VISION_HIGH_QUALITY_CONTOURS
          : settings.GRAVITY_VISION_LOW_QUALITY_CONTOURS,
      };
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
      qualityRef.current.GRID_SIZE,
      settings
    );

    updateVisualization(svg, field, width, height, qualityRef.current);
  }, [warpPoints, settings, containerRef]);

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
