/**
 * Demo account with realistic data spread over the last 8 weeks.
 * Used by `npm run seed` and, when SEED_DEMO=true, on server startup.
 */
import { Application } from '../models/Application.js';
import { User } from '../models/User.js';

export const DEMO_USER = { name: 'Demo User', email: 'demo@offertrail.dev', password: 'demo1234' };

const DAY_MS = 24 * 60 * 60 * 1000;

// [company, role, location, source, priority, final status, days since applied]
const ROWS = [
  ['Northwind Labs', 'Frontend Engineer', 'Remote', 'linkedin', 'high', 'interview', 6],
  ['Acme Robotics', 'Full Stack Developer', 'Bengaluru', 'referral', 'high', 'offer', 41],
  ['Bluefin Analytics', 'MERN Developer', 'Pune', 'job-board', 'medium', 'applied', 3],
  ['Cobalt Health', 'React Developer', 'Remote', 'company-site', 'medium', 'rejected', 34],
  ['Driftwood Games', 'Node.js Engineer', 'Hyderabad', 'linkedin', 'low', 'applied', 12],
  ['Evergreen Fintech', 'Software Engineer I', 'Mumbai', 'referral', 'high', 'interview', 15],
  ['Foxglove AI', 'Junior Full Stack Engineer', 'Remote', 'linkedin', 'high', 'applied', 1],
  ['Granite Cloud', 'Backend Developer', 'Gurugram', 'job-board', 'medium', 'rejected', 48],
  ['Harbor Logistics', 'Web Developer', 'Chennai', 'company-site', 'low', 'applied', 20],
  ['Indigo Media', 'Frontend Developer', 'Remote', 'linkedin', 'medium', 'rejected', 27],
  ['Juniper Systems', 'Software Developer', 'Noida', 'job-board', 'medium', 'applied', 9],
  ['Kestrel Security', 'Full Stack Engineer', 'Bengaluru', 'referral', 'high', 'interview', 22],
  ['Lumen Education', 'React Native Developer', 'Remote', 'linkedin', 'low', 'rejected', 39],
  ['Maple Commerce', 'MERN Stack Developer', 'Pune', 'company-site', 'medium', 'offer', 52],
  ['Nimbus Data', 'Associate Engineer', 'Hyderabad', 'job-board', 'low', 'applied', 17],
  ['Orchid Travel', 'JavaScript Developer', 'Remote', 'linkedin', 'medium', 'rejected', 44],
  ['Pinecone Labs', 'Node.js Developer', 'Bengaluru', 'other', 'medium', 'applied', 5],
  ['Quartz Payments', 'Full Stack Developer', 'Mumbai', 'linkedin', 'high', 'interview', 11],
  ['Redwood Health', 'Software Engineer', 'Remote', 'job-board', 'medium', 'rejected', 30],
  ['Sapphire Retail', 'Frontend Engineer', 'Delhi', 'company-site', 'low', 'applied', 25],
  ['Tidal Energy', 'Web Application Developer', 'Remote', 'linkedin', 'medium', 'rejected', 54],
  ['Umber Studio', 'UI Engineer', 'Bengaluru', 'referral', 'high', 'interview', 8],
  ['Vertex Mobility', 'Backend Engineer', 'Pune', 'job-board', 'medium', 'applied', 2],
  ['Willow Insurance', 'Full Stack Developer', 'Remote', 'linkedin', 'high', 'wishlist', 0],
  ['Xenon Biotech', 'Software Engineer', 'Hyderabad', 'company-site', 'medium', 'wishlist', 0],
  ['Yarrow Foods', 'React Developer', 'Remote', 'other', 'low', 'wishlist', 0],
];

const PATHS = {
  wishlist: ['wishlist'],
  applied: ['applied'],
  interview: ['applied', 'interview'],
  offer: ['applied', 'interview', 'offer'],
  rejected: ['applied', 'rejected'],
};

function buildDemoApplications(userId, now = new Date()) {
  return ROWS.map(([company, role, location, source, priority, status, daysAgo], i) => {
    const appliedAt = new Date(now.getTime() - daysAgo * DAY_MS);
    // Space each later stage a few days apart, never past "now".
    const statusHistory = PATHS[status].map((step, stepIndex) => ({
      status: step,
      changedAt: new Date(Math.min(appliedAt.getTime() + stepIndex * 6 * DAY_MS, now.getTime())),
    }));
    const isOpen = status === 'applied' || status === 'interview';
    // Open applications get a follow-up 2 days ago, today, or in 2 days (overdue, due, upcoming).
    const followUpAt = isOpen ? new Date(now.getTime() + ((i % 3) - 1) * 2 * DAY_MS) : null;

    return {
      user: userId,
      company,
      role,
      location,
      source,
      priority,
      status,
      appliedAt,
      followUpAt,
      statusHistory,
      jobUrl: `https://careers.example.com/${company.toLowerCase().replace(/\s+/g, '-')}`,
      salaryMin: 600_000 + (i % 5) * 100_000,
      salaryMax: 900_000 + (i % 5) * 150_000,
      notes:
        status === 'interview'
          ? 'Technical round scheduled. Revise React hooks, REST design and MongoDB indexing.'
          : '',
    };
  });
}

/** Deletes and recreates the demo account. Only the demo user's data is touched. */
export async function resetDemoData() {
  const existing = await User.findOne({ email: DEMO_USER.email });
  if (existing) {
    await Application.deleteMany({ user: existing._id });
    await existing.deleteOne();
  }

  const user = await User.create(DEMO_USER);
  // insertMany skips the save hook, so the hand-built statusHistory is kept as is.
  const applications = await Application.insertMany(buildDemoApplications(user._id));
  return applications.length;
}

/** Creates the demo account only if it doesn't exist yet (used on startup when SEED_DEMO=true). */
export async function ensureDemoData() {
  if (await User.exists({ email: DEMO_USER.email })) return 0;
  return resetDemoData();
}
