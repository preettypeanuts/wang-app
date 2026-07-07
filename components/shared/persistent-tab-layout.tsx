"use client";

import { usePathname } from "next/navigation";
import {
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isPersistentTabRoute } from "@/config/persistent-tabs";
import { PersistentTabActiveProvider } from "@/components/shared/persistent-tab-active-context";
import { isTabsRouteLoading } from "@/lib/navigation/is-tabs-route-loading";
import { useSession } from "@/lib/auth/auth-client";

interface PersistentTabLayoutProps {
  children: ReactNode;
}

/**
 * Cache each main nav tab so switching routes does not unmount panels.
 * Skips caching route loading skeletons so first paint can stream in.
 */
export function PersistentTabLayout({ children }: PersistentTabLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const tabPath = isPersistentTabRoute(pathname) ? pathname : null;
  const [cache, setCache] = useState<Record<string, ReactNode>>({});

  useLayoutEffect(() => {
    setCache({});
  }, [userId]);

  useLayoutEffect(() => {
    if (!tabPath || isTabsRouteLoading(children)) {
      return;
    }

    setCache((current) => ({ ...current, [tabPath]: children }));
  }, [children, tabPath]);

  const panels = useMemo(() => {
    if (!tabPath) {
      return null;
    }

    const cached = cache[tabPath];
    if (cached) {
      return cache;
    }

    if (isTabsRouteLoading(children)) {
      return null;
    }

    return { ...cache, [tabPath]: children };
  }, [cache, children, tabPath]);

  if (!panels || !tabPath) {
    return children;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {(Object.entries(panels) as Array<[string, ReactNode]>).map(
        ([path, panel]) => (
          <div
            key={path}
            hidden={path !== tabPath}
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
          >
            <PersistentTabActiveProvider active={path === tabPath}>
              {panel}
            </PersistentTabActiveProvider>
          </div>
        ),
      )}
    </div>
  );
}
