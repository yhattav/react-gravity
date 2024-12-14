import React, { useEffect, useRef } from "react";
import Paper from "paper";

interface PaperCanvasProps {
  simulatorId: string;
  onCanvasReady: (scope: paper.PaperScope) => void;
}

export const PaperCanvas: React.FC<PaperCanvasProps> = ({
  simulatorId,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scopeRef = useRef<paper.PaperScope>();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a new Paper.js scope for this canvas
    const scope = new Paper.PaperScope();
    scopeRef.current = scope;

    // Setup with explicit scope
    scope.setup(canvasRef.current);

    // Get container dimensions
    const container = canvasRef.current.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const pixelRatio = 1;

    canvasRef.current.width = rect.width * pixelRatio;
    canvasRef.current.height = rect.height * pixelRatio;
    scope.view.viewSize = new scope.Size(rect.width, rect.height);
    scope.view.scale(pixelRatio, pixelRatio);

    const handleResize = () => {
      if (!container || !canvasRef.current || !scope.view) return;
      const newRect = container.getBoundingClientRect();
      canvasRef.current.width = newRect.width * pixelRatio;
      canvasRef.current.height = newRect.height * pixelRatio;
      scope.view.viewSize = new scope.Size(newRect.width, newRect.height);
      scope.view.update();
    };

    window.addEventListener("resize", handleResize);
    onCanvasReady(scope);

    return () => {
      window.removeEventListener("resize", handleResize);
      scope.project?.clear();
    };
  }, [onCanvasReady]);

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
