import type { PlansPageTab } from "@/components/plans/plans-page-tabs";

interface PlansTabState {
  tab: PlansPageTab;
}

type PlansTabListener = () => void;

let state: PlansTabState = {
  tab: "wish",
};

const listeners = new Set<PlansTabListener>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function getPlansTabState(): PlansTabState {
  return state;
}

/** Update store without notifying subscribers — safe during render. */
export function syncPlansTabState(next: PlansTabState): void {
  state = next;
}

export function notifyPlansTabStateSubscribers(): void {
  emit();
}

export function initPlansTabState(next: PlansTabState) {
  if (state.tab === next.tab) {
    return;
  }

  state = next;
  emit();
}

export function setPlansTabState(tab: PlansPageTab) {
  if (state.tab === tab) {
    return;
  }

  state = { tab };
  emit();
}

export function subscribePlansTabState(listener: PlansTabListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function syncPlansTabUrl(tab: PlansPageTab) {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl =
    tab === "wish"
      ? window.location.pathname
      : `${window.location.pathname}?tab=savings`;

  window.history.replaceState(window.history.state, "", nextUrl);
}
