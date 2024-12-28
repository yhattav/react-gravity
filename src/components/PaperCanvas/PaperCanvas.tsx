import React, { useEffect, useRef } from "react";
import paper from "paper";

interface PaperCanvasProps {
  simulatorId?: string;
  onCanvasReady: (scope: paper.PaperScope) => void;
  shouldReset?: boolean;
  onResetComplete?: () => void;
}

export const PaperCanvas: React.FC<PaperCanvasProps> = ({
  simulatorId = "default",
  onCanvasReady,
  shouldReset = false,
  onResetComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scopeRef = useRef<paper.PaperScope | null>(null);

  // Handle reset
  useEffect(() => {
    if (!shouldReset || !scopeRef.current) return;

    // Clear the canvas
    scopeRef.current.project.clear();

    // Create a new project
    const newScope = new paper.PaperScope();
    newScope.setup(canvasRef.current!);
    scopeRef.current = newScope;

    // Notify parent of new scope
    onCanvasReady(newScope);
    onResetComplete?.();
  }, [shouldReset, onCanvasReady, onResetComplete]);

  // Initial setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const scope = new paper.PaperScope();
    scope.setup(canvasRef.current);
    scopeRef.current = scope;
    onCanvasReady(scope);

    return () => {
      scope.project.clear();
      // @ts-expect-error next line
      scope.remove();
    };
  }, [onCanvasReady]);

  // Handle resize
  useEffect(() => {
    if (!canvasRef.current || !scopeRef.current) return;

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const scope = scopeRef.current;
      if (!canvas || !scope) return;

      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      scope.view.viewSize = new paper.Size(width, height);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(canvasRef.current.parentElement!);
    updateCanvasSize(); // Initial size update

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id={`gravity-canvas-${simulatorId}`}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};
