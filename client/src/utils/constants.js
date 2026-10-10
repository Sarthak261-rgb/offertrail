// Mirrors server/src/utils/constants.js. Order = board column order.
export const STATUSES = [
  {
    value: 'wishlist',
    label: 'Wishlist',
    badge: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-400',
  },
  { value: 'applied', label: 'Applied', badge: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  {
    value: 'interview',
    label: 'Interview',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
  {
    value: 'offer',
    label: 'Offer',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
  },
  { value: 'rejected', label: 'Rejected', badge: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
];

export const SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'company-site', label: 'Company site' },
  { value: 'job-board', label: 'Job board' },
  { value: 'other', label: 'Other' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const SORT_OPTIONS = [
  { value: '-appliedAt', label: 'Newest first' },
  { value: 'appliedAt', label: 'Oldest first' },
  { value: 'company', label: 'Company A–Z' },
  { value: '-company', label: 'Company Z–A' },
  { value: '-updatedAt', label: 'Recently updated' },
];

const byValue = (list) => Object.fromEntries(list.map((item) => [item.value, item]));
export const STATUS_BY_VALUE = byValue(STATUSES);
export const SOURCE_LABELS = Object.fromEntries(SOURCES.map((s) => [s.value, s.label]));
export const PRIORITY_LABELS = Object.fromEntries(PRIORITIES.map((p) => [p.value, p.label]));
