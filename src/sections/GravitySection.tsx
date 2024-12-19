import React, { useRef, useCallback } from "react";
import { CustomCursor } from "@yhattav/react-component-cursor";
import { Card } from "antd";
import { DebugData } from "../types/Debug";
// import { GravitySimulatorWithSettings } from "../components/GravitySimulatorWithSettings/GravitySimulatorWithSettings";
import { Point } from "paper";
import { Vector } from "../utils/types/physics";

interface GravitySectionProps {
  onDebugData?: (data: DebugData) => void;
}

export const GravitySection: React.FC<GravitySectionProps> = ({
  onDebugData,
}) => {
  const gravityRef = useRef<HTMLDivElement>(null);
  const pointerPosRef = useRef<Vector | null>(null);

  const handleCursorMove = useCallback(async (x: number, y: number) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (isFinite(x) && isFinite(y)) {
      pointerPosRef.current = new Point(x, y);
    }
  }, []);

  return (
    <Card
      onDragOver={(e) => e.preventDefault()}
      style={{
        height: "100%",
        position: "relative",
        border: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      styles={{
        body: {
          flex: 1,
          padding: 0,
          height: "100%",
          position: "relative",
        },
      }}
    >
      <CustomCursor
        containerRef={gravityRef}
        smoothFactor={1}
        onMove={handleCursorMove}
        hideNativeCursor={false}
      >
        <div style={{ width: "100%", height: "100%" }} />
      </CustomCursor>

      {/* <GravitySimulatorWithSettings
        simulatorId="gravity-main-section"
        gravityRef={gravityRef}
        pointerPosRef={pointerPosRef}
        onDebugData={onDebugData}
      /> */}
    </Card>
  );
};
