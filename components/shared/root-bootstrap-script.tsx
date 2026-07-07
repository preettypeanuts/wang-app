"use client";

import { useServerInsertedHTML } from "next/navigation";

import { createRootAppearanceBootstrapScript } from "@/lib/appearance/bootstrap-script";
import { createAppleTouchIconBootstrapScript } from "@/lib/pwa/apple-touch-icon";

const BOOTSTRAP_SCRIPT = `${createRootAppearanceBootstrapScript()}\n${createAppleTouchIconBootstrapScript()}`;

/** Injects blocking bootstrap outside the React tree — avoids React 19 script warnings. */
export function RootBootstrapScript() {
  useServerInsertedHTML(() => (
    <script
      id="monmon-bootstrap"
      dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }}
    />
  ));

  return null;
}
