"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  getPayplanTabState,
  notifyPayplanTabStateSubscribers,
  setPayplanTabState,
  subscribePayplanTabState,
  syncPayplanTabState,
  syncPayplanTabUrl,
} from "@/lib/payplan/payplan-tab-store";
import type { PlannerTab } from "@/types/planner";

interface PayplanPageTabContextValue {
  tab: PlannerTab;
  monthKey: string;
  setTab: (tab: PlannerTab) => void;
}

const PayplanPageTabContext = createContext<PayplanPageTabContextValue | null>(
  null,
);

interface PayplanPageTabProviderProps {
  initialTab: PlannerTab;
  monthKey: string;
  children: ReactNode;
}

export function PayplanPageTabProvider({
  initialTab,
  monthKey,
  children,
}: PayplanPageTabProviderProps) {
  const snapshot = useSyncExternalStore(
    subscribePayplanTabState,
    getPayplanTabState,
    () => ({ tab: initialTab, monthKey }),
  );

  useLayoutEffect(() => {
    syncPayplanTabState({ tab: initialTab, monthKey });
    notifyPayplanTabStateSubscribers();
  }, [initialTab, monthKey]);

  function setTab(nextTab: PlannerTab) {
    setPayplanTabState(nextTab, monthKey);
    syncPayplanTabUrl(nextTab, monthKey);
  }

  return (
    <PayplanPageTabContext.Provider
      value={{ tab: snapshot.tab, monthKey: snapshot.monthKey || monthKey, setTab }}
    >
      {children}
    </PayplanPageTabContext.Provider>
  );
}

export function usePayplanPageTab() {
  const context = useContext(PayplanPageTabContext);
  const snapshot = useSyncExternalStore(
    subscribePayplanTabState,
    getPayplanTabState,
    getPayplanTabState,
  );

  if (context) {
    return context;
  }

  if (!snapshot.monthKey) {
    return null;
  }

  return {
    tab: snapshot.tab,
    monthKey: snapshot.monthKey,
    setTab: (nextTab: PlannerTab) => {
      setPayplanTabState(nextTab, snapshot.monthKey);
      syncPayplanTabUrl(nextTab, snapshot.monthKey);
    },
  };
}
