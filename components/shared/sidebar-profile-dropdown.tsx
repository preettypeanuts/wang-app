"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PROFILE_TITLE,
  SETTINGS_SIGN_OUT,
  SETTINGS_SIGNING_OUT,
} from "@/config/settings-labels";
import { signOut } from "@/lib/auth/auth-client";
import { ArrowLeftIcon, UserCircleIcon } from "@/lib/icons";

interface SidebarProfileDropdownProps {
  trigger: ReactElement;
  contentSide?: "top" | "right" | "bottom" | "left";
  contentAlign?: "start" | "center" | "end";
  contentSideOffset?: number;
}

export function SidebarProfileDropdown({
  trigger,
  contentSide = "top",
  contentAlign = "end",
  contentSideOffset = 8,
}: SidebarProfileDropdownProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    if (pending) {
      return;
    }

    setPending(true);

    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });

    setPending(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent
        side={contentSide}
        align={contentAlign}
        sideOffset={contentSideOffset}
      >
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserCircleIcon />
          {PROFILE_TITLE}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={handleSignOut}
        >
          <ArrowLeftIcon />
          {pending ? SETTINGS_SIGNING_OUT : SETTINGS_SIGN_OUT}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
