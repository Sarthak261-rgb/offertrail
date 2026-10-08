import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, signedInAgent, validApplication } from './helpers.js';

const DAY_MS = 24 * 60 * 60 * 1000;

let agent;

beforeEach(async () => {
  ({ agent } = await signedInAgent());
});

async function createApplication(overrides) {
  const res = await agent.post('/api/applications').send(validApplication(overrides));
  expect(res.status).toBe(201);
  return res.body.data;
}

describe('authentication', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/applications', () => {
  it('creates an application with defaults and an initial history entry', async () => {
    const created = await createApplication();

    expect(created).toMatchObject({ status: 'applied', priority: 'medium', company: 'Northwind Labs' });
    expect(created.statusHistory).toHaveLength(1);
    expect(created.statusHistory[0].status).toBe('applied');
  });

  it('requires company and role', async () => {
    const res = await agent.post('/api/applications').send({ source: 'linkedin' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('company');
    expect(res.body.error.details).toHaveProperty('role');
  });

  it('rejects attempts to set server-owned fields', async () => {
    const res = await agent
      .post('/api/applications')
      .send(validApplication({ user: '507f1f77bcf86cd799439011', statusHistory: [] }));

    expect(res.status).toBe(400);
  });

  it('rejects a salary range where min is above max', async () => {
    const res = await agent
      .post('/api/applications')
      .send(validApplication({ salaryMin: 900000, salaryMax: 500000 }));

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('salaryMax');
  });

  it('treats empty form fields as "no value"', async () => {
    const created = await createApplication({ salaryMin: '', followUpAt: '', jobUrl: '' });

    expect(created.salaryMin).toBeNull();
    expect(created.followUpAt).toBeNull();
  });
});

describe('GET /api/applications', () => {
  beforeEach(async () => {
    await createApplication({ company: 'Google', role: 'Frontend Engineer', status: 'interview' });
    await createApplication({ company: 'Goodreads', role: 'Backend Engineer' });
    await createApplication({ company: 'Stripe', role: 'Full Stack', source: 'referral' });
  });

  it('searches company and role with a case-insensitive partial match', async () => {
    const res = await agent.get('/api/applications').query({ q: 'GOO' });

    expect(res.status).toBe(200);
    expect(res.body.data.map((a) => a.company).sort()).toEqual(['Goodreads', 'Google']);
  });

  it('filters by status and source', async () => {
    const byStatus = await agent.get('/api/applications').query({ status: 'interview' });
    const bySource = await agent.get('/api/applications').query({ source: 'referral' });

    expect(byStatus.body.data.map((a) => a.company)).toEqual(['Google']);
    expect(bySource.body.data.map((a) => a.company)).toEqual(['Stripe']);
  });

  it('ignores empty filter values sent by the client', async () => {
    const res = await agent.get('/api/applications').query({ status: '', source: '' });
    expect(res.body.meta.total).toBe(3);
  });

  it('paginates and reports metadata', async () => {
    const res = await agent.get('/api/applications').query({ limit: 2, page: 2, sort: 'company' });

    expect(res.body.data.map((a) => a.company)).toEqual(['Stripe']);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it('rejects invalid query parameters', async () => {
    expect((await agent.get('/api/applications').query({ page: 'abc' })).status).toBe(400);
    expect((await agent.get('/api/applications').query({ limit: 1000 })).status).toBe(400);
    expect((await agent.get('/api/applications').query({ status: 'hired' })).status).toBe(400);
  });
});

describe('PATCH /api/applications/:id', () => {
  it('appends to the status history when the status changes', async () => {
    const created = await createApplication();
    const res = await agent.patch(`/api/applications/${created._id}`).send({ status: 'interview' });

    expect(res.status).toBe(200);
    expect(res.body.data.statusHistory.map((h) => h.status)).toEqual(['applied', 'interview']);
  });

  it('does not add a history entry when the status is unchanged', async () => {
    const created = await createApplication();
    const res = await agent
      .patch(`/api/applications/${created._id}`)
      .send({ status: 'applied', notes: 'Recruiter called' });

    expect(res.body.data.notes).toBe('Recruiter called');
    expect(res.body.data.statusHistory).toHaveLength(1);
  });

  it('cannot overwrite the history or owner', async () => {
    const created = await createApplication();
    const res = await agent.patch(`/api/applications/${created._id}`).send({ statusHistory: [] });

    expect(res.status).toBe(400);
  });

  it('rejects an empty update and a malformed id', async () => {
    const created = await createApplication();

    expect((await agent.patch(`/api/applications/${created._id}`).send({})).status).toBe(400);
    expect((await agent.patch('/api/applications/not-an-id').send({ notes: 'x' })).status).toBe(400);
  });
});

describe('ownership', () => {
  it("returns 404 when another user reads, edits or deletes someone else's application", async () => {
    const created = await createApplication();
    const { agent: intruder } = await signedInAgent();
    const url = `/api/applications/${created._id}`;

    expect((await intruder.get(url)).status).toBe(404);
    expect((await intruder.patch(url).send({ status: 'rejected' })).status).toBe(404);
    expect((await intruder.delete(url)).status).toBe(404);
    expect((await intruder.get('/api/applications')).body.data).toHaveLength(0);

    // The owner's data is untouched.
    expect((await agent.get(url)).body.data.status).toBe('applied');
  });
});

describe('DELETE /api/applications/:id', () => {
  it('deletes the application', async () => {
    const created = await createApplication();
    const url = `/api/applications/${created._id}`;

    expect((await agent.delete(url)).status).toBe(204);
    expect((await agent.get(url)).status).toBe(404);
  });
});

describe('GET /api/applications/follow-ups', () => {
  it('returns open applications with a follow-up due today or earlier, oldest first', async () => {
    const now = Date.now();
    await createApplication({ company: 'Overdue', followUpAt: new Date(now - 3 * DAY_MS) });
    await createApplication({ company: 'Today', followUpAt: new Date(now) });
    await createApplication({ company: 'Future', followUpAt: new Date(now + 5 * DAY_MS) });
    await createApplication({ company: 'Closed', status: 'rejected', followUpAt: new Date(now - DAY_MS) });
    await createApplication({ company: 'No date' });

    const res = await agent.get('/api/applications/follow-ups');

    expect(res.status).toBe(200);
    expect(res.body.data.map((a) => a.company)).toEqual(['Overdue', 'Today']);
  });
});

describe('GET /api/applications/board', () => {
  it('returns lightweight cards without notes or history', async () => {
    await createApplication({ notes: 'secret notes' });
    const res = await agent.get('/api/applications/board');

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].notes).toBeUndefined();
    expect(res.body.data[0].statusHistory).toBeUndefined();
  });
});
