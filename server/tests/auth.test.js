import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, signedInAgent } from './helpers.js';

const credentials = { name: 'Asha', email: 'asha@test.dev', password: 'password123' };

describe('POST /api/auth/register', () => {
  it('creates the user, sets an httpOnly session cookie and never returns the password', async () => {
    const res = await request(app).post('/api/auth/register').send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Asha', email: 'asha@test.dev' });
    expect(res.body.data.password).toBeUndefined();
    expect(res.headers['set-cookie'][0]).toMatch(/^token=.+HttpOnly/);
  });

  it('normalises the email, so a duplicate in different case returns 409', async () => {
    await request(app).post('/api/auth/register').send(credentials);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...credentials, email: 'ASHA@test.dev' });

    expect(res.status).toBe(409);
  });

  it('returns field errors for invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'nope', password: 'short' });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details)).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(credentials);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('gives the same 401 for a wrong password and an unknown email', async () => {
    await request(app).post('/api/auth/register').send(credentials);
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.dev', password: 'whatever1' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message);
  });
});

describe('session', () => {
  it('rejects /me without a cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a tampered token', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', 'token=not-a-real-jwt');
    expect(res.status).toBe(401);
  });

  it('returns the current user, then nothing after logout', async () => {
    const { agent, user } = await signedInAgent();

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data._id).toBe(user._id);

    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).toBe(204);

    const afterLogout = await agent.get('/api/auth/me');
    expect(afterLogout.status).toBe(401);
  });
});
