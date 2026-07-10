"use client";

import { useEffect, useState } from "react";

import { useAppearance } from "@/components/shared/appearance-provider";
import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { SettingsAccentPanel } from "@/components/settings/settings-accent-panel";
import { SettingsAppearancePanel } from "@/components/settings/settings-appearance-panel";
import { SettingsGlassPanel } from "@/components/settings/settings-glass-panel";
import { SettingsIosProfileCard } from "@/components/settings/settings-ios-profile-card";
import { SettingsPushNotificationSection } from "@/components/notifications/settings-push-notification-section";
import { SettingsIosRow } from "@/components/settings/settings-ios-row";
import { SettingsIosSection } from "@/components/settings/settings-ios-section";
import { SettingsSignOutRow } from "@/components/settings/settings-sign-out-row";
import { SettingsWallpaperPanel } from "@/components/settings/settings-wallpaper-panel";
import { ACCENT_COLORS } from "@/config/accent-colors";
import { GLASS_BLUR_LEVELS } from "@/config/glass-blur";
import {
  SETTINGS_IOS_ICON_ACCENT,
  SETTINGS_IOS_ICON_GLASS,
  SETTINGS_IOS_ICON_THEME,
  SETTINGS_IOS_ICON_WALLPAPER,
  SETTINGS_IOS_DRAWER_LARGE_TITLE,
  SETTINGS_IOS_LARGE_TITLE,
  SETTINGS_IOS_SCROLL,
} from "@/config/settings-ios";
import {
  SETTINGS_ACCOUNT,
  SETTINGS_APPEARANCE,
  SETTINGS_DISPLAY_MODE,
  SETTINGS_ACCENT_COLOR,
  SETTINGS_GLASS_BLUR,
  SETTINGS_TITLE,
  SETTINGS_WALLPAPER,
  SETTINGS_WALLPAPER_FOOTER,
} from "@/config/settings-labels";
import { THEME_MODES } from "@/config/theme-modes";
import {
  DesktopIcon,
  HeartIcon,
  SparkleIcon,
  SquaresFourIcon,
} from "@/lib/icons";
import { resolveActiveWallpaper } from "@/lib/wallpaper/resolve-wallpaper";
import { cn } from "@/lib/utils";

type SettingsPanel = "root" | "appearance" | "accent" | "glass" | "wallpaper";

interface SettingsPanelContentProps {
  open: boolean;
  mobileDrawer?: boolean;
}

export function SettingsPanelContent({
  open,
  mobileDrawer = false,
}: SettingsPanelContentProps) {
  const [panel, setPanel] = useState<SettingsPanel>("root");
  const { themeMode, accentId, glassBlurLevel } = useAppearance();
  const { wallpaperId, customWallpaperSlots } = useWallpaper();

  useEffect(() => {
    if (!open) {
      setPanel("root");
    }
  }, [open]);

  const themeLabel =
    THEME_MODES.find((mode) => mode.id === themeMode)?.label ?? "System";
  const accentLabel =
    ACCENT_COLORS.find((accent) => accent.id === accentId)?.label ?? "Blue";
  const glassLabel =
    GLASS_BLUR_LEVELS.find((level) => level.id === glassBlurLevel)?.label ??
    "Normal";
  const wallpaperLabel = resolveActiveWallpaper(
    wallpaperId,
    customWallpaperSlots,
  ).label;

  if (panel === "appearance") {
    return <SettingsAppearancePanel onBack={() => setPanel("root")} />;
  }

  if (panel === "accent") {
    return <SettingsAccentPanel onBack={() => setPanel("root")} />;
  }

  if (panel === "glass") {
    return <SettingsGlassPanel onBack={() => setPanel("root")} />;
  }

  if (panel === "wallpaper") {
    return <SettingsWallpaperPanel onBack={() => setPanel("root")} />;
  }

  return (
    <section className={cn(SETTINGS_IOS_SCROLL, mobileDrawer && "pt-1")}>
      <h2
        className={
          mobileDrawer ? SETTINGS_IOS_DRAWER_LARGE_TITLE : SETTINGS_IOS_LARGE_TITLE
        }
      >
        {SETTINGS_TITLE}
      </h2>

      <div className="shrink-0">
        <SettingsIosProfileCard />
      </div>

      <SettingsPushNotificationSection />

      <SettingsIosSection label={SETTINGS_APPEARANCE}>
        <SettingsIosRow
          icon={<DesktopIcon aria-hidden />}
          iconClassName={SETTINGS_IOS_ICON_THEME}
          label={SETTINGS_DISPLAY_MODE}
          value={themeLabel}
          onClick={() => setPanel("appearance")}
        />
        <SettingsIosRow
          icon={<HeartIcon aria-hidden />}
          iconClassName={SETTINGS_IOS_ICON_ACCENT}
          label={SETTINGS_ACCENT_COLOR}
          value={accentLabel}
          onClick={() => setPanel("accent")}
        />
        <SettingsIosRow
          icon={<SparkleIcon aria-hidden />}
          iconClassName={SETTINGS_IOS_ICON_GLASS}
          label={SETTINGS_GLASS_BLUR}
          value={glassLabel}
          onClick={() => setPanel("glass")}
        />
      </SettingsIosSection>

      <SettingsIosSection
        label={SETTINGS_WALLPAPER}
        footer={SETTINGS_WALLPAPER_FOOTER}
      >
        <SettingsIosRow
          icon={<SquaresFourIcon aria-hidden />}
          iconClassName={SETTINGS_IOS_ICON_WALLPAPER}
          label={SETTINGS_WALLPAPER}
          value={wallpaperLabel}
          onClick={() => setPanel("wallpaper")}
        />
      </SettingsIosSection>

      <SettingsIosSection label={SETTINGS_ACCOUNT}>
        <SettingsSignOutRow />
      </SettingsIosSection>
    </section>
  );
}
