import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { OnChange } from "@monaco-editor/react";
import { Scenario, ScenarioData } from "../../types/scenario";
import { IoClose } from "react-icons/io5";
import { SerializableGravityPoint, Point2D } from "../../utils/types/physics";
import { SerializableParticle } from "../../types/particle";
import { SerializableSimulatorPath, PathPoint } from "../../utils/types/path";
import { PhysicsSettings } from "../../constants/physics";

interface JsonScenarioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: Scenario) => void;
}

interface UnknownObject {
  [key: string]: unknown;
}

const isPoint2D = (point: unknown): point is Point2D => {
  if (!point || typeof point !== "object") return false;
  const p = point as UnknownObject;
  return (
    typeof p.x === "number" &&
    typeof p.y === "number" &&
    Object.keys(p).length === 2
  );
};

const validateGravityPoint = (
  point: unknown
): point is SerializableGravityPoint => {
  if (!point || typeof point !== "object") return false;
  const p = point as UnknownObject;

  return (
    isPoint2D({ x: p.x as number, y: p.y as number }) &&
    typeof p.mass === "number" &&
    typeof p.label === "string" &&
    (!p.id || typeof p.id === "string")
  );
};

const validateParticle = (
  particle: unknown
): particle is SerializableParticle => {
  if (!particle || typeof particle !== "object") return false;
  const p = particle as UnknownObject;

  return (
    isPoint2D(p.position as Point2D) &&
    isPoint2D(p.velocity as Point2D) &&
    typeof p.mass === "number" &&
    typeof p.id === "string" &&
    typeof p.elasticity === "number" &&
    (!p.outgoingForceRatio || typeof p.outgoingForceRatio === "number") &&
    (!p.size || typeof p.size === "number") &&
    (!p.color || typeof p.color === "string") &&
    (!p.showVectors || typeof p.showVectors === "boolean")
  );
};

const validatePathPoint = (point: unknown): point is PathPoint => {
  if (!point || typeof point !== "object") return false;
  const p = point as UnknownObject;

  const hasValidHandles =
    (!p.handleIn || isPoint2D(p.handleIn as Point2D)) &&
    (!p.handleOut || isPoint2D(p.handleOut as Point2D));

  return isPoint2D({ x: p.x as number, y: p.y as number }) && hasValidHandles;
};

const validatePath = (path: unknown): path is SerializableSimulatorPath => {
  if (!path || typeof path !== "object") return false;
  const p = path as UnknownObject;

  return (
    typeof p.id === "string" &&
    Array.isArray(p.points) &&
    p.points.every(validatePathPoint) &&
    typeof p.closed === "boolean" &&
    isPoint2D(p.position as Point2D) &&
    typeof p.label === "string" &&
    typeof p.mass === "number" &&
    (!p.strokeColor || typeof p.strokeColor === "string") &&
    (!p.fillColor || typeof p.fillColor === "string") &&
    (!p.strokeWidth || typeof p.strokeWidth === "number") &&
    (!p.opacity || typeof p.opacity === "number")
  );
};

const validateSettings = (
  settings: unknown
): settings is Partial<PhysicsSettings> => {
  if (!settings || typeof settings !== "object") return false;
  const s = settings as UnknownObject;

  // Check each property has the correct type if present
  for (const [key, value] of Object.entries(s)) {
    switch (key) {
      case "CONSTANT_FORCE":
        if (!isPoint2D(value as Point2D)) return false;
        break;
      case "SHOW_VELOCITY_ARROWS":
      case "SHOW_FORCE_ARROWS":
      case "SOLID_BOUNDARIES":
      case "PARTICLES_EXERT_GRAVITY":
      case "SHOW_GRAVITY_VISION":
      case "SHOW_D3_GRAVITY_VISION":
      case "GRAVITY_VISION_INVERT_COLORS":
        if (typeof value !== "boolean") return false;
        break;
      case "GRAVITY_VISION_STROKE_COLOR":
      case "GRAVITY_VISION_COLOR_SCHEME":
        if (typeof value !== "string") return false;
        break;
      default:
        if (value !== undefined && typeof value !== "number") return false;
    }
  }

  return true;
};

