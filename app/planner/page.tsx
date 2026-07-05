import { redirect } from "next/navigation";

interface PlannerRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PlannerRedirect({
  searchParams,
}: PlannerRedirectProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        query.append(key, entry);
      }
    }
  }

  const qs = query.toString();
  redirect(qs ? `/payplan?${qs}` : "/payplan");
}
