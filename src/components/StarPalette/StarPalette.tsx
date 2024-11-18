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
  const [isDragging, setIsDragging] = useState(false);

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
      className="floating-panel star-palette"
      animate={
        isDragging
          ? {
              overflow: "visible",
            }
          : {}
      }
      whileHover={{
        width: "400px",
        height: "60px",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ overflow: "hidden", width: "40px", height: "40px" }}
    >
      <div>
        {STAR_TEMPLATES.map((template, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: "20px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "height 0.3s ease-out",
              }}
            >
              <motion.div
                drag
                dragSnapToOrigin
                dragConstraints={containerRef}
                whileDrag={{ scale: 1.1, zIndex: 1000 }}
                onDragStart={() => {
                  setIsDragging(true);
                  onStarDragStart({
                    ...template,
                    mass: starMasses[index] || template.mass,
                  });
                }}
                onDragEnd={(e) => {
                  setTimeout(() => {
                    setIsDragging(false);
                  }, 900);
                  onStarDragEnd(
                    {
                      ...template,
                      mass: starMasses[index] || template.mass,
                    },
                    e
                  );
                }}
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
                {
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "20px" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      padding: "0px 10px",
                      fontSize: "0.8rem",
                      color: "rgba(255, 255, 255, 0.8)",
                      fontFamily:
                        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'",
                      textAlign: "center",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      position: "absolute",
                      top: "35px",
                      left: "0px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        minWidth: "50px",
                        textAlign: "left",
                      }}
                    >
                      {formatMass(starMasses[index] || template.mass)}
                    </span>
                    <span>{getStarType(starMasses[index])}</span>
                  </motion.div>
                }
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 1,
                  }}
                  style={{
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
                </motion.div>
              }
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
