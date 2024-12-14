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
  segmentPaths: paper.Path[];
}

interface ParticleRendererProps {
  scope: paper.PaperScope;
  particlesRef: React.RefObject<Particle[]>;
  shouldReset?: boolean;
  onResetComplete?: () => void;
}

export const ParticleRenderer: React.FC<ParticleRendererProps> = ({
  scope,
  particlesRef,
  shouldReset,
  onResetComplete,
}) => {
  const trailsRef = useRef<Map<string, ParticleTrail>>(new Map());
  const layerRef = useRef<paper.Layer | null>(null);
  const { settings } = useSettings();

  const maxTrailPointsRef = useRef(settings.PARTICLE_TRAIL_LENGTH);
  const showForceArrowsRef = useRef(settings.SHOW_FORCE_ARROWS);
  const showVelocityArrowsRef = useRef(settings.SHOW_VELOCITY_ARROWS);

  useEffect(() => {
    maxTrailPointsRef.current = settings.PARTICLE_TRAIL_LENGTH;
    showForceArrowsRef.current = settings.SHOW_FORCE_ARROWS;
    showVelocityArrowsRef.current = settings.SHOW_VELOCITY_ARROWS;
  }, [settings]);

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
    console.log("ParticleRenderer useEffect");
    if (!scope) return;

    scope.activate();
    if (!layerRef.current) {
      layerRef.current = new scope.Layer();
      layerRef.current.activate();
    }

    scope.view.onFrame = () => {
      const currentParticles = particlesRef.current;
      if (!currentParticles || !layerRef.current) return;

      const currentParticleIds = new Set(currentParticles.map((p) => p.id));
      trailsRef.current.forEach((trail, id) => {
        if (!currentParticleIds.has(id)) {
          trail.path.remove();
          trail.segmentPaths.forEach((path) => path.remove());
          trail.path.lastCircle?.remove();
          trail.path.vectors?.forEach((vector) => vector.remove());
          trailsRef.current.delete(id);
        }
      });

      currentParticles.forEach((particle) => {
        const {
          id,
          position,
          color = "#BADA55",
          size = 10,
          mass = 0.1,
        } = particle;
        const isNegativeMass = mass < 0;

        if (!trailsRef.current.has(id)) {
          const path: ParticleTrail["path"] = new scope.Path({
            strokeColor: color,
            strokeWidth: 0,
            strokeCap: "round",
            dashArray: isNegativeMass ? [4, 4] : null,
          });

          const segmentPaths: paper.Path[] = [];
          for (let i = 0; i < maxTrailPointsRef.current - 1; i++) {
            const segmentPath = new scope.Path({
              segments: [new Point(0, 0), new Point(0, 0)],
              strokeColor: color,
              strokeWidth: 0,
              opacity: 0,
              strokeCap: "round",
              dashArray: isNegativeMass ? [4, 4] : null,
              visible: false,
            });
            layerRef.current?.addChild(segmentPath);
            segmentPaths.push(segmentPath);
          }

          path.lastCircle = new Paper.Path.Circle({
            center: new Paper.Point(position.x, position.y),
            radius: size / 2,
            strokeColor: color,
            strokeWidth: 2,
            fillColor: null,
            dashArray: isNegativeMass ? [4, 4] : null,
          });
          layerRef.current?.addChild(path.lastCircle);
          layerRef.current?.addChild(path);

          trailsRef.current.set(id, { path, segmentPaths });
        }

        const trail = trailsRef.current.get(id)!;

        trail.path.add(new Point(position.x, position.y));
        if (trail.path.segments.length > maxTrailPointsRef.current) {
          trail.path.removeSegments(
            0,
            trail.path.segments.length - maxTrailPointsRef.current
          );
        } else if (trail.path.segments.length < maxTrailPointsRef.current) {
          const lastPosition = trail.path.lastSegment.point;
          while (trail.path.segments.length < maxTrailPointsRef.current) {
            trail.path.insert(0, lastPosition);
          }
        }

        const segments = trail.path.segments;
        const totalSegments = segments.length - 1;

        trail.segmentPaths.forEach((segmentPath, i) => {
          if (i < totalSegments) {
            segmentPath.visible = true;
            segmentPath.segments[0].point = segments[i].point;
            segmentPath.segments[1].point = segments[i + 1].point;

            const progress = i / totalSegments;
            segmentPath.strokeWidth = size * 1.2 * progress;
            segmentPath.opacity = 0.3 * progress;
          } else {
            segmentPath.visible = false;
          }
        });

        if (trail.path.lastCircle) {
          trail.path.lastCircle.position = new Paper.Point(
            position.x,
            position.y
          );
        }

        trail.path.vectors?.forEach((vector) => vector.remove());
        trail.path.vectors = [];
        if (showVelocityArrowsRef.current) {
          const velocityArrow = createArrow(
            new Paper.Point(position.x, position.y),
            particle.velocity,
            "#4CAF50",
            1
          );
          trail.path.vectors.push(velocityArrow);
        }

        if (showForceArrowsRef.current) {
          const forceArrow = createArrow(
            new Paper.Point(position.x, position.y),
            isNegativeMass ? particle.force.multiply(-1) : particle.force,
            "#FF4081",
            40
          );
          trail.path.vectors.push(forceArrow);
        }
      });

      scope.view.update();
    };

    return () => {
      scope.view.onFrame = null;
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [scope, particlesRef]);

  return null;
};

export default ParticleRenderer;
