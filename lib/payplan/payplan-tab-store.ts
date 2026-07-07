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

export function initPayplanTabState(next: PayplanTabState) {
  state = next;
  emit();
}

export function setPayplanTabState(tab: PlannerTab, monthKey: string) {
  state = { tab, monthKey };
  emit();
}

export function subscribePayplanTabState(listener: PayplanTabListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function syncPayplanTabUrl(tab: PlannerTab, monthKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  params.set("tab", tab);
  params.set("month", monthKey);

  if (tab === "budget") {
    params.delete("layout");
  }

  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    "",
    query ? `${window.location.pathname}?${query}` : window.location.pathname,
  );
}
