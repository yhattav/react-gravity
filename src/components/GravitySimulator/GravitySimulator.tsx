import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import html2canvas from "html2canvas";
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
import {
  calculateTotalForce,
  calculateAcceleration,
  calculateNewVelocity,
  handleBoundaryCollision,
} from "../../utils/physics/physicsUtils";
import { getContainerOffset } from "../../utils/dom/domUtils";
import {
  INITIAL_GRAVITY_POINTS,
  PhysicsSettings,
} from "../../constants/physics";
import { SimulatorSettings } from "../SimulatorSettings/SimulatorSettings";
import { useSettings } from "../../contexts/SettingsContext";
import { debounce } from "lodash";
import "../../styles/global.scss";
import { motion } from "framer-motion";
import { DebugData } from "../../types/Debug";
import { VscLibrary } from "react-icons/vsc";
import { ScenarioPanel } from "../ScenarioPanel/ScenarioPanel";
import { Scenario } from "../../types/scenario";
import { SettingOutlined } from "@ant-design/icons";
import { SaveScenarioModal } from "../SaveScenarioModal/SaveScenarioModal";
import {
  Particle,
  ParticleMechanics,
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

const generatePastelColor = () => {
  const r = Math.floor(Math.random() * 75 + 180);
  const g = Math.floor(Math.random() * 75 + 180);
  const b = Math.floor(Math.random() * 75 + 180);
  return `rgb(${r}, ${g}, ${b})`;
};

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
    options?: Partial<Omit<Particle, "position" | "id">>
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
  const [isSimulationStarted, setIsSimulationStarted] = useState(
    !!initialScenario
  );
  const [firstInteractionDetected, setFirstInteractionDetected] =
    useState(false);
  const [particles, setParticles] = useState<Particle[]>(
    initialScenario?.data.particles?.map(toParticle) || []
  );
  const particlesRef = useRef<Particle[]>([]);

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

  // Only wrap functions that need additional functionality
  const wrappedHandleStarDragStart = useCallback(() => {
    if (blockInteractions) return;
    setFirstInteractionDetected(true);
    handleStarDragStart();
  }, [blockInteractions, handleStarDragStart]);

  const wrappedHandleStarDragEnd = useCallback(
    (template: StarTemplate, e: MouseEvent | TouchEvent | PointerEvent) => {
      if (blockInteractions) return;
      handleStarDragEnd(template, e, gravityRef);
    },
    [blockInteractions, handleStarDragEnd, gravityRef]
  );

  const wrappedHandlePointDelete = useCallback(
    (index: number) => {
      setFirstInteractionDetected(true);
      handlePointDelete(index);
    },
    [handlePointDelete]
  );

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

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [isColorInverted, setIsColorInverted] = useState(false);
  const [offset, setOffset] = useState<Vector>(new Point(0, 0));
  const [shouldResetRenderer, setShouldResetRenderer] = useState(false);
  const [paths, setPaths] = useState<SimulatorPath[]>(
    initialScenario?.data.paths?.map(toSimulatorPath) || []
  );
  const [paperScope, setPaperScope] = useState<paper.PaperScope | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

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
  } = useScenarioManagement({
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
  });

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

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      gravityRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [gravityRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const updateParticleMechanics = useCallback(
    (
      particle: ParticleMechanics,
      allParticles: Array<ParticleMechanics> = []
    ): ParticleMechanics => {
      const otherParticles = allParticles.filter((p) => p !== particle);
      const calculatedForce = calculateTotalForce(
        particle.position,
        new Point(pointerPosRef?.current || { x: 0, y: 0 }).subtract(
          new Point(offset)
        ),
        gravityPoints,
        physicsConfig.POINTER_MASS,
        otherParticles,
        paths,
        physicsConfig.PARTICLES_EXERT_GRAVITY
      );
      const force = new Point(calculatedForce.x, calculatedForce.y).add(
        new Point(physicsConfig.CONSTANT_FORCE)
      );

      const acceleration = calculateAcceleration(force, particle.mass);
      let newVelocity = calculateNewVelocity(
        particle.velocity,
        acceleration,
        physicsConfig.DELTA_TIME,
        physicsConfig.FRICTION
      );
      let newPosition = new Point(particle.position).add(
        new Point(newVelocity).multiply(physicsConfig.DELTA_TIME)
      );

      // Handle boundary collisions if enabled
      if (physicsConfig.SOLID_BOUNDARIES) {
        const collision = handleBoundaryCollision(
          newPosition,
          newVelocity,
          gravityRef,
          particle.elasticity
        );
        newPosition = collision.position;
        newVelocity = collision.velocity;
      }

      return {
        position: newPosition,
        velocity: newVelocity,
        force,
        mass: particle.mass,
        elasticity: particle.elasticity,
      };
    },
    [gravityPoints, paths, physicsConfig, gravityRef, offset, pointerPosRef]
  );

  useEffect(() => {
    if (!isSimulationStarted || isPaused) return;
    let animationFrameId: number;
    //const lastTime = performance.now();
    // let accumulator = 0;

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
  }, [isSimulationStarted, isPaused, updateParticleMechanics]);

  const createParticle = useCallback(
    (
      position: Point2D,
      options: Partial<Omit<Particle, "position" | "id">> = {}
    ): Particle => {
      const newPosition = new Point(position).subtract(new Point(offset));

      return {
        id: Math.random().toString(36).substr(2, 9),
        position: newPosition,
        velocity: new Point(0, 0),
        force: new Point(0, 0),
        mass: physicsConfig.NEW_PARTICLE_MASS,
        elasticity: physicsConfig.NEW_PARTICLE_ELASTICITY,
        color: generatePastelColor(),
        size: 10,
        showVectors: true,
        ...options,
      };
    },
    [physicsConfig, offset]
  );

  // Use the interaction handlers hook
  const { handleContainerClick, handleTouchStart, handleTouchMove } =
    useInteractionHandlers({
      blockInteractions,
      isDragging,
      isDraggingNewStar,
      isSimulationStarted,
      createParticle,
      setParticles,
      setIsSimulationStarted,
      detectFirstInteraction: () => setFirstInteractionDetected(true),
      pointerPosRef,
    });

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

  const handleScreenshot = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      try {
        // Temporarily hide all overlays except signature
        const overlayElements = gravityRef.current?.querySelectorAll(
          ".floating-panel, .floating-button"
        );
        overlayElements?.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "none";
          }
        });

        // Show prefix and ensure signature is visible
        const prefix = document.querySelector(".signature-prefix");
        if (prefix instanceof HTMLElement) {
          prefix.style.display = "block";
        }

        // Take screenshot
        if (!gravityRef.current) return;
        const screenshotPromise = html2canvas(gravityRef.current, {
          background: "none",
        });

        // Wait for screenshot to complete
        const canvas = await screenshotPromise;

        // Restore overlay state immediately after starting the screenshot
        overlayElements?.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "";
          }
        });

        // Hide prefix again
        if (prefix instanceof HTMLElement) {
          prefix.style.display = "none";
        }

        setIsFlashing(true);

        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
          });
        });

        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);

        // Show flash animation after screenshot is taken and copied
        setTimeout(() => setIsFlashing(false), 300);
      } catch (error) {
        console.error("Failed to take screenshot:", error);
      }
    },
    [gravityRef]
  );

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
        toggleFullscreen,
        invertColors: (invert: boolean) => setIsColorInverted(invert),

        addParticle: (position, options) => {
          setIsSimulationStarted(true);
          setParticles((current) => [
            ...current,
            createParticle(position, options),
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
      // Add all deps
    ]
  );

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  // Update ref when isPaused changes
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const onSelectScenario = useCallback(
    (scenario: Scenario) => {
      setFirstInteractionDetected(true);
      handleSelectScenario(scenario);
    },
    [handleSelectScenario]
  );

  // Add handler functions
  const handlePause = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleReset = useCallback(() => {
    setParticles([]);
    setIsSimulationStarted(false);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  const handleInvertColors = useCallback(() => {
    setIsColorInverted((prev) => !prev);
  }, []);

  const content = (
    <>
      <div
        ref={gravityRef}
        onClick={handleContainerClick}
        onTouchStart={handleTouchStart}
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
              onClose={() => setIsSettingsPanelOpen(false)}
            />

            <div
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                display: "flex",
                gap: "10px",
                zIndex: 1001,
              }}
            >
              <motion.button
                onClick={handleScenarioPanelToggle}
                className="floating-panel floating-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Scenarios"
              >
                <VscLibrary size={20} />
              </motion.button>

              <motion.button
                onClick={handleSettingsPanelToggle}
                className="floating-panel floating-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Settings"
              >
                <SettingOutlined size={20} />
              </motion.button>
            </div>

            <ScenarioPanel
              isOpen={isScenarioPanelOpen}
              onClose={() => setIsScenarioPanelOpen(false)}
              onSelectScenario={onSelectScenario}
            />

            <SaveScenarioModal
              isOpen={isSaveModalOpen}
              onClose={() => setIsSaveModalOpen(false)}
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
