import { INBOX_EDIT_HINT_STORAGE_KEY } from "@/config/inbox-edit-hint";

export function hasSeenInboxEditHint(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(INBOX_EDIT_HINT_STORAGE_KEY) === "true";
}

export function markInboxEditHintSeen(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(INBOX_EDIT_HINT_STORAGE_KEY, "true");
}
