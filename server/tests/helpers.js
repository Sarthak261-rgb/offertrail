import request from 'supertest';
import { createApp } from '../src/app.js';

export const app = createApp();

let counter = 0;

/** Registers a fresh user and returns a Supertest agent that carries their session cookie. */
export async function signedInAgent(overrides = {}) {
  counter += 1;
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/register').send({
    name: `User ${counter}`,
    email: `user${counter}@test.dev`,
    password: 'password123',
    ...overrides,
  });
  return { agent, user: res.body.data };
}

export const validApplication = (overrides = {}) => ({
  company: 'Northwind Labs',
  role: 'Frontend Engineer',
  source: 'linkedin',
  ...overrides,
});
