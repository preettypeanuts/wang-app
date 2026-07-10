import { ThemeModePicker } from "@/components/shared/theme-mode-picker";
import { SettingsIosSection } from "@/components/settings/settings-ios-section";
import { SettingsSubHeader } from "@/components/settings/settings-sub-header";
import {
  SETTINGS_DISPLAY_MODE,
  SETTINGS_DISPLAY_MODE_FOOTER,
} from "@/config/settings-labels";
import { SETTINGS_IOS_SUB_SCROLL } from "@/config/settings-ios";

interface SettingsAppearancePanelProps {
  onBack: () => void;
}

export function SettingsAppearancePanel({ onBack }: SettingsAppearancePanelProps) {
  return (
    <>
      <SettingsSubHeader title={SETTINGS_DISPLAY_MODE} onBack={onBack} />
      <section className={SETTINGS_IOS_SUB_SCROLL}>
        <SettingsIosSection footer={SETTINGS_DISPLAY_MODE_FOOTER}>
          <ThemeModePicker />
        </SettingsIosSection>
      </section>
    </>
  );
}
