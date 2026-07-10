/** Client build id — inlined at build time via next.config env. */
export const CLIENT_BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown";

export function readServerBuildId(): string {
  return process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown";
}
