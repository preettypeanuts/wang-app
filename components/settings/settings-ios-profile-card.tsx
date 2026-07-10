"use client";

import { APP_TAGLINE } from "@/config/app";
import { SETTINGS_DEFAULT_USER } from "@/config/settings-labels";
import {
  SETTINGS_IOS_PROFILE_GROUP,
  SETTINGS_IOS_PROFILE_NAME,
  SETTINGS_IOS_PROFILE_ROW,
  SETTINGS_IOS_PROFILE_SUBTITLE,
} from "@/config/settings-ios";
import { useSession } from "@/lib/auth/auth-client";

export function SettingsIosProfileCard() {
  const { data: session } = useSession();
  const name = session?.user?.name?.trim() || SETTINGS_DEFAULT_USER;
  const email = session?.user?.email?.trim();
  const initial = name.charAt(0).toUpperCase() || "W";

  return (
    <div className={SETTINGS_IOS_PROFILE_GROUP}>
      <div className={SETTINGS_IOS_PROFILE_ROW}>
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-[#7C8CFF] via-[#5B6CFF] to-[#3B4FE0] text-lg font-semibold text-white shadow-sm">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className={SETTINGS_IOS_PROFILE_NAME}>{name}</p>
          <p className={SETTINGS_IOS_PROFILE_SUBTITLE}>
            {email ?? APP_TAGLINE}
          </p>
        </div>
      </div>
    </div>
  );
}
