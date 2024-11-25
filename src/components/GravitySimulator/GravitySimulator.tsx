import React, { useState, useCallback, useEffect } from "react";
import { Point2D, GravityPoint, Force } from "../../utils/types/physics";
import { GravityPointComponent } from "../GravityPoint/GravityPoint";
import { ParticleRenderer } from "../ParticleRenderer/ParticleRenderer";
import { StarPalette } from "../StarPalette/StarPalette";
import { StarTemplate } from "../../types/star";
import {
  calculateTotalForce,
  calculateAcceleration,
  calculateNewVelocity,
  calculateNewPosition,
  handleBoundaryCollision,
} from "../../utils/physics/physicsUtils";
import { getContainerOffset } from "../../utils/dom/domUtils";
import { INITIAL_GRAVITY_POINTS } from "../../constants/physics";
import { SimulatorSettings } from "../SimulatorSettings/SimulatorSettings";
import { useSettings } from "../../hooks/useSettings";
import { throttle } from "lodash";
import "../../styles/global.scss";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { BiReset } from "react-icons/bi";
import { motion } from "framer-motion";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { DebugData } from "../../types/Debug";
import { AiOutlineExport } from "react-icons/ai";
import { VscLibrary } from "react-icons/vsc";
import { ScenarioPanel } from "../ScenarioPanel/ScenarioPanel";
import { Scenario } from "../../types/scenario";
import { SettingOutlined } from "@ant-design/icons";

interface ParticleMechanics {
  position: Point2D;
  velocity: Point2D;
  force: Force;
  mass: number;
  elasticity: number;
}

interface Particle extends ParticleMechanics {
  id: string;
  color: string;
  size: number;
  showVectors: boolean;
  trails: TrailPoint[];
}

interface TrailPoint extends Point2D {
  timestamp: number;
}

interface GravitySimulatorProps {
  gravityRef: React.RefObject<HTMLDivElement>;
  pointerPos: Point2D;
  onDebugData?: (data: DebugData) => void;
  className?: string;
}

interface SimulationScenario {
  settings: typeof physicsConfig;
  gravityPoints: GravityPoint[];
  particles: Array<Omit<Particle, "trails" | "force">>;
}

const generatePastelColor = () => {
  const r = Math.floor(Math.random() * 75 + 180);
  const g = Math.floor(Math.random() * 75 + 180);
  const b = Math.floor(Math.random() * 75 + 180);
  return `rgb(${r}, ${g}, ${b})`;
};

