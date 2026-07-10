import { WallpaperPicker } from "@/components/shared/wallpaper-picker";
import { SettingsIosSection } from "@/components/settings/settings-ios-section";
import { SettingsSubHeader } from "@/components/settings/settings-sub-header";
import {
  SETTINGS_WALLPAPER,
  SETTINGS_WALLPAPER_FOOTER,
} from "@/config/settings-labels";
import { SETTINGS_IOS_SUB_SCROLL } from "@/config/settings-ios";

interface SettingsWallpaperPanelProps {
  onBack: () => void;
}

export function SettingsWallpaperPanel({ onBack }: SettingsWallpaperPanelProps) {
  return (
    <>
      <SettingsSubHeader title={SETTINGS_WALLPAPER} onBack={onBack} />
      <section className={SETTINGS_IOS_SUB_SCROLL}>
        <SettingsIosSection footer={SETTINGS_WALLPAPER_FOOTER}>
          <WallpaperPicker />
        </SettingsIosSection>
      </section>
    </>
  );
}
