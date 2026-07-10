import { CLIENT_BUILD_ID } from "@/lib/deployment/build-id";
import { fetchServerBuildId } from "@/lib/deployment/fetch-server-build-id";

export async function hasDeploymentMismatch(): Promise<boolean> {
  const serverBuildId = await fetchServerBuildId();

  if (!serverBuildId || serverBuildId === "unknown") {
    return false;
  }

  return serverBuildId !== CLIENT_BUILD_ID;
}
