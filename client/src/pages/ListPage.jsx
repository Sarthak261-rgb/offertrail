import { useEffect, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  EmptyState,
  ErrorState,
  PageSpinner,
  PriorityTag,
  StatusBadge,
} from '../components/ui.jsx';
import { useApplicationList } from '../hooks/useApplications.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { PRIORITIES, SORT_OPTIONS, SOURCE_LABELS, SOURCES, STATUSES } from '../utils/constants.js';
import { formatDate, formatSalary } from '../utils/format.js';

const PAGE_SIZE = 10;
const FILTERS = [
  { name: 'status', label: 'All statuses', options: STATUSES },
  { name: 'source', label: 'All sources', options: SOURCES },
  { name: 'priority', label: 'All priorities', options: PRIORITIES },
];

/** Filters live in the URL, so a filtered view can be refreshed, bookmarked or shared. */
export function ListPage() {
  const { openCreate } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const debouncedSearch = useDebouncedValue(search.trim());

  const params = {
    q: searchParams.get('q') ?? '',
    status: searchParams.get('status') ?? '',
    source: searchParams.get('source') ?? '',
    priority: searchParams.get('priority') ?? '',
    sort: searchParams.get('sort') ?? '-appliedAt',
    page: Number(searchParams.get('page')) || 1,
  };

  // Changing any filter resets to page 1; empty values are removed from the URL.
  const setParam = (name, value) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(name, value);
        else next.delete(name);
        if (name !== 'page') next.delete('page');
        return next;
      },
      { replace: true },
    );

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get('q') ?? '')) setParam('q', debouncedSearch);
    // Only the debounced input should trigger this sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useApplicationList({
    ...params,
    limit: PAGE_SIZE,
  });

  const hasFilters = Boolean(params.q || params.status || params.source || params.priority);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">All applications</h1>
          {data && <p className="text-sm text-slate-500">{data.meta.total} found</p>}
        </div>
      </div>

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="search"
          className="input lg:col-span-1"
          placeholder="Search company or role…"
          aria-label="Search company or role"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {FILTERS.map((filter) => (
          <select
            key={filter.name}
            className="input"
            aria-label={filter.label}
            value={params[filter.name]}
            onChange={(event) => setParam(filter.name, event.target.value)}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
        <select
          className="input"
          aria-label="Sort by"
          value={params.sort}
          onChange={(event) => setParam('sort', event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isPending && <PageSpinner />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data?.data.length === 0 &&
        (hasFilters ? (
          <EmptyState
            title="No matches"
            description="Try a different search or clear the filters."
            action={
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearch('');
                  setSearchParams({}, { replace: true });
                }}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <EmptyState
            title="No applications yet"
            action={
              <button type="button" className="btn btn-primary" onClick={() => openCreate()}>
                Add an application
              </button>
            }
          />
        ))}

      {data?.data.length > 0 && (
        <div className={`card overflow-x-auto ${isPlaceholderData ? 'opacity-60' : ''}`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Company / role
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  Source
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">
                  Salary
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                  Applied
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.data.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/applications/${app._id}`}
                      className="font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {app.company}
                    </Link>
                    <p className="text-slate-500">{app.role}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                    {SOURCE_LABELS[app.source]}
                  </td>
                  <td className="hidden px-4 py-3 whitespace-nowrap text-slate-600 lg:table-cell">
                    {formatSalary(app.salaryMin, app.salaryMax)}
                  </td>
                  <td className="hidden px-4 py-3 whitespace-nowrap text-slate-600 sm:table-cell">
                    {formatDate(app.appliedAt)}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <PriorityTag priority={app.priority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={params.page <= 1}
            onClick={() => setParam('page', String(params.page - 1))}
          >
            ← Previous
          </button>
          <span className="text-slate-500">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={params.page >= data.meta.totalPages}
            onClick={() => setParam('page', String(params.page + 1))}
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
}
