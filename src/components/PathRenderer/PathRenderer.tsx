import React, { useEffect, useRef } from "react";
import { SimulatorPath } from "../../utils/types/path";

interface PathRendererProps {
  scope: paper.PaperScope;
  paths: SimulatorPath[];
  simulatorId?: string;
  shouldReset?: boolean;
  onResetComplete?: () => void;
}

export const PathRenderer: React.FC<PathRendererProps> = ({
  scope,
  paths,
  simulatorId = "default",
  shouldReset = false,
  onResetComplete,
}) => {
  const layerRef = useRef<paper.Layer | null>(null);

  // Handle reset
  useEffect(() => {
    if (!scope || !shouldReset) return;

    scope.activate();
    if (layerRef.current) {
      layerRef.current.removeChildren();
    }
    scope.view.update();
    onResetComplete?.();
  }, [scope, shouldReset, onResetComplete]);

  // Update paths
  useEffect(() => {
    if (!scope) return;

    scope.activate();

    if (!layerRef.current) {
      layerRef.current = new scope.Layer();
    }

    const layer = layerRef.current;
    layer.removeChildren();

    // Draw all paths
    paths?.forEach((simulatorPath, index) => {
      try {
        const pathCopy = simulatorPath.path.clone();
        layer.addChild(pathCopy);
      } catch (error) {
        console.error(
          `[PathRenderer ${simulatorId}] Error adding path ${index}:`,
          error
        );
      }
    });

    scope.view.update();

    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [scope, paths, simulatorId]);

  return null;
};
