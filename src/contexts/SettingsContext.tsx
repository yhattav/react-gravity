import React, { createContext, useContext, useState, useCallback } from "react";
import { DEFAULT_PHYSICS_CONFIG, PhysicsSettings } from "../constants/physics";
import { Scenario } from "../types/scenario";

const STORAGE_KEYS = {
  SETTINGS: "simulatorSettings",
  SHOW_DEV: "showDevSettings",
  SAVED_SCENARIOS: "savedScenarios",
} as const;

interface SettingsContextType {
  settings: PhysicsSettings;
  showDevSettings: boolean;
  savedScenarios: Scenario[];
  updateSettings: (newSettings: Partial<PhysicsSettings>) => void;
  updateShowDevSettings: (show: boolean) => void;
  resetSettings: () => void;
  saveScenario: (scenario: Scenario) => void;
  deleteSavedScenario: (scenarioId: string) => void;
  isDevelopment: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<PhysicsSettings>(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      const validSettings = Object.keys(parsedSettings).reduce((acc, key) => {
        if (key in DEFAULT_PHYSICS_CONFIG) {
          acc[key] = parsedSettings[key];
        }
        return acc;
      }, {} as Partial<PhysicsSettings>);

      return { ...DEFAULT_PHYSICS_CONFIG, ...validSettings };
    }
    return DEFAULT_PHYSICS_CONFIG;
  });

  const [showDevSettings, setShowDevSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOW_DEV);
    return saved ? JSON.parse(saved) : false;
  });

  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_SCENARIOS);
    return saved ? JSON.parse(saved) : [];
  });

  const updateSettings = useCallback(
    (newSettings: Partial<PhysicsSettings>) => {
      const validNewSettings = Object.keys(newSettings).reduce((acc, key) => {
        if (key in DEFAULT_PHYSICS_CONFIG) {
          acc[key] = newSettings[key as keyof typeof DEFAULT_PHYSICS_CONFIG];
        }
        return acc;
      }, {} as Partial<PhysicsSettings>);

      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...validNewSettings };
        localStorage.setItem(
          STORAGE_KEYS.SETTINGS,
          JSON.stringify(updatedSettings)
        );
        return updatedSettings;
      });
    },
    []
  );

  const updateShowDevSettings = useCallback((show: boolean) => {
    setShowDevSettings(show);
    localStorage.setItem(STORAGE_KEYS.SHOW_DEV, JSON.stringify(show));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_PHYSICS_CONFIG);
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(DEFAULT_PHYSICS_CONFIG)
    );
  }, []);

  const saveScenario = useCallback((scenario: Scenario) => {
    setSavedScenarios((prevScenarios) => {
      const updatedScenarios = [...prevScenarios, scenario];
      localStorage.setItem(
        STORAGE_KEYS.SAVED_SCENARIOS,
        JSON.stringify(updatedScenarios)
      );
      return updatedScenarios;
    });
  }, []);

  const deleteSavedScenario = useCallback((scenarioId: string) => {
    setSavedScenarios((prevScenarios) => {
      const updatedScenarios = prevScenarios.filter((s) => s.id !== scenarioId);
      localStorage.setItem(
        STORAGE_KEYS.SAVED_SCENARIOS,
        JSON.stringify(updatedScenarios)
      );
      return updatedScenarios;
    });
  }, []);

  const value = {
    settings,
    showDevSettings,
    savedScenarios,
    updateSettings,
    updateShowDevSettings,
    resetSettings,
    saveScenario,
    deleteSavedScenario,
    isDevelopment: process.env.NODE_ENV === "development",
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
