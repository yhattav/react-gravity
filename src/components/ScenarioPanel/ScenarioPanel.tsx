import React, { useState } from "react";
import { Tabs } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { Scenario } from "../../types/scenario";
import { defaultScenarios } from "../../scenarios/defaults";
import "./ScenarioPanel.scss";
import { VscLibrary } from "react-icons/vsc";

interface ScenarioPanelProps {
  onSelectScenario: (scenario: Scenario) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({
  onSelectScenario,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="floating-panel settings-panel"
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
                  label: <span style={{ fontSize: "0.9rem" }}>Default</span>,
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
                  label: <span style={{ fontSize: "0.9rem" }}>Saved</span>,
                  children: (
                    <div
                      className="scenarios-list"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Coming soon...
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
