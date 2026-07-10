import { AccentColorPicker } from "@/components/shared/accent-color-picker";
import { SettingsIosSection } from "@/components/settings/settings-ios-section";
import { SettingsSubHeader } from "@/components/settings/settings-sub-header";
import {
  SETTINGS_ACCENT_COLOR,
  SETTINGS_ACCENT_COLOR_FOOTER,
} from "@/config/settings-labels";
import { SETTINGS_IOS_SUB_SCROLL } from "@/config/settings-ios";

interface SettingsAccentPanelProps {
  onBack: () => void;
}

export function SettingsAccentPanel({ onBack }: SettingsAccentPanelProps) {
  return (
    <>
      <SettingsSubHeader title={SETTINGS_ACCENT_COLOR} onBack={onBack} />
      <section className={SETTINGS_IOS_SUB_SCROLL}>
        <SettingsIosSection footer={SETTINGS_ACCENT_COLOR_FOOTER}>
          <AccentColorPicker />
        </SettingsIosSection>
      </section>
    </>
  );
}
