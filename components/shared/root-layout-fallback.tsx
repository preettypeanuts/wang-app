import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { SerwistProviderShell } from "@/components/providers/serwist-provider-shell";
import { AppShell } from "@/components/shared/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DEFAULT_ACCENT_ID } from "@/config/accent-colors";
import { DEFAULT_THEME_MODE } from "@/config/theme-modes";

interface RootLayoutFallbackProps {
  children: React.ReactNode;
}

/** Default chrome while server appearance cookies stream in. */
export function RootLayoutFallback({ children }: RootLayoutFallbackProps) {
  return (
    <SerwistProviderShell>
      <AppThemeProvider
        initialAppearance={{
          themeMode: DEFAULT_THEME_MODE,
          accentId: DEFAULT_ACCENT_ID,
          resolvedDark: false,
        }}
      >
        <TooltipProvider>
          <AppShell initialSidebarOpen>{children}</AppShell>
        </TooltipProvider>
      </AppThemeProvider>
    </SerwistProviderShell>
  );
}
