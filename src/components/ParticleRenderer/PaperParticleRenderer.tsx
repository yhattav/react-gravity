import React, { useEffect, useRef } from "react";
import Paper, { Path, Point } from "paper";
import { Particle } from "../../types/particle";

interface ParticleTrail {
  path: paper.Path & { lastCircle?: paper.Path.Circle };
  segmentPaths?: paper.Path[];
  particle: Particle;
}

export const PaperParticleRenderer: React.FC<{
  particles: Particle[];
  showVelocityArrows?: boolean;
  showForceArrows?: boolean;
  shouldReset?: boolean;
  onResetComplete?: () => void;
}> = ({ particles, shouldReset, onResetComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<Map<string, ParticleTrail>>(new Map());
  const MAX_TRAIL_POINTS = 100;

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const pixelRatio = 1;
    canvasRef.current.width = viewportWidth * pixelRatio;
    canvasRef.current.height = viewportHeight * pixelRatio;

    Paper.setup(canvasRef.current);
    Paper.view.viewSize = new Paper.Size(viewportWidth, viewportHeight);
    Paper.view.scale(pixelRatio, pixelRatio);

    return () => {
      // Clean up all trails
      trailsRef.current.forEach((trail) => trail.path.remove());
      trailsRef.current.clear();
      Paper.project?.clear();
    };
  }, []);

  useEffect(() => {
    if (shouldReset && Paper.project) {
      // Clear all paths
      Paper.project.activeLayer.removeChildren();
      trailsRef.current.clear();
      Paper.view.update();
      onResetComplete?.();
    }
  }, [shouldReset, onResetComplete]);

  useEffect(() => {
    if (!Paper.project) return;

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
        const path = new Path({
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

        const segmentPath = new Paper.Path({
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
    });

    Paper.view.update();

    // Cleanup function to remove circles (but keep trails)
    return () => {
      Paper.project.activeLayer.children.forEach((child) => {
        if (child instanceof Paper.Path.Circle) {
          child.remove();
        }
      });
    };
  }, [particles]);

  return (
    <canvas
      ref={canvasRef}
      id="paper-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
};

export default PaperParticleRenderer;
