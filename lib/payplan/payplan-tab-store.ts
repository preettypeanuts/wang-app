import type { PlannerTab } from "@/types/planner";

interface PayplanTabState {
  tab: PlannerTab;
  monthKey: string;
}

type PayplanTabListener = () => void;

let state: PayplanTabState = {
  tab: "calendar",
  monthKey: "",
};

const listeners = new Set<PayplanTabListener>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function getPayplanTabState(): PayplanTabState {
  return state;
}

/** Update store without notifying subscribers — safe during render. */
export function syncPayplanTabState(next: PayplanTabState): void {
  state = next;
}

export function notifyPayplanTabStateSubscribers(): void {
  emit();
}

export function initPayplanTabState(next: PayplanTabState) {
  if (state.tab === next.tab && state.monthKey === next.monthKey) {
    return;
  }

  state = next;
  emit();
}

export function setPayplanTabState(tab: PlannerTab, monthKey: string) {
  if (state.tab === tab && state.monthKey === monthKey) {
    return;
  }

  state = { tab, monthKey };
  emit();
}

export function subscribePayplanTabState(listener: PayplanTabListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function syncPayplanTabUrl(
  tab: PlannerTab,
  monthKey: string,
  options?: { stripLayout?: boolean },
) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  params.set("tab", tab);
  params.set("month", monthKey);

  if (tab === "budget" || options?.stripLayout) {
    params.delete("layout");
  }

  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    "",
    query ? `${window.location.pathname}?${query}` : window.location.pathname,
  );
}
