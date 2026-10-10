import { Link } from 'react-router-dom';
import { useFollowUps } from '../hooks/useApplications.js';
import { describeDue, daysFromToday } from '../utils/format.js';
import { StatusBadge } from './ui.jsx';

export function FollowUpsPanel() {
  const { data: followUps, isPending, isError } = useFollowUps();

  // The board is the main content; this panel stays quiet while loading or on error.
  if (isPending || isError || followUps.length === 0) return null;

  return (
    <section
      aria-labelledby="follow-ups-heading"
      className="card mb-5 border-amber-200 bg-amber-50/60 p-4"
    >
      <h2
        id="follow-ups-heading"
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900"
      >
        🔔 Follow-ups due
        <span className="rounded-full bg-amber-200 px-2 text-xs">{followUps.length}</span>
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {followUps.map((item) => (
          <li key={item._id}>
            <Link
              to={`/applications/${item._id}`}
              className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-amber-100 hover:ring-amber-300"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.company}</span>
                <span
                  className={`text-xs ${daysFromToday(item.followUpAt) < 0 ? 'text-rose-600' : 'text-amber-700'}`}
                >
                  {describeDue(item.followUpAt)}
                </span>
              </span>
              <StatusBadge status={item.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
