import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { OnChange } from "@monaco-editor/react";
import { Scenario } from "../../types/scenario";
import { IoClose } from "react-icons/io5";
import { ScenarioSchema } from "../../schemas/scenario";
import { fromZodError } from "zod-validation-error";
import { VscSync } from "react-icons/vsc";

interface JsonScenarioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: Scenario) => void;
  getCurrentScenario: () => Scenario;
}

export const JsonScenarioPanel: React.FC<JsonScenarioPanelProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
  getCurrentScenario,
}) => {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>(`{
  "id": "custom-scenario",
  "name": "Custom Scenario",
  "description": "A custom scenario loaded from JSON",
  "data": {
    "settings": {
      "NEW_PARTICLE_MASS": 0.02,
      "NEW_PARTICLE_ELASTICITY": 0.8,
      "FRICTION": 1,
      "POINTER_MASS": 500000
    },
    "gravityPoints": [
      {
        "x": 300,
        "y": 300,
        "label": "Custom Point",
        "mass": 1000000
      }
    ],
    "particles": [
      {
        "id": "particle-1",
        "position": { "x": 200, "y": 200 },
        "velocity": { "x": 0, "y": 30 },
        "mass": 0.03,
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
      const parsedJson = JSON.parse(editorContent);
      const result = ScenarioSchema.safeParse(parsedJson);

      if (!result.success) {
        // Convert Zod error to a more readable format
        const validationError = fromZodError(result.error);
        setJsonError(validationError.message);
        return;
      }

      setJsonError(null);
      onApplyScenario(result.data);
      onClose();
    } catch (error) {
      setJsonError(
        error instanceof Error ? error.message : "Invalid JSON format"
      );
    }
  };

  const handleLoadCurrentState = () => {
    try {
      const currentScenario = getCurrentScenario();
      setEditorContent(JSON.stringify(currentScenario, null, 2));
      setJsonError(null);
    } catch (error) {
      setJsonError(
        error instanceof Error ? error.message : "Failed to load current state"
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
              <div style={{ display: "flex", gap: "12px" }}>
                <motion.button
                  onClick={handleLoadCurrentState}
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
                  title="Load Current State"
                >
                  <VscSync size={20} />
                </motion.button>
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
