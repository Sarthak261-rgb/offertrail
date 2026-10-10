import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useOutletContext } from 'react-router-dom';
import { EmptyState, ErrorState, PageSpinner } from '../components/ui.jsx';
import { useStats } from '../hooks/useApplications.js';
import { SOURCE_LABELS, STATUSES } from '../utils/constants.js';

const BAR_COLOR = '#4f46e5'; // indigo-600: the app's single data hue
const weekLabel = (iso) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(iso),
  );

function StatTile({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Labelled horizontal bar: the number is always printed, so colour never carries meaning alone. */
function BarRow({ label, value, max, display, dotClass }) {
  const width = max === 0 ? 0 : Math.max((value / max) * 100, value > 0 ? 2 : 0);
  return (
    <li className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_auto]">
      <span className="flex items-center gap-2 truncate text-slate-700">
        {dotClass && (
          <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
        )}
        {label}
      </span>
      <span className="h-2.5 rounded-full bg-slate-100" aria-hidden="true">
        <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${width}%` }} />
      </span>
      <span className="text-right font-medium text-slate-900 tabular-nums">{display ?? value}</span>
    </li>
  );
}

function WeeklyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { weekStart, count } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="text-slate-500">Week of {weekLabel(weekStart)}</p>
      <p className="font-semibold text-slate-900">
        {count} application{count === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export function StatsPage() {
  const { openCreate } = useOutletContext();
  const { data: stats, isPending, isError, error, refetch } = useStats();

  if (isPending) return <PageSpinner />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const { totals, byStatus, bySource, weekly } = stats;
  const maxStatus = Math.max(...Object.values(byStatus));

  return (
    <>
      <h1 className="text-2xl font-bold">Stats</h1>
      <p className="mb-5 text-sm text-slate-500">
        How your search is going, computed from your applications.
      </p>

      {totals.total === 0 ? (
        <EmptyState
          title="Nothing to measure yet"
          description="Stats appear once you've added a few applications."
          action={
            <button type="button" className="btn btn-primary" onClick={() => openCreate()}>
              Add an application
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Applied"
              value={totals.applied}
              hint={`${byStatus.wishlist} more on wishlist`}
            />
            <StatTile label="In progress" value={totals.active} hint="Applied or interviewing" />
            <StatTile
              label="Interview rate"
              value={`${totals.interviewRate}%`}
              hint={`${totals.interviews} of ${totals.applied} reached an interview`}
            />
            <StatTile label="Offers" value={totals.offers} />
          </div>

          <section className="card p-5" aria-labelledby="weekly-heading">
            <h2 id="weekly-heading" className="font-semibold">
              Applications per week
            </h2>
            <p className="mb-4 text-xs text-slate-500">Last 8 weeks, by date applied</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekly}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="weekStart"
                    tickFormatter={weekLabel}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<WeeklyTooltip />} cursor={{ fill: '#eef2ff' }} />
                  <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                Show as table
              </summary>
              <table className="mt-2 w-full max-w-xs text-left">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="py-1 font-medium">Week of</th>
                    <th className="py-1 text-right font-medium">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {weekly.map((w) => (
                    <tr key={w.weekStart} className="border-t border-slate-100">
                      <td className="py-1">{weekLabel(w.weekStart)}</td>
                      <td className="py-1 text-right tabular-nums">{w.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card p-5" aria-labelledby="status-heading">
              <h2 id="status-heading" className="mb-4 font-semibold">
                Where everything stands
              </h2>
              <ul className="space-y-3">
                {STATUSES.map((status) => (
                  <BarRow
                    key={status.value}
                    label={status.label}
                    dotClass={status.dot}
                    value={byStatus[status.value]}
                    max={maxStatus}
                  />
                ))}
              </ul>
            </section>

            <section className="card p-5" aria-labelledby="source-heading">
              <h2 id="source-heading" className="font-semibold">
                Interview rate by source
              </h2>
              <p className="mb-4 text-xs text-slate-500">
                Share of submitted applications that reached an interview
              </p>
              {bySource.length === 0 ? (
                <p className="text-sm text-slate-400">No submitted applications yet.</p>
              ) : (
                <ul className="space-y-3">
                  {bySource.map((row) => (
                    <BarRow
                      key={row.source}
                      label={SOURCE_LABELS[row.source]}
                      value={row.interviewRate}
                      max={100}
                      display={`${row.interviewRate}% · ${row.interviews}/${row.applied}`}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
