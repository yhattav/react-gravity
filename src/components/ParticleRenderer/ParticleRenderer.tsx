import React, { useEffect, useRef } from "react";
import Paper, { Point } from "paper";
import { Particle } from "../../types/particle";
import { createArrow } from "../../utils/physics/vectorUtils";
import { useSettings } from "../../contexts/SettingsContext";

interface ParticleTrail {
  path: paper.Path & {
    lastCircle?: paper.Path.Circle;
    vectors?: paper.Group[];
  };
  segmentPaths?: paper.Path[];
  particle: Particle;
}

interface ParticleRendererProps {
  scope: paper.PaperScope;
  particles: Particle[];
  showVelocityArrows?: boolean;
  showForceArrows?: boolean;
  shouldReset?: boolean;
  onResetComplete?: () => void;
}

export const ParticleRenderer: React.FC<ParticleRendererProps> = ({
  scope,
  particles,
  shouldReset,
  showForceArrows,
  showVelocityArrows,
  onResetComplete,
}) => {
  const trailsRef = useRef<Map<string, ParticleTrail>>(new Map());
  const layerRef = useRef<paper.Layer | null>(null);
  const { settings } = useSettings();
  const MAX_TRAIL_POINTS = settings.PARTICLE_TRAIL_LENGTH;

  useEffect(() => {
    if (!scope || !shouldReset) return;

    scope.activate();
    if (layerRef.current) {
      layerRef.current.removeChildren();
      trailsRef.current.clear();
    }
    scope.view.update();
    onResetComplete?.();
  }, [scope, shouldReset, onResetComplete]);

  useEffect(() => {
    if (!scope) return;

    scope.activate();

    if (!layerRef.current) {
      layerRef.current = new scope.Layer();
    }

    const layer = layerRef.current;
    layer.removeChildren();

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
      if (!trail.path) return;

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
        const width = size * 1.2 * progress;
        const opacity = 0.3 * progress;

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
        fillColor: null,
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
            "#4CAF50",
            1
          );
          trail.path.vectors.push(velocityArrow);
        }

        if (showForceArrows) {
          const forceArrow = createArrow(
            new Paper.Point(position.x, position.y),
            isNegativeMass ? particle.force.multiply(-1) : particle.force,
            "#FF4081",
            40
          );
          trail.path.vectors.push(forceArrow);
        }
      } else {
        // Remove vectors when arrows are disabled
        trail.path.vectors?.forEach((vector) => vector.remove());
        trail.path.vectors = [];
      }
    });

    scope.view.update();

    // Cleanup function to remove circles (but keep trails)
    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [scope, particles, showForceArrows, showVelocityArrows, MAX_TRAIL_POINTS]);

  return null;
};

export default ParticleRenderer;
