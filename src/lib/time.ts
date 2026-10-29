export type ZonedParts = {
  date: string;
  time: string;
  weekday: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, formatter);
  }

  return formatter;
}

function readParts(instant: Date, timeZone: string): Record<string, string> {
  return Object.fromEntries(
    getFormatter(timeZone)
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );
}

function offsetMinutes(instant: Date, timeZone: string): number {
  const parts = readParts(instant, timeZone);
  const wallAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const truncated = Math.floor(instant.getTime() / 1000) * 1000;

  return Math.round((wallAsUtc - truncated) / 60_000);
}

export function weekdayOf(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total: number): string {
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  const minutes = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getZonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = readParts(instant, timeZone);
  const date = `${parts.year}-${parts.month}-${parts.day}`;

  return {
    date,
    time: `${parts.hour}:${parts.minute}`,
    weekday: weekdayOf(date),
  };
}

export function zonedTimeToUtc(
  date: string,
  time: string,
  timeZone: string,
): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hours, minutes);

  const firstGuess = wallAsUtc - offsetMinutes(new Date(wallAsUtc), timeZone) * 60_000;
  const corrected = wallAsUtc - offsetMinutes(new Date(firstGuess), timeZone) * 60_000;

  return new Date(corrected);
}

export function formatInZone(
  instant: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, ...options }).format(instant);
}
