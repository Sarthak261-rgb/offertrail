import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../utils/AppError.js';

export const SESSION_COOKIE = 'token';

export function requireAuth(req, _res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) throw new AppError(401, 'Not authenticated');

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub };
  } catch {
    throw new AppError(401, 'Your session has expired, please log in again');
  }

  next();
}
