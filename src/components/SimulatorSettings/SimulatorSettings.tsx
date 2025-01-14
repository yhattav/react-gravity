import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DEFAULT_PHYSICS_CONFIG,
  SETTINGS_METADATA,
  SliderSettingMetadata,
  VectorSettingMetadata,
} from "../../constants/physics";
import { useSettings } from "../../contexts/SettingsContext";
import { VectorController } from "../VectorController/VectorController";
import { Point2D } from "../../utils/types/physics";
import { MdVisibility } from "react-icons/md";
import { IoMusicalNotes } from "react-icons/io5";
import { TbAtom2Filled } from "react-icons/tb";

interface SimulatorSettingsProps {
  onSettingsChange: (settings: typeof DEFAULT_PHYSICS_CONFIG) => void;
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "physics" | "visuals" | "sound";

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  settings: (keyof typeof DEFAULT_PHYSICS_CONFIG)[];
}

const TABS: TabConfig[] = [
  {
    id: "physics",
    label: "Physics",
    icon: <TbAtom2Filled />,
    settings: [
      "NEW_PARTICLE_MASS",
      "NEW_PARTICLE_ELASTICITY",
      "FRICTION",
      "DELTA_TIME",
      "POINTER_MASS",
      "CONSTANT_FORCE",
      "SOLID_BOUNDARIES",
      "PARTICLES_EXERT_GRAVITY",
    ],
  },
  {
    id: "visuals",
    label: "Visuals",
    icon: <MdVisibility />,
    settings: [
      "SHOW_VELOCITY_ARROWS",
      "SHOW_FORCE_ARROWS",
      "PARTICLE_TRAIL_LENGTH",
      "SHOW_GRAVITY_VISION",
      "GRAVITY_GRID_DENSITY",
      "SHOW_D3_GRAVITY_VISION",
      "GRAVITY_VISION_OPACITY",
      "GRAVITY_VISION_STROKE_OPACITY",
      "GRAVITY_VISION_STROKE_WIDTH",
      "GRAVITY_VISION_STROKE_COLOR",
      "GRAVITY_VISION_COLOR_SCHEME",
      "GRAVITY_VISION_INVERT_COLORS",
      "GRAVITY_VISION_GRID_SIZE",
      "GRAVITY_VISION_CONTOUR_LEVELS",
      "GRAVITY_VISION_THROTTLE_MS",
      "GRAVITY_VISION_TRANSITION_MS",
      "GRAVITY_VISION_STRENGTH",
      "GRAVITY_VISION_FALLOFF",
      "GRAVITY_VISION_MASS_THRESHOLD",
      "GRAVITY_VISION_BLUR",
    ],
  },
  {
    id: "sound",
    label: "Sound",
    icon: <IoMusicalNotes />,
    settings: ["MASTER_VOLUME", "AMBIENT_VOLUME", "PARTICLE_VOLUME"],
  },
];

