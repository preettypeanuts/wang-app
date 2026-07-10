"use client";

import { useState } from "react";

import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PROFILE_CHANGE_PASSWORD,
  PROFILE_CHANGE_PASSWORD_DESC,
  PROFILE_CONFIRM_PASSWORD,
  PROFILE_CURRENT_PASSWORD,
  PROFILE_NEW_PASSWORD,
  PROFILE_PASSWORD_CHANGE_FAILED,
  PROFILE_PASSWORD_MIN_LENGTH,
  PROFILE_PASSWORD_MISMATCH,
  PROFILE_PASSWORD_UPDATED,
  PROFILE_SAVE_PASSWORD,
  PROFILE_SAVING_PASSWORD,
} from "@/config/settings-labels";
import { changePassword } from "@/lib/auth/auth-client";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError(PROFILE_PASSWORD_MIN_LENGTH);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(PROFILE_PASSWORD_MISMATCH);
      return;
    }

    setPending(true);

    const result = await changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? PROFILE_PASSWORD_CHANGE_FAILED);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(PROFILE_PASSWORD_UPDATED);
  }

  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h2 className="text-[13px] font-medium text-muted-foreground">
          {PROFILE_CHANGE_PASSWORD}
        </h2>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {PROFILE_CHANGE_PASSWORD_DESC}
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
          <div className="space-y-2">
            <Label htmlFor="current-password">{PROFILE_CURRENT_PASSWORD}</Label>
            <PasswordInput
              autoComplete="current-password"
              id="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">{PROFILE_NEW_PASSWORD}</Label>
            <PasswordInput
              autoComplete="new-password"
              id="new-password"
              minLength={8}
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">{PROFILE_CONFIRM_PASSWORD}</Label>
            <PasswordInput
              autoComplete="new-password"
              id="confirm-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
              {success}
            </p>
          ) : null}
        </div>

        <Button className="w-full shrink-0" disabled={pending} type="submit">
          {pending ? PROFILE_SAVING_PASSWORD : PROFILE_SAVE_PASSWORD}
        </Button>
      </form>
    </section>
  );
}
