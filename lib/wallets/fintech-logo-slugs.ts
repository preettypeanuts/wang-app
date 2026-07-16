import { GENERATED_FINTECH_LOGO_SLUGS } from "@/config/wallet-institution-catalog.generated";

let slugSet: Set<string> | null = null;

function ensureSlugSet(): Set<string> {
  if (slugSet) {
    return slugSet;
  }

  slugSet = new Set(GENERATED_FINTECH_LOGO_SLUGS);
  return slugSet;
}

export function isFintechLogoSlug(slug: string): boolean {
  return ensureSlugSet().has(slug);
}
