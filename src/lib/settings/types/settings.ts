export interface BaseSettingMetadata {
  isDev: boolean;
  isRelevant: (settings: Record<string, unknown>) => boolean;
}

export interface SliderSettingMetadata extends BaseSettingMetadata {
  type: "slider";
  min: number;
  max: number;
  step: number;
}

export interface BooleanSettingMetadata extends BaseSettingMetadata {
  type: "boolean";
}

export interface VectorSettingMetadata extends BaseSettingMetadata {
  type: "vector";
  max: Point2D;
  min: Point2D;
  label?: string;
}

export interface ColorSettingMetadata extends BaseSettingMetadata {
  type: "color";
}

export interface SelectSettingMetadata extends BaseSettingMetadata {
  type: "select";
  options: string[];
}

export type SettingMetadata =
  | SliderSettingMetadata
  | BooleanSettingMetadata
  | VectorSettingMetadata
  | ColorSettingMetadata
  | SelectSettingMetadata;

export interface Point2D {
  x: number;
  y: number;
}

export interface SettingsConfig<T extends Record<string, unknown>> {
  defaultSettings: T;
  metadata: Record<keyof T, SettingMetadata>;
}

export interface StorageConfig {
  prefix?: string;
  keys: Record<string, string>;
}
