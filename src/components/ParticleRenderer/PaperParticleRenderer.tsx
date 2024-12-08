import React, { useEffect, useRef } from "react";
import Paper, { Point } from "paper";
import { Particle } from "../../types/particle";

interface ParticleTrail {
  path: paper.Path & {
    lastCircle?: paper.Path.Circle;
    vectors?: paper.Group[];
  };
  segmentPaths?: paper.Path[];
  particle: Particle;
}

const createArrow = (
  from: paper.Point,
  direction: paper.Point,
  color: string,
  scale: number = 20,
  arrowSize: number = 8
): paper.Group => {
  const to = from.add(direction.multiply(scale));

  // Create the main line
  const line = new Paper.Path({
    segments: [from, to],
    strokeColor: color,
    strokeWidth: 2,
    strokeCap: "round",
  });

  // Create arrowhead
  const arrowHead = new Paper.Path({
    strokeColor: color,
    fillColor: color,
    strokeWidth: 1,
    closed: true,
  });

  const arrowDirection = direction.normalize(arrowSize);
  const arrowLeft = to.subtract(arrowDirection.rotate(315, new Point(0, 0)));
  const arrowRight = to.subtract(arrowDirection.rotate(45, new Point(0, 0)));

  arrowHead.add(to);
  arrowHead.add(arrowLeft);
  arrowHead.add(arrowRight);

  // Group the line and arrowhead
  return new Paper.Group([line, arrowHead]);
};

export const PaperParticleRenderer: React.FC<{
  particles: Particle[];
  showVelocityArrows?: boolean;
  showForceArrows?: boolean;
  shouldReset?: boolean;
  onResetComplete?: () => void;
  simulatorId?: string;
}> = ({
  particles,
  shouldReset,
  showForceArrows,
  showVelocityArrows,
  onResetComplete,
  simulatorId = "default",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<Map<string, ParticleTrail>>(new Map());
  const scopeRef = useRef<paper.PaperScope>();
  const MAX_TRAIL_POINTS = 100;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a new Paper.js scope for this canvas
    const scope = new Paper.PaperScope();
    scopeRef.current = scope;

    // Get container dimensions instead of document
    const container = canvasRef.current.parentElement;
    if (!container) return;

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

    const currentTrails = trailsRef.current; // Capture the ref value
    return () => {
      window.removeEventListener("resize", handleResize);
      scope.activate();
      currentTrails.forEach((trail) => trail.path.remove());
      currentTrails.clear();
      scope.project?.clear();
    };
  }, [simulatorId]);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || !scope.project) return;

    if (shouldReset) {
      scope.project.activeLayer.removeChildren();
      trailsRef.current.forEach((trail) => {
        trail.path.vectors?.forEach((vector) => vector.remove());
        trail.segmentPaths?.forEach((path) => path.remove());
        trail.path.lastCircle?.remove();
      });
      trailsRef.current.clear();
      scope.view.update();
      onResetComplete?.();
    }
  }, [shouldReset, onResetComplete]);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || !scope.project) return;

    scope.activate(); // Add this line at the start of each effect

    // Remove trails only for particles that no longer exist
    const currentParticleIds = new Set(particles.map((p) => p.id));
    trailsRef.current.forEach((trail, id) => {
      if (!currentParticleIds.has(id)) {
        trail.path.remove();
        trail.segmentPaths?.forEach((path) => path.remove());
        trail.path.lastCircle?.remove();
        trailsRef.current.delete(id);
      }
    });

    particles.forEach((particle) => {
      const {
        id,
        position,
        color = "#BADA55",
        size = 10,
        mass = 0.1,
      } = particle;

      const isNegativeMass = mass < 0;

      // Handle trail
      let trail = trailsRef.current.get(id);
      if (!trail) {
        // Create new trail if it doesn't exist
        const path = new scope.Path({
          strokeColor: color,
          strokeWidth: size * 0.8,
          strokeCap: "round",
          dashArray: isNegativeMass ? [4, 4] : null,
        });
        trail = { path, particle };
        trailsRef.current.set(id, trail);
      }

      // Update trail
      trail.path.add(new Point(position.x, position.y));

      // Remove old points if trail is too long
      if (trail.path.segments.length > MAX_TRAIL_POINTS) {
        trail.path.removeSegments(
          0,
          trail.path.segments.length - MAX_TRAIL_POINTS
        );
      }

      // Update trail appearance
      if (!trail.path || !trail.path.segments.length) return;

      let paperColor: paper.Color;
      try {
        paperColor = new Paper.Color(color);
      } catch {
        // Fallback for RGB strings
        paperColor = new Paper.Color(color.match(/\d+/g)!.map(Number));
      }

      // Apply width and opacity gradients along the path
      const segments = trail.path.segments;

      // Clear old segment paths
      trail.segmentPaths?.forEach((path) => path.remove());
      trail.segmentPaths = [];

      // Create new segment paths
      for (let i = 0; i < segments.length - 1; i++) {
        const progress = i / segments.length; // 0 at start, 1 at end
        const width = size * 0.8 * progress;
        const opacity = 0.4 * progress;

        const currentPoint = segments[i].point;
        const nextPoint = segments[i + 1].point;

        const segmentPath = new scope.Path({
          segments: [currentPoint, nextPoint],
          strokeColor: paperColor,
          strokeWidth: width,
          opacity: opacity,
          strokeCap: "round",
          dashArray: isNegativeMass ? [4, 4] : null,
        });

        trail.segmentPaths.push(segmentPath);
      }

      // Hide the main path (we're using segment paths for display)
      trail.path.strokeWidth = 0;

      // Store particle circle in trail object
      trail.path.lastCircle?.remove();
      trail.path.lastCircle = new Paper.Path.Circle({
        center: new Paper.Point(position.x, position.y),
        radius: size / 2,
        strokeColor: color,
        strokeWidth: 2,
        fillColor: color,
        dashArray: isNegativeMass ? [4, 4] : null,
      });

      if (showVelocityArrows || showForceArrows) {
        // Remove old vectors if they exist
        trail.path.vectors?.forEach((vector) => vector.remove());
        trail.path.vectors = [];

        if (showVelocityArrows) {
          const velocityArrow = createArrow(
            new Paper.Point(position.x, position.y),
            particle.velocity,
            "#4CAF50", // Green
            1
          );
          trail.path.vectors.push(velocityArrow);
        }

        if (showForceArrows) {
          const forceArrow = createArrow(
            new Paper.Point(position.x, position.y),
            particle.force,
            "#FF4081", // Pink
            40
          );
          trail.path.vectors.push(forceArrow);
        }
      }
    });

    scope.view.update();

    // Cleanup function to remove circles (but keep trails)
    return () => {
      scope.project?.activeLayer?.children.forEach((child) => {
        if (child instanceof Paper.Path.Circle) {
          child.remove();
        }
      });
    };
  }, [particles, showForceArrows, showVelocityArrows]);

  return (
    <canvas
      ref={canvasRef}
      className={`paper-canvas-${simulatorId}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
};

export default PaperParticleRenderer;
