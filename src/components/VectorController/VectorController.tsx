import React, { useState, useRef, useEffect } from "react";
import { Point2D } from "../../utils/types/physics";
import Paper from "paper";
import { createArrow } from "../../utils/physics/vectorUtils";

interface VectorControllerProps {
  value: Point2D;
  onChange: (value: Point2D) => void;
  max: Point2D;
  width?: number;
  height?: number;
}

export const VectorController: React.FC<VectorControllerProps> = ({
  value,
  onChange,
  max,
  width = 100,
  height = 100,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scopeRef = useRef<typeof Paper.PaperScope>();
  const [isDragging, setIsDragging] = useState(false);

  // Initialize Paper.js when the component mounts
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a new scope for this instance
    scopeRef.current = new Paper.PaperScope();
    scopeRef.current.setup(canvasRef.current);

    return () => {
      if (scopeRef.current) {
        scopeRef.current.project?.clear();
        scopeRef.current.remove();
      }
    };
  }, []);

  // Convert pixel coordinates to normalized coordinates
  const pixelToNormalized = (pixel: Point2D): Point2D => ({
    x: pixel.x / (width / 2) - 1,
    y: pixel.y / (height / 2) - 1,
  });

  // Convert normalized coordinates to actual values using max
  const normalizedToValue = (normalized: Point2D): Point2D => ({
    x: normalized.x * max.x,
    y: normalized.y * max.y,
  });

  // Convert actual values to normalized coordinates using max
  const valueToNormalized = (val: Point2D): Point2D => ({
    x: val.x / max.x,
    y: val.y / max.y,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pixel: Point2D = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const normalized = pixelToNormalized(pixel);
    const clampedNormalized = {
      x: Math.max(-1, Math.min(1, normalized.x)),
      y: Math.max(-1, Math.min(1, normalized.y)),
    };

    onChange(normalizedToValue(clampedNormalized));
    setIsDragging(true);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pixel: Point2D = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const normalized = pixelToNormalized(pixel);
    const clampedNormalized = {
      x: Math.max(-1, Math.min(1, normalized.x)),
      y: Math.max(-1, Math.min(1, normalized.y)),
    };

    onChange(normalizedToValue(clampedNormalized));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isDragging]);

  // Draw the arrow whenever the value changes
  useEffect(() => {
    if (!scopeRef.current?.project) return;

    const scope = scopeRef.current;
    scope.activate();
    scope.project.clear();

    const center = new scope.Point(width / 2, height / 2);
    const normalized = valueToNormalized(value);
    const direction = new scope.Point(normalized.x, normalized.y);

    // Create background circle
    new scope.Path.Circle({
      center,
      radius: Math.min(width, height) / 2 - 1,
      fillColor: "rgba(255, 255, 255, 0.1)",
    });

    // Create center point
    new scope.Path.Circle({
      center,
      radius: 3,
      fillColor: "rgba(255, 255, 255, 0.5)",
    });

    // Only create arrow if there's a direction
    if (direction.length > 0) {
      createArrow(center, direction, "white", Math.min(width, height) / 2 - 10);
    }

    scope.view.update();
  }, [value, width, height]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      style={{
        width,
        height,
        position: "relative",
        borderRadius: "50%",
        cursor: "pointer",
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
