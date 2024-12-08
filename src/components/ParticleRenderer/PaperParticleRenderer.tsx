import React, { useEffect, useRef } from "react";
import Paper from "paper";
import { Particle } from "../../types/particle";

export const PaperParticleRenderer: React.FC<{
  particles: Particle[];
  width: number;
  height: number;
  showVelocityArrows?: boolean;
  showForceArrows?: boolean;
}> = ({ particles, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Use viewport dimensions instead of passed props
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Setup Paper.js with the correct pixel ratio
    const pixelRatio = 1;
    canvasRef.current.width = viewportWidth * pixelRatio;
    canvasRef.current.height = viewportHeight * pixelRatio;

    Paper.setup(canvasRef.current);
    Paper.view.viewSize = new Paper.Size(viewportWidth, viewportHeight);
    // Don't center the view - keep 0,0 at top left
    Paper.view.scale(pixelRatio, pixelRatio);

    return () => {
      Paper.project?.clear();
    };
  }, []); // Remove width/height from dependencies since we're using viewport size

  useEffect(() => {
    if (!Paper.project) return;
    Paper.project.clear();

    // Add debug log to verify particles data

    particles.forEach((particle) => {
      const {
        position,
        color = "#BADA55",
        size = 10,
        trails = [],
        mass = 0.1,
      } = particle;

      // Add debug log to verify each particle position

      const isNegativeMass = mass < 0;

      // Draw trails with opacity gradient
      if (trails.length > 1) {
        trails.slice(0, -1).forEach((point, i) => {
          const nextPoint = trails[i + 1];
          const progress = 1 - i / (trails.length - 1);

          new Paper.Path({
            segments: [
              new Paper.Point(point.position?.x || 0, point.position?.y || 0),
              new Paper.Point(
                nextPoint.position?.x || 0,
                nextPoint.position?.y || 0
              ),
            ],
            strokeColor: color,
            strokeWidth: size * progress * 0.8,
            opacity: progress * 0.4,
            strokeCap: "round",
            dashArray: isNegativeMass ? [4, 4] : null,
          });
        });
      }
      // Draw particle
      const particleCircle = new Paper.Path.Circle({
        center: new Paper.Point(position.x, position.y),
        radius: size / 2,
        strokeColor: color,
        strokeWidth: 2,
        fillColor: color,
      });

      if (isNegativeMass) {
        particleCircle.dashArray = [4, 4];
      }

      // Draw vectors if enabled
      //   if (showVectors) {
      //     // Velocity vector (green)
      //     if (showVelocityArrows) {
      //       const velocityScale = 20;
      //       new Paper.Path({
      //         segments: [
      //           new Paper.Point(position.x, position.y),
      //           new Paper.Point(
      //             position.x + velocity.x * velocityScale,
      //             position.y + velocity.y * velocityScale
      //           ),
      //         ],
      //         strokeColor: "#4CAF50",
      //         strokeWidth: 2,
      //         strokeCap: "round",
      //         // Add arrowhead
      //         onFrame: function () {
      //           //   const arrowHead = new Paper.Path({
      //           //     segments: this.segments,
      //           //     strokeColor: "#4CAF50",
      //           //     strokeWidth: 2,
      //           //   });
      //           // Add arrow head geometry here
      //           //arrowHead.add(new Paper.Point(position.x, position.y));
      //         },
      //       });
      //     }

      //     // Force vector (pink)
      //     if (showForceArrows) {
      //       const forceScale = 50;
      //       new Paper.Path({
      //         segments: [
      //           new Paper.Point(position.x, position.y),
      //           new Paper.Point(
      //             position.x + (force?.x || 0) * forceScale,
      //             position.y + (force?.y || 0) * forceScale
      //           ),
      //         ],
      //         strokeColor: "#FF4081",
      //         strokeWidth: 2,
      //         strokeCap: "round",
      //         // Add similar arrowhead
      //       });
      //     }
      //   }
    });

    Paper.view.update();
  }, [particles, width, height]);

  return (
    <canvas
      ref={canvasRef}
      id="paper-canvas"
      style={{
        position: "fixed", // Changed to fixed to cover viewport
        top: 0,
        left: 0,
        width: "100vw", // Use viewport units
        height: "100vh",
        pointerEvents: "none", // Allow clicks to pass through
        zIndex: 10, // Ensure it's above other content but below UI
      }}
    />
  );
};

export default PaperParticleRenderer;
