import 'dotenv/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach } from 'vitest';

// Tests use an in-memory MongoDB by default (as in CI). Set TEST_MONGODB_URI to use a real
// server instead, e.g. where local policy blocks the downloaded mongod binary.
// This file runs before each test file is imported, so config.js sees the env vars below.
const externalUri = process.env.TEST_MONGODB_URI;
const mongod = externalUri ? null : await MongoMemoryServer.create();

process.env.MONGODB_URI = externalUri ?? mongod.getUri();
process.env.JWT_SECRET = 'test-secret';

// One database per worker, so test files running in parallel never clear each other's data.
await mongoose.connect(process.env.MONGODB_URI, {
  dbName: `offertrail_test_${process.env.VITEST_POOL_ID ?? 0}`,
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  if (externalUri) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongod?.stop();
});
