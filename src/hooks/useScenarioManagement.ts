import { useState, useCallback } from "react";
import { Scenario } from "../types/scenario";
import { createShareableLink } from "../utils/compression";
import {
  GravityPoint,
  toSerializableGravityPoint,
} from "../utils/types/physics";
import { Particle, toSerializableParticle } from "../types/particle";
import {
  SimulatorPath,
  toSerializableSimulatorPath,
} from "../utils/types/path";
import { PhysicsSettings } from "../constants/physics";

export const useScenarioManagement = (
  physicsConfig: PhysicsSettings,
  gravityPoints: GravityPoint[],
  particles: Particle[],
  paths: SimulatorPath[],
  setIsPaused: (paused: boolean) => void
) => {
  const [isScenarioPanelOpen, setIsScenarioPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  const handleExportScenario = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const scenario: Scenario = {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        description: "User saved scenario",
        data: {
          settings: physicsConfig,
          gravityPoints: gravityPoints.map(toSerializableGravityPoint),
          particles: particles.map(toSerializableParticle),
          paths: paths.map(toSerializableSimulatorPath),
        },
      };
      setShareableLink(createShareableLink(scenario));
      setIsPaused(true);
      setIsSaveModalOpen(true);
    },
    [physicsConfig, gravityPoints, particles, paths, setIsPaused]
  );

  const handleSaveScenario = useCallback(
    (name: string) => {
      const scenario: Scenario = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description: "User saved scenario",
        data: {
          settings: physicsConfig,
          gravityPoints: gravityPoints.map(toSerializableGravityPoint),
          particles: particles.map(toSerializableParticle),
          paths: paths.map(toSerializableSimulatorPath),
        },
      };
      // Here you would typically save to your storage
      setIsSaveModalOpen(false);
    },
    [physicsConfig, gravityPoints, particles, paths]
  );

  const handleScenarioPanelToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScenarioPanelOpen((prev) => !prev);
    setIsSettingsPanelOpen(false);
  }, []);

  const handleSettingsPanelToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsPanelOpen((prev) => !prev);
    setIsScenarioPanelOpen(false);
  }, []);

  return {
    isScenarioPanelOpen,
    setIsScenarioPanelOpen,
    isSettingsPanelOpen,
    setIsSettingsPanelOpen,
    isSaveModalOpen,
    setIsSaveModalOpen,
    shareableLink,
    handleExportScenario,
    handleSaveScenario,
    handleScenarioPanelToggle,
    handleSettingsPanelToggle,
  };
};
