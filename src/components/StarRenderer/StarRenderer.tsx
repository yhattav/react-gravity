import React from "react";
import { StarTemplate } from "../../types/star";

interface StarRendererProps {
  template: StarTemplate;
  size?: number;
  glowIntensity?: number;
}

export const StarRenderer: React.FC<StarRendererProps> = ({
  template,
  glowIntensity = 15,
}) => {
  return (
    <div
      style={{
        width: template.size,
        height: template.size,
        backgroundColor: template.color,
        borderRadius: "50%",
        boxShadow: `0 0 ${glowIntensity}px ${template.color}`,
      }}
    />
  );
};
