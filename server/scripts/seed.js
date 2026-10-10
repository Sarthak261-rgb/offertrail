/**
 * Resets the demo account (demo@offertrail.dev). Safe to run against production:
 * only the demo user's data is touched.
 *   npm run seed
 */
import mongoose from 'mongoose';
import { config } from '../src/config.js';
import { connectDB, disconnectDB } from '../src/db.js';
import { DEMO_USER, resetDemoData } from '../src/demo/demoData.js';

try {
  await connectDB(config.mongoUri);
  const count = await resetDemoData();
  console.log(`Seeded ${count} applications for ${DEMO_USER.email}`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState) await disconnectDB();
}
