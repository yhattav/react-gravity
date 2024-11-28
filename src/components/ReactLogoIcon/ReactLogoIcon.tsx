import React, { useRef } from "react";
import { GravitySimulator } from "../GravitySimulator/GravitySimulator";
import { reactIcon } from "../../scenarios/defaults/reactIcon";
import { Point2D } from "../../utils/types/physics";

export const ReactLogoIcon: React.FC = () => {
  const iconRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        width: "51px",
        height: "51px",
        position: "relative",
        marginRight: "10px",
      }}
      ref={iconRef}
    >
      <GravitySimulator
        gravityRef={iconRef}
        pointerPos={{ x: 0, y: 0 } as Point2D}
        initialScenario={reactIcon}
        removeOverlay={true}
        blockInteractions={true}
        className="react-logo-icon"
      />
    </div>
  );
};
