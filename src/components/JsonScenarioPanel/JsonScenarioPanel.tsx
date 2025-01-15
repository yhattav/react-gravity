import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { OnChange } from "@monaco-editor/react";
import { Scenario, ScenarioData } from "../../types/scenario";
import { IoClose } from "react-icons/io5";
import { SerializableGravityPoint } from "../../utils/types/physics";
import { SerializableParticle } from "../../types/particle";
import { SerializableSimulatorPath } from "../../utils/types/path";

interface JsonScenarioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: Scenario) => void;
}

const validateGravityPoint = (
  point: any
): point is SerializableGravityPoint => {
  return (
    typeof point === "object" &&
    point !== null &&
    typeof point.position === "object" &&
    point.position !== null &&
    typeof point.position.x === "number" &&
    typeof point.position.y === "number" &&
    typeof point.mass === "number" &&
    (!point.id || typeof point.id === "string")
  );
};

const validateParticle = (particle: any): particle is SerializableParticle => {
  return (
    typeof particle === "object" &&
    particle !== null &&
    typeof particle.position === "object" &&
    particle.position !== null &&
    typeof particle.position.x === "number" &&
    typeof particle.position.y === "number" &&
    typeof particle.velocity === "object" &&
    particle.velocity !== null &&
    typeof particle.velocity.x === "number" &&
    typeof particle.velocity.y === "number" &&
    typeof particle.mass === "number" &&
    (!particle.id || typeof particle.id === "string")
  );
};

const validatePath = (path: any): path is SerializableSimulatorPath => {
  return (
    typeof path === "object" &&
    path !== null &&
    Array.isArray(path.points) &&
    path.points.every(
      (point: any) =>
        typeof point === "object" &&
        point !== null &&
        typeof point.x === "number" &&
        typeof point.y === "number"
    )
  );
};

const validateScenarioData = (data: any): data is ScenarioData => {
  if (typeof data !== "object" || data === null) {
    throw new Error("Data must be an object");
  }

  // Validate settings (optional but must be an object if present)
  if (
    data.settings !== undefined &&
    (typeof data.settings !== "object" || data.settings === null)
  ) {
    throw new Error("Settings must be an object if present");
  }

  // Validate gravityPoints (optional but must be array of valid gravity points if present)
  if (data.gravityPoints !== undefined) {
    if (!Array.isArray(data.gravityPoints)) {
      throw new Error("gravityPoints must be an array");
    }
    if (!data.gravityPoints.every(validateGravityPoint)) {
      throw new Error(
        "Invalid gravity point format. Each gravity point must have position (x, y) and mass"
      );
    }
  }

  // Validate particles (optional but must be array of valid particles if present)
  if (data.particles !== undefined) {
    if (!Array.isArray(data.particles)) {
      throw new Error("particles must be an array");
    }
    if (!data.particles.every(validateParticle)) {
      throw new Error(
        "Invalid particle format. Each particle must have position (x, y), velocity (x, y), and mass"
      );
    }
  }

  // Validate paths (optional but must be array of valid paths if present)
  if (data.paths !== undefined) {
    if (!Array.isArray(data.paths)) {
      throw new Error("paths must be an array");
    }
    if (!data.paths.every(validatePath)) {
      throw new Error(
        "Invalid path format. Each path must have an array of points with x and y coordinates"
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
    "settings": {},
    "gravityPoints": [
      {
        "position": { "x": 100, "y": 100 },
        "mass": 1000
      }
    ],
    "particles": [
      {
        "position": { "x": 200, "y": 200 },
        "velocity": { "x": 0, "y": 0 },
        "mass": 10
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
