import { useState, useCallback } from "react";
import { Point } from "paper";
import { GravityPoint, Point2D } from "../utils/types/physics";
import { StarTemplate } from "../types/star";

export const useGravityPoints = (initialPoints: GravityPoint[] = []) => {
  const [gravityPoints, setGravityPoints] =
    useState<GravityPoint[]>(initialPoints);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingNewStar, setIsDraggingNewStar] = useState(false);

  const handlePointDelete = useCallback((index: number) => {
    setGravityPoints((currentPoints) => {
      const newPoints = currentPoints.filter((_, i) => i !== index);
      return newPoints.map((point) => ({
        ...point,
        id: point.id || Math.random().toString(36).substr(2, 9),
      }));
    });
  }, []);

  const handleReportNewPosition = useCallback(
    (point: Point2D, index: number) => {
      if (
        gravityPoints[index].position.x === point.x &&
        gravityPoints[index].position.y === point.y
      )
        return;
      setGravityPoints((points) =>
        points.map((point2, i) =>
          i === index
            ? {
                ...point2,
                position: new Point(point.x, point.y),
              }
            : point2
        )
      );
    },
    [gravityPoints]
  );

  const handleDrag = useCallback(() => {
    setTimeout(() => {
      setIsDragging(true);
    }, 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => {
      setIsDragging(false);
    }, 0);
  }, []);

  const handleStarDragStart = useCallback(() => {
    setIsDraggingNewStar(true);
  }, []);

  const handleStarDragEnd = useCallback(
    (
      template: StarTemplate,
      e: MouseEvent | TouchEvent | PointerEvent,
      gravityRef: React.RefObject<HTMLDivElement>
    ) => {
      setIsDraggingNewStar(false);
      if (gravityRef.current) {
        const rect = gravityRef.current.getBoundingClientRect();
        const clientX =
          "clientX" in e ? e.clientX : (e as TouchEvent).touches[0].clientX;
        const clientY =
          "clientY" in e ? e.clientY : (e as TouchEvent).touches[0].clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          setGravityPoints((points) => [
            ...points,
            {
              id: Math.random().toString(36).substr(2, 9),
              position: new Point(x, y),
              label: template.label,
              mass: template.mass,
            },
          ]);
        }
      }
    },
    []
  );

  return {
    gravityPoints,
    setGravityPoints,
    isDragging,
    isDraggingNewStar,
    handlePointDelete,
    handleReportNewPosition,
    handleDrag,
    handleDragEnd,
    handleStarDragStart,
    handleStarDragEnd,
  };
};
