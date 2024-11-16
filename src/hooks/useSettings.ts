import { useState, useEffect } from "react";
import { PHYSICS_CONFIG, SETTINGS_METADATA } from "../constants/physics";

const STORAGE_KEYS = {
  SETTINGS: "simulatorSettings",
  SHOW_DEV: "showDevSettings",
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

  return {
    settings,
    showDevSettings,
    updateSettings,
    updateShowDevSettings,
    resetSettings,
    isDevelopment: process.env.NODE_ENV === "development",
  };
};
