import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.schema.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => config.isTest,
  message: { error: { message: 'Too many attempts, please try again in a few minutes' } },
});

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
