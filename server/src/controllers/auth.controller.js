import { config } from '../config.js';
import { SESSION_COOKIE } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';

const baseCookie = {
  httpOnly: true, // not readable from JavaScript, so XSS can't steal the session
  secure: config.isProduction,
  sameSite: 'lax',
  path: '/',
};

function startSession(res, status, user) {
  res.cookie(SESSION_COOKIE, authService.signSessionToken(user._id), {
    ...baseCookie,
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
  });
  res.status(status).json({ data: user });
}

export async function register(req, res) {
  const user = await authService.registerUser(req.validated.body);
  startSession(res, 201, user);
}

export async function login(req, res) {
  const user = await authService.authenticate(req.validated.body);
  startSession(res, 200, user);
}

export function logout(_req, res) {
  res.clearCookie(SESSION_COOKIE, baseCookie);
  res.status(204).end();
}

export async function me(req, res) {
  res.json({ data: await authService.getUserById(req.user.id) });
}
