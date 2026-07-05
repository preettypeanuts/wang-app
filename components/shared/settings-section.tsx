import {
  SETTINGS_GROUP,
  SETTINGS_SECTION_FOOTER,
  SETTINGS_SECTION_LABEL,
} from "@/config/settings-layout";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  label: string;
  footer?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  label,
  footer,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <h3 className={SETTINGS_SECTION_LABEL}>{label}</h3>
      <div className={SETTINGS_GROUP}>{children}</div>
      {footer ? <p className={SETTINGS_SECTION_FOOTER}>{footer}</p> : null}
    </section>
  );
}
