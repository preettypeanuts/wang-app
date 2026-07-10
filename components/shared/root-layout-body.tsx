import { cookies } from "next/headers";

import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { SerwistProviderShell } from "@/components/providers/serwist-provider-shell";
import { AppShell } from "@/components/shared/app-shell";
import { DeploymentRecoveryHandler } from "@/components/shared/deployment-recovery-handler";
import { TooltipProvider } from "@/components/ui/tooltip";
import { readServerAppearance } from "@/lib/appearance/cookies";
import { readServerSidebarOpen } from "@/lib/sidebar/cookies";

interface RootLayoutBodyProps {
  children: React.ReactNode;
}

export async function RootLayoutBody({ children }: RootLayoutBodyProps) {
  const cookieStore = await cookies();
  const appearance = readServerAppearance(cookieStore);
  const sidebarOpen = readServerSidebarOpen(cookieStore);

  return (
    <SerwistProviderShell>
      <DeploymentRecoveryHandler />
      <AppThemeProvider initialAppearance={appearance}>
        <TooltipProvider>
          <AppShell initialSidebarOpen={sidebarOpen}>{children}</AppShell>
        </TooltipProvider>
      </AppThemeProvider>
    </SerwistProviderShell>
  );
}
