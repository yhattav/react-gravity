import React, { useRef } from "react";
import { motion } from "framer-motion";
import { GravityPoint } from "../../utils/types/physics";
import { Point2D } from "../../utils/types/physics";
import { StarRenderer } from "../../components/StarRenderer/StarRenderer";

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

  const handlePointerDown = () => {
    isDraggingRef.current = false;
    timeoutRef.current = setTimeout(() => {
      isDraggingRef.current = true;
    }, 200); // Wait 200ms before considering it a drag
  };

  const reportPosition = (newPosition: Point2D) => {
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const finalPosition = {
        x: Math.round(newPosition.x + containerRect.left),
        y: Math.round(newPosition.y + containerRect.top),
      };
      reportNewPosition(finalPosition, index);
    }
  };

  const handlePointerUp = () => {
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
        reportPosition({ x: Number(latest.x), y: Number(latest.y) });
      }}
      drag={!disabled}
      dragMomentum={false}
      dragElastic={0}
      onDrag={() => {
        isDraggingRef.current = true;
        onDrag();
      }}
      initial={{ x: point.x, y: point.y }}
      onDragEnd={onDragEnd}
      onPointerDown={disabled ? undefined : handlePointerDown}
      onPointerUp={disabled ? undefined : handlePointerUp}
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
              scale: 1.1,
            }
      }
    >
      <StarRenderer mass={point.mass} />
    </motion.div>
  );
};
