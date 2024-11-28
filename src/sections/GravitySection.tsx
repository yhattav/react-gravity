import React, { useRef, useState, useCallback } from "react";
import { CustomCursor } from "@yhattav/react-component-cursor";
import { Card } from "antd";
import { Point2D } from "../utils/types/physics";
import { GravitySimulator } from "../components/GravitySimulator/GravitySimulator";
import { DebugData } from "../types/Debug";
import { Scenario } from "../types/scenario";

interface GravitySectionProps {
  onDebugData?: (data: DebugData) => void;
}

// const testScenario: Scenario = {
//   id: "test-react",
//   name: "Test React",
//   description: "A test scenario based on the React logo",
//   data: {
//     settings: {
//       NEW_PARTICLE_MASS: 0.016,
//       NEW_PARTICLE_ELASTICITY: 1,
//       FRICTION: 1,
//       DELTA_TIME: 0.016666,
//       POINTER_MASS: 0,
//       SHOW_VELOCITY_ARROWS: false,
//       SHOW_FORCE_ARROWS: false,
//       CONSTANT_FORCE_X: 0,
//       CONSTANT_FORCE_Y: 0,
//       SOLID_BOUNDARIES: true,
//       PARTICLES_EXERT_GRAVITY: false,
//     },
//     gravityPoints: [
//       {
//         x: 275,
//         y: 300,
//         label: "Nucleus",
//         mass: 100000,
//         color: "#61dafb",
//       },
//     ],
//     particles: [
//       {
//         id: "electron-1",
//         position: { x: 295, y: 300 },
//         velocity: { x: 0, y: -30 },
//         mass: 0.016,
//         elasticity: 1,
//         color: "#61dafb",
//         size: 4,
//         showVectors: false,
//       },
//       {
//         id: "electron-2",
//         position: { x: 265, y: 317 },
//         velocity: { x: 26, y: 15 },
//         mass: 0.016,
//         elasticity: 1,
//         color: "#61dafb",
//         size: 4,
//         showVectors: false,
//       },
//       {
//         id: "electron-3",
//         position: { x: 265, y: 283 },
//         velocity: { x: 26, y: -15 },
//         mass: 0.016,
//         elasticity: 1,
//         color: "#61dafb",
//         size: 4,
//         showVectors: false,
//       },
//     ],
//   },
// };

export const GravitySection: React.FC<GravitySectionProps> = ({
  onDebugData,
}) => {
  const gravityRef = useRef<HTMLDivElement>(null);
  const [pointerPos, setPointerPos] = useState<Point2D>({ x: 0, y: 0 });

  const handleCursorMove = useCallback((x: number, y: number) => {
    if (isFinite(x) && isFinite(y)) {
      setPointerPos({ x, y });
    }
  }, []);

  return (
    <>
      <Card
        onDragOver={(e) => e.preventDefault()}
        style={{
          height: "100%",
          position: "relative",
          border: "none",
          overflow: "hidden",
        }}
      >
        <CustomCursor
          containerRef={gravityRef}
          smoothFactor={1}
          onMove={handleCursorMove}
          hideNativeCursor={false}
        >
          <div style={{ width: "100vw", height: "100vh" }} />
        </CustomCursor>

        <GravitySimulator
          gravityRef={gravityRef}
          pointerPos={pointerPos}
          onDebugData={onDebugData}
          //initialScenario={testScenario}
        />
      </Card>
    </>
  );
};
