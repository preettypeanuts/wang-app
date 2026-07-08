"use client";

import {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { PlansPageTab } from "@/components/plans/plans-page-tabs";
import {
  getPlansTabState,
  initPlansTabState,
  setPlansTabState,
  subscribePlansTabState,
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
  const propsRef = useRef({ initialTab });
  const initializedRef = useRef(false);

  if (!initializedRef.current || propsRef.current.initialTab !== initialTab) {
    initializedRef.current = true;
    propsRef.current = { initialTab };
    initPlansTabState({ tab: initialTab });
  }

  const snapshot = useSyncExternalStore(
    subscribePlansTabState,
    getPlansTabState,
    getPlansTabState,
  );

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
