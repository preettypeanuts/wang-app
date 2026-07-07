import { Children, isValidElement, type ReactNode } from "react";

import {
  SETTINGS_IOS_GROUP,
  SETTINGS_IOS_ROW_DIVIDER,
  SETTINGS_IOS_SECTION_FOOTER,
  SETTINGS_IOS_SECTION_LABEL,
} from "@/config/settings-ios";
import { cn } from "@/lib/utils";

interface SettingsIosSectionProps {
  label?: string;
  footer?: string;
  footerClassName?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsIosSection({
  label,
  footer,
  footerClassName,
  children,
  className,
}: SettingsIosSectionProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <section className={cn("space-y-1", className)}>
      {label ? <p className={SETTINGS_IOS_SECTION_LABEL}>{label}</p> : null}
      <div className={SETTINGS_IOS_GROUP}>
        {items.map((child, index) => (
          <div key={child.key ?? index}>
            {child}
            {index < items.length - 1 ? (
              <div className={SETTINGS_IOS_ROW_DIVIDER} aria-hidden />
            ) : null}
          </div>
        ))}
      </div>
      {footer ? (
        <p className={cn(SETTINGS_IOS_SECTION_FOOTER, footerClassName)}>
          {footer}
        </p>
      ) : null}
    </section>
  );
}
