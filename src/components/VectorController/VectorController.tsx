import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const scopeRef = useRef<paper.PaperScope>();
  const [isDragging, setIsDragging] = useState(false);

  const pixelToNormalized = useCallback(
    (pixel: Point2D): Point2D => ({
      x: pixel.x / (width / 2) - 1,
      y: pixel.y / (height / 2) - 1,
    }),
    [width, height]
  );

  const normalizedToValue = useCallback(
    (normalized: Point2D): Point2D => ({
      x: normalized.x * max.x,
      y: normalized.y * max.y,
    }),
    [max]
  );

  const valueToNormalized = useCallback(
    (val: Point2D): Point2D => ({
      x: val.x / max.x,
      y: val.y / max.y,
    }),
    [max]
  );

  const drawArrow = useCallback(() => {
    if (!scopeRef.current) return;

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

    // Draw x and y axes
    new scope.Path.Line({
      from: [0, height / 2],
      to: [width, height / 2],
      strokeColor: "rgba(255, 255, 255, 0.2)",
      strokeWidth: 1,
    });

    new scope.Path.Line({
      from: [width / 2, 0],
      to: [width / 2, height],
      strokeColor: "rgba(255, 255, 255, 0.2)",
      strokeWidth: 1,
    });

    // Create center point
    new scope.Path.Circle({
      center,
      radius: 3,
      fillColor: "rgba(255, 255, 255, 0.5)",
    });

    // Only create arrow if there's a direction
    if (direction.length > 0) {
      createArrow(
        center,
        direction,
        "#FF4081",
        Math.min(width, height) / 2 - 10
      );
    }

    scope.view.update();
  }, [width, height, value, valueToNormalized]);

  useEffect(() => {
    if (!canvasRef.current) return;

    scopeRef.current = new Paper.PaperScope();
    scopeRef.current.setup(canvasRef.current);

    requestAnimationFrame(drawArrow);

    return () => {
      if (scopeRef.current) {
        scopeRef.current.project.clear();
        scopeRef.current.remove();
      }
    };
  }, [drawArrow]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pixel: Point2D = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Check if click is in the center area (10px radius from center)
    const centerX = width / 2;
    const centerY = height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(pixel.x - centerX, 2) + Math.pow(pixel.y - centerY, 2)
    );

    if (distanceFromCenter <= 10) {
      // Reset to 0,0 if clicking center
      onChange({ x: 0, y: 0 });
      return;
    }

    const normalized = pixelToNormalized(pixel);
    const clampedNormalized = {
      x: Math.max(-1, Math.min(1, normalized.x)),
      y: Math.max(-1, Math.min(1, normalized.y)),
    };

    onChange(normalizedToValue(clampedNormalized));
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
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
    },
    [isDragging, normalizedToValue, pixelToNormalized, onChange]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    drawArrow();
  }, [drawArrow]);

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
