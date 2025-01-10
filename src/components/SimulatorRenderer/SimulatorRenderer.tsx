import React from "react";
import { GravityPointComponent } from "../GravityPoint/GravityPoint";
import { ParticleRenderer } from "../ParticleRenderer/ParticleRenderer";
import { PathRenderer } from "../PathRenderer/PathRenderer";
import { GravityVision } from "../GravityVision/GravityVision";
import { D3GravityVision } from "../D3GravityVision/D3GravityVision";
import { GravityPoint, WarpPoint, Point2D } from "../../utils/types/physics";
import { Particle } from "../../types/particle";
import { SimulatorPath } from "../../utils/types/path";
import { PhysicsSettings } from "../../constants/physics";

interface SimulatorRendererProps {
  paperScope: paper.PaperScope | null;
  particlesRef: React.RefObject<Particle[]>;
  gravityPoints: GravityPoint[];
  paths: SimulatorPath[];
  isPausedRef: React.RefObject<boolean>;
  shouldReset: boolean;
  onResetComplete: () => void;
  settings: PhysicsSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  handlePointDelete: (index: number) => void;
  handleReportNewPosition: (point: Point2D, index: number) => void;
  handleDrag: () => void;
  handleDragEnd: () => void;
  blockInteractions: boolean;
  isSimulationStarted: boolean;
  simulatorId: string;
  warpPoints: WarpPoint[];
}

export const SimulatorRenderer: React.FC<SimulatorRendererProps> = ({
  paperScope,
  particlesRef,
  gravityPoints,
  paths,
  isPausedRef,
  shouldReset,
  onResetComplete,
  settings,
  containerRef,
  handlePointDelete,
  handleReportNewPosition,
  handleDrag,
  handleDragEnd,
  blockInteractions,
  isSimulationStarted,
  simulatorId,
  warpPoints,
}) => {
  if (!paperScope) return null;

  return (
    <>
      {gravityPoints.map((point, index) => (
        <GravityPointComponent
          key={point.id || index}
          point={point}
          index={index}
          onDrag={handleDrag}
          reportNewPosition={handleReportNewPosition}
          onDragEnd={handleDragEnd}
          onDelete={handlePointDelete}
          containerRef={containerRef}
          disabled={blockInteractions}
        />
      ))}

      {isSimulationStarted && (
        <ParticleRenderer
          scope={paperScope}
          particlesRef={particlesRef}
          isPausedRef={isPausedRef}
          shouldReset={shouldReset}
          onResetComplete={onResetComplete}
        />
      )}

      <PathRenderer
        scope={paperScope}
        paths={paths}
        shouldReset={shouldReset}
        onResetComplete={onResetComplete}
        simulatorId={simulatorId}
      />

      {settings.SHOW_GRAVITY_VISION && (
        <GravityVision
          scope={paperScope}
          warpPoints={warpPoints}
          settings={settings}
          containerRef={containerRef}
          isPausedRef={isPausedRef}
        />
      )}

      {settings.SHOW_D3_GRAVITY_VISION && (
        <D3GravityVision
          warpPoints={warpPoints}
          settings={settings}
          containerRef={containerRef}
          isPausedRef={isPausedRef}
        />
      )}
    </>
  );
};
