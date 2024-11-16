import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PHYSICS_CONFIG, SETTINGS_METADATA } from "../../constants/physics";
import { useSettings } from "../../hooks/useSettings";

interface SimulatorSettingsProps {
  onSettingsChange: (settings: typeof PHYSICS_CONFIG) => void;
}

export const SimulatorSettings: React.FC<SimulatorSettingsProps> = ({
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    settings,
    showDevSettings,
    updateSettings,
    updateShowDevSettings,
    isDevelopment,
  } = useSettings();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSettingChange = (key: keyof typeof settings, value: number) => {
    const newSettings = { [key]: value };
    updateSettings(newSettings);
    onSettingsChange({ ...settings, ...newSettings });
  };

  const handleShowDevSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateShowDevSettings(e.target.checked);
  };

  const handleCheckboxChange = (key: keyof typeof settings) => {
    const newSettings = { [key]: !settings[key] };
    updateSettings(newSettings);
    onSettingsChange({ ...settings, ...newSettings });
  };

  const shouldShowSetting = (key: keyof typeof PHYSICS_CONFIG) => {
    const isDevSetting = SETTINGS_METADATA[key].isDev;
    return !isDevSetting || (isDevelopment && showDevSettings);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <motion.button
        onClick={handleButtonClick}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(8px)",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: 80,
              right: 20,
              maxHeight: "calc(100vh - 100px)",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "12px",
              color: "white",
              zIndex: 1000,
              width: "280px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
            }}
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ opacity: 0.7 }}
                >
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
                Simulator Settings
              </h3>
            </div>

            <div
              style={{
                padding: "20px",
                overflowY: "auto",
                flexGrow: 1,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
              }}
            >
              {isDevelopment && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showDevSettings}
                      onChange={handleShowDevSettingsChange}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: "0.9rem" }}>
                      Show Dev Settings
                    </span>
                  </label>
                </div>
              )}

              {Object.entries(settings).map(([key, value]) =>
                shouldShowSetting(key as keyof typeof PHYSICS_CONFIG) ? (
                  <div key={key} style={{ marginBottom: "16px" }}>
                    {SETTINGS_METADATA[key as keyof typeof PHYSICS_CONFIG]
                      .type === "boolean" ? (
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={() =>
                            handleCheckboxChange(key as keyof typeof settings)
                          }
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ fontSize: "0.9rem" }}>
                          {key.replace(/_/g, " ")}
                        </span>
                      </label>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                          }}
                        >
                          <label style={{ fontSize: "0.9rem" }}>
                            {key.replace(/_/g, " ")}
                            {SETTINGS_METADATA[
                              key as keyof typeof SETTINGS_METADATA
                            ].isDev && (
                              <span
                                style={{
                                  color: "#ff6b6b",
                                  marginLeft: "4px",
                                  fontSize: "0.8rem",
                                  padding: "2px 6px",
                                  background: "rgba(255, 107, 107, 0.1)",
                                  borderRadius: "4px",
                                }}
                              >
                                dev
                              </span>
                            )}
                          </label>
                          <span
                            style={{
                              color: "rgba(255, 255, 255, 0.7)",
                              fontSize: "0.85rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {Number(value).toFixed(3)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={
                            SETTINGS_METADATA[
                              key as keyof typeof SETTINGS_METADATA
                            ].type === "slider"
                              ? SETTINGS_METADATA[
                                  key as keyof typeof SETTINGS_METADATA
                                ].min
                              : undefined
                          }
                          max={
                            SETTINGS_METADATA[
                              key as keyof typeof SETTINGS_METADATA
                            ].type === "slider"
                              ? SETTINGS_METADATA[
                                  key as keyof typeof SETTINGS_METADATA
                                ].max
                              : undefined
                          }
                          step={
                            SETTINGS_METADATA[
                              key as keyof typeof SETTINGS_METADATA
                            ].type === "slider"
                              ? SETTINGS_METADATA[
                                  key as keyof typeof SETTINGS_METADATA
                                ].step
                              : undefined
                          }
                          value={value as number}
                          onChange={(e) =>
                            handleSettingChange(
                              key as keyof typeof PHYSICS_CONFIG,
                              Number(e.target.value)
                            )
                          }
                          style={{
                            width: "100%",
                            height: "4px",
                            WebkitAppearance: "none",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "2px",
                            cursor: "pointer",
                          }}
                        />
                      </>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
          input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            cursor: pointer;
          }

          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 14px;
            width: 14px;
            border-radius: 50%;
            background: #fff;
            cursor: pointer;
            border: 2px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            transition: all 0.15s ease;
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            background: #fff;
          }

          input[type="range"]::-moz-range-thumb {
            height: 14px;
            width: 14px;
            border-radius: 50%;
            background: #fff;
            cursor: pointer;
            border: 2px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            transition: all 0.15s ease;
          }

          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
            background: #fff;
          }

          input[type="checkbox"] {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            cursor: pointer;
            position: relative;
            transition: all 0.15s ease;
          }

          input[type="checkbox"]:checked {
            background: #4CAF50;
            border-color: #4CAF50;
          }

          input[type="checkbox"]:checked::after {
            content: '✓';
            position: absolute;
            color: white;
            font-size: 12px;
            left: 2px;
            top: -1px;
          }

          input[type="checkbox"]:hover {
            border-color: rgba(255, 255, 255, 0.5);
          }

          div::-webkit-scrollbar {
            width: 6px;
          }

          div::-webkit-scrollbar-track {
            background: transparent;
          }

          div::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
          }

          div::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.5);
          }
        `}
      </style>
    </>
  );
};