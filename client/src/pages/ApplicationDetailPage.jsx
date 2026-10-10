import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApplicationFormModal } from '../components/ApplicationFormModal.jsx';
import {
  EmptyState,
  ErrorState,
  PageSpinner,
  PriorityTag,
  StatusBadge,
} from '../components/ui.jsx';
import {
  useApplication,
  useDeleteApplication,
  useUpdateApplication,
} from '../hooks/useApplications.js';
import { SOURCE_LABELS, STATUS_BY_VALUE, STATUSES } from '../utils/constants.js';
import { describeDue, formatDate, formatDateTime, formatSalary } from '../utils/format.js';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const { data: app, isPending, isError, error, refetch } = useApplication(id);
  const update = useUpdateApplication();
  const remove = useDeleteApplication();

  if (isPending) return <PageSpinner />;
  if (isError) {
    return error.status === 404 || error.status === 400 ? (
      <EmptyState
        title="Application not found"
        description="It may have been deleted."
        action={
          <Link to="/" className="btn btn-secondary">
            Back to board
          </Link>
        }
      />
    ) : (
      <ErrorState error={error} onRetry={refetch} />
    );
  }

  function changeStatus(status) {
    update.mutate(
      { id, changes: { status } },
      {
        onSuccess: () => toast.success(`Moved to ${STATUS_BY_VALUE[status].label}`),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDelete() {
    if (!window.confirm(`Delete your application to ${app.company}? This can't be undone.`)) return;
    remove.mutate(id, {
      onSuccess: () => {
        toast.success('Application deleted');
        navigate('/', { replace: true });
      },
      onError: (err) => toast.error(err.message),
    });
  }

  const history = [...app.statusHistory].reverse(); // newest first

  return (
    <>
      <Link to="/" className="text-sm text-slate-500 hover:text-indigo-600">
        ← Back to board
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{app.company}</h1>
            <StatusBadge status={app.status} />
            <PriorityTag priority={app.priority} />
          </div>
          <p className="mt-1 text-slate-600">{app.role}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={remove.isPending}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Move to</h2>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Change status">
              {STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  aria-pressed={app.status === status.value}
                  disabled={app.status === status.value || update.isPending}
                  onClick={() => changeStatus(status.value)}
                  className={`btn border ${
                    app.status === status.value
                      ? `${status.badge} border-transparent disabled:opacity-100`
                      : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail label="Location">{app.location || '—'}</Detail>
              <Detail label="Source">{SOURCE_LABELS[app.source]}</Detail>
              <Detail label="Applied on">{formatDate(app.appliedAt)}</Detail>
              <Detail label="Follow up">
                {app.followUpAt
                  ? `${formatDate(app.followUpAt)} · ${describeDue(app.followUpAt)}`
                  : '—'}
              </Detail>
              <Detail label="Salary range">{formatSalary(app.salaryMin, app.salaryMax)}</Detail>
              <Detail label="Job posting">
                {app.jobUrl ? (
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-indigo-600 hover:underline"
                  >
                    Open posting ↗
                  </a>
                ) : (
                  '—'
                )}
              </Detail>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Notes</h2>
            {app.notes ? (
              <p className="text-sm whitespace-pre-wrap text-slate-700">{app.notes}</p>
            ) : (
              <p className="text-sm text-slate-400">No notes yet. Use Edit to add some.</p>
            )}
          </section>
        </div>

        <section className="card h-fit p-5" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="mb-4 text-sm font-semibold text-slate-700">
            Timeline
          </h2>
          <ol className="relative space-y-5 border-l border-slate-200 pl-5">
            {history.map((entry, index) => (
              <li key={`${entry.status}-${entry.changedAt}`} className="relative">
                <span
                  className={`absolute top-1 -left-[26px] h-3 w-3 rounded-full ring-4 ring-white ${STATUS_BY_VALUE[entry.status].dot}`}
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">
                  {index === history.length - 1 ? 'Created as ' : 'Moved to '}
                  {STATUS_BY_VALUE[entry.status].label}
                </p>
                <p className="text-xs text-slate-500">{formatDateTime(entry.changedAt)}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <ApplicationFormModal open={editing} application={app} onClose={() => setEditing(false)} />
    </>
  );
}
