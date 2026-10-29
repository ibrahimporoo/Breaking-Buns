import { formatInZone } from "@/lib/time";

export function formatTimeLabel(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${twelveHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatDateLabel(instant: Date, timeZone: string): string {
  return formatInZone(instant, timeZone, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWhen(instant: Date, timeZone: string): string {
  const date = formatInZone(instant, timeZone, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const time = formatInZone(instant, timeZone, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${date} at ${time}`;
}

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function timeAgo(iso: string, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ${minutes % 60} min ago`;

  return `${Math.floor(hours / 24)} d ago`;
}
