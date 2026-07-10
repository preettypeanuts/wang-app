import {
  SETTINGS_DEFAULT_USER,
  SETTINGS_EMAIL_UNAVAILABLE,
} from "@/config/settings-labels";
import {
  SETTINGS_IOS_GROUP,
  SETTINGS_IOS_PROFILE_NAME,
  SETTINGS_IOS_PROFILE_SUBTITLE,
  SETTINGS_IOS_ROW,
} from "@/config/settings-ios";

interface ProfileSummaryProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

export function ProfileSummary({ name, email }: ProfileSummaryProps) {
  const displayName = name?.trim() || SETTINGS_DEFAULT_USER;
  const initial = displayName.charAt(0).toUpperCase() || "W";

  return (
    <div className={SETTINGS_IOS_GROUP}>
      <div className={SETTINGS_IOS_ROW}>
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-[#7C8CFF] via-[#5B6CFF] to-[#3B4FE0] text-lg font-semibold text-white shadow-sm">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className={SETTINGS_IOS_PROFILE_NAME}>{displayName}</p>
          <p className={SETTINGS_IOS_PROFILE_SUBTITLE}>
            {email?.trim() || SETTINGS_EMAIL_UNAVAILABLE}
          </p>
        </div>
      </div>
    </div>
  );
}
