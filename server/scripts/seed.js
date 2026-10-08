/**
 * Creates (or resets) the demo account with realistic data spread over the last 8 weeks.
 * Only the demo user's data is touched, so this is safe to run against production.
 *   npm run seed
 */
import mongoose from 'mongoose';
import { config } from '../src/config.js';
import { connectDB, disconnectDB } from '../src/db.js';
import { Application } from '../src/models/Application.js';
import { User } from '../src/models/User.js';

const DEMO_USER = { name: 'Demo User', email: 'demo@offertrail.dev', password: 'demo1234' };

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

async function seed() {
  await connectDB(config.mongoUri);

  const existing = await User.findOne({ email: DEMO_USER.email });
  if (existing) {
    await Application.deleteMany({ user: existing._id });
    await existing.deleteOne();
  }

  const user = await User.create(DEMO_USER);
  // insertMany skips the save hook, so the hand-built statusHistory is kept as is.
  const applications = await Application.insertMany(buildDemoApplications(user._id));

  console.log(`Seeded ${applications.length} applications for ${DEMO_USER.email}`);
}

try {
  await seed();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState) await disconnectDB();
}
