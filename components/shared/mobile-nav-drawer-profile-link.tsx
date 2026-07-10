"use client";

import Link from "next/link";

import { APP_TAGLINE } from "@/config/app";
import { SETTINGS_DEFAULT_USER } from "@/config/settings-labels";
import { MOBILE_DRAWER_ROW } from "@/config/mobile-nav";
import { useSession } from "@/lib/auth/auth-client";
import { CaretRightIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface MobileNavDrawerProfileLinkProps {
  onNavigate?: () => void;
}

export function MobileNavDrawerProfileLink({
  onNavigate,
}: MobileNavDrawerProfileLinkProps) {
  const { data: session } = useSession();
  const name = session?.user?.name?.trim() || SETTINGS_DEFAULT_USER;
  const email = session?.user?.email?.trim();
  const initial = name.charAt(0).toUpperCase() || "W";

  return (
    <Link
      className={cn(MOBILE_DRAWER_ROW, "p-3")}
      href="/profile"
      onClick={onNavigate}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[0.85rem] bg-linear-to-b from-[#7C8CFF] via-[#5B6CFF] to-[#3B4FE0] text-sm font-semibold text-white shadow-sm">
        {initial}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {email ?? APP_TAGLINE}
        </p>
      </div>
      <CaretRightIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    </Link>
  );
}
