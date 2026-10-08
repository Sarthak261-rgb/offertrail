import { describe, expect, it } from 'vitest';
import { Application } from '../src/models/Application.js';
import { getOverview } from '../src/services/stats.service.js';
import { signedInAgent } from './helpers.js';

const DAY_MS = 24 * 60 * 60 * 1000;
// A fixed Wednesday, so week boundaries are predictable.
const NOW = new Date('2026-10-07T12:00:00Z');
const daysAgo = (n) => new Date(NOW.getTime() - n * DAY_MS);
const history = (...statuses) => statuses.map((status) => ({ status, changedAt: NOW }));

async function seedFor(userId) {
  await Application.insertMany(
    [
      // linkedin: 3 applied, 1 reached interview
      { company: 'A', status: 'applied', source: 'linkedin', appliedAt: daysAgo(1), statusHistory: history('applied') },
      { company: 'B', status: 'interview', source: 'linkedin', appliedAt: daysAgo(2), statusHistory: history('applied', 'interview') },
      { company: 'C', status: 'rejected', source: 'linkedin', appliedAt: daysAgo(9), statusHistory: history('applied', 'rejected') },
      // referral: 2 applied, both reached interview (one was later rejected)
      { company: 'D', status: 'offer', source: 'referral', appliedAt: daysAgo(8), statusHistory: history('applied', 'interview', 'offer') },
      { company: 'E', status: 'rejected', source: 'referral', appliedAt: daysAgo(70), statusHistory: history('applied', 'interview', 'rejected') },
      // wishlist: not applied yet, excluded from rates and weekly counts
      { company: 'F', status: 'wishlist', source: 'other', appliedAt: daysAgo(0), statusHistory: history('wishlist') },
    ].map((doc) => ({ ...doc, role: 'Engineer', user: userId })),
  );
}

describe('getOverview', () => {
  it('computes totals, rates, per-source breakdown and 8 weekly buckets', async () => {
    const { user } = await signedInAgent();
    await seedFor(user._id);

    const stats = await getOverview(user._id, NOW);

    expect(stats.byStatus).toEqual({ wishlist: 1, applied: 1, interview: 1, offer: 1, rejected: 2 });
    expect(stats.totals).toEqual({
      total: 6,
      applied: 5,
      active: 2,
      interviews: 3,
      offers: 1,
      interviewRate: 60,
    });
    expect(stats.bySource).toEqual([
      { source: 'linkedin', applied: 3, interviews: 1, interviewRate: 33.3 },
      { source: 'referral', applied: 2, interviews: 2, interviewRate: 100 },
    ]);

    expect(stats.weekly).toHaveLength(8);
    expect(stats.weekly.at(-1)).toEqual({ weekStart: '2026-10-05', count: 2 }); // A, B
    expect(stats.weekly.at(-2)).toEqual({ weekStart: '2026-09-28', count: 2 }); // C, D
    // E (70 days ago) is outside the 8-week window.
    expect(stats.weekly.reduce((sum, w) => sum + w.count, 0)).toBe(4);
  });

  it("only counts the requesting user's data", async () => {
    const { user: owner } = await signedInAgent();
    const { user: other } = await signedInAgent();
    await seedFor(owner._id);

    const stats = await getOverview(other._id, NOW);

    expect(stats.totals.total).toBe(0);
    expect(stats.totals.interviewRate).toBe(0);
    expect(stats.bySource).toEqual([]);
  });

  it('is served over HTTP for the logged-in user', async () => {
    const { agent } = await signedInAgent();
    const res = await agent.get('/api/stats/overview');

    expect(res.status).toBe(200);
    expect(res.body.data.weekly).toHaveLength(8);
  });
});
