"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEPLOYMENT_RECOVERY_EVENT } from "@/config/deployment-recovery";
import { isPersistentMobileTabRoute } from "@/config/persistent-tabs";
import { PersistentTabActiveProvider } from "@/components/shared/persistent-tab-active-context";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useSession } from "@/lib/auth/auth-client";

interface PersistentTabLayoutProps {
  children: ReactNode;
}

/**
 * Mobile: cache each bottom-nav tab so switching routes does not unmount panels.
 * Desktop: pass-through — standard Next.js navigation.
 */
export function PersistentTabLayout({ children }: PersistentTabLayoutProps) {
  const pathname = usePathname();
  const isMobile = useIsMobileViewport();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const tabPath = isPersistentMobileTabRoute(pathname) ? pathname : null;
  const [cache, setCache] = useState<Record<string, ReactNode>>({});

  useLayoutEffect(() => {
    setCache({});
  }, [userId]);

  useEffect(() => {
    const clearCacheOnRecovery = () => {
      setCache({});
    };

    window.addEventListener(DEPLOYMENT_RECOVERY_EVENT, clearCacheOnRecovery);

    return () => {
      window.removeEventListener(
        DEPLOYMENT_RECOVERY_EVENT,
        clearCacheOnRecovery,
      );
    };
  }, []);

  useLayoutEffect(() => {
    if (!isMobile || !tabPath) {
      return;
    }

    setCache((current) => {
      if (current[tabPath]) {
        return current;
      }

      return { ...current, [tabPath]: children };
    });
  }, [children, isMobile, tabPath]);

  const panels = useMemo(() => {
    if (!isMobile || !tabPath) {
      return null;
    }

    return { ...cache, [tabPath]: children };
  }, [cache, children, isMobile, tabPath]);

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
