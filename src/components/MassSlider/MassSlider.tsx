import React from "react";
import { motion } from "framer-motion";
import { StarRenderer } from "../StarRenderer/StarRenderer";
import { STAR_TEMPLATES } from "../../constants/physics";

interface MassSliderProps {
  value: number;
  onChange: (value: number) => void;
  length: number; // Height in pixels
}

export const MassSlider: React.FC<MassSliderProps> = ({
  value,
  onChange,
  length,
}) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const padding = 20; // Padding for top and bottom
  const innerLength = length - padding * 2; // Actual draggable area length

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
      {/* Inner track line */}
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

            // Convert to percentage using inner track length
            const percentage =
              Math.max(0, Math.min(innerLength, relativeY)) / innerLength;

            console.log("##percentage:", percentage);
            onChange(percentage);
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
        <StarRenderer mass={STAR_TEMPLATES[0].mass} />
      </motion.div>
    </div>
  );
};
