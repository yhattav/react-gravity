import React from "react";
import { motion } from "framer-motion";
import { StarRenderer } from "../StarRenderer/StarRenderer";
import { STAR_TEMPLATES } from "../../constants/physics";

interface MassSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const MassSlider: React.FC<MassSliderProps> = ({ value, onChange }) => {
  return (
    <div
      style={{
        height: "200px",
        width: "40px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        position: "relative",
        marginLeft: "20px",
      }}
    >
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 200 }}
        dragElastic={0}
        dragMomentum={false}
        onDrag={(_, info) => {
          const newValue = Math.round(201 - info.point.y);
          const clampedValue = Math.max(1, Math.min(200, newValue));
          onChange(clampedValue);
        }}
        style={{
          width: "40px",
          height: "40px",
          position: "absolute",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <StarRenderer mass={STAR_TEMPLATES[0].mass} />
      </motion.div>
    </div>
  );
};
