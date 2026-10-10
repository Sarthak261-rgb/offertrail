import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { DEMO_USER, ensureDemoData, resetDemoData } from '../src/demo/demoData.js';
import { Application } from '../src/models/Application.js';
import { User } from '../src/models/User.js';
import { app } from './helpers.js';

describe('demo data', () => {
  it('creates a demo account that can log in, with consistent status histories', async () => {
    const count = await resetDemoData();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: DEMO_USER.email, password: DEMO_USER.password });
    expect(login.status).toBe(200);

    const applications = await Application.find({ user: login.body.data._id });
    expect(applications).toHaveLength(count);
    for (const application of applications) {
      expect(application.statusHistory.at(-1).status).toBe(application.status);
    }
  });

  it('ensureDemoData only creates the account once', async () => {
    expect(await ensureDemoData()).toBeGreaterThan(0);
    expect(await ensureDemoData()).toBe(0);
    expect(await User.countDocuments({ email: DEMO_USER.email })).toBe(1);
  });
});
