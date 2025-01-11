import { useCallback, useRef } from "react";
import { Point } from "paper";
import { Point2D } from "../utils/types/physics";
import { Particle } from "../types/particle";
import { Position } from "@yhattav/react-component-cursor";

interface InteractionHandlersProps {
  blockInteractions: boolean;
  isDragging: boolean;
  isDraggingNewStar: boolean;
  isSimulationStarted: boolean;
  createParticle: (
    position: Point2D,
    velocity: Point2D,
    options?: Partial<Omit<Particle, "position" | "id" | "velocity">>
  ) => Particle;
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  setIsSimulationStarted: (started: boolean) => void;
  detectFirstInteraction: () => void;
  pointerPosRef: React.RefObject<Position>;
}

interface DragState {
  startPosition: Point2D;
  isDragging: boolean;
}

export const useInteractionHandlers = ({
  blockInteractions,
  isDragging: isStarDragging,
  isDraggingNewStar,
  isSimulationStarted,
  createParticle,
  setParticles,
  setIsSimulationStarted,
  detectFirstInteraction,
  pointerPosRef,
}: InteractionHandlersProps) => {
  const dragStateRef = useRef<DragState | null>(null);

  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (blockInteractions) return;
      if (isStarDragging || isDraggingNewStar) return;

      const coordinates =
        "touches" in e
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : { x: e.clientX, y: e.clientY };

      dragStateRef.current = {
        startPosition: coordinates,
        isDragging: true,
      };

      setParticles((current) => [
        ...current,
        createParticle(coordinates, { x: 0, y: 0 }, { frozen: true }),
      ]);

      if (!isSimulationStarted) {
        setIsSimulationStarted(true);
      }
      detectFirstInteraction();
    },
    [
      blockInteractions,
      isStarDragging,
      isDraggingNewStar,
      isSimulationStarted,
      setIsSimulationStarted,
      detectFirstInteraction,
      createParticle,
      setParticles,
    ]
  );

  const handleContainerMouseUp = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragStateRef.current?.isDragging) return;

      const endCoordinates =
        "touches" in e
          ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
          : { x: e.clientX, y: e.clientY };

      const startPos = dragStateRef.current.startPosition;
      const velocityX = (startPos.x - endCoordinates.x) * 0.1;
      const velocityY = (startPos.y - endCoordinates.y) * 0.1;

      setParticles((current) => {
        const particles = [...current];
        const lastParticle = particles[particles.length - 1];
        if (lastParticle && lastParticle.frozen) {
          particles[particles.length - 1] = {
            ...lastParticle,
            frozen: false,
            velocity: new Point(velocityX, velocityY),
          };
        }
        return particles;
      });

      dragStateRef.current = null;
    },
    [setParticles]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (blockInteractions) return;
      if (pointerPosRef.current) {
        pointerPosRef.current.x = e.touches[0].clientX;
        pointerPosRef.current.y = e.touches[0].clientY;
      }
      handleContainerMouseDown(e);
    },
    [blockInteractions, pointerPosRef, handleContainerMouseDown]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (blockInteractions) return;
      handleContainerMouseUp(e);
    },
    [blockInteractions, handleContainerMouseUp]
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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (blockInteractions) return;
      if (pointerPosRef.current) {
        pointerPosRef.current.x = e.clientX;
        pointerPosRef.current.y = e.clientY;
      }
    },
    [blockInteractions, pointerPosRef]
  );

  return {
    handleContainerMouseDown,
    handleContainerMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleMouseMove,
    dragStateRef,
  };
};
