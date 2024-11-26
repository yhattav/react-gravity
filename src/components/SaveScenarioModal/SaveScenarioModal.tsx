import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scenario } from "../../types/scenario";

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [scenarioName, setScenarioName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenarioName.trim()) {
      onSave(scenarioName);
      setScenarioName("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="floating-panel"
          style={{
            position: "absolute",
            top: "70px",
            right: "20px",
            width: "280px",
            padding: "20px",
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", fontSize: "1rem" }}>
            Save Scenario
          </h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "white",
                marginBottom: "15px",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="action-button"
                style={{ background: "rgba(255, 255, 255, 0.1)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-button"
                style={{ background: "rgba(78, 205, 196, 0.2)" }}
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
