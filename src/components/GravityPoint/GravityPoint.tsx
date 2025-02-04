import React, { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GravityPoint } from "../../utils/types/physics";
import { Point2D } from "../../utils/types/physics";
import { StarRenderer } from "../../components/StarRenderer/StarRenderer";
import { throttle } from "lodash";

interface GravityPointComponentProps {
  point: GravityPoint;
  index: number;
  onDrag: () => void;
  onDragEnd: () => void;
  reportNewPosition: (point: Point2D, index: number) => void;
  onDelete: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}

export const GravityPointComponent: React.FC<GravityPointComponentProps> = ({
  point,
  index,
  onDrag,
  reportNewPosition,
  onDragEnd,
  onDelete,
  containerRef,
  disabled = false,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("handleMouseDown");
    e.stopPropagation();
    isDraggingRef.current = false;
    timeoutRef.current = setTimeout(() => {
      isDraggingRef.current = true;
    }, 200); // Wait 200ms before considering it a drag
  };

  // Create a throttled report position function for this specific gravity point
  const throttledReportPosition = useCallback(
    throttle(
      (newPosition: Point2D) => {
        const container = containerRef.current;
        if (container) {
          const finalPosition = {
            x: Math.round(newPosition.x),
            y: Math.round(newPosition.y),
          };
          reportNewPosition(finalPosition, index);
        }
      },
      50,
      { leading: true, trailing: true }
    ),
    [containerRef, reportNewPosition, index]
  );

  const handleClick = () => {
    clearTimeout(timeoutRef.current);
    if (!isDraggingRef.current) {
      onDelete(index);
    }
    isDraggingRef.current = false;
  };

  return (
    <motion.div
      ref={elementRef}
      onUpdate={(latest) => {
        throttledReportPosition({ x: Number(latest.x), y: Number(latest.y) });
      }}
      drag={!disabled}
      dragMomentum={false}
      dragElastic={0}
      onDrag={() => {
        isDraggingRef.current = true;
        onDrag();
      }}
      initial={{ x: point.position.x, y: point.position.y }}
      onDragEnd={onDragEnd}
      onMouseDown={disabled ? undefined : handleMouseDown}
      onClick={disabled ? undefined : handleClick}
      data-point={index}
      style={{
        position: "absolute",
        cursor: disabled ? "default" : "grab",
        zIndex: 2,
      }}
      dragConstraints={containerRef}
      whileDrag={disabled ? undefined : { cursor: "grabbing" }}
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.6,
            }
      }
    >
      <StarRenderer mass={point.mass} />
    </motion.div>
  );
};
