import type { LucideProps } from "lucide-react";

/** Default Lucide props for the solid/filled look used across Monmon. */
export const LUCIDE_FILLED_PROPS: Pick<
  LucideProps,
  "fill" | "stroke" | "strokeWidth"
> = {
  fill: "currentColor",
  stroke: "currentColor",
  strokeWidth: 1.5,
};
