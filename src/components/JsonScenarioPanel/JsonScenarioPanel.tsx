import React, { useState, useEffect } from "react";
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
  const [editorContent, setEditorContent] = useState<string>("");
  const [scenarioDescription, setScenarioDescription] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      handleLoadCurrentState();
    }
  }, [isOpen]);

  const generateLLMPrompt = () => {
    // Get current simulator dimensions
    const simulatorElement = document.querySelector(".gravity-simulator");
    const width = simulatorElement?.clientWidth || 1000;
    const height = simulatorElement?.clientHeight || 800;

    // Get current scenario state
    const currentScenario = getCurrentScenario();

    const prompt = `You are a scenario generator for a gravity simulator. Your task is to create a JSON scenario based on the user's description.

Environment Context:
- Simulator dimensions: ${width}x${height} pixels
- Center position: x=${width / 2}, y=${height / 2}
- Current physics settings: ${JSON.stringify(
      currentScenario.data.settings,
      null,
      2
    )}

Scenario Requirements:
1. All positions must be within the simulator bounds (0 to ${width} for x, 0 to ${height} for y)
2. Each gravity point must have:
   - position (x, y)
   - mass (typical range: 100,000 to 2,000,000)
   - label (descriptive name)
3. Each particle must have:
   - position (x, y)
   - velocity (x, y) (typical range: -50 to 50)
   - mass (typical range: 0.01 to 0.1)
   - elasticity (0 to 1, typically 0.8)
   - id (unique string)
4. Settings can include:
   - NEW_PARTICLE_MASS (default: ${
     currentScenario.data.settings.NEW_PARTICLE_MASS
   })
   - NEW_PARTICLE_ELASTICITY (default: ${
     currentScenario.data.settings.NEW_PARTICLE_ELASTICITY
   })
   - FRICTION (default: ${currentScenario.data.settings.FRICTION})
   - POINTER_MASS (default: ${currentScenario.data.settings.POINTER_MASS})

User's Description: "${scenarioDescription}"

Generate a valid JSON scenario that matches this description. The JSON must follow this structure:
${JSON.stringify(
  {
    id: "example-id",
    name: "Example Name",
    description: "Example Description",
    data: {
      settings: {},
      gravityPoints: [],
      particles: [],
      paths: [],
    },
  },
  null,
  2
)}

Consider:
- Relative positions (e.g., "center" means x=${width / 2}, y=${height / 2})
- Physical accuracy (e.g., orbits need appropriate velocity vectors)
- Visual balance within the simulator dimensions
- Realistic mass and velocity ranges for stable simulation

Return only the valid JSON with no additional text.`;

    console.log("Generated LLM Prompt:", prompt);
    return prompt;
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setScenarioDescription(e.target.value);
    if (e.target.value) {
      generateLLMPrompt();
    }
  };

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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                htmlFor="scenario-description"
                style={{ color: "#fff", fontSize: "14px" }}
              >
                Describe the scenario you want to create:
              </label>
              <textarea
                id="scenario-description"
                value={scenarioDescription}
                onChange={handleDescriptionChange}
                placeholder="Example: Create a solar system with a large star in the center and three planets orbiting around it at different distances..."
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "8px 12px",
                  backgroundColor: "#2d2d2d",
                  color: "#fff",
                  border: "1px solid #404040",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>

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
