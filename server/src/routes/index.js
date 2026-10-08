import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { applicationRouter } from './application.routes.js';
import { authRouter } from './auth.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));
apiRouter.use('/auth', authRouter);
apiRouter.use('/applications', requireAuth, applicationRouter);
apiRouter.get('/stats/overview', requireAuth, statsController.overview);
