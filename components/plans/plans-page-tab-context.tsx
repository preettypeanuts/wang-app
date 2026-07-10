"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { PlansPageTab } from "@/components/plans/plans-page-tabs";
import {
  getPlansTabState,
  notifyPlansTabStateSubscribers,
  setPlansTabState,
  subscribePlansTabState,
  syncPlansTabState,
  syncPlansTabUrl,
} from "@/lib/plans/plans-tab-store";

interface PlansPageTabContextValue {
  tab: PlansPageTab;
  setTab: (tab: PlansPageTab) => void;
}

const PlansPageTabContext = createContext<PlansPageTabContextValue | null>(null);

interface PlansPageTabProviderProps {
  initialTab: PlansPageTab;
  children: ReactNode;
}

export function PlansPageTabProvider({
  initialTab,
  children,
}: PlansPageTabProviderProps) {
  const serverSnapshot = useMemo(() => ({ tab: initialTab }), [initialTab]);

  const snapshot = useSyncExternalStore(
    subscribePlansTabState,
    getPlansTabState,
    () => serverSnapshot,
  );

  useLayoutEffect(() => {
    syncPlansTabState({ tab: initialTab });
    notifyPlansTabStateSubscribers();
  }, [initialTab]);

  function setTab(nextTab: PlansPageTab) {
    setPlansTabState(nextTab);
    syncPlansTabUrl(nextTab);
  }

  return (
    <PlansPageTabContext.Provider value={{ tab: snapshot.tab, setTab }}>
      {children}
    </PlansPageTabContext.Provider>
  );
}

export function usePlansPageTab() {
  const context = useContext(PlansPageTabContext);
  const snapshot = useSyncExternalStore(
    subscribePlansTabState,
    getPlansTabState,
    getPlansTabState,
  );

  if (context) {
    return context;
  }

  return {
    tab: snapshot.tab,
    setTab: (nextTab: PlansPageTab) => {
      setPlansTabState(nextTab);
      syncPlansTabUrl(nextTab);
    },
  };
}
