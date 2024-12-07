import React, { useEffect, useRef } from "react";
import Paper from "paper";
import { Point2D, Force } from "../../utils/types/physics";
import { TrailPoint } from "../../types/particle";

interface PaperParticleRenderParams {
  position: Point2D;
  velocity: Point2D;
  force: Force;
  color?: string;
  size?: number;
  showVectors?: boolean;
  showVelocityArrows?: boolean;
  showForceArrows?: boolean;
  trails?: TrailPoint[];
  onDelete?: () => void;
  disabled?: boolean;
  mass?: number;
}

export const PaperParticleRenderer: React.FC<PaperParticleRenderParams> = ({
  position,
  velocity,
  force,
  color = "#BADA55",
  size = 10,
  showVectors = true,
  showVelocityArrows = true,
  showForceArrows = true,
  trails = [],
  onDelete,
  disabled = false,
  mass = 0.1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<Paper.Path.Circle | null>(null);
  const trailRef = useRef<Paper.Path | null>(null);
  const vectorsRef = useRef<Paper.Group | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Paper.js
    Paper.setup(canvasRef.current);

    // Create particle
    const particle = new Paper.Path.Circle({
      center: new Paper.Point(position.x, position.y),
      radius: size / 2,
      strokeColor: color,
      strokeWidth: 2,
      fillColor: mass < 0 ? "transparent" : color + "20", // Transparent fill for negative mass
      dashArray: mass < 0 ? [4, 4] : null, // Dashed stroke for negative mass
    });
    particleRef.current = particle;

    // Create trail
    if (trails.length > 1) {
      const trail = new Paper.Path({
        segments: trails.map((p) => new Paper.Point(p.x, p.y)),
        strokeColor: color,
        strokeWidth: size * 0.8,
        strokeCap: "round",
        opacity: 0.4,
        dashArray: mass < 0 ? [4, 4] : null,
      });
      trail.smooth(); // Smooth the path for better visuals
      trailRef.current = trail;
    }

    // Create vectors
    if (showVectors) {
      const vectors = new Paper.Group();

      if (showVelocityArrows) {
        const velocityVector = new Paper.Path({
          segments: [
            new Paper.Point(position.x, position.y),
            new Paper.Point(
              position.x + velocity.x * 5,
              position.y + velocity.y * 5
            ),
          ],
          strokeColor: "#4CAF50",
          strokeWidth: 2,
          strokeCap: "round",
        });
        vectors.addChild(velocityVector);
      }

      if (showForceArrows) {
        const forceVector = new Paper.Path({
          segments: [
            new Paper.Point(position.x, position.y),
            new Paper.Point(
              position.x + force.fx * 50,
              position.y + force.fy * 50
            ),
          ],
          strokeColor: "#FF4081",
          strokeWidth: 2,
          strokeCap: "round",
        });
        vectors.addChild(forceVector);
      }
      vectorsRef.current = vectors;
    }

    // Add hover and click interactions
    particle.onMouseEnter = () => {
      if (!disabled) {
        particle.scale(1.2);
        particle.strokeColor = new Paper.Color("#ff5252");
      }
    };

    particle.onMouseLeave = () => {
      if (!disabled) {
        particle.scale(1 / 1.2);
        particle.strokeColor = new Paper.Color(color);
      }
    };

    particle.onClick = (event: Paper.MouseEvent) => {
      if (!disabled) {
        event.stopPropagation();
        onDelete?.();
      }
    };

    // Cleanup
    return () => {
      particle.remove();
      trailRef.current?.remove();
      vectorsRef.current?.remove();
      Paper.project.clear();
    };
  }, [
    position,
    velocity,
    force,
    color,
    size,
    showVectors,
    trails,
    disabled,
    mass,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: disabled ? "none" : "auto",
        zIndex: 3,
      }}
    />
  );
};
