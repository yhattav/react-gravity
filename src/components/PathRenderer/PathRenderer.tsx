import React, { useEffect, useRef } from "react";
import Paper from "paper";
import { SimulatorPath } from "../../utils/types/path";

interface PathRendererProps {
  paths: SimulatorPath[];
  simulatorId?: string;
  shouldReset?: boolean;
  onResetComplete?: () => void;
}

export const PathRenderer: React.FC<PathRendererProps> = ({
  paths,
  simulatorId = "default",
  shouldReset = false,
  onResetComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scopeRef = useRef<paper.PaperScope>();

  // Initialize Paper.js scope
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a new Paper.js scope for this canvas
    const scope = new Paper.PaperScope();
    scopeRef.current = scope;

    // Get container dimensions
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

    return () => {
      window.removeEventListener("resize", handleResize);
      scope.activate();
      scope.project?.clear();
    };
  }, [simulatorId]);

  // Handle reset
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || !scope.project) return;

    if (shouldReset) {
      scope.activate();
      scope.project.activeLayer.removeChildren();
      scope.view.update();
      onResetComplete?.();
    }
  }, [shouldReset, onResetComplete]);

  // Update paths
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || !scope.project) return;

    scope.activate();

    // Clear previous frame
    scope.project.activeLayer.removeChildren();

    // Draw all paths
    paths.forEach((simulatorPath) => {
      const pathCopy = simulatorPath.path.clone();
      scope.project.activeLayer.addChild(pathCopy);

      console.log(`[${simulatorId}] Path added:`, {
        segments: pathCopy.segments.length,
        visible: pathCopy.visible,
        strokeColor: pathCopy.strokeColor,
        position: pathCopy.position,
      });
    });

    scope.view.update();
    console.log(
      `[${simulatorId}] Layer children:`,
      scope.project.activeLayer.children.length
    );
  }, [paths, simulatorId]);

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
      }}
    />
  );
};
