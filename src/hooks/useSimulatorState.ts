import { useState, useCallback } from "react";
import { Scenario } from "../types/scenario";

export const useSimulatorState = (
  initialScenario?: Scenario,
  blockInteractions = false,
  clearParticles?: () => void
) => {
  const [isSimulationStarted, setIsSimulationStarted] = useState(
    !!initialScenario
  );
  const [firstInteractionDetected, setFirstInteractionDetected] =
    useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isColorInverted, setIsColorInverted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [shouldResetRenderer, setShouldResetRenderer] = useState(false);

  const handlePause = useCallback(() => {
    if (blockInteractions) return;
    setIsPaused((prev) => !prev);
  }, [blockInteractions]);

  const handleReset = useCallback(() => {
    if (blockInteractions) return;
    if (clearParticles) {
      clearParticles();
    }
    setIsSimulationStarted(false);
    setShouldResetRenderer(true);
  }, [blockInteractions, clearParticles]);

  const handleFullscreenToggle = useCallback(
    (gravityRef: React.RefObject<HTMLDivElement>) => {
      if (blockInteractions) return;
      if (!document.fullscreenElement) {
        gravityRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    },
    [blockInteractions]
  );

  const handleInvertColors = useCallback(() => {
    if (blockInteractions) return;
    setIsColorInverted((prev) => !prev);
  }, [blockInteractions]);

  const detectFirstInteraction = useCallback(() => {
    if (!firstInteractionDetected) {
      setFirstInteractionDetected(true);
    }
  }, [firstInteractionDetected]);

  return {
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
    handleFullscreenToggle,
    handleInvertColors,
    detectFirstInteraction,
  };
};
