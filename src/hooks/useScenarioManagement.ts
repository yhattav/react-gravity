import { useState, useCallback } from "react";
import { Scenario } from "../types/scenario";
import { PhysicsSettings } from "../constants/physics";
import {
  GravityPoint,
  toSerializableGravityPoint,
  toGravityPoint,
} from "../utils/types/physics";
import {
  Particle,
  toSerializableParticle,
  toParticle,
} from "../types/particle";
import {
  SimulatorPath,
  toSerializableSimulatorPath,
  toSimulatorPath,
} from "../utils/types/path";
import { createShareableLink } from "../utils/compression";
import { Point } from "paper";

interface UseScenarioManagementProps {
  physicsConfig: PhysicsSettings;
  gravityPoints: GravityPoint[];
  particles: Particle[];
  paths: SimulatorPath[];
  setIsPaused: (paused: boolean) => void;
  setGravityPoints: (points: GravityPoint[]) => void;
  setParticles: (particles: Particle[]) => void;
  setPaths: (paths: SimulatorPath[]) => void;
  updateSettings: (settings: Partial<PhysicsSettings>) => void;
  setIsSimulationStarted: (started: boolean) => void;
  setShouldResetRenderer: (reset: boolean) => void;
  saveScenario: (scenario: Scenario) => void;
}

interface UseScenarioManagementReturn {
  isScenarioPanelOpen: boolean;
  setIsScenarioPanelOpen: (open: boolean) => void;
  isSettingsPanelOpen: boolean;
  setIsSettingsPanelOpen: (open: boolean) => void;
  isSaveModalOpen: boolean;
  setIsSaveModalOpen: (open: boolean) => void;
  shareableLink: string;
  handleExportScenario: (e: React.MouseEvent) => void;
  handleSaveScenario: (name: string) => void;
  handleSelectScenario: (scenario: Scenario) => void;
  handleScenarioPanelToggle: (e: React.MouseEvent) => void;
  handleSettingsPanelToggle: (e: React.MouseEvent) => void;
}

export const useScenarioManagement = ({
  physicsConfig,
  gravityPoints,
  particles,
  paths,
  setIsPaused,
  setGravityPoints,
  setParticles,
  setPaths,
  updateSettings,
  setIsSimulationStarted,
  setShouldResetRenderer,
  saveScenario,
}: UseScenarioManagementProps): UseScenarioManagementReturn => {
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
      saveScenario(scenario);
      setIsSaveModalOpen(false);
    },
    [physicsConfig, gravityPoints, particles, paths, saveScenario]
  );

  const handleSelectScenario = useCallback(
    (scenario: Scenario) => {
      // First pause the simulation
      const isCurrentlyPaused = true;
      setIsPaused(true);

      // Trigger reset for all renderers
      setShouldResetRenderer(true);

      // Clear current state
      setParticles([]);
      setGravityPoints([]);
      setPaths([]);

      // Wait for cleanup to complete before setting new data
      requestAnimationFrame(() => {
        // Update settings
        updateSettings(scenario.data.settings);

        // Set new data in the next frame
        requestAnimationFrame(() => {
          // Convert gravity points
          setGravityPoints(
            (scenario.data.gravityPoints || []).map((point) => ({
              ...toGravityPoint(point),
              id: point.id || Math.random().toString(36).substr(2, 9),
            }))
          );

          // Convert particles
          setParticles(
            (scenario.data.particles || []).map((particle) => ({
              ...toParticle(particle),
              force: new Point(0, 0),
            }))
          );

          // Convert paths
          setPaths(
            (scenario.data.paths || []).map((path) => ({
              ...toSimulatorPath(path),
              id: path.id || Math.random().toString(36).substr(2, 9),
            }))
          );

          // Complete reset and resume simulation
          setShouldResetRenderer(false);
          setIsSimulationStarted(true);
          setIsScenarioPanelOpen(false);
          setIsPaused(isCurrentlyPaused);
        });
      });
    },
    [
      setIsPaused,
      setShouldResetRenderer,
      setParticles,
      setGravityPoints,
      setPaths,
      updateSettings,
      setIsSimulationStarted,
    ]
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
    handleSelectScenario,
    handleScenarioPanelToggle,
    handleSettingsPanelToggle,
  };
};
