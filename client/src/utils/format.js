const DAY_MS = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '—');

export const formatDateTime = (value) => (value ? dateTimeFormatter.format(new Date(value)) : '—');

/** "2026-10-08T00:00:00.000Z" → "2026-10-08", the format <input type="date"> expects. */
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const todayInput = () => new Date().toISOString().slice(0, 10);

/** Compact Indian-style salary: 1200000 → "₹12L". */
export function formatSalary(min, max) {
  const lakh = (n) => `₹${Math.round((n / 100_000) * 10) / 10}L`;
  if (min != null && max != null) return `${lakh(min)} – ${lakh(max)}`;
  if (min != null) return `from ${lakh(min)}`;
  if (max != null) return `up to ${lakh(max)}`;
  return '—';
}

/** Whole calendar days from today (UTC) to `value`: negative = in the past. */
export function daysFromToday(value, now = new Date()) {
  const startOfDay = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((startOfDay(new Date(value)) - startOfDay(now)) / DAY_MS);
}

export function describeDue(value, now = new Date()) {
  const days = daysFromToday(value, now);
  if (days === 0) return 'Due today';
  if (days < 0) return `${-days} day${days === -1 ? '' : 's'} overdue`;
  return `Due in ${days} day${days === 1 ? '' : 's'}`;
}
