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
  label?: string;
}

export const MassSlider: React.FC<MassSliderProps> = ({
  value,
  onChange,
  length,
  orientation = "horizontal",
  onDragStart,
  onDragEnd,
  label,
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

  const formatMass = (mass: number): string => {
    if (mass >= 1000000) {
      return `${(mass / 1000000).toFixed(1)}M`;
    } else if (mass >= 1000) {
      return `${(mass / 1000).toFixed(1)}K`;
    }
    return mass.toFixed(0);
  };

  // Add this function to determine star type based on mass
  const getStarType = (mass: number): string => {
    if (mass < 1000) return "Brown Dwarf";
    if (mass < 20000) return "Red Dwarf";
    if (mass < 200000) return "Main Sequence";
    if (mass < 1000000) return "Red Giant";
    return "Super Giant";
  };

  return (
    <div
      style={{
        width: isVertical ? "20px" : `${length}px`,
        height: isVertical ? `${length}px` : "20px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        position: "relative",
        display: "flex",
        margin: "5px",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.8)",
          left: "10px",
          fontFamily: "monospace",
        }}
      >
        {formatMass(value)}
        <div style={{ textAlign: "center" }}>{label || getStarType(value)}</div>
      </div>
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
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
                ? info.point.y - sliderRect.top
                : info.point.x - sliderRect.left;

              const percentage =
                Math.max(0, Math.min(innerLength, relativePos)) / innerLength;

              const adjustedPercentage = isVertical
                ? 1 - percentage
                : percentage;
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
    </div>
  );
};
