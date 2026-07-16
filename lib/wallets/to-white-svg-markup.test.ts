import { describe, expect, it } from "vitest";

import { toWhiteSvgMarkup } from "@/lib/wallets/to-white-svg-markup";

describe("toWhiteSvgMarkup", () => {
  it("converts colored fills to white", () => {
    const input =
      '<svg fill="none"><g fill="#0060AF"><path fill="#5827D4"/></g></svg>';
    const output = toWhiteSvgMarkup(input);

    expect(output).toContain('fill="#FFFFFF"');
    expect(output).not.toContain("#0060AF");
    expect(output).not.toContain("#5827D4");
    expect(output).toContain('fill="none"');
  });

  it("converts gradient fills to white", () => {
    const input = '<path fill="url(#paint0_linear)" stroke="#003A70"/>';
    const output = toWhiteSvgMarkup(input);

    expect(output).toBe('<path fill="#FFFFFF" stroke="#FFFFFF"/>');
  });
});
