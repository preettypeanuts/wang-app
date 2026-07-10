import { describe, expect, it } from "vitest";

import { isStaleDeploymentError } from "@/lib/errors/is-stale-deployment-error";

describe("isStaleDeploymentError", () => {
  it("detects chunk load failures", () => {
    expect(
      isStaleDeploymentError(new Error("Loading chunk 1234 failed.")),
    ).toBe(true);
  });

  it("detects dynamic import failures", () => {
    expect(
      isStaleDeploymentError(
        new TypeError("Failed to fetch dynamically imported module"),
      ),
    ).toBe(true);
  });

  it("detects server component deploy errors", () => {
    expect(
      isStaleDeploymentError(
        new Error("An error occurred in the Server Components render"),
      ),
    ).toBe(true);
  });

  it("detects server action mismatch", () => {
    expect(
      isStaleDeploymentError(new Error("Failed to find Server Action")),
    ).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isStaleDeploymentError(new Error("Network request failed"))).toBe(
      false,
    );
  });
});
