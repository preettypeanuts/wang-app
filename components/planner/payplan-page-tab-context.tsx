"use client";

import {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  getPayplanTabState,
  initPayplanTabState,
  setPayplanTabState,
  subscribePayplanTabState,
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
  const propsRef = useRef({ initialTab, monthKey });

  if (
    propsRef.current.initialTab !== initialTab ||
    propsRef.current.monthKey !== monthKey
  ) {
    propsRef.current = { initialTab, monthKey };
    initPayplanTabState({ tab: initialTab, monthKey });
  }

  const snapshot = useSyncExternalStore(
    subscribePayplanTabState,
    getPayplanTabState,
    getPayplanTabState,
  );

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
