import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { OnChange } from "@monaco-editor/react";
import { Scenario } from "../../types/scenario";
import { IoClose } from "react-icons/io5";
import { ScenarioSchema } from "../../schemas/scenario";
import { fromZodError } from "zod-validation-error";
import { VscSync } from "react-icons/vsc";
import { debounce } from "lodash";
import { Select } from "antd";
import { generateScenarioPrompt } from "../../utils/prompts/scenarioPrompts";
import { useAIService } from "../../hooks/useAIService";

interface JsonScenarioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: Scenario) => void;
  getCurrentScenario: () => Scenario;
}

const JsonScenarioPanelComponent: React.FC<JsonScenarioPanelProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
  getCurrentScenario,
}) => {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [scenarioDescription, setScenarioDescription] = useState<string>("");

  // Use the AI service hook
  const { aiConfig, setAIConfig, isGenerating, generateContent } = useAIService(
    {
      onContentUpdate: setEditorContent,
      onError: setJsonError,
      onValidJson: () => setJsonError(null),
    }
  );

  // Load current state when panel opens
  useEffect(() => {
    if (isOpen) {
      const currentScenario = getCurrentScenario();
      setEditorContent(JSON.stringify(currentScenario, null, 2));
      setJsonError(null);
    }
  }, [isOpen, getCurrentScenario]);

  // Create a debounced version of the prompt generator
  const debouncedGenerateAndLogPrompt = useMemo(
    () =>
      debounce((description: string) => {
        if (!description) return;
        const prompt = generateLLMPrompt(description);
        console.log("Generated LLM Prompt:", prompt);
        navigator.clipboard.writeText(prompt).catch(console.error);
      }, 1000),
    []
  );

  // Update the prompt when description changes
  useEffect(() => {
    debouncedGenerateAndLogPrompt(scenarioDescription);
    return () => {
      debouncedGenerateAndLogPrompt.cancel();
    };
  }, [scenarioDescription, debouncedGenerateAndLogPrompt]);

  const generateLLMPrompt = (description: string) => {
    // Get current simulator dimensions
    const simulatorElement = document.querySelector(".gravity-simulator");
    const width = simulatorElement?.clientWidth || 1000;
    const height = simulatorElement?.clientHeight || 800;

    return generateScenarioPrompt(description, getCurrentScenario(), {
      width,
      height,
    });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setScenarioDescription(e.target.value);
    if (e.target.value) {
      generateLLMPrompt(e.target.value);
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
    const currentScenario = getCurrentScenario();
    setEditorContent(JSON.stringify(currentScenario, null, 2));
    setJsonError(null);
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
              style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
            >
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="ai-service"
                  style={{
                    color: "#fff",
                    fontSize: "14px",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  AI Service:
                </label>
                <Select
                  id="ai-service"
                  value={aiConfig.service}
                  onChange={(value) =>
                    setAIConfig((prev) => ({ ...prev, service: value }))
                  }
                  style={{ width: "100%" }}
                  options={[
                    { value: "none", label: "None (Copy Prompt)" },
                    { value: "openai", label: "OpenAI GPT-4" },
                    { value: "anthropic", label: "Anthropic Claude" },
                  ]}
                />
              </div>
              {aiConfig.service !== "none" && (
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="api-key"
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    API Key:
                  </label>
                  <input
                    id="api-key"
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) =>
                      setAIConfig((prev) => ({
                        ...prev,
                        apiKey: e.target.value,
                      }))
                    }
                    placeholder={`Enter your ${
                      aiConfig.service === "openai" ? "OpenAI" : "Anthropic"
                    } API key`}
                    style={{
                      width: "100%",
                      padding: "4px 11px",
                      backgroundColor: "#2d2d2d",
                      color: "#fff",
                      border: "1px solid #404040",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                htmlFor="scenario-description"
                style={{ color: "#fff", fontSize: "14px" }}
              >
                Describe the scenario you want to create:
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <textarea
                  id="scenario-description"
                  value={scenarioDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Example: Create a solar system with a large star in the center and three planets orbiting around it at different distances..."
                  style={{
                    flex: 1,
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
                {scenarioDescription && (
                  <motion.button
                    onClick={() =>
                      generateContent(generateLLMPrompt(scenarioDescription))
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isGenerating}
                    style={{
                      background: "#1a90ff",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: isGenerating ? "wait" : "pointer",
                      fontSize: "14px",
                      opacity: isGenerating ? 0.7 : 1,
                      alignSelf: "stretch",
                    }}
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </motion.button>
                )}
              </div>
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

export const JsonScenarioPanel = React.memo(JsonScenarioPanelComponent);
