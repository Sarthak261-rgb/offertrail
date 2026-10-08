import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { INTERVIEW_STATUSES, SOURCES, STATUSES } from '../utils/constants.js';

const WEEKS = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday 00:00 UTC of the week containing `date`. */
function startOfWeek(date) {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - daysSinceMonday * DAY_MS);
}

const percent = (part, whole) => (whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10);

// True when the application is, or ever was, at the interview or offer stage.
const reachedInterview = {
  $gt: [
    {
      $size: {
        $setIntersection: [
          { $setUnion: [{ $ifNull: ['$statusHistory.status', []] }, ['$status']] },
          INTERVIEW_STATUSES,
        ],
      },
    },
    0,
  ],
};

export async function getOverview(userId, now = new Date()) {
  const firstWeek = new Date(startOfWeek(now).getTime() - (WEEKS - 1) * 7 * DAY_MS);
  const submitted = { status: { $ne: 'wishlist' } };

  const [facets] = await Application.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        bySource: [
          { $match: submitted },
          {
            $group: {
              _id: '$source',
              applied: { $sum: 1 },
              interviews: { $sum: { $cond: [reachedInterview, 1, 0] } },
            },
          },
        ],
        weekly: [
          { $match: { ...submitted, appliedAt: { $gte: firstWeek } } },
          {
            $group: {
              _id: {
                $dateTrunc: {
                  date: '$appliedAt',
                  unit: 'week',
                  startOfWeek: 'monday',
                  timezone: 'UTC',
                },
              },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  for (const { _id, count } of facets.byStatus) byStatus[_id] = count;

  const bySource = SOURCES.map((source) => {
    const row = facets.bySource.find((r) => r._id === source);
    const applied = row?.applied ?? 0;
    const interviews = row?.interviews ?? 0;
    return { source, applied, interviews, interviewRate: percent(interviews, applied) };
  }).filter((row) => row.applied > 0);

  // $group only returns weeks that have data; fill the gaps so the chart has 8 bars.
  const countsByWeek = new Map(facets.weekly.map((w) => [w._id.getTime(), w.count]));
  const weekly = Array.from({ length: WEEKS }, (_, i) => {
    const weekStart = new Date(firstWeek.getTime() + i * 7 * DAY_MS);
    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      count: countsByWeek.get(weekStart.getTime()) ?? 0,
    };
  });

  const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
  const applied = total - byStatus.wishlist;
  const interviews = bySource.reduce((sum, row) => sum + row.interviews, 0);

  return {
    totals: {
      total,
      applied,
      active: byStatus.applied + byStatus.interview,
      interviews,
      offers: byStatus.offer,
      interviewRate: percent(interviews, applied),
    },
    byStatus,
    bySource,
    weekly,
  };
}
