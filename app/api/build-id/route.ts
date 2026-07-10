import { readServerBuildId } from "@/lib/deployment/build-id";

export function GET() {
  return Response.json(
    { buildId: readServerBuildId() },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