export const SimulatorSettings: React.FC<SimulatorSettingsProps> = ({
  onSettingsChange,
  isOpen,
}) => {
  const {
    settings,
    showDevSettings,
    updateSettings,
    updateShowDevSettings,
    isDevelopment,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>("physics");

  const handleSettingChange = (
    key: keyof typeof settings,
    value: number | Point2D | string | boolean
  ) => {
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

  const shouldShowSetting = (key: keyof typeof DEFAULT_PHYSICS_CONFIG) => {
    const isDevSetting = SETTINGS_METADATA[key]?.isDev;
    const isRelevant = SETTINGS_METADATA[key]?.isRelevant(settings);
    return (!isDevSetting || (isDevelopment && showDevSettings)) && isRelevant;
  };

  const renderSettingControl = (key: keyof typeof DEFAULT_PHYSICS_CONFIG) => {
    const value = settings[key];
    const metadata = SETTINGS_METADATA[key];

    if (metadata.type === "select") {
      return (
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              fontSize: "0.9rem",
              display: "block",
              marginBottom: "6px",
            }}
          >
            {key.replace(/_/g, " ")}
          </label>
          <select
            value={value as string}
            onChange={(e) =>
              handleSettingChange(
                key as keyof typeof DEFAULT_PHYSICS_CONFIG,
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {metadata.options.map((option) => (
              <option key={option} value={option}>
                {option.replace(/^interpolate/, "")}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (metadata.type === "color") {
      return (
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "0.9rem" }}>
              {key.replace(/_/g, " ")}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "4px",
                  backgroundColor: value as string,
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                }}
              />
              <input
                type="color"
                value={value as string}
                onChange={(e) =>
                  handleSettingChange(
                    key as keyof typeof DEFAULT_PHYSICS_CONFIG,
                    e.target.value
                  )
                }
                style={{
                  width: "0",
                  height: "0",
                  padding: "0",
                  border: "none",
                  opacity: "0",
                  position: "absolute",
                }}
                id={`color-${key}`}
              />
              <label
                htmlFor={`color-${key}`}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                {(value as string).toUpperCase()}
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (metadata.type === "vector") {
      return (
        <div key={key} style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "0.9rem" }}>{key.replace(/_/g, " ")}</label>
          <VectorController
            value={value as Point2D}
            onChange={(newValue) =>
              handleSettingChange(
                key as keyof typeof DEFAULT_PHYSICS_CONFIG,
                newValue
              )
            }
            max={
              (
                SETTINGS_METADATA[
                  key as keyof typeof DEFAULT_PHYSICS_CONFIG
                ] as VectorSettingMetadata
              ).max
            }
            width={100}
            height={100}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              fontSize: "0.85rem",
              fontFamily: "monospace",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            <span>x: {(value as Point2D).x.toFixed(3)}</span>
            <span>y: {(value as Point2D).y.toFixed(3)}</span>
          </div>
        </div>
      );
    }

    if (metadata.type === "boolean") {
      return (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={() => handleCheckboxChange(key as keyof typeof settings)}
            style={{
              width: "16px",
              height: "16px",
              cursor: "pointer",
            }}
          />
          <span style={{ fontSize: "0.9rem" }}>{key.replace(/_/g, " ")}</span>
        </label>
      );
    }

    return (
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <label style={{ fontSize: "0.9rem" }}>
            {key.replace(/_/g, " ")}
            {SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA].isDev && (
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
            SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA].type ===
            "slider"
              ? (
                  SETTINGS_METADATA[
                    key as keyof typeof SETTINGS_METADATA
                  ] as SliderSettingMetadata
                ).min
              : undefined
          }
          max={
            SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA].type ===
            "slider"
              ? (
                  SETTINGS_METADATA[
                    key as keyof typeof SETTINGS_METADATA
                  ] as SliderSettingMetadata
                ).max
              : undefined
          }
          step={
            SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA].type ===
            "slider"
              ? (
                  SETTINGS_METADATA[
                    key as keyof typeof SETTINGS_METADATA
                  ] as SliderSettingMetadata
                ).step
              : undefined
          }
          value={value as number}
          onChange={(e) =>
            handleSettingChange(
              key as keyof typeof DEFAULT_PHYSICS_CONFIG,
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
      </div>
    );
  };

  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="floating-panel settings-panel"
            style={{
              position: "absolute",
              right: "20px",
              width: "300px",
              display: "flex",
              flexDirection: "column",
              zIndex: 1000,
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
                {TABS.find((tab) => tab.id === activeTab)?.label} Settings
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

              {TABS.find((tab) => tab.id === activeTab)?.settings.map(
                (key) => shouldShowSetting(key) && renderSettingControl(key)
              )}
            </div>

            {/* Tabs */}
            <div
              style={{
                position: "absolute",
                left: "-40px",
                bottom: "0",
                display: "flex",
                flexDirection: "column-reverse",
                gap: "4px",
                width: "40px",
                paddingBottom: "20px",
              }}
            >
              {TABS.map((tab, index) => (
                <motion.div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={false}
                  animate={{
                    scale: activeTab === tab.id ? 1.1 : 1,
                    backgroundColor:
                      activeTab === tab.id
                        ? "rgba(0, 0, 0, 0.8)"
                        : "rgba(0, 0, 0, 0.6)",
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "8px 0 0 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      activeTab === tab.id
                        ? "#fff"
                        : "rgba(255, 255, 255, 0.6)",
                    zIndex: activeTab === tab.id ? 3 : 2 - index,
                    position: "relative",
                    fontSize: "24px",
                    transformOrigin: "center right",
                  }}
                  whileHover={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "#fff",
                  }}
                >
                  {tab.icon}
                  {activeTab === tab.id && (
                    <div
                      style={{
                        position: "absolute",
                        right: "-2px",
                        top: 0,
                        bottom: 0,
                        width: "2px",
                        background: "rgba(0, 0, 0, 0.8)",
                      }}
                    />
                  )}
                </motion.div>
              ))}
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
    </div>
  );
};
