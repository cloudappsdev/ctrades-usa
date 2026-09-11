const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const absoluteFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Chicago",
});

/** "3 days ago", "yesterday". Pass `now` explicitly to keep callers testable. */
export function formatRelativeTime(date: Date, now: Date = new Date()) {
  let duration = (date.getTime() - now.getTime()) / 1000;

  for (const { amount, unit } of DIVISIONS) {
    if (Math.abs(duration) < amount) {
      return relativeFormatter.format(Math.round(duration), unit);
    }
    duration /= amount;
  }

  return relativeFormatter.format(Math.round(duration), "years");
}

/** Chicago-local timestamp for display, so it reads the same on every server. */
export function formatAbsoluteTime(date: Date) {
  return `${absoluteFormatter.format(date)} CST`;
}
