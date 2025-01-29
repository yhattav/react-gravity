# React Settings Panel

A flexible and customizable settings panel for React applications. This library provides a complete solution for managing application settings with a beautiful UI, persistent storage, and TypeScript support.

## Features

- 🎨 Beautiful and customizable UI
- 💾 Persistent storage with localStorage
- 🔄 Real-time settings updates
- 🎯 Type-safe with full TypeScript support
- 📱 Responsive design
- 🎭 Smooth animations with Framer Motion
- 🛠 Developer settings support
- 📑 Tabbed interface support

## Installation

```bash
npm install react-settings-panel
# or
yarn add react-settings-panel
```

## Quick Start

```tsx
import { createSettingsContext, SettingsPanel } from "react-settings-panel";

// Define your settings configuration
const config = {
  defaultSettings: {
    theme: "dark",
    fontSize: 16,
    notifications: true,
  },
  metadata: {
    theme: {
      type: "select",
      options: ["light", "dark", "system"],
      isDev: false,
      isRelevant: () => true,
    },
    fontSize: {
      type: "slider",
      min: 12,
      max: 24,
      step: 1,
      isDev: false,
      isRelevant: () => true,
    },
    notifications: {
      type: "boolean",
      isDev: false,
      isRelevant: () => true,
    },
  },
};

// Create settings context
const { Provider: SettingsProvider, useSettings } =
  createSettingsContext<typeof config.defaultSettings>();

// Use in your app
function App() {
  return (
    <SettingsProvider
      config={config}
      storageConfig={{
        prefix: "myapp_",
        keys: {
          settings: "settings",
          showDev: "showDevSettings",
        },
      }}
    >
      <YourApp />
    </SettingsProvider>
  );
}

// Use settings panel in your components
function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    settings,
    showDevSettings,
    updateSettings,
    updateShowDevSettings,
    isDevelopment,
  } = useSettings();

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Settings</button>
      <SettingsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        config={config}
        settings={settings}
        showDevSettings={showDevSettings}
        onSettingChange={(key, value) => updateSettings({ [key]: value })}
        onShowDevSettingsChange={updateShowDevSettings}
        isDevelopment={isDevelopment}
        tabs={[
          {
            id: "appearance",
            label: "Appearance",
            icon: <Icon />,
            settings: ["theme", "fontSize"],
          },
          {
            id: "notifications",
            label: "Notifications",
            icon: <Icon />,
            settings: ["notifications"],
          },
        ]}
      />
    </>
  );
}
```

## API Reference

### SettingsPanel Props

| Prop                    | Type                                   | Description                                   |
| ----------------------- | -------------------------------------- | --------------------------------------------- |
| isOpen                  | boolean                                | Whether the settings panel is visible         |
| onClose                 | () => void                             | Callback when the panel should close          |
| config                  | SettingsConfig<T>                      | Configuration object for settings             |
| settings                | T                                      | Current settings values                       |
| showDevSettings         | boolean                                | Whether to show developer settings            |
| onSettingChange         | (key: keyof T, value: unknown) => void | Callback when a setting changes               |
| onShowDevSettingsChange | (show: boolean) => void                | Callback when dev settings visibility changes |
| isDevelopment           | boolean                                | Whether the app is in development mode        |
| tabs?                   | Array<Tab>                             | Optional tabs configuration                   |

### createSettingsContext

Creates a context provider and hook for managing settings. Returns:

- Provider: React component for providing settings context
- useSettings: Hook for accessing settings in components

### Types

```typescript
interface SettingsConfig<T> {
  defaultSettings: T;
  metadata: Record<keyof T, SettingMetadata>;
}

type SettingMetadata =
  | SliderSettingMetadata
  | BooleanSettingMetadata
  | VectorSettingMetadata
  | ColorSettingMetadata
  | SelectSettingMetadata;

interface StorageConfig {
  prefix?: string;
  keys: Record<string, string>;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]
