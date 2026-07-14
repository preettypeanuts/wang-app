"use client";

import { useServerInsertedHTML } from "next/navigation";

import { createRootAppearanceBootstrapScript } from "@/lib/appearance/bootstrap-script";

const BOOTSTRAP_SCRIPT = createRootAppearanceBootstrapScript();

/** Injects blocking bootstrap outside the React tree — avoids React 19 script warnings. */
export function RootBootstrapScript() {
  useServerInsertedHTML(() => (
    <script
      id="wang-bootstrap"
      dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }}
    />
  ));

  return null;
}
