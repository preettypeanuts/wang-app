import { APP_TIMEZONE } from "@/config/timezone";
import {
  UI_GREETING_AFTERNOON,
  UI_GREETING_EVENING,
  UI_GREETING_MORNING,
  UI_GREETING_NIGHT,
} from "@/config/ui-labels";
import type { OverviewGreeting } from "@/types/overview";

const OVERVIEW_HEADER_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: APP_TIMEZONE,
});

function formatOverviewHeaderDate(value: Date): string {
  return OVERVIEW_HEADER_DATE_FORMAT.format(value);
}

function resolveGreetingTitle(date: Date): string {
  const hour = date.getHours();

  if (hour < 11) {
    return UI_GREETING_MORNING;
  }

  if (hour < 15) {
    return UI_GREETING_AFTERNOON;
  }

  if (hour < 18) {
    return UI_GREETING_EVENING;
  }

  return UI_GREETING_NIGHT;
}

function resolveGreetingFirstName(userName?: string | null): string | null {
  const trimmed = userName?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.split(/\s+/)[0] ?? null;
}

export function formatOverviewGreeting(
  date: Date = new Date(),
  userName?: string | null,
): OverviewGreeting {
  const timeGreeting = resolveGreetingTitle(date);
  const firstName = resolveGreetingFirstName(userName);

  return {
    title: firstName ? `${timeGreeting}, ${firstName}` : timeGreeting,
    subtitle: formatOverviewHeaderDate(date),
  };
}
