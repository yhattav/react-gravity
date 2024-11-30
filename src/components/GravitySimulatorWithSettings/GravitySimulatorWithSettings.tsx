import React from "react";
import {
  GravitySimulator,
  GravitySimulatorProps,
} from "../GravitySimulator/GravitySimulator";
import { SettingsProvider } from "../../contexts/SettingsContext";

export const GravitySimulatorWithSettings: React.FC<GravitySimulatorProps> = (
  props
) => {
  const { simulatorId, ...restProps } = props;

  if (!simulatorId) {
    return <GravitySimulator {...props} />;
  }

  return (
    <SettingsProvider simulatorId={simulatorId}>
      <GravitySimulator {...restProps} simulatorId={simulatorId} />
    </SettingsProvider>
  );
};
