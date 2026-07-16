import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { isFintechLogoSlug } from "@/lib/wallets/fintech-logo-slugs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  if (!isFintechLogoSlug(slug)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public/icons/fintech",
      `${slug}.svg`,
    );
    const svg = await readFile(filePath, "utf8");

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
