import React, { useEffect, useRef, useCallback } from "react";
import { WarpPoint } from "../../utils/types/physics";
import { PhysicsSettings } from "../../constants/physics";
import * as d3 from "d3";
import { throttle } from "lodash";

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
  const minDist = Math.min(cellWidth, cellHeight); // Use grid cell size as minimum distance

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = j * cellWidth + cellWidth / 2;
      const y = i * cellHeight + cellHeight / 2;

      let totalPotential = 0;

      warpPoints.forEach((warpPoint) => {
        const dx = x - warpPoint.position.x;
        const dy = y - warpPoint.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp the distance to minDist to prevent spikes
        const clampedDist = Math.max(dist, minDist);

        const massScale = warpPoint.effectiveMass / averageMass;
        if (massScale > 0.01) {
          const potential =
            settings.GRAVITY_VISION_STRENGTH *
            massScale *
            (1 / (1 + clampedDist / settings.GRAVITY_VISION_FALLOFF));

          totalPotential += potential;
        }
      });

      field[i][j] = totalPotential;
    }
  }

  return field;
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

const calculateAverageMass = (points: WarpPoint[]): number => {
  const activePoints = points.filter((point) => point.effectiveMass > 0);
  return activePoints.length > 0
    ? activePoints.reduce(
        (sum, point) => sum + Math.abs(point.effectiveMass),
        0
      ) / activePoints.length
    : 1;
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
  const lastWarpPointsKeyRef = useRef<string>("");
  const qualityRef = useRef<QualitySettings>({
    GRID_SIZE: settings.GRAVITY_VISION_GRID_SIZE,
    CONTOUR_LEVELS: settings.GRAVITY_VISION_CONTOUR_LEVELS,
  });

  // Setup or update the blur filter
  const updateFilter = useCallback(
    (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
      // Check if filter exists
      let defs = svg.select<SVGDefsElement>("defs");
      if (defs.empty()) {
        defs = svg.append("defs");
      }

      let filter = defs.select<SVGFilterElement>("filter");
      if (filter.empty() && settings.GRAVITY_VISION_BLUR > 0) {
        // Create new filter if it doesn't exist
        filter = defs.append("filter").attr("id", "blur-filter");

        filter
          .append("feGaussianBlur")
          .attr("stdDeviation", settings.GRAVITY_VISION_BLUR);
      } else if (settings.GRAVITY_VISION_BLUR > 0) {
        // Update the blur amount
        filter
          .select("feGaussianBlur")
          .attr("stdDeviation", settings.GRAVITY_VISION_BLUR);
      } else {
        // Remove the filter if blur is 0
        filter.remove();
      }
    },
    [settings.GRAVITY_VISION_BLUR]
  );

  const updateVisualization = useCallback(
    (
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
        g.attr("filter", "url(#blur-filter)");
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

      // Update existing paths with transition
      paths
        .attr("d", d3.geoPath())
        .attr("fill", (d) => colorScale(d.value))
        .attr("transform", `scale(${scaleX}, ${scaleY})`)
        .attr("stroke-width", adjustedStrokeWidth)
        .attr("stroke", settings.GRAVITY_VISION_STROKE_COLOR)
        .attr("stroke-opacity", settings.GRAVITY_VISION_STROKE_OPACITY)
        .attr("fill-opacity", settings.GRAVITY_VISION_OPACITY)
        .style("opacity", settings.GRAVITY_VISION_OPACITY);

      // Add new paths
      paths
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("transform", `scale(${scaleX}, ${scaleY})`)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .style("opacity", 0)
        .transition(t)
        .attr("fill", (d) => colorScale(d.value))
        .attr("fill-opacity", settings.GRAVITY_VISION_OPACITY)
        .attr("stroke", settings.GRAVITY_VISION_STROKE_COLOR)
        .attr("stroke-opacity", settings.GRAVITY_VISION_STROKE_OPACITY)
        .attr("stroke-width", adjustedStrokeWidth)
        .style("opacity", settings.GRAVITY_VISION_OPACITY);
    },
    [settings]
  );

  // Create a throttled settings update function with trailing edge
  const throttledSettingsUpdate = useCallback(
    throttle(
      (settings: PhysicsSettings) => {
        if (
          !containerRef.current ||
          !svgRef.current ||
          !settings.SHOW_D3_GRAVITY_VISION
        )
          return;

        const container = containerRef.current;
        const { width, height } = container.getBoundingClientRect();

        // Setup SVG
        const svg = d3
          .select(svgRef.current)
          .attr("width", width)
          .attr("height", height);

        // Update filter when settings change
        updateFilter(svg);

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
      },
      100,
      { trailing: true }
    ),
    [containerRef, updateVisualization]
  );

  // Create a throttled warp point update function
  const throttledWarpPointUpdate = useCallback(
    throttle(
      (
        warpPoints: WarpPoint[],
        settings: PhysicsSettings,
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        width: number,
        height: number
      ) => {
        // Calculate gravity field
        const field = calculateGravityField(
          width,
          height,
          warpPoints,
          averageEffectiveMassRef.current,
          qualityRef.current.GRID_SIZE,
          settings
        );

        // Update visualization
        updateVisualization(svg, field, width, height, qualityRef.current);
      },
      settings.GRAVITY_VISION_THROTTLE_MS,
      { trailing: true }
    ),
    [updateVisualization]
  );

  // Handle settings changes
  useEffect(() => {
    // Update quality settings
    qualityRef.current = {
      GRID_SIZE: settings.GRAVITY_VISION_GRID_SIZE,
      CONTOUR_LEVELS: settings.GRAVITY_VISION_CONTOUR_LEVELS,
    };

    throttledSettingsUpdate(settings);
  }, [settings, throttledSettingsUpdate]);

  // Handle warp point changes
  useEffect(() => {
    if (
      !containerRef.current ||
      !svgRef.current ||
      !settings.SHOW_D3_GRAVITY_VISION
    )
      return;

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

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    // Setup SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Use throttled update for warp point changes
    throttledWarpPointUpdate(warpPoints, settings, svg, width, height);
  }, [warpPoints, containerRef, throttledWarpPointUpdate]);

  // Cleanup throttled functions on unmount
  useEffect(() => {
    return () => {
      throttledSettingsUpdate.cancel();
      throttledWarpPointUpdate.cancel();
    };
  }, [throttledSettingsUpdate, throttledWarpPointUpdate]);

  if (!settings.SHOW_D3_GRAVITY_VISION || warpPoints.length === 0) return null;

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
