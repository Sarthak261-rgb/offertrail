import 'dotenv/config';

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET'];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const env = process.env.NODE_ENV ?? 'development';

export const config = Object.freeze({
  env,
  isProduction: env === 'production',
  isTest: env === 'test',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  sessionDays: 7,
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  // Create the demo account on startup if it's missing (hosts without a shell for `npm run seed`).
  seedDemo: process.env.SEED_DEMO === 'true',
});
