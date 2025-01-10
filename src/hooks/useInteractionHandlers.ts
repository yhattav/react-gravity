import { useCallback } from "react";
import { Point2D } from "../utils/types/physics";
import { Particle } from "../types/particle";

interface InteractionHandlersProps {
  blockInteractions: boolean;
  isDragging: boolean;
  isDraggingNewStar: boolean;
  isSimulationStarted: boolean;
  createParticle: (position: Point2D) => Particle;
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  setIsSimulationStarted: (started: boolean) => void;
  detectFirstInteraction: () => void;
  pointerPosRef: React.RefObject<Point2D>;
}

export const useInteractionHandlers = ({
  blockInteractions,
  isDragging,
  isDraggingNewStar,
  isSimulationStarted,
  createParticle,
  setParticles,
  setIsSimulationStarted,
  detectFirstInteraction,
  pointerPosRef,
}: InteractionHandlersProps) => {
  const handleContainerClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (blockInteractions) return;
      if (isDragging || isDraggingNewStar) return;

      const coordinates =
        "touches" in e
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : { x: e.clientX, y: e.clientY };

      if (!isSimulationStarted) {
        setIsSimulationStarted(true);
      }
      detectFirstInteraction();
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
      setIsSimulationStarted,
      detectFirstInteraction,
      setParticles,
    ]
  );

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

  return {
    handleContainerClick,
    handleTouchStart,
    handleTouchMove,
  };
};
