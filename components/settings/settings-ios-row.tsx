import { CaretRightIcon } from "@/lib/icons";
import {
  SETTINGS_IOS_ROW,
  SETTINGS_IOS_ROW_ICON,
  SETTINGS_IOS_ROW_LABEL,
  SETTINGS_IOS_ROW_VALUE,
} from "@/config/settings-ios";
import { cn } from "@/lib/utils";

interface SettingsIosRowProps {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  value?: string;
  showChevron?: boolean;
  control?: React.ReactNode;
  onClick?: () => void;
}

export function SettingsIosRow({
  icon,
  iconClassName,
  label,
  value,
  showChevron = true,
  control,
  onClick,
}: SettingsIosRowProps) {
  const content = (
    <>
      <span className={cn(SETTINGS_IOS_ROW_ICON, iconClassName)}>{icon}</span>
      <span className={SETTINGS_IOS_ROW_LABEL}>{label}</span>
      {control ?? (
        <>
          {value ? <span className={SETTINGS_IOS_ROW_VALUE}>{value}</span> : null}
          {showChevron ? (
            <CaretRightIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground/70"
            />
          ) : null}
        </>
      )}
    </>
  );

  if (!onClick) {
    return <div className={SETTINGS_IOS_ROW}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={SETTINGS_IOS_ROW}>
      {content}
    </button>
  );
}
