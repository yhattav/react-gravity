import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  Point2D,
  GravityPoint,
  Vector,
  WarpPoint,
} from "../../utils/types/physics";
import { GravityPointComponent } from "../GravityPoint/GravityPoint";
import { ParticleRenderer } from "../ParticleRenderer/ParticleRenderer";
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
import { throttle, debounce } from "lodash";
import "../../styles/global.scss";
import { MdFullscreen, MdFullscreenExit, MdInvertColors } from "react-icons/md";
import { BiReset } from "react-icons/bi";
import { motion } from "framer-motion";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { DebugData } from "../../types/Debug";
import { AiOutlineExport } from "react-icons/ai";
import { VscLibrary } from "react-icons/vsc";
import { ScenarioPanel } from "../ScenarioPanel/ScenarioPanel";
import { Scenario } from "../../types/scenario";
import { SettingOutlined } from "@ant-design/icons";
import { SaveScenarioModal } from "../SaveScenarioModal/SaveScenarioModal";
import { createShareableLink } from "../../utils/compression";
import { Particle, ParticleMechanics } from "../../types/particle";
import { Position } from "@yhattav/react-component-cursor";
import { Point } from "paper";
import {
  toGravityPoint,
  toSerializableGravityPoint,
} from "../../utils/types/physics";
import { toParticle, toSerializableParticle } from "../../types/particle";
import { GravityVision } from "../GravityVision/GravityVision";
import {
  SimulatorPath,
  toSerializableSimulatorPath,
  toSimulatorPath,
} from "../../utils/types/path";
import { PathRenderer } from "../PathRenderer/PathRenderer";
import { PaperCanvas } from "../PaperCanvas/PaperCanvas";
import { MusicPlayer } from "../MusicPlayer/MusicPlayer";

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
  onApiReady,
  simulatorId = "default",
}) => {
  const [isSimulationStarted, setIsSimulationStarted] = useState(
    !!initialScenario
  );
  const [particles, setParticles] = useState<Particle[]>(
    initialScenario?.data.particles?.map(toParticle) || []
  );
  const particlesRef = useRef<Particle[]>([]);
  const [gravityPoints, setGravityPoints] = useState<GravityPoint[]>(
    initialScenario?.data.gravityPoints?.map(toGravityPoint) ||
      INITIAL_GRAVITY_POINTS
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingNewStar, setIsDraggingNewStar] = useState(false);
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
  const [isScenarioPanelOpen, setIsScenarioPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isColorInverted, setIsColorInverted] = useState(false);
  const [offset, setOffset] = useState<Vector>(new Point(0, 0));
  const [shouldResetRenderer, setShouldResetRenderer] = useState(false);
  const [paths, setPaths] = useState<SimulatorPath[]>(
    initialScenario?.data.paths?.map(toSimulatorPath) || []
  );
  const [paperScope, setPaperScope] = useState<paper.PaperScope | null>(null);

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

  const handleDrag = useCallback(
    throttle(() => {
      if (blockInteractions) return;

      setTimeout(() => {
        setIsDragging(true);
      }, 0);
    }),
    [blockInteractions]
  );

  const handleReportNewPosition = useCallback(
    throttle((point: Point2D, index: number) => {
      if (!offset) return;
      setGravityPoints((points) =>
        points.map((point2, i) =>
          i === index
            ? {
                ...point2,
                position: new Point(point.x - offset.x, point.y - offset.y),
              }
            : point2
        )
      );
    }, 16),
    [gravityRef, offset]
  );

  const handleDragEnd = useCallback(() => {
    if (blockInteractions) return;

    setTimeout(() => {
      setIsDragging(false);
    }, 0);
  }, [blockInteractions]);

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

  const handleContainerClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (blockInteractions) return;
      if (isDragging || isDraggingNewStar) return;

      // Get the correct coordinates whether it's a touch or mouse event
      const coordinates =
        "touches" in e
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : { x: e.clientX, y: e.clientY };

      if (!isSimulationStarted) {
        setIsSimulationStarted(true);
      }
      setParticles((current) => [
        ...current,
        createParticle({ x: coordinates.x, y: coordinates.y }),
      ]);
    },
    [
      isSimulationStarted,
      isDragging,
      isDraggingNewStar,
      createParticle,
      blockInteractions,
    ]
  );

  // Add touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (blockInteractions) return;
      if (pointerPosRef.current) {
        pointerPosRef.current.x = e.touches[0].clientX;
        pointerPosRef.current.y = e.touches[0].clientY;
      }
    },
    [blockInteractions, pointerPosRef]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (blockInteractions) return;
      if (pointerPosRef.current) {
        pointerPosRef.current.x = e.touches[0].clientX;
        pointerPosRef.current.y = e.touches[0].clientY;
      }
    },
    [blockInteractions, pointerPosRef]
  );

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

  const handleStarDragStart = useCallback(() => {
    if (blockInteractions) return;
    setIsDraggingNewStar(true);
  }, [blockInteractions]);

  const handleStarDragEnd = useCallback(
    (template: StarTemplate, e: MouseEvent | TouchEvent | PointerEvent) => {
      if (blockInteractions) return;
      setIsDraggingNewStar(false);
      if (gravityRef.current) {
        const rect = gravityRef.current.getBoundingClientRect();
        const clientX =
          "clientX" in e ? e.clientX : (e as TouchEvent).touches[0].clientX;
        const clientY =
          "clientY" in e ? e.clientY : (e as TouchEvent).touches[0].clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          setGravityPoints((points) => [
            ...points,
            {
              id: Math.random().toString(36).substr(2, 9),
              position: new Point(x, y),
              label: template.label,
              mass: template.mass,
            },
          ]);
        }
      }

      setIsDraggingNewStar(false);
    },
    [gravityRef, blockInteractions]
  );

  const handlePointDelete = useCallback((index: number) => {
    setGravityPoints((currentPoints) => {
      // Create a new array without the deleted point
      const newPoints = currentPoints.filter((_, i) => i !== index);

      // Ensure each remaining point maintains its position and ID
      return newPoints.map((point) => ({
        ...point,
        id: point.id || Math.random().toString(36).substr(2, 9), // Ensure ID exists
      }));
    });
  }, []);

  const exportScenario = useCallback(
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
    [physicsConfig, gravityPoints, particles, paths]
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
      const isCurrentlyPaused = isPaused;
      setIsPaused(true);

      // Trigger reset for all renderers
      setShouldResetRenderer(true);

      // Clear current state
      setParticles([]);
      setGravityPoints([]);
      setPaths([]);
      setPaperScope(null);

      // Wait for cleanup to complete before setting new data
      requestAnimationFrame(() => {
        // Update settings
        updateSettings(scenario.data.settings);

        // Set new data in the next frame
        requestAnimationFrame(() => {
          setGravityPoints(
            (scenario.data.gravityPoints?.map(toGravityPoint) || []).map(
              (point) => ({
                ...point,
                id: point.id || Math.random().toString(36).substr(2, 9),
              })
            )
          );

          setParticles(
            scenario.data.particles?.map((particle) => ({
              ...toParticle(particle),
              force: new Point(0, 0),
            })) || []
          );

          setPaths(scenario.data.paths?.map(toSimulatorPath) || []);

          // Complete reset and resume simulation
          setShouldResetRenderer(false);
          setIsSimulationStarted(true);
          setIsScenarioPanelOpen(false);
          setIsPaused(isCurrentlyPaused);
        });
      });
    },
    [updateSettings, isPaused]
  );

  const handleSettingsPanelToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsPanelOpen((prev) => !prev);
    setIsScenarioPanelOpen(false);
  }, []);

  const handleScenarioPanelToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScenarioPanelOpen((prev) => !prev);
    setIsSettingsPanelOpen(false);
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

  const handleCanvasReady = useCallback((scope: paper.PaperScope) => {
    setPaperScope(scope);
  }, []);

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
        removeGravityPoint: handlePointDelete,
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

  const audioFiles = useMemo(
    () => [
      "/assets/audio/ambient2.mp3",
      "/assets/audio/ambient1.mp3",
      "/assets/audio/ambient3.mp3",
    ],
    []
  );

  const content = (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap');
          
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }
          
          .star-label {
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
          }
          
          div:hover .star-label {
            opacity: 1;
          }

          .signature {
            position: absolute;
            bottom: 15px;
            left: 20px;
            font-family: 'Homemade Apple', cursive;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.40);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            user-select: none;
            z-index: 1;
            letter-spacing: 2px;
            text-decoration: none;
            transition: color 0.2s ease, text-shadow 0.2s ease;
          }

          .signature:hover {
            color: rgba(255, 255, 255, 0.6);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .inverted {
            filter: invert(1);
          }

          .not-inverted {
            filter: invert(0);
          }
        `}
      </style>
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
          touchAction: "none", // Prevent default touch behaviors
        }}
      >
        <PaperCanvas
          simulatorId={simulatorId}
          onCanvasReady={handleCanvasReady}
          shouldReset={shouldResetRenderer}
          onResetComplete={() => setShouldResetRenderer(false)}
        />

        {!removeOverlay && (
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              gap: "10px",
              zIndex: 1001,
              width: "fit-content",
              height: "40px",
              alignItems: "center",
            }}
          >
            <MusicPlayer
              audioFiles={audioFiles}
              shouldPlay={isSimulationStarted}
            />
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="floating-panel floating-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isPaused ? "Resume Simulation" : "Pause Simulation"}
            >
              {isPaused ? <BsPlayFill size={20} /> : <BsPauseFill size={20} />}
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setParticles([]);
                setIsSimulationStarted(false);
              }}
              className="floating-panel floating-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Reset Simulation"
            >
              <BiReset size={20} />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="floating-panel floating-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <MdFullscreenExit size={20} />
              ) : (
                <MdFullscreen size={20} />
              )}
            </motion.button>

            <motion.button
              onClick={exportScenario}
              className="floating-panel floating-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export Scenario"
            >
              <AiOutlineExport size={20} />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setIsColorInverted((prev) => !prev);
              }}
              className="floating-panel floating-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Invert Colors"
            >
              <MdInvertColors size={20} />
            </motion.button>
          </div>
        )}

        {!removeOverlay && (
          <StarPalette
            onStarDragStart={handleStarDragStart}
            onStarDragEnd={handleStarDragEnd}
            containerRef={gravityRef}
          />
        )}

        {gravityPoints.map((point, index) => (
          <GravityPointComponent
            key={point.id || index}
            point={point}
            index={index}
            onDrag={handleDrag}
            reportNewPosition={handleReportNewPosition}
            onDragEnd={handleDragEnd}
            onDelete={handlePointDelete}
            containerRef={gravityRef}
            disabled={blockInteractions}
          />
        ))}

        {paperScope && (
          <>
            {isSimulationStarted && (
              <ParticleRenderer
                scope={paperScope}
                particlesRef={particlesRef}
                isPausedRef={isPausedRef}
                shouldReset={shouldResetRenderer}
                onResetComplete={() => setShouldResetRenderer(false)}
              />
            )}

            <PathRenderer
              scope={paperScope}
              paths={paths}
              shouldReset={shouldResetRenderer}
              onResetComplete={() => {
                setShouldResetRenderer(false);
              }}
              simulatorId={simulatorId}
            />

            {!removeOverlay && (
              <GravityVision
                scope={paperScope}
                warpPoints={generateWarpPoints()}
                settings={physicsConfig}
                containerRef={gravityRef}
                isPausedRef={isPausedRef}
              />
            )}
          </>
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
              onSelectScenario={handleSelectScenario}
            />

            <SaveScenarioModal
              isOpen={isSaveModalOpen}
              onClose={() => setIsSaveModalOpen(false)}
              onSave={handleSaveScenario}
              shareableLink={shareableLink}
            />

            <a
              href="https://github.com/yhattav"
              target="_blank"
              rel="noopener noreferrer"
              className="signature"
              onClick={(e) => e.stopPropagation()}
            >
              Y·Hattav
            </a>
          </>
        )}
      </div>
    </>
  );

  return content;
};
