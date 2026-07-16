"use client";

import { useEffect, useState } from "react";

import {
  WALLET_INSTITUTION_LOGO_CARD,
  WALLET_INSTITUTION_LOGO_CARD_FALLBACK,
  WALLET_INSTITUTION_LOGO_CARD_GLYPH,
  WALLET_INSTITUTION_LOGO_FALLBACK,
  WALLET_INSTITUTION_LOGO_GLYPH,
  WALLET_INSTITUTION_LOGO_SHELL,
} from "@/config/wallet-institution-logo";
import { getFintechLogoUrl } from "@/lib/wallets/fintech-logo-url";
import { toWhiteSvgMarkup } from "@/lib/wallets/to-white-svg-markup";
import { cn } from "@/lib/utils";

type WalletInstitutionLogoVariant = "shell" | "card";

interface WalletInstitutionLogoProps {
  slug: string | null;
  name: string;
  size?: number;
  variant?: WalletInstitutionLogoVariant;
  className?: string;
}

function WalletInstitutionLogoFallback({
  name,
  size,
  variant,
  className,
}: Pick<
  WalletInstitutionLogoProps,
  "name" | "size" | "variant" | "className"
>) {
  const isCard = variant === "card";

  return (
    <span
      className={cn(
        isCard
          ? WALLET_INSTITUTION_LOGO_CARD_FALLBACK
          : WALLET_INSTITUTION_LOGO_FALLBACK,
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function WalletInstitutionLogo({
  slug,
  name,
  size = 32,
  variant = "shell",
  className,
}: WalletInstitutionLogoProps) {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const isCard = variant === "card";
  const shellClass = isCard
    ? WALLET_INSTITUTION_LOGO_CARD
    : WALLET_INSTITUTION_LOGO_SHELL;
  const glyphClass = isCard
    ? WALLET_INSTITUTION_LOGO_CARD_GLYPH
    : WALLET_INSTITUTION_LOGO_GLYPH;

  useEffect(() => {
    if (!slug) {
      setSvgMarkup(null);
      setLoadFailed(false);
      return;
    }

    let cancelled = false;
    setSvgMarkup(null);
    setLoadFailed(false);

    fetch(getFintechLogoUrl(slug))
      .then((response) => {
        if (!response.ok) {
          throw new Error("Logo not found");
        }

        return response.text();
      })
      .then((markup) => {
        if (!cancelled) {
          setSvgMarkup(isCard ? toWhiteSvgMarkup(markup) : markup);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, isCard]);

  if (!slug || loadFailed) {
    return (
      <WalletInstitutionLogoFallback
        name={name}
        size={size}
        variant={variant}
        className={className}
      />
    );
  }

  if (!svgMarkup) {
    return (
      <span
        className={cn(shellClass, className)}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <span className={glyphClass} />
      </span>
    );
  }

  return (
    <span
      className={cn(shellClass, className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className={glyphClass}
        // Trusted local assets synced via npm run fintech:logos
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </span>
  );
}
