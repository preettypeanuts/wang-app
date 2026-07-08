import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { APP_DESCRIPTION, APP_NAME } from "@/config/app";
import { PWA_APPLE_TOUCH_ICON, PWA_ICON_192, PWA_ICON_512 } from "@/config/pwa";
import "./globals.css";
import { RootBootstrapScript } from "@/components/shared/root-bootstrap-script";
import { RootLayoutBody } from "@/components/shared/root-layout-body";
import { RootLayoutFallback } from "@/components/shared/root-layout-fallback";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

function resolveMetadataBase(): URL | undefined {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;
  return url ? new URL(url) : undefined;
}

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  metadataBase: resolveMetadataBase(),
  icons: {
    icon: [
      { url: PWA_ICON_192, sizes: "192x192", type: "image/png" },
      { url: PWA_ICON_512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: PWA_APPLE_TOUCH_ICON, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="id"
      className={cn("h-full antialiased", inter.variable)}
      data-wallpaper="default"
      suppressHydrationWarning
    >
      <body
        className="flex h-svh max-h-svh flex-col overflow-hidden font-sans"
        suppressHydrationWarning
      >
        <RootBootstrapScript />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Suspense fallback={<RootLayoutFallback>{children}</RootLayoutFallback>}>
            <RootLayoutBody>{children}</RootLayoutBody>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