const validateScenarioData = (data: unknown): data is ScenarioData => {
  if (!data || typeof data !== "object") {
    throw new Error("Data must be an object");
  }
  const d = data as UnknownObject;

  // Validate settings
  if (d.settings !== undefined && !validateSettings(d.settings)) {
    throw new Error("Invalid settings format");
  }

  // Validate gravityPoints
  if (d.gravityPoints !== undefined) {
    if (!Array.isArray(d.gravityPoints)) {
      throw new Error("gravityPoints must be an array");
    }
    if (!d.gravityPoints.every(validateGravityPoint)) {
      throw new Error(
        "Invalid gravity point format. Each gravity point must have position (x, y), label, and mass"
      );
    }
  }

  // Validate particles
  if (d.particles !== undefined) {
    if (!Array.isArray(d.particles)) {
      throw new Error("particles must be an array");
    }
    if (!d.particles.every(validateParticle)) {
      throw new Error(
        "Invalid particle format. Each particle must have position (x, y), velocity (x, y), mass, and elasticity"
      );
    }
  }

  // Validate paths
  if (d.paths !== undefined) {
    if (!Array.isArray(d.paths)) {
      throw new Error("paths must be an array");
    }
    if (!d.paths.every(validatePath)) {
      throw new Error(
        "Invalid path format. Each path must have points array, position, label, and mass"
      );
    }
  }

  return true;
};

export const JsonScenarioPanel: React.FC<JsonScenarioPanelProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
}) => {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>(`{
  "id": "custom-scenario",
  "name": "Custom Scenario",
  "description": "A custom scenario loaded from JSON",
  "data": {
    "settings": {
      "NEW_PARTICLE_MASS": 0.1,
      "NEW_PARTICLE_ELASTICITY": 0.8,
      "FRICTION": 1,
      "POINTER_MASS": 0
    },
    "gravityPoints": [
      {
        "x": 100,
        "y": 100,
        "label": "Custom Point",
        "mass": 1000
      }
    ],
    "particles": [
      {
        "id": "particle-1",
        "position": { "x": 200, "y": 200 },
        "velocity": { "x": 0, "y": 0 },
        "mass": 10,
        "elasticity": 0.8
      }
    ],
    "paths": []
  }
}`);

  const handleEditorChange: OnChange = (value) => {
    setEditorContent(value || "");
  };

  const handleApply = () => {
    try {
      const parsedScenario = JSON.parse(editorContent);

      // Validate basic scenario structure
      if (!parsedScenario.id || typeof parsedScenario.id !== "string") {
        throw new Error("Invalid scenario format: id must be a string");
      }
      if (!parsedScenario.name || typeof parsedScenario.name !== "string") {
        throw new Error("Invalid scenario format: name must be a string");
      }
      if (
        parsedScenario.description &&
        typeof parsedScenario.description !== "string"
      ) {
        throw new Error(
          "Invalid scenario format: description must be a string if present"
        );
      }
      if (!parsedScenario.data) {
        throw new Error("Invalid scenario format: data is required");
      }

      // Validate scenario data structure
      validateScenarioData(parsedScenario.data);

      setJsonError(null);
      onApplyScenario(parsedScenario);
      onClose();
    } catch (error) {
      setJsonError(
        error instanceof Error ? error.message : "Invalid JSON format"
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="floating-panel vertical-panel"
          style={{
            width: "500px",
            maxWidth: "90vw",
          }}
        >
          <div className="panel-header">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>Load JSON Scenario</h3>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IoClose size={24} />
              </motion.button>
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              height: "500px",
              maxHeight: "calc(90vh - 200px)",
            }}
          >
            <div style={{ flex: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs-dark"
                value={editorContent}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: "on",
                }}
              />
            </div>

            {jsonError && (
              <div
                style={{
                  color: "#ff4d4f",
                  background: "rgba(255, 77, 79, 0.1)",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                {jsonError}
              </div>
            )}

            <motion.button
              onClick={handleApply}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: "#4CAF50",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Apply Scenario
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
