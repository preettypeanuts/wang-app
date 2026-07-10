import { DEPLOYMENT_RECOVERY_EVENT } from "@/config/deployment-recovery";

/** Ask the global recovery provider to show the update UI and reload safely. */
export function requestDeploymentRecovery(): void {
  window.dispatchEvent(new Event(DEPLOYMENT_RECOVERY_EVENT));
}
