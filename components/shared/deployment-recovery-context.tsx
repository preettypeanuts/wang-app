"use client";

import { createContext, useContext } from "react";

export interface DeploymentRecoveryState {
  visible: boolean;
  progress: number;
  secondsRemaining: number;
  stageLabel: string;
  exhausted: boolean;
  requestRecovery: () => void;
  manualReload: () => void;
}

const defaultState: DeploymentRecoveryState = {
  visible: false,
  progress: 0,
  secondsRemaining: 0,
  stageLabel: "",
  exhausted: false,
  requestRecovery: () => {},
  manualReload: () => {},
};

export const DeploymentRecoveryContext =
  createContext<DeploymentRecoveryState>(defaultState);

export function useDeploymentRecovery(): DeploymentRecoveryState {
  return useContext(DeploymentRecoveryContext);
}
