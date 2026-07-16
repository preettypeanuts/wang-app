"use client";

import { Fragment } from "react";

import { WalletInstitutionLogo } from "@/components/wallets/wallet-institution-logo";
import { getWalletInstitutionSectionIcon } from "@/config/wallet-institution-sections";
import { WALLET_INSTITUTION_SEARCH_PLACEHOLDER } from "@/config/wallet-labels";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { CheckIcon } from "@/lib/icons";
import {
  type WalletInstitutionOption,
  type WalletInstitutionSection,
} from "@/lib/wallets/build-wallet-institution-catalog";
import { cn } from "@/lib/utils";
import type { WalletType } from "@/types/wallet";

const OPTION_ITEM =
  "flex w-full items-center gap-3 px-4 py-3 text-left text-[17px] transition-colors active:bg-foreground/5";

interface WalletInstitutionOptionListProps {
  type: WalletType;
  sections: WalletInstitutionSection[];
  selectedSlug: string | null;
  selectedName: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (option: WalletInstitutionOption) => void;
  className?: string;
  listClassName?: string;
  closeOnSelect?: boolean;
}

function isSelected(
  option: WalletInstitutionOption,
  selectedSlug: string | null,
  selectedName: string,
): boolean {
  if (selectedSlug && option.slug) {
    return option.slug === selectedSlug;
  }

  return option.name.trim().toLowerCase() === selectedName.trim().toLowerCase();
}

export function WalletInstitutionOptionList({
  type,
  sections,
  selectedSlug,
  selectedName,
  search,
  onSearchChange,
  onSelect,
  className,
  listClassName,
  closeOnSelect = false,
}: WalletInstitutionOptionListProps) {
  const hasResults = sections.some((section) => section.options.length > 0);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="shrink-0 px-3 py-2">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={WALLET_INSTITUTION_SEARCH_PLACEHOLDER}
          className="h-9 border-0 bg-black/6 shadow-none focus-visible:ring-black/10 dark:bg-white/10 dark:focus-visible:ring-white/15"
        />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain",
          listClassName,
        )}
        role="listbox"
        aria-label={WALLET_INSTITUTION_SEARCH_PLACEHOLDER}
      >
        {!hasResults ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Tidak ada hasil untuk pencarian ini.
          </p>
        ) : (
          sections.map((section) => {
            if (section.options.length === 0) {
              return null;
            }

            const SectionIcon = getWalletInstitutionSectionIcon(
              section.id,
              type,
            );

            return (
              <Fragment key={section.id}>
                <div className="flex items-center gap-1.5 px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <SectionIcon className="size-3.5 shrink-0" aria-hidden />
                  <span>{section.title}</span>
                </div>

                {section.options.map((option) => {
                  const selected = isSelected(
                    option,
                    selectedSlug,
                    selectedName,
                  );

                  const optionButton = (
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => onSelect(option)}
                      className={cn(
                        OPTION_ITEM,
                        selected && "bg-accent font-medium",
                      )}
                    >
                      <WalletInstitutionLogo
                        slug={option.slug}
                        name={option.name}
                        size={32}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {option.name}
                      </span>
                      {selected ? (
                        <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
                      ) : null}
                    </button>
                  );

                  if (closeOnSelect) {
                    return (
                      <DrawerClose
                        key={`${section.id}-${option.slug ?? option.name}`}
                        render={optionButton}
                      />
                    );
                  }

                  return (
                    <Fragment key={`${section.id}-${option.slug ?? option.name}`}>
                      {optionButton}
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
