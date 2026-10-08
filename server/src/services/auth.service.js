import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function registerUser({ name, email, password }) {
  if (await User.exists({ email })) {
    throw new AppError(409, 'An account with this email already exists');
  }
  return User.create({ name, email, password });
}

export async function authenticate({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password, so accounts can't be enumerated.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, 'Invalid email or password');
  }
  return user;
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw new AppError(401, 'This account no longer exists');
  return user;
}

export function signSessionToken(userId) {
  return jwt.sign({ sub: userId.toString() }, config.jwtSecret, {
    expiresIn: `${config.sessionDays}d`,
  });
}
