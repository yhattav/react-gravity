import React, { createContext, useContext, useState, useCallback } from "react";
import { SettingsConfig, StorageConfig } from "../types/settings";

interface SettingsContextType<T extends Record<string, unknown>> {
  settings: T;
  showDevSettings: boolean;
  updateSettings: (newSettings: Partial<T>) => void;
  updateShowDevSettings: (show: boolean) => void;
  resetSettings: () => void;
  isDevelopment: boolean;
}

interface SettingsProviderProps<T extends Record<string, unknown>> {
  children: React.ReactNode;
  config: SettingsConfig<T>;
  storageConfig?: StorageConfig;
}

function createSettingsContext<T extends Record<string, unknown>>() {
  const Context = createContext<SettingsContextType<T> | null>(null);

  const Provider = ({
    children,
    config,
    storageConfig,
  }: SettingsProviderProps<T>) => {
    const getStorageKey = useCallback(
      (key: string) => {
        if (!storageConfig) return null;
        return storageConfig.prefix ? `${storageConfig.prefix}${key}` : key;
      },
      [storageConfig]
    );

    const loadFromStorage = <V,>(
      key: string,
      defaultValue: V,
      getValue: (saved: string) => V
    ): V => {
      const storageKey = getStorageKey(key);
      if (!storageKey) return defaultValue;

      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        return defaultValue;
      }
      return getValue(saved);
    };

    const saveToStorage = useCallback(
      (key: string, value: unknown) => {
        const storageKey = getStorageKey(key);
        if (!storageKey) return;
        localStorage.setItem(storageKey, JSON.stringify(value));
      },
      [getStorageKey]
    );

    const [settings, setSettings] = useState<T>(() => {
      return loadFromStorage(
        storageConfig?.keys.settings ?? "settings",
        config.defaultSettings,
        (saved) => {
          const parsedSettings = JSON.parse(saved);
          // Only keep known keys from defaultSettings
          return Object.keys(config.defaultSettings).reduce(
            (cleanSettings, key) => {
              const typedKey = key as keyof T;
              cleanSettings[typedKey] =
                key in parsedSettings
                  ? parsedSettings[key]
                  : config.defaultSettings[typedKey];
              return cleanSettings;
            },
            {} as T
          );
        }
      );
    });

    const [showDevSettings, setShowDevSettings] = useState(() => {
      return loadFromStorage(
        storageConfig?.keys.showDev ?? "showDevSettings",
        false,
        Boolean
      );
    });

    const updateSettings = useCallback(
      (newSettings: Partial<T>) => {
        const validNewSettings = Object.keys(newSettings).reduce((acc, key) => {
          if (key in config.defaultSettings) {
            acc[key as keyof T] = newSettings[key as keyof T];
          }
          return acc;
        }, {} as Partial<T>);

        setSettings((prevSettings) => {
          const updatedSettings = { ...prevSettings, ...validNewSettings };
          saveToStorage(
            storageConfig?.keys.settings ?? "settings",
            updatedSettings
          );
          return updatedSettings;
        });
      },
      [config.defaultSettings, saveToStorage, storageConfig?.keys.settings]
    );

    const updateShowDevSettings = useCallback(
      (show: boolean) => {
        setShowDevSettings(show);
        saveToStorage(storageConfig?.keys.showDev ?? "showDevSettings", show);
      },
      [saveToStorage, storageConfig?.keys.showDev]
    );

    const resetSettings = useCallback(() => {
      setSettings(config.defaultSettings);
      saveToStorage(
        storageConfig?.keys.settings ?? "settings",
        config.defaultSettings
      );
    }, [config.defaultSettings, saveToStorage, storageConfig?.keys.settings]);

    const value = {
      settings,
      showDevSettings,
      updateSettings,
      updateShowDevSettings,
      resetSettings,
      isDevelopment: process.env.NODE_ENV === "development",
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useSettings = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
  };

  return { Provider, useSettings };
}

export { createSettingsContext };
