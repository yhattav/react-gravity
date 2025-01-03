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

interface SettingsProviderProps {
  children: React.ReactNode;
  simulatorId?: string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  simulatorId,
}) => {
  const storagePrefix = simulatorId ? `${simulatorId}_` : "";

  const getStorageKey = useCallback(
    (key: keyof typeof STORAGE_KEYS) => {
      return simulatorId ? `${storagePrefix}${STORAGE_KEYS[key]}` : null;
    },
    [simulatorId, storagePrefix]
  );

  const loadFromStorage = <T,>(
    key: keyof typeof STORAGE_KEYS,
    defaultValue: T,
    getValue: (saved: string) => T
  ): T => {
    const storageKey = getStorageKey(key);

    if (!storageKey) return defaultValue;

    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return defaultValue;
    }
    return getValue(saved);
    //return { ...(defaultValue ? defaultValue : {}), ...JSON.parse(saved) };
  };

  const saveToStorage = useCallback(
    (key: keyof typeof STORAGE_KEYS, value: unknown) => {
      const storageKey = getStorageKey(key);
      if (!storageKey) return;
      localStorage.setItem(storageKey, JSON.stringify(value));
    },
    [getStorageKey]
  );

  const [settings, setSettings] = useState<PhysicsSettings>(() => {
    return loadFromStorage("SETTINGS", DEFAULT_PHYSICS_CONFIG, (saved) => {
      const parsedSettings = JSON.parse(saved);
      // Only keep known keys from DEFAULT_PHYSICS_CONFIG
      return Object.keys(DEFAULT_PHYSICS_CONFIG).reduce(
        (cleanSettings: PhysicsSettings, key) => {
          const typedKey = key as keyof typeof DEFAULT_PHYSICS_CONFIG;
          // @ts-expect-error todo later
          cleanSettings[typedKey] =
            key in parsedSettings
              ? (parsedSettings[key] as PhysicsSettings[typeof typedKey])
              : DEFAULT_PHYSICS_CONFIG[typedKey];
          return cleanSettings;
        },
        {} as PhysicsSettings
      );
    });
  });

  const [showDevSettings, setShowDevSettings] = useState(() => {
    return loadFromStorage("SHOW_DEV", false, Boolean);
  });

  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>(() => {
    return loadFromStorage("SAVED_SCENARIOS", [], (saved) => [
      ...JSON.parse(saved),
    ]);
  });

  const updateSettings = useCallback(
    (newSettings: Partial<PhysicsSettings>) => {
      const validNewSettings = Object.keys(newSettings).reduce((acc, key) => {
        if (key in DEFAULT_PHYSICS_CONFIG) {
          // @ts-expect-error todo later
          acc[key] = newSettings[key as keyof typeof DEFAULT_PHYSICS_CONFIG];
        }
        return acc;
      }, {} as Partial<PhysicsSettings>);

      setSettings((prevSettings) => {
        const updatedSettings = { ...prevSettings, ...validNewSettings };
        saveToStorage("SETTINGS", updatedSettings);
        return updatedSettings;
      });
    },
    [saveToStorage]
  );

  const updateShowDevSettings = useCallback(
    (show: boolean) => {
      setShowDevSettings(show);
      saveToStorage("SHOW_DEV", show);
    },
    [saveToStorage]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_PHYSICS_CONFIG);
    saveToStorage("SETTINGS", DEFAULT_PHYSICS_CONFIG);
  }, [saveToStorage]);

  const saveScenario = useCallback(
    (scenario: Scenario) => {
      setSavedScenarios((prevScenarios) => {
        const updatedScenarios = [...prevScenarios, scenario];
        saveToStorage("SAVED_SCENARIOS", updatedScenarios);
        return updatedScenarios;
      });
    },
    [saveToStorage]
  );

  const deleteSavedScenario = useCallback(
    (scenarioId: string) => {
      setSavedScenarios((prevScenarios) => {
        const updatedScenarios = prevScenarios.filter(
          (s) => s.id !== scenarioId
        );
        saveToStorage("SAVED_SCENARIOS", updatedScenarios);
        return updatedScenarios;
      });
    },
    [saveToStorage]
  );

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
