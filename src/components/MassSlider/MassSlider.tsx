import React from "react";
import { motion } from "framer-motion";
import { StarRenderer } from "../StarRenderer/StarRenderer";

interface MassSliderProps {
  value: number;
  onChange: (value: number) => void;
  length: number;
  orientation?: "vertical" | "horizontal";
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const MassSlider: React.FC<MassSliderProps> = ({
  value,
  onChange,
  length,
  orientation = "horizontal",
  onDragStart,
  onDragEnd,
}) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const padding = 20;
  const innerLength = length - padding * 2;

  // Constants for mass calculation
  const MIN_MASS = 1;
  const MAX_MASS = 2500000;
  const EXPONENT = 4;

  const percentageToMass = (percentage: number): number => {
    const exponentialValue = Math.pow(percentage, EXPONENT);
    return MIN_MASS + (MAX_MASS - MIN_MASS) * exponentialValue;
  };

  const massToPercentage = (mass: number): number => {
    const normalizedMass = (mass - MIN_MASS) / (MAX_MASS - MIN_MASS);
    return Math.pow(normalizedMass, 1 / EXPONENT);
  };

  // Calculate initial position based on current value
  const initialPercentage = massToPercentage(value);
  const isVertical = orientation === "vertical";

  // Calculate the initial position relative to the center of the slider
  const initialPosition = initialPercentage * innerLength - innerLength / 2;

  return (
    <div
      style={{
        width: isVertical ? "40px" : `${length}px`,
        height: isVertical ? `${length}px` : "40px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        position: "relative",
        marginLeft: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={sliderRef}
        style={{
          width: isVertical ? "2px" : `${innerLength}px`,
          height: isVertical ? `${innerLength}px` : "2px",
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "1px",
        }}
      />

      <motion.div
        drag={isVertical ? "y" : "x"}
        dragConstraints={sliderRef}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => onDragStart?.()}
        onDragEnd={() => onDragEnd?.()}
        initial={isVertical ? { y: initialPosition } : { x: initialPosition }}
        onDrag={(_, info) => {
          if (sliderRef.current) {
            const sliderRect = sliderRef.current.getBoundingClientRect();
            const relativePos = isVertical
              ? info.point.y - (sliderRect.top + padding)
              : info.point.x - (sliderRect.left + padding);

            const percentage =
              Math.max(0, Math.min(innerLength, relativePos)) / innerLength;

            const adjustedPercentage = isVertical ? 1 - percentage : percentage;
            const mass = percentageToMass(adjustedPercentage);
            onChange(mass);
          }
        }}
        style={{
          position: "absolute",
          cursor: "grab",
          touchAction: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StarRenderer mass={value} />
      </motion.div>
    </div>
  );
};
