"use client";

import { createContext, useContext, useMemo } from "react";

interface InboxSearchContextValue {
  open: () => void;
}

const InboxSearchContext = createContext<InboxSearchContextValue | null>(null);

interface InboxSearchProviderProps {
  children: React.ReactNode;
  onOpen: () => void;
}

export function InboxSearchProvider({
  children,
  onOpen,
}: InboxSearchProviderProps) {
  const value = useMemo(() => ({ open: onOpen }), [onOpen]);

  return (
    <InboxSearchContext.Provider value={value}>
      {children}
    </InboxSearchContext.Provider>
  );
}

export function useOptionalInboxSearch(): InboxSearchContextValue | null {
  return useContext(InboxSearchContext);
}
