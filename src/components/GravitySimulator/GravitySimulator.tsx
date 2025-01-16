import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { Point } from "paper";
import {
  Point2D,
  GravityPoint,
  Vector,
  WarpPoint,
  toGravityPoint,
  toSerializableGravityPoint,
} from "../../utils/types/physics";
import { StarPalette } from "../StarPalette/StarPalette";
import { StarTemplate } from "../../types/star";
import { getContainerOffset } from "../../utils/dom/domUtils";
import {
  INITIAL_GRAVITY_POINTS,
  PhysicsSettings,
} from "../../constants/physics";
import { SimulatorSettings } from "../SimulatorSettings/SimulatorSettings";
import { useSettings } from "../../contexts/SettingsContext";
import { debounce } from "lodash";
import "../../styles/global.scss";
import { DebugData } from "../../types/Debug";
import { ScenarioPanel } from "../ScenarioPanel/ScenarioPanel";
import { Scenario } from "../../types/scenario";
import { SaveScenarioModal } from "../SaveScenarioModal/SaveScenarioModal";
import {
  Particle,
  toParticle,
  toSerializableParticle,
} from "../../types/particle";
import { Position } from "@yhattav/react-component-cursor";
import {
  SimulatorPath,
  toSimulatorPath,
  toSerializableSimulatorPath,
} from "../../utils/types/path";
import { PaperCanvas } from "../PaperCanvas/PaperCanvas";
import { SimulatorRenderer } from "../SimulatorRenderer/SimulatorRenderer";
import { SimulatorControls } from "../SimulatorControls/SimulatorControls";
import { useAudioSystem } from "../../hooks/useAudioSystem";
import { useScenarioManagement } from "../../hooks/useScenarioManagement";
import { useGravityPoints } from "../../hooks/useGravityPoints";
import { useInteractionHandlers } from "../../hooks/useInteractionHandlers";
import { useSimulatorState } from "../../hooks/useSimulatorState";
import { useParticleSystem } from "../../hooks/useParticleSystem";
import { useScreenshot } from "../../hooks/useScreenshot";
import { JsonScenarioPanel } from "../JsonScenarioPanel/JsonScenarioPanel";

export interface GravitySimulatorProps {
  gravityRef: React.RefObject<HTMLDivElement>;
  pointerPosRef: React.RefObject<Position>;
  onDebugData?: (data: DebugData) => void;
  className?: string;
  removeOverlay?: boolean;
  initialScenario?: Scenario;
  blockInteractions?: boolean;
  disableSound?: boolean;
  onApiReady?: (api: GravitySimulatorApi) => void;
  simulatorId?: string;
}

export interface GravitySimulatorApi {
  // Simulation Control
  play: () => void;
  pause: () => void;
  reset: () => void;

  // Display Control
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
  invertColors: (invert: boolean) => void;

  // Particle Management
  addParticle: (
    position: Point2D,
    velocity: Point2D,
    options?: Partial<Omit<Particle, "position" | "id" | "velocity">>
  ) => void;
  removeAllParticles: () => void;

  // Gravity Points Management
  addGravityPoint: (point: Omit<GravityPoint, "id">) => void;
  removeGravityPoint: (index: number) => void;
  removeAllGravityPoints: () => void;

  // Scenario Management
  loadScenario: (scenario: Scenario) => void;
  exportCurrentScenario: () => Scenario;

  // Settings
  updateSettings: (settings: Partial<PhysicsSettings>) => void;
  getSettings: () => PhysicsSettings;

  // State Queries
  isPlaying: () => boolean;
  isFullscreen: () => boolean;
  getParticleCount: () => number;
  getGravityPointsCount: () => number;
}