export const GravitySimulator: React.FC<GravitySimulatorProps> = ({
  gravityRef,
  pointerPos,
  onDebugData,
  className,
}) => {
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gravityPoints, setGravityPoints] = useState<GravityPoint[]>(
    INITIAL_GRAVITY_POINTS
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingNewStar, setIsDraggingNewStar] = useState(false);
  const { settings: physicsConfig, updateSettings } = useSettings();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [throttledPointerPos, setThrottledPointerPos] = useState(pointerPos);
  const [isPaused, setIsPaused] = useState(false);
  const [isScenarioPanelOpen, setIsScenarioPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);

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

  const handleDrag = throttle(() => {
    setTimeout(() => {
      setIsDragging(true);
    }, 0);
  });

  const handleReportNewPosition = useCallback(
    throttle((point: Point2D, index: number) => {
      const offset = getContainerOffset(gravityRef);
      if (!offset) return;

      setGravityPoints((points) =>
        points.map((point2, i) =>
          i === index
            ? { ...point2, x: point.x - offset.x, y: point.y - offset.y }
            : point2
        )
      );
    }, 16),
    [gravityRef]
  );

  const handleDragEnd = () => {
    setTimeout(() => {
      setIsDragging(false);
    }, 0);
  };

  const offset = getContainerOffset(gravityRef);

  useEffect(() => {
    const throttledUpdate = throttle((newPos: Point2D) => {
      setThrottledPointerPos(newPos);
    }, physicsConfig.DELTA_TIME * 1000);

    throttledUpdate(pointerPos);
    return () => throttledUpdate.cancel();
  }, [pointerPos, physicsConfig.DELTA_TIME]);

  const updateParticleMechanics = useCallback(
    (
      particle: ParticleMechanics & { trails: TrailPoint[] }
    ): ParticleMechanics => {
      const calculatedForce = calculateTotalForce(
        particle.position,
        throttledPointerPos,
        gravityPoints,
        offset,
        physicsConfig.POINTER_MASS
      );

      const force = {
        fx: calculatedForce.fx + physicsConfig.CONSTANT_FORCE_X,
        fy: calculatedForce.fy + physicsConfig.CONSTANT_FORCE_Y,
      };

      const acceleration = calculateAcceleration(force, particle.mass);
      let newVelocity = calculateNewVelocity(
        particle.velocity,
        acceleration,
        physicsConfig.DELTA_TIME,
        physicsConfig.FRICTION
      );
      let newPosition = calculateNewPosition(
        particle.position,
        newVelocity,
        physicsConfig.DELTA_TIME
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

      const now = Date.now();
      const newTrails = [
        { x: particle.position.x, y: particle.position.y, timestamp: now },
        ...particle.trails.filter((t) => now - t.timestamp < 5000),
      ].slice(0, 100);

      return {
        position: newPosition,
        velocity: newVelocity,
        force,
        mass: particle.mass,
        elasticity: particle.elasticity,
        trails: newTrails,
      };
    },
    [throttledPointerPos, gravityPoints, offset, physicsConfig, gravityRef]
  );

  useEffect(() => {
    if (!isSimulationStarted || isPaused) return;

    let animationFrameId: number;
    //const lastTime = performance.now();
    // let accumulator = 0;

    const updateParticles = () => {
      // const frameTime = (currentTime - lastTime) / 1000;
      // lastTime = currentTime;
      // accumulator += frameTime;

      // if (accumulator >= physicsConfig.DELTA_TIME) {
      //   accumulator = 0;

      setParticles((currentParticles) =>
        currentParticles.map((particle) => {
          const mechanics = updateParticleMechanics(particle);
          return { ...particle, ...mechanics };
        })
      );
      // }

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    animationFrameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    isSimulationStarted,
    isPaused,
    updateParticleMechanics,
    physicsConfig.DELTA_TIME,
  ]);

  const createParticle = useCallback(
    (
      position: Point2D,
      options: Partial<Omit<Particle, "position" | "id">> = {}
    ): Particle => ({
      id: Math.random().toString(36).substr(2, 9),
      position,
      velocity: { x: 0, y: 0 },
      force: { fx: 0, fy: 0 },
      mass: physicsConfig.NEW_PARTICLE_MASS,
      elasticity: physicsConfig.NEW_PARTICLE_ELASTICITY,
      color: generatePastelColor(),
      size: 10,
      showVectors: true,
      trails: [{ ...position, timestamp: Date.now() }],
      ...options,
    }),
    [physicsConfig]
  );

  const handleContainerClick = useCallback(() => {
    if (isDragging || isDraggingNewStar) return;

    if (!isSimulationStarted) {
      setIsSimulationStarted(true);
    }

    setParticles((current) => [...current, createParticle(pointerPos)]);
  }, [
    pointerPos,
    isSimulationStarted,
    isDragging,
    isDraggingNewStar,
    createParticle,
  ]);

  useEffect(() => {
    onDebugData?.({
      particle: {
        position: particles.map((particle) => particle.position),
        velocity: particles.map((particle) => particle.velocity),
      },
      pointer: {
        position: pointerPos,
      },
      velocity: particles.map((particle) => particle.velocity),
      totalForce: particles.map((particle) => particle.force),
    });
  }, [particles, pointerPos, onDebugData]);

  const handleStarDragStart = useCallback(() => {
    setIsDraggingNewStar(true);
  }, []);

  const handleStarDragEnd = useCallback(
    (template: StarTemplate, e: MouseEvent | TouchEvent | PointerEvent) => {
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
              x,
              y,
              label: template.label,
              mass: template.mass,
              color: template.color,
            },
          ]);
        }
      }

      setIsDraggingNewStar(false);
    },
    [gravityRef]
  );

  const handlePointDelete = useCallback((index: number) => {
    setGravityPoints((points) => points.filter((_, i) => i !== index));
  }, []);

  const exportScenario = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const scenario: SimulationScenario = {
        settings: physicsConfig,
        gravityPoints,
        particles: particles.map(({ trails, force, ...particle }) => particle),
      };
      console.log(JSON.stringify(scenario, null, 2));
    },
    [physicsConfig, gravityPoints, particles]
  );

  const handleSelectScenario = useCallback(
    (scenario: Scenario) => {
      // First, ensure all gravity points have unique IDs
      const newGravityPoints = scenario.data.gravityPoints.map((point) => ({
        ...point,
        id: point.id || Math.random().toString(36).substr(2, 9), // Ensure each point has an ID
      }));

      // Reset the simulation state
      setParticles([]);
      setGravityPoints([]); // Clear existing points first

      // Update settings and state in the next frame to ensure clean rendering
      requestAnimationFrame(() => {
        updateSettings(scenario.data.settings);
        setGravityPoints(newGravityPoints);
        setParticles(
          scenario.data.particles.map((particle) => ({
            ...particle,
            trails: [{ ...particle.position, timestamp: Date.now() }],
            force: { fx: 0, fy: 0 },
          }))
        );
        setIsSimulationStarted(true);
        setIsScenarioPanelOpen(false);
      });
    },
    [updateSettings]
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

  return (
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
            font-size: 21px;
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
        `}
      </style>
      <div
        ref={gravityRef}
        onClick={handleContainerClick}
        className={className}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(45deg, #1a1a1a, #2a2a2a)",
          zIndex: 1,
        }}
      >
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
        </div>

        <StarPalette
          onStarDragStart={handleStarDragStart}
          onStarDragEnd={handleStarDragEnd}
          containerRef={gravityRef}
        />

        {gravityPoints.map((point, index) => (
          <GravityPointComponent
            key={point.id}
            point={point}
            index={index}
            onDrag={handleDrag}
            reportNewPosition={handleReportNewPosition}
            onDragEnd={handleDragEnd}
            onDelete={handlePointDelete}
            containerRef={gravityRef}
          />
        ))}

        {isSimulationStarted &&
          particles.map((particle) => (
            <ParticleRenderer
              key={particle.id}
              position={particle.position}
              velocity={particle.velocity}
              force={particle.force}
              color={particle.color}
              size={particle.size}
              showVectors={particle.showVectors}
              trails={particle.trails}
              showVelocityArrows={physicsConfig.SHOW_VELOCITY_ARROWS}
              showForceArrows={physicsConfig.SHOW_FORCE_ARROWS}
              onDelete={() => {
                setParticles(particles.filter((p) => p.id !== particle.id));
              }}
            />
          ))}

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
  );
};
