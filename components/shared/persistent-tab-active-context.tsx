"use client";

import { createContext, useContext } from "react";

const PersistentTabActiveContext = createContext(true);

export function PersistentTabActiveProvider({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <PersistentTabActiveContext.Provider value={active}>
      {children}
    </PersistentTabActiveContext.Provider>
  );
}

/** False when a cached mobile tab panel is hidden via `hidden`. */
export function usePersistentTabActive(): boolean {
  return useContext(PersistentTabActiveContext);
}
