import React from "react";
import { motion } from "framer-motion";
import { StarTemplate } from "../../types/star";
import { STAR_TEMPLATES } from "../../constants/physics";
import { StarRenderer } from "../StarRenderer/StarRenderer";
import { useState } from "react";
import { MassSlider } from "../MassSlider/MassSlider";

interface StarPaletteProps {
  onStarDragStart: (template: StarTemplate) => void;
  onStarDragEnd: (
    template: StarTemplate,
    e: MouseEvent | TouchEvent | PointerEvent
  ) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export const StarPalette: React.FC<StarPaletteProps> = ({
  onStarDragStart,
  onStarDragEnd,
  containerRef,
}) => {
  const [starMasses, setStarMasses] = useState<{ [key: number]: number }>({});
  const [isPaletteHovered, setIsPaletteHovered] = useState(false);

  const handleStarMassChange = (index: number, mass: number) => {
    setStarMasses((prev) => ({
      ...prev,
      [index]: mass,
    }));
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsPaletteHovered(true)}
      onMouseLeave={() => setIsPaletteHovered(false)}
      style={{
        position: "absolute",
        left: 20,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        background: "rgba(0, 0, 0, 0.3)",
        padding: "15px",
        borderRadius: "12px",
        backdropFilter: "blur(8px)",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {STAR_TEMPLATES.map((template, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
            }}
          >
            <motion.div
              drag
              dragSnapToOrigin
              dragConstraints={containerRef}
              whileDrag={{ scale: 1.1, zIndex: 1000 }}
              onDragStart={() =>
                onStarDragStart({
                  ...template,
                  mass: starMasses[index] || template.mass,
                })
              }
              onDragEnd={(e) =>
                onStarDragEnd(
                  {
                    ...template,
                    mass: starMasses[index] || template.mass,
                  },
                  e
                )
              }
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
                position: "relative",
                touchAction: "none",
              }}
            >
              <StarRenderer mass={starMasses[index] || template.mass} />
              <div className="star-label">{template.label}</div>
            </motion.div>
            {isPaletteHovered && (
              <div
                style={{
                  marginLeft: "20px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MassSlider
                  value={starMasses[index] || template.mass}
                  length={300}
                  orientation="horizontal"
                  onChange={(value) => handleStarMassChange(index, value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
