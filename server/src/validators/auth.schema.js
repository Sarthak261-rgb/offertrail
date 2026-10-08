import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email address');

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  email,
  // bcrypt ignores anything past 72 bytes, so longer passwords would be silently truncated.
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});
