import React, { useRef, useState } from "react";
import { reactIcon } from "../../scenarios/defaults/reactIcon";
import { GravitySimulatorApi } from "../GravitySimulator/GravitySimulator";
import { GravitySimulatorWithSettings } from "../GravitySimulatorWithSettings/GravitySimulatorWithSettings";
import { Point2D } from "../../utils/types/physics";

interface ReactLogoIconProps {
  duration?: number; // Duration in milliseconds before pausing, if not provided it will run indefinitely
}

export const ReactLogoIcon: React.FC<ReactLogoIconProps> = ({ duration }) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const [simulatorApi, setSimulatorApi] = useState<GravitySimulatorApi | null>(
    null
  );

  const handleApiReady = (api: GravitySimulatorApi) => {
    setSimulatorApi(api);
    if (duration) {
      setTimeout(() => {
        api?.pause();
      }, duration);
    }
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
      onMouseLeave={() => (duration ? simulatorApi?.pause() : null)}
    >
      <GravitySimulatorWithSettings
        simulatorId="react-logo-icon"
        gravityRef={iconRef}
        disableSound={true}
        initialScenario={reactIcon}
        removeOverlay={true}
        blockInteractions={true}
        className="react-logo-icon"
        onApiReady={handleApiReady}
        pointerPosRef={{ current: { x: 0, y: 0 } as Point2D }}
      />
    </div>
  );
};
