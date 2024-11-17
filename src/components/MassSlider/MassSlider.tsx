import React from "react";
import { motion } from "framer-motion";
import { StarRenderer } from "../StarRenderer/StarRenderer";
import { STAR_TEMPLATES } from "../../constants/physics";

interface MassSliderProps {
  value: number;
  onChange: (value: number) => void;
  length: number;
}

export const MassSlider: React.FC<MassSliderProps> = ({
  value,
  onChange,
  length,
}) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const padding = 20;
  const innerLength = length - padding * 2;

  // Constants for mass calculation
  const MIN_MASS = 1;
  const MAX_MASS = 2500000;
  const EXPONENT = 4; // Adjust this to change the curve of the exponential

  // Convert percentage to mass using exponential scaling
  const percentageToMass = (percentage: number): number => {
    // Use exponential function to create non-linear scaling
    const exponentialValue = Math.pow(percentage, EXPONENT);
    return MIN_MASS + (MAX_MASS - MIN_MASS) * exponentialValue;
  };

  // Convert mass back to percentage for slider position
  const massToPercentage = (mass: number): number => {
    const normalizedMass = (mass - MIN_MASS) / (MAX_MASS - MIN_MASS);
    return Math.pow(normalizedMass, 1 / EXPONENT);
  };

  return (
    <div
      style={{
        height: `${length}px`,
        width: "40px",
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
          height: `${innerLength}px`,
          width: "2px",
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "1px",
        }}
      />

      <motion.div
        drag="y"
        dragConstraints={sliderRef}
        dragElastic={0}
        dragMomentum={false}
        onDrag={(_, info) => {
          if (sliderRef.current) {
            const sliderRect = sliderRef.current.getBoundingClientRect();
            const relativeY = info.point.y - (sliderRect.top + padding);
            const percentage =
              Math.max(0, Math.min(innerLength, relativeY)) / innerLength;

            // Convert percentage to mass value
            const mass = percentageToMass(percentage); // Invert percentage so top = max mass

            console.log("##percentage:", 1 - percentage);
            console.log("##mass:", mass);
            onChange(mass);
          }
        }}
        // Position the star based on the current mass value
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