export const GravitySimulator: React.FC<GravitySimulatorProps> = ({
  gravityRef,
  pointerPosRef,
  onDebugData,
  className,
  removeOverlay = false,
  initialScenario,
  blockInteractions = false,
  disableSound = false,
  onApiReady,
  simulatorId = "default",
}) => {
  const {
    settings: physicsConfig,
    updateSettings,
    saveScenario,
  } = useSettings();

  useEffect(() => {
    if (initialScenario?.data.settings) {
      updateSettings(initialScenario.data.settings);
    }
  }, [initialScenario, updateSettings]);

  const [offset, setOffset] = useState<Vector>(new Point(0, 0));
  const [paths, setPaths] = useState<SimulatorPath[]>(
    initialScenario?.data.paths?.map(toSimulatorPath) || []
  );
  const [paperScope, setPaperScope] = useState<paper.PaperScope | null>(null);
  const isPausedRef = useRef(false);

  // Use the gravity points hook
  const {
    gravityPoints,
    setGravityPoints,
    isDragging,
    isDraggingNewStar,
    handlePointDelete,
    handleReportNewPosition,
    handleDrag,
    handleDragEnd,
    handleStarDragStart,
    handleStarDragEnd,
  } = useGravityPoints(
    initialScenario?.data.gravityPoints?.map(toGravityPoint) ||
      INITIAL_GRAVITY_POINTS
  );

  // Use the particle system hook
  const {
    particles,
    setParticles,
    particlesRef,
    updateParticleMechanics,
    createParticle,
  } = useParticleSystem(
    physicsConfig,
    offset,
    pointerPosRef,
    gravityPoints,
    paths,
    gravityRef
  );

  // Use simulator state hook
  const {
    isSimulationStarted,
    setIsSimulationStarted,
    firstInteractionDetected,
    isPaused,
    setIsPaused,
    isFullscreen,
    setIsFullscreen,
    isColorInverted,
    setIsColorInverted,
    isFlashing,
    setIsFlashing,
    shouldResetRenderer,
    setShouldResetRenderer,
    handlePause,
    handleReset,
    handleFullscreenToggle: baseHandleFullscreenToggle,
    handleInvertColors,
    detectFirstInteraction,
  } = useSimulatorState(initialScenario, blockInteractions, () =>
    setParticles([])
  );

  // Use the interaction handlers hook
  const {
    handleContainerMouseDown,
    handleContainerMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
  } = useInteractionHandlers({
    blockInteractions,
    isDragging,
    isDraggingNewStar,
    isSimulationStarted,
    createParticle,
    setParticles,
    setIsSimulationStarted,
    detectFirstInteraction,
    pointerPosRef,
  });

  // Initialize particles with initial scenario data if available
  useEffect(() => {
    if (initialScenario?.data.particles) {
      setParticles(initialScenario.data.particles.map(toParticle));
    }
  }, [initialScenario, setParticles]);

  // Wrap fullscreen toggle to include gravityRef
  const handleFullscreenToggle = useCallback(() => {
    baseHandleFullscreenToggle(gravityRef);
  }, [baseHandleFullscreenToggle, gravityRef]);

  // Only wrap functions that need additional functionality
  const wrappedHandleStarDragStart = useCallback(() => {
    if (blockInteractions) return;
    detectFirstInteraction();
    handleStarDragStart();
  }, [blockInteractions, handleStarDragStart, detectFirstInteraction]);

  const wrappedHandleStarDragEnd = useCallback(
    (template: StarTemplate, e: MouseEvent | TouchEvent | PointerEvent) => {
      if (blockInteractions) return;
      handleStarDragEnd(template, e, gravityRef);
    },
    [blockInteractions, handleStarDragEnd, gravityRef]
  );

  const wrappedHandlePointDelete = useCallback(
    (index: number) => {
      detectFirstInteraction();
      handlePointDelete(index);
    },
    [handlePointDelete, detectFirstInteraction]
  );

  useEffect(() => {
    if (!isSimulationStarted || isPaused) return;
    let animationFrameId: number;

    const updateParticles = () => {
      setParticles((currentParticles) =>
        currentParticles.map((particle) => {
          const mechanics = updateParticleMechanics(particle, currentParticles);
          return { ...particle, ...mechanics };
        })
      );

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    animationFrameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimulationStarted, isPaused, updateParticleMechanics, setParticles]);

  // Update ref when isPaused changes
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Debug data effect
  useEffect(() => {
    onDebugData?.({
      particle: {
        position: particles.map((particle) => particle.position),
        velocity: particles.map((particle) => particle.velocity),
      },
      pointer: {
        position: pointerPosRef.current,
      },
      velocity: particles.map((particle) => particle.velocity),
      totalForce: particles.map((particle) => particle.force),
    });
  }, [particles, pointerPosRef, onDebugData]);

  // Use the scenario management hook
  const {
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
    getCurrentScenario,
  } = useScenarioManagement({
    physicsConfig,
    gravityPoints,
    particlesRef,
    paths,
    setIsPaused,
    setGravityPoints,
    setParticles,
    setPaths,
    updateSettings,
    setIsSimulationStarted,
    setShouldResetRenderer,
    saveScenario,
  });

  const [isJsonPanelOpen, setIsJsonPanelOpen] = useState(false);

  const handleJsonPanelToggle = useCallback(() => {
    setIsJsonPanelOpen((prev) => !prev);
  }, []);

  // Audio files definition
  const audioFiles = useMemo(
    () => [
      "/assets/audio/ambient2.mp3",
      "/assets/audio/ambient1.mp3",
      "/assets/audio/ambient3.mp3",
    ],
    []
  );

  // Use the audio system hook
  const {
    isAudioLoaded,
    isAudioPlaying,
    handleAudioToggle,
    notifyFirstInteraction,
  } = useAudioSystem({
    disableSound,
    particles,
    volumeSettings: {
      masterVolume: physicsConfig.MASTER_VOLUME,
      ambientVolume: physicsConfig.AMBIENT_VOLUME,
      particleVolume: physicsConfig.PARTICLE_VOLUME,
    },
    audioFiles,
  });

  // Handle first interaction
  useEffect(() => {
    if (firstInteractionDetected) {
      notifyFirstInteraction();
    }
  }, [firstInteractionDetected, notifyFirstInteraction]);

  useEffect(() => {
    const updateOffset = () => {
      const newOffset = getContainerOffset(gravityRef);
      if (newOffset) {
        setOffset(new Point(newOffset));
      }
    };

    // Update offset on mount
    updateOffset();

    // Optionally, update offset on window resize
    window.addEventListener("resize", debounce(updateOffset, 250));
    return () => window.removeEventListener("resize", updateOffset);
  }, [gravityRef]);

  const handleCanvasReady = useCallback((scope: paper.PaperScope) => {
    setPaperScope(scope);
  }, []);

  const generateWarpPoints = useCallback((): WarpPoint[] => {
    const warpPoints: WarpPoint[] = [];

    // Add gravity points
    gravityPoints?.forEach((point) => {
      warpPoints.push({
        position: point.position,
        effectiveMass: point.mass,
      });
    });

    // Add pointer if it exists
    if (
      pointerPosRef.current &&
      pointerPosRef.current.x &&
      pointerPosRef.current.y &&
      physicsConfig.POINTER_MASS > 0
    ) {
      warpPoints.push({
        position: new Point(
          pointerPosRef.current.x,
          pointerPosRef.current.y
        ).subtract(offset),
        effectiveMass: physicsConfig.POINTER_MASS,
      });
    }

    // Add particles if they exert gravity
    if (physicsConfig.PARTICLES_EXERT_GRAVITY) {
      particles?.forEach((particle) => {
        warpPoints.push({
          position: particle.position,
          effectiveMass: particle.mass * (particle.outgoingForceRatio ?? 1),
        });
      });
    }

    return warpPoints;
  }, [gravityPoints, particles, pointerPosRef, offset, physicsConfig]);

  // Use screenshot hook
  const { handleScreenshot } = useScreenshot({
    containerRef: gravityRef,
    setIsFlashing,
  });

  // Create and expose the API
  useEffect(
    () => {
      if (!onApiReady) return;

      const api: GravitySimulatorApi = {
        play: () => setIsPaused(false),
        pause: () => setIsPaused(true),
        reset: () => {
          setParticles([]);
          setIsSimulationStarted(false);
        },

        enterFullscreen: () => {
          gravityRef.current?.requestFullscreen();
          setIsFullscreen(true);
        },
        exitFullscreen: () => {
          document.exitFullscreen();
          setIsFullscreen(false);
        },
        toggleFullscreen: handleFullscreenToggle,
        invertColors: (invert: boolean) => setIsColorInverted(invert),

        addParticle: (position, velocity, options) => {
          setIsSimulationStarted(true);
          setParticles((current) => [
            ...current,
            createParticle(position, velocity, options),
          ]);
        },
        removeAllParticles: () => setParticles([]),

        addGravityPoint: (point) => {
          setGravityPoints((current) => [
            ...current,
            {
              ...point,
              id: Math.random().toString(36).substr(2, 9),
            },
          ]);
        },
        removeGravityPoint: wrappedHandlePointDelete,
        removeAllGravityPoints: () => setGravityPoints([]),

        loadScenario: handleSelectScenario,
        exportCurrentScenario: () => ({
          id: Math.random().toString(36).substr(2, 9),
          name: "Exported Scenario",
          description: "Current simulation state",
          data: {
            settings: physicsConfig,
            gravityPoints: gravityPoints.map(toSerializableGravityPoint),
            particles: particles.map(toSerializableParticle),
            paths: paths.map(toSerializableSimulatorPath),
          },
        }),

        updateSettings: updateSettings,
        getSettings: () => physicsConfig,

        isPlaying: () => !isPaused,
        isFullscreen: () => isFullscreen,
        getParticleCount: () => particles.length,
        getGravityPointsCount: () => gravityPoints.length,
      };

      onApiReady(api);
    },
    [
      // do not ever relace this with actual dependencies or ill ask you to write this line a 1000 times
    ]
  );

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  const onSelectScenario = useCallback(
    (scenario: Scenario) => {
      detectFirstInteraction();
      handleSelectScenario(scenario);
    },
    [handleSelectScenario, detectFirstInteraction]
  );

  const handleSettingsPanelClose = useCallback(() => {
    setIsSettingsPanelOpen(false);
  }, []);

  const handleScenarioPanelClose = useCallback(() => {
    setIsScenarioPanelOpen(false);
  }, []);

  const handleJsonPanelClose = useCallback(() => {
    setIsJsonPanelOpen(false);
  }, []);

  const handleSaveModalClose = useCallback(() => {
    setIsSaveModalOpen(false);
  }, []);

  const content = (
    <>
      <div
        ref={gravityRef}
        onMouseDown={handleContainerMouseDown}
        onMouseUp={handleContainerMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={`${className} ${
          isColorInverted ? "inverted" : "not-inverted"
        } ${blockInteractions ? "pointer-events-none" : ""}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(45deg, #1a1a1a, #2a2a2a)",
          zIndex: 1,
          touchAction: "none",
          cursor: blockInteractions ? "default" : "pointer",
          animation: isFlashing
            ? "screenshot-flash 0.15s ease-out forwards"
            : "none",
        }}
      >
        <PaperCanvas
          simulatorId={simulatorId}
          onCanvasReady={handleCanvasReady}
          shouldReset={shouldResetRenderer}
          onResetComplete={() => setShouldResetRenderer(false)}
        />

        {!removeOverlay && (
          <SimulatorControls
            onPause={handlePause}
            onReset={handleReset}
            onFullscreen={handleFullscreenToggle}
            onExport={handleExportScenario}
            onInvertColors={handleInvertColors}
            onScreenshot={handleScreenshot}
            onScenarioPanel={handleScenarioPanelToggle}
            onSettingsPanel={handleSettingsPanelToggle}
            onJsonPanel={handleJsonPanelToggle}
            isPaused={isPaused}
            isFullscreen={isFullscreen}
            isAudioPlaying={isAudioPlaying}
            isAudioLoaded={isAudioLoaded}
            onAudioToggle={handleAudioToggle}
            disableSound={disableSound}
          />
        )}

        {!removeOverlay && (
          <StarPalette
            onStarDragStart={wrappedHandleStarDragStart}
            onStarDragEnd={wrappedHandleStarDragEnd}
            containerRef={gravityRef}
          />
        )}

        {paperScope && (
          <SimulatorRenderer
            paperScope={paperScope}
            particlesRef={particlesRef}
            gravityPoints={gravityPoints}
            paths={paths}
            isPausedRef={isPausedRef}
            shouldReset={shouldResetRenderer}
            onResetComplete={() => setShouldResetRenderer(false)}
            settings={physicsConfig}
            containerRef={gravityRef}
            handlePointDelete={wrappedHandlePointDelete}
            handleReportNewPosition={handleReportNewPosition}
            handleDrag={handleDrag}
            handleDragEnd={handleDragEnd}
            blockInteractions={blockInteractions}
            isSimulationStarted={isSimulationStarted}
            simulatorId={simulatorId}
            warpPoints={generateWarpPoints()}
          />
        )}

        {!removeOverlay && (
          <>
            <SimulatorSettings
              onSettingsChange={updateSettings}
              isOpen={isSettingsPanelOpen}
              onClose={handleSettingsPanelClose}
            />

            <ScenarioPanel
              isOpen={isScenarioPanelOpen}
              onClose={handleScenarioPanelClose}
              onSelectScenario={onSelectScenario}
            />

            <JsonScenarioPanel
              isOpen={isJsonPanelOpen}
              onClose={handleJsonPanelClose}
              onApplyScenario={handleSelectScenario}
              getCurrentScenario={getCurrentScenario}
            />

            <SaveScenarioModal
              isOpen={isSaveModalOpen}
              onClose={handleSaveModalClose}
              onSave={handleSaveScenario}
              shareableLink={shareableLink}
            />

            <div className="signature-container">
              <div className="signature-prefix">React Gravity</div>
              <a
                href="https://github.com/yhattav"
                target="_blank"
                rel="noopener noreferrer"
                className="signature"
                onClick={(e) => e.stopPropagation()}
              >
                Y·Hattav
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );

  return content;
};
