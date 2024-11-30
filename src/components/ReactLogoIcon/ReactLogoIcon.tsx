import React, { useRef, useState } from "react";
//import { GravitySimulator } from "../GravitySimulator/GravitySimulator";
import { reactIcon } from "../../scenarios/defaults/reactIcon";
import { Point2D } from "../../utils/types/physics";
import { GravitySimulatorApi } from "../GravitySimulator/GravitySimulator";
import { GravitySimulatorWithSettings } from "../GravitySimulatorWithSettings/GravitySimulatorWithSettings";

export const ReactLogoIcon: React.FC = () => {
  const iconRef = useRef<HTMLDivElement>(null);
  const [simulatorApi, setSimulatorApi] = useState<GravitySimulatorApi | null>(
    null
  );

  const handleApiReady = (api: GravitySimulatorApi) => {
    setSimulatorApi(api);
    setTimeout(() => {
      api?.pause();
    }, 3000);
  };

  return (
    <div
      style={{
        width: "51px",
        height: "51px",
        position: "relative",
        marginRight: "10px",
      }}
      ref={iconRef}
      onMouseEnter={() => simulatorApi?.play()}
      onMouseLeave={() => simulatorApi?.pause()}
    >
      <GravitySimulatorWithSettings
        simulatorId="react-logo-icon"
        gravityRef={iconRef}
        pointerPos={{ x: 0, y: 0 } as Point2D}
        initialScenario={reactIcon}
        removeOverlay={true}
        blockInteractions={true}
        className="react-logo-icon"
        onApiReady={handleApiReady}
      />
    </div>
  );
};
