import { useState } from 'react';
import { fieldErrorsFrom } from '../api/client.js';
import { toPayload, validateApplication } from '../utils/applicationForm.js';
import { PRIORITIES, SOURCES, STATUSES } from '../utils/constants.js';

export function ApplicationForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const clientErrors = validateApplication(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      setErrors({ ...fieldErrorsFrom(error), form: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  const field = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: update,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const error = (name) =>
    errors[name] && (
      <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
        {errors[name]}
      </p>
    );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errors.form && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="label">
            Company *
          </label>
          <input className="input" autoFocus placeholder="Northwind Labs" {...field('company')} />
          {error('company')}
        </div>
        <div>
          <label htmlFor="role" className="label">
            Role *
          </label>
          <input className="input" placeholder="Full Stack Developer" {...field('role')} />
          {error('role')}
        </div>
        <div>
          <label htmlFor="location" className="label">
            Location
          </label>
          <input className="input" placeholder="Remote, Bengaluru…" {...field('location')} />
        </div>
        <div>
          <label htmlFor="jobUrl" className="label">
            Job posting URL
          </label>
          <input className="input" type="url" placeholder="https://" {...field('jobUrl')} />
          {error('jobUrl')}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="status" className="label">
            Status
          </label>
          <select className="input" {...field('status')}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="source" className="label">
            Source
          </label>
          <select className="input" {...field('source')}>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="label">
            Priority
          </label>
          <select className="input" {...field('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="appliedAt" className="label">
            Applied on
          </label>
          <input className="input" type="date" {...field('appliedAt')} />
          {error('appliedAt')}
        </div>
        <div>
          <label htmlFor="followUpAt" className="label">
            Follow up on
          </label>
          <input className="input" type="date" {...field('followUpAt')} />
        </div>
        <div>
          <label htmlFor="salaryMin" className="label">
            Min salary (₹ / year)
          </label>
          <input
            className="input"
            type="number"
            min="0"
            step="10000"
            placeholder="600000"
            {...field('salaryMin')}
          />
          {error('salaryMin')}
        </div>
        <div>
          <label htmlFor="salaryMax" className="label">
            Max salary (₹ / year)
          </label>
          <input
            className="input"
            type="number"
            min="0"
            step="10000"
            placeholder="900000"
            {...field('salaryMax')}
          />
          {error('salaryMax')}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          className="input min-h-24"
          placeholder="Recruiter name, interview prep, questions to ask…"
          {...field('notes')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
