import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  shareableLink: string;
}

export const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  shareableLink,
}) => {
  const [scenarioName, setScenarioName] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenarioName.trim()) {
      onSave(scenarioName);
      setScenarioName("");
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareableLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
            width: "380px",
            padding: "20px",
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", fontSize: "1.2rem" }}>
            Save Scenario
          </h3>

          {/* Share URL Row */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={shareableLink}
                readOnly
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  paddingRight: "40px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  color: "white",
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                {isCopied ? <CheckOutlined /> : <CopyOutlined />}
              </button>
            </div>
          </div>

          {/* Save Scenario Row */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name"
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "white",
              }}
            />
            <button
              type="submit"
              className="action-button"
              style={{
                background: "rgba(78, 205, 196, 0.2)",
                whiteSpace: "nowrap",
                padding: "8px 16px",
              }}
            >
              Save
            </button>
          </form>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "15px",
            }}
          >
            <button
              onClick={onClose}
              className="action-button"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
