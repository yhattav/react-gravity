import React from "react";
import { PHYSICS_CONFIG, SETTINGS_METADATA } from "../../constants/physics";
import { useSettings } from "../../hooks/useSettings";

interface SimulatorSettingsProps {
  onSettingsChange: (settings: typeof PHYSICS_CONFIG) => void;
}

export const SimulatorSettings: React.FC<SimulatorSettingsProps> = ({
  onSettingsChange,
}) => {
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

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: "15px",
        borderRadius: "8px",
        color: "white",
        zIndex: 1000,
        minWidth: "250px",
      }}
    >
      <h3 style={{ margin: "0 0 15px 0" }}>Simulator Settings</h3>

      {isDevelopment && (
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={showDevSettings}
              onChange={handleShowDevSettingsChange}
            />
            Show Dev Settings
          </label>
        </div>
      )}

      {Object.entries(settings).map(([key, value]) =>
        shouldShowSetting(key as keyof typeof PHYSICS_CONFIG) ? (
          <div key={key} style={{ marginBottom: "10px" }}>
            {SETTINGS_METADATA[key as keyof typeof PHYSICS_CONFIG].type ===
            "boolean" ? (
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={() =>
                    handleCheckboxChange(key as keyof typeof settings)
                  }
                />
                {key.replace(/_/g, " ")}
              </label>
            ) : (
              <>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <label>
                    {key.replace(/_/g, " ")}
                    {SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA]
                      .isDev && (
                      <span style={{ color: "#ff6b6b", marginLeft: "4px" }}>
                        (dev)
                      </span>
                    )}
                  </label>
                  <span>{Number(value).toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={
                    SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA]
                      .type === "slider"
                      ? SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA]
                          .min
                      : undefined
                  }
                  max={
                    SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA]
                      .type === "slider"
                      ? SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA]
                          .max
                      : undefined
                  }
                  step={
                    SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA]
                      .type === "slider"
                      ? SETTINGS_METADATA[key as keyof typeof SETTINGS_METADATA]
                          .step
                      : undefined
                  }
                  value={value as number}
                  onChange={(e) =>
                    handleSettingChange(
                      key as keyof typeof PHYSICS_CONFIG,
                      Number(e.target.value)
                    )
                  }
                  style={{ width: "100%" }}
                />
              </>
            )}
          </div>
        ) : null
      )}
    </div>
  );
};
