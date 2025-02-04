import React, { useState, useEffect } from "react";
import { Tabs } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { Scenario } from "../../types/scenario";
import { defaultScenarios } from "../../scenarios/defaults";
import "./ScenarioPanel.scss";
import { VscLibrary, VscShare } from "react-icons/vsc";
import { useSettings } from "../../contexts/SettingsContext";
import { useSearchParams } from "react-router-dom";
import {
  decompressScenario,
  createShareableLink,
} from "../../utils/compression";

interface ScenarioPanelProps {
  onSelectScenario: (scenario: Scenario) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({
  onSelectScenario,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState("1");
  const { savedScenarios, deleteSavedScenario } = useSettings();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const scenarioParam = searchParams.get("scenario");
    if (scenarioParam) {
      try {
        const sharedScenario = decompressScenario(scenarioParam);
        if (sharedScenario) {
          // Clear the search parameter to prevent reloading on refresh
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete("scenario");
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}${
              newSearchParams.toString() ? "?" + newSearchParams.toString() : ""
            }`
          );

          // Load the scenario
          onSelectScenario(sharedScenario);
        }
      } catch (error) {
        console.error("Error loading scenario from URL:", error);
      }
    }
  }, []);

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
          className="floating-panel scenario-panel vertical-panel"
          style={{ color: "rgba(255, 255, 255, 0.9)" }}
        >
          <div
            style={{
              padding: "20px 20px 0 20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
              background: "rgba(0, 0, 0, 0.2)",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "1.2rem",
                fontWeight: 500,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <VscLibrary style={{ opacity: 0.7 }} />
              Scenarios
            </h3>
          </div>

          <div
            style={{
              padding: "20px",
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              style={{ color: "rgba(255, 255, 255, 0.9)" }}
              items={[
                {
                  key: "1",
                  label: (
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      Default
                    </span>
                  ),
                  children: (
                    <div className="scenarios-list">
                      {defaultScenarios.map((scenario) => (
                        <motion.div
                          key={scenario.id}
                          className="scenario-item"
                          onClick={() => onSelectScenario(scenario)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <h3
                            style={{
                              fontSize: "0.9rem",
                              color: "rgba(255, 255, 255, 0.9)",
                              fontWeight: "normal",
                            }}
                          >
                            {scenario.name}
                          </h3>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "rgba(255, 255, 255, 0.7)",
                            }}
                          >
                            {scenario.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      Saved
                    </span>
                  ),
                  children: (
                    <div className="scenarios-list">
                      {savedScenarios.length === 0 ? (
                        <div style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                          No saved scenarios yet
                        </div>
                      ) : (
                        savedScenarios.map((scenario) => (
                          <div
                            key={scenario.id}
                            className="scenario-item"
                            style={{
                              display: "flex",
                              gap: "12px",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "8px",
                              transition: "border-color 0.2s ease",
                              padding: "12px",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.borderColor =
                                "rgba(255, 255, 255, 0.3)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.borderColor =
                                "rgba(255, 255, 255, 0.1)")
                            }
                          >
                            <motion.div
                              style={{ flex: "1" }}
                              onClick={() => onSelectScenario(scenario)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <h3
                                  style={{
                                    fontSize: "0.9rem",
                                    color: "rgba(255, 255, 255, 0.9)",
                                    fontWeight: "normal",
                                  }}
                                >
                                  {scenario.name}
                                </h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSavedScenario(scenario.id);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "rgba(255, 255, 255, 0.5)",
                                    cursor: "pointer",
                                    padding: "4px",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "rgba(255, 255, 255, 0.7)",
                                }}
                              >
                                {scenario.description}
                              </p>
                            </motion.div>

                            <motion.div
                              style={{ width: "20%", position: "relative" }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                const link = createShareableLink(scenario);
                                navigator.clipboard.writeText(link);
                                const tooltip = e.currentTarget.querySelector(
                                  ".tooltip"
                                ) as HTMLElement;
                                tooltip.style.opacity = "1";
                                setTimeout(() => {
                                  tooltip.style.opacity = "0";
                                }, 2000);
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  height: "100%",
                                  cursor: "pointer",
                                  color: "rgba(255, 255, 255, 0.5)",
                                }}
                              >
                                <VscShare
                                  style={{ opacity: 0.7, fontSize: "1.5rem" }}
                                />
                              </div>
                              <div
                                className="tooltip"
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  right: "0",
                                  background: "rgba(0, 0, 0, 0.8)",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "0.8rem",
                                  opacity: "0",
                                  transition: "opacity 0.2s",
                                  pointerEvents: "none",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Link copied!
                              </div>
                            </motion.div>
                          </div>
                        ))
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
