import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarTemplate } from "../../types/star";
import { STAR_TEMPLATES } from "../../constants/physics";
import { StarRenderer } from "../StarRenderer/StarRenderer";
import { MassSlider } from "../MassSlider/MassSlider";
import { formatMass, getStarType } from "../../utils/mass/massUtils";

interface StarPaletteProps {
  onStarDragStart: (template: StarTemplate) => void;
  onStarDragEnd: (
    template: StarTemplate,
    e: MouseEvent | TouchEvent | PointerEvent
  ) => void;
  containerRef: React.RefObject<HTMLElement>;
  forceHover?: boolean;
}

export const StarPalette: React.FC<StarPaletteProps> = ({
  onStarDragStart,
  onStarDragEnd,
  containerRef,
  forceHover = false,
}) => {
  const [starMasses, setStarMasses] = useState<{ [key: number]: number }>({});
  const [isPaletteHovered, setIsPaletteHovered] = useState(forceHover);

  const handleStarMassChange = (index: number, mass: number) => {
    setStarMasses((prev) => ({
      ...prev,
      [index]: mass,
    }));
  };

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsPaletteHovered(true)}
      onMouseLeave={() => setIsPaletteHovered(false)}
      className="floating-panel star-palette"
      animate={{ height: isPaletteHovered ? "60px" : "40px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
    >
      <div style={{ padding: "0 10px" }}>
        {STAR_TEMPLATES.map((template, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "40px",
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
            </motion.div>
            <AnimatePresence>
              {(forceHover || isPaletteHovered) && (
                <motion.div
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: "auto", marginLeft: "20px" }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 1,
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <MassSlider
                    value={starMasses[index] || template.mass}
                    length={300}
                    orientation="horizontal"
                    onChange={(value) => handleStarMassChange(index, value)}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.8)",
                      fontFamily: "monospace",
                      textAlign: "left",
                    }}
                  >
                    {formatMass(starMasses[index] || template.mass)}
                    <div>{getStarType(starMasses[index] || template.mass)}</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
