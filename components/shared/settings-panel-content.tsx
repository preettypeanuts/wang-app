"use client";

import { useEffect, useState } from "react";

import { useAppearance } from "@/components/shared/appearance-provider";
import { useWallpaper } from "@/components/shared/wallpaper-provider";
import { SettingsAccentPanel } from "@/components/settings/settings-accent-panel";
import { SettingsAppearancePanel } from "@/components/settings/settings-appearance-panel";
import { SettingsGlassPanel } from "@/components/settings/settings-glass-panel";
import { SettingsIosProfileCard } from "@/components/settings/settings-ios-profile-card";
import { SettingsPushNotificationRow } from "@/components/notifications/settings-push-notification-row";
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
import { THEME_MODES } from "@/config/theme-modes";
import {
  DesktopIcon,
  HeartIcon,
  SparkleIcon,
  SquaresFourIcon,
} from "@/lib/icons";
import { resolveActiveWallpaper } from "@/lib/wallpaper/resolve-wallpaper";

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
    THEME_MODES.find((mode) => mode.id === themeMode)?.label ?? "Sistem";
  const accentLabel =
    ACCENT_COLORS.find((accent) => accent.id === accentId)?.label ?? "Biru";
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
    <section className={SETTINGS_IOS_SCROLL}>
      <h2
        className={
          mobileDrawer ? SETTINGS_IOS_DRAWER_LARGE_TITLE : SETTINGS_IOS_LARGE_TITLE
        }
      >
        Pengaturan
      </h2>

      <SettingsIosProfileCard />

      <SettingsIosSection
        label="Notifikasi"
        footer="Aktifkan push untuk tagihan mendatang, ringkasan AI, dan alert penting. Cron harian via cron-job.org."
      >
        <SettingsPushNotificationRow />
      </SettingsIosSection>

      <SettingsIosSection label="Tampilan">
        <SettingsIosRow
          icon={<DesktopIcon aria-hidden />}
          iconClassName={SETTINGS_IOS_ICON_THEME}
          label="Mode tampilan"
          value={themeLabel}
          onClick={() => setPanel("appearance")}
        />
        <SettingsIosRow
          icon={<HeartIcon aria-hidden />}
          iconClassName={SETTINGS_IOS_ICON_ACCENT}
          label="Warna aksen"
          value={accentLabel}
          onClick={() => setPanel("accent")}
        />
        <SettingsIosRow
          icon={<SparkleIcon aria-hidden />}
          iconClassName={SETTINGS_IOS_ICON_GLASS}
          label="Blur glass"
          value={glassLabel}
          onClick={() => setPanel("glass")}
        />
      </SettingsIosSection>

      <SettingsIosSection
        label="Wallpaper"
        footer="Pilih preset atau upload foto. Mask membantu keterbacaan teks di atas wallpaper."
      >
        <SettingsIosRow
          icon={<SquaresFourIcon aria-hidden />}
          iconClassName={SETTINGS_IOS_ICON_WALLPAPER}
          label="Wallpaper"
          value={wallpaperLabel}
          onClick={() => setPanel("wallpaper")}
        />
      </SettingsIosSection>

      <SettingsIosSection label="Akun">
        <SettingsSignOutRow />
      </SettingsIosSection>
    </section>
  );
}
