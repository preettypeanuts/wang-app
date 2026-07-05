import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AppShell } from "@/components/shared/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { readServerAppearance } from "@/lib/appearance/cookies";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monmon",
  description: "AI-powered finance tracking with chat input",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearance = readServerAppearance(await cookies());

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-accent={appearance.accentId}
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        outfit.variable,
        appearance.resolvedDark && "dark",
      )}
    >
      <body className="h-svh overflow-hidden bg-transparent">
        <TooltipProvider>
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
