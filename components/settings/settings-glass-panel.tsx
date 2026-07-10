import { GlassBlurPicker } from "@/components/shared/glass-blur-picker";
import { SettingsIosSection } from "@/components/settings/settings-ios-section";
import { SettingsSubHeader } from "@/components/settings/settings-sub-header";
import {
  SETTINGS_GLASS_BLUR,
  SETTINGS_GLASS_BLUR_FOOTER,
} from "@/config/settings-labels";
import { SETTINGS_IOS_SUB_SCROLL } from "@/config/settings-ios";

interface SettingsGlassPanelProps {
  onBack: () => void;
}

export function SettingsGlassPanel({ onBack }: SettingsGlassPanelProps) {
  return (
    <>
      <SettingsSubHeader title={SETTINGS_GLASS_BLUR} onBack={onBack} />
      <section className={SETTINGS_IOS_SUB_SCROLL}>
        <SettingsIosSection footer={SETTINGS_GLASS_BLUR_FOOTER}>
          <GlassBlurPicker />
        </SettingsIosSection>
      </section>
    </>
  );
}
