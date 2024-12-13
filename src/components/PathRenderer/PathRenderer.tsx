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
  const renderCountRef = useRef(0);
  const mountedRef = useRef(false);

  // Initialize Paper.js scope
  useEffect(() => {
    // Skip if already mounted
    if (mountedRef.current) {
      return;
    }

    if (!canvasRef.current) {
      console.warn(`[PathRenderer ${simulatorId}] No canvas ref`);
      return;
    }

    // Create a new Paper.js scope for this canvas
    const scope = new Paper.PaperScope();
    scopeRef.current = scope;
    mountedRef.current = true;

    // Get container dimensions
    const container = canvasRef.current.parentElement;
    if (!container) {
      console.warn(`[PathRenderer ${simulatorId}] No parent container`);
      return;
    }

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
      scope.activate();
      const newRect = container.getBoundingClientRect();
      canvasRef.current.width = newRect.width * pixelRatio;
      canvasRef.current.height = newRect.height * pixelRatio;
      scope.view.viewSize = new scope.Size(newRect.width, newRect.height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (scope && scope.project) {
        scope.activate();
        scope.project.clear();
      }
      mountedRef.current = false;
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
  }, [shouldReset, onResetComplete, simulatorId]);

  // Update paths
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || !scope.project) {
      return;
    }

    renderCountRef.current++;
    const renderCount = renderCountRef.current;

    scope.activate();

    // Clear previous frame
    scope.project.activeLayer.removeChildren();

    // Draw all paths
    paths?.forEach((simulatorPath, index) => {
      try {
        const pathCopy = simulatorPath.path.clone();
        scope.project.activeLayer.addChild(pathCopy);
      } catch (error) {
        console.error(
          `[PathRenderer ${simulatorId}] Error adding path ${index}:`,
          error
        );
      }
    });

    try {
      scope.view.update();
    } catch (error) {
      console.error(
        `[PathRenderer ${simulatorId}] Error updating view:`,
        error
      );
    }
  }, [paths, simulatorId]);

  useEffect(() => {
    console.log(simulatorId, ">>simulatorId");
  }, [simulatorId]);
  useEffect(() => {
    console.log(paths, ">>paths");
  }, [paths]);

  return (
    <canvas
      ref={canvasRef}
      className={`path-canvas-${simulatorId}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 20, // Added zIndex to ensure it's above other elements
      }}
    />
  );
};
