"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  archiveWalletAction,
  saveWalletAction,
  setDefaultWalletAction,
} from "@/app/actions/wallets";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FORM_DIALOG_BODY_SCROLL,
  FORM_FIELD_INPUT,
  FORM_GROUP,
} from "@/config/form-dialog";
import { SEPARATED_CONTROL } from "@/config/shape";
import { UI_LABEL_CANCEL } from "@/config/ui-labels";
import {
  WALLET_FORM_ARCHIVE,
  WALLET_FORM_ARCHIVE_DEFAULT_NOTICE,
  WALLET_FORM_ARCHIVE_HINT,
  WALLET_FORM_ARCHIVING,
  WALLET_FORM_DESC,
  WALLET_FORM_INITIAL_BALANCE,
  WALLET_FORM_NAME,
  WALLET_FORM_NAME_PLACEHOLDER,
  WALLET_FORM_SAVE,
  WALLET_FORM_SAVING,
  WALLET_FORM_SET_DEFAULT,
  WALLET_FORM_SETTING_DEFAULT,
  WALLET_FORM_TITLE_EDIT,
  WALLET_FORM_TITLE_NEW,
  WALLET_FORM_TYPE,
  WALLET_TYPE_LABELS,
  WALLET_TYPE_ORDER,
} from "@/config/wallet-labels";
import { cn } from "@/lib/utils";
import type { WalletRecord, WalletType } from "@/types/wallet";

export type WalletFormMode =
  | { kind: "new" }
  | { kind: "edit"; wallet: WalletRecord };

interface WalletFormDialogProps {
  open: boolean;
  mode: WalletFormMode | null;
  onOpenChange: (open: boolean) => void;
}

export function WalletFormDialog({
  open,
  mode,
  onOpenChange,
}: WalletFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [initialBalance, setInitialBalance] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  useEffect(() => {
    if (!open || !mode) {
      return;
    }

    if (mode.kind === "new") {
      setName("");
      setType("cash");
      setInitialBalance("");
    } else {
      setName(mode.wallet.name);
      setType(mode.wallet.type);
      setInitialBalance(
        mode.wallet.initialBalance > 0
          ? String(mode.wallet.initialBalance)
          : "",
      );
    }

    setError(null);
    setArchiveNotice(null);
    setIsArchiving(false);
    setIsSettingDefault(false);
  }, [mode, open]);

  const isEdit = mode?.kind === "edit";
  const title = isEdit ? WALLET_FORM_TITLE_EDIT : WALLET_FORM_TITLE_NEW;
  const showSetDefault = isEdit && mode.wallet.isDefault === false;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveWalletAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  function handleSetDefault() {
    if (mode?.kind !== "edit") {
      return;
    }

    setIsSettingDefault(true);
    startTransition(async () => {
      const result = await setDefaultWalletAction(mode.wallet.id);
      setIsSettingDefault(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  function handleArchive() {
    if (mode?.kind !== "edit") {
      return;
    }

    const walletId = mode.wallet.id;
    setIsArchiving(true);
    setArchiveNotice(null);
    startTransition(async () => {
      const result = await archiveWalletAction(walletId);
      setIsArchiving(false);

      if (!result.ok) {
        if (result.reason === "is_default") {
          setArchiveNotice(WALLET_FORM_ARCHIVE_DEFAULT_NOTICE);
          setError(null);
          return;
        }

        setError(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={title}>
      <ResponsiveDialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {title}
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-snug">
          {WALLET_FORM_DESC}
        </DialogDescription>
      </ResponsiveDialogHeader>

      <form
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={handleSubmit}
      >
        <ResponsiveDialogBody className={FORM_DIALOG_BODY_SCROLL}>
          {isEdit ? (
            <input type="hidden" name="id" value={mode.wallet.id} />
          ) : null}
          <input type="hidden" name="type" value={type} />

          <div className={FORM_GROUP}>
            <FormDialogField label={WALLET_FORM_NAME} htmlFor="wallet-name">
              <Input
                id="wallet-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={WALLET_FORM_NAME_PLACEHOLDER}
                className={FORM_FIELD_INPUT}
                required
                maxLength={48}
              />
            </FormDialogField>

            <FormDialogField label={WALLET_FORM_TYPE}>
              <div
                className="grid grid-cols-2 gap-2"
                role="tablist"
                aria-label={WALLET_FORM_TYPE}
              >
                {WALLET_TYPE_ORDER.map((walletType) => (
                  <button
                    key={walletType}
                    type="button"
                    role="tab"
                    aria-selected={type === walletType}
                    onClick={() => setType(walletType)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      type === walletType
                        ? "border-primary/40 bg-primary/8 text-foreground"
                        : "border-black/6 text-muted-foreground dark:border-white/8",
                    )}
                  >
                    {WALLET_TYPE_LABELS[walletType]}
                  </button>
                ))}
              </div>
            </FormDialogField>

            <FormDialogField
              label={WALLET_FORM_INITIAL_BALANCE}
              htmlFor="wallet-initial-balance"
            >
              <Input
                id="wallet-initial-balance"
                name="initialBalance"
                value={initialBalance}
                onChange={(event) => setInitialBalance(event.target.value)}
                placeholder="0"
                inputMode="numeric"
                className={FORM_FIELD_INPUT}
              />
            </FormDialogField>
          </div>

          {showSetDefault ? (
            <div className="px-1">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className={cn(SEPARATED_CONTROL, "w-full")}
                onClick={handleSetDefault}
              >
                {isSettingDefault
                  ? WALLET_FORM_SETTING_DEFAULT
                  : WALLET_FORM_SET_DEFAULT}
              </Button>
            </div>
          ) : null}

          {isEdit ? (
            <div className="flex flex-col gap-1.5 px-1">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className={cn(
                  SEPARATED_CONTROL,
                  "text-destructive hover:text-destructive",
                )}
                onClick={handleArchive}
              >
                {isArchiving ? WALLET_FORM_ARCHIVING : WALLET_FORM_ARCHIVE}
              </Button>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {WALLET_FORM_ARCHIVE_HINT}
              </p>
            </div>
          ) : null}

          {archiveNotice ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[13px] leading-snug text-amber-950 dark:text-amber-100">
              {archiveNotice}
            </p>
          ) : null}

          {error ? (
            <p className="px-1 text-sm text-destructive">{error}</p>
          ) : null}
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className={cn(SEPARATED_CONTROL, "flex-1")}
            onClick={() => onOpenChange(false)}
          >
            {UI_LABEL_CANCEL}
          </Button>
          <Button
            type="submit"
            disabled={isPending || name.trim().length === 0}
            className={cn(SEPARATED_CONTROL, "flex-1")}
          >
            {isPending && !isArchiving && !isSettingDefault
              ? WALLET_FORM_SAVING
              : WALLET_FORM_SAVE}
          </Button>
        </ResponsiveDialogFooter>
      </form>
    </ResponsiveDialog>
  );
}
