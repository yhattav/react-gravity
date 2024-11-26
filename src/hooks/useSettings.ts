import { useState } from "react";
import { PHYSICS_CONFIG } from "../constants/physics";
import { Scenario } from "../../types/scenario";

const STORAGE_KEYS = {
  SETTINGS: "simulatorSettings",
  SHOW_DEV: "showDevSettings",
  SAVED_SCENARIOS: "savedScenarios",
} as const;

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      const validSettings = Object.keys(parsedSettings).reduce((acc, key) => {
        if (key in PHYSICS_CONFIG) {
          acc[key] = parsedSettings[key];
        }
        return acc;
      }, {} as Partial<typeof PHYSICS_CONFIG>);

      return { ...PHYSICS_CONFIG, ...validSettings };
    }
    return PHYSICS_CONFIG;
  });

  const [showDevSettings, setShowDevSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOW_DEV);
    return saved ? JSON.parse(saved) : false;
  });

  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_SCENARIOS);
    return saved ? JSON.parse(saved) : [];
  });

  const updateSettings = (newSettings: Partial<typeof PHYSICS_CONFIG>) => {
    const validNewSettings = Object.keys(newSettings).reduce((acc, key) => {
      if (key in PHYSICS_CONFIG) {
        acc[key] = newSettings[key as keyof typeof PHYSICS_CONFIG];
      }
      return acc;
    }, {} as Partial<typeof PHYSICS_CONFIG>);

    const updatedSettings = { ...settings, ...validNewSettings };
    setSettings(updatedSettings);
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(updatedSettings)
    );
  };

  const updateShowDevSettings = (show: boolean) => {
    setShowDevSettings(show);
    localStorage.setItem(STORAGE_KEYS.SHOW_DEV, JSON.stringify(show));
  };

  const resetSettings = () => {
    setSettings(PHYSICS_CONFIG);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(PHYSICS_CONFIG));
  };

  const saveScenario = (scenario: Scenario) => {
    const updatedScenarios = [...savedScenarios, scenario];
    setSavedScenarios(updatedScenarios);
    localStorage.setItem(
      STORAGE_KEYS.SAVED_SCENARIOS,
      JSON.stringify(updatedScenarios)
    );
  };

  const deleteSavedScenario = (scenarioId: string) => {
    const updatedScenarios = savedScenarios.filter((s) => s.id !== scenarioId);
    setSavedScenarios(updatedScenarios);
    localStorage.setItem(
      STORAGE_KEYS.SAVED_SCENARIOS,
      JSON.stringify(updatedScenarios)
    );
  };

  return {
    settings,
    showDevSettings,
    updateSettings,
    updateShowDevSettings,
    resetSettings,
    isDevelopment: process.env.NODE_ENV === "development",
    savedScenarios,
    saveScenario,
    deleteSavedScenario,
  };
};
