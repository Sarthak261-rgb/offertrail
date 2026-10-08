import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

/** Builds the Express app without starting it, so tests can drive it with Supertest. */
export function createApp() {
  const app = express();

  // Behind Render's proxy: needed for secure cookies and per-IP rate limiting.
  if (config.isProduction) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (!config.isTest) app.use(morgan(config.isProduction ? 'combined' : 'dev'));

  app.use('/api', apiRouter);
  app.use('/api', notFound);

  // In production the API also serves the built React app (one service, same origin).
  if (config.isProduction) {
    app.use(express.static(clientDist));
    app.use((req, res, next) =>
      req.method === 'GET' ? res.sendFile(path.join(clientDist, 'index.html')) : next(),
    );
  }

  app.use(errorHandler);
  return app;
}
