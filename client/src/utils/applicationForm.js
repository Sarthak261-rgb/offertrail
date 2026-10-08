import { toDateInput, todayInput } from './format.js';

export const FORM_FIELDS = [
  'company', 'role', 'location', 'jobUrl', 'status', 'source', 'priority',
  'appliedAt', 'followUpAt', 'salaryMin', 'salaryMax', 'notes',
];

/** API document → controlled-input values (no nulls, dates as yyyy-mm-dd). */
export function toFormValues(application = {}) {
  return {
    company: application.company ?? '',
    role: application.role ?? '',
    location: application.location ?? '',
    jobUrl: application.jobUrl ?? '',
    status: application.status ?? 'applied',
    source: application.source ?? 'linkedin',
    priority: application.priority ?? 'medium',
    appliedAt: application.appliedAt ? toDateInput(application.appliedAt) : todayInput(),
    followUpAt: toDateInput(application.followUpAt),
    salaryMin: application.salaryMin ?? '',
    salaryMax: application.salaryMax ?? '',
    notes: application.notes ?? '',
  };
}

/** Mirrors the server rules so most mistakes are caught before a round trip. */
export function validateApplication(values) {
  const errors = {};
  if (!values.company.trim()) errors.company = 'Company is required';
  if (!values.role.trim()) errors.role = 'Role is required';
  if (values.jobUrl.trim() && !/^https?:\/\/\S+\.\S+/.test(values.jobUrl.trim())) {
    errors.jobUrl = 'Enter a full URL, starting with https://';
  }
  const min = values.salaryMin === '' ? null : Number(values.salaryMin);
  const max = values.salaryMax === '' ? null : Number(values.salaryMax);
  if (min != null && max != null && min > max) {
    errors.salaryMax = 'Max must be greater than or equal to min';
  }
  return errors;
}

/** Form values → request body. Empty strings are sent as-is; the API treats them as "no value". */
export const toPayload = (values) =>
  Object.fromEntries(
    FORM_FIELDS.map((key) => [key, typeof values[key] === 'string' ? values[key].trim() : values[key]]),
  );
