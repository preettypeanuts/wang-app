import { formatJournalHeaderDate } from "@/lib/finance/format-datetime";
import type { OverviewGreeting } from "@/types/overview";

function resolveGreetingTitle(date: Date): string {
  const hour = date.getHours();

  if (hour < 11) {
    return "Selamat pagi";
  }

  if (hour < 15) {
    return "Selamat siang";
  }

  if (hour < 18) {
    return "Selamat sore";
  }

  return "Selamat malam";
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
    subtitle: formatJournalHeaderDate(date),
  };
}
