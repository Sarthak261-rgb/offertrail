import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

const send = (res, status, message, details) =>
  res.status(status).json({ error: { message, ...(details && { details }) } });

// Express identifies error middleware by its four parameters, so `_next` must stay.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return send(res, err.status, err.message, err.details);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, error]) => [field, [error.message]]),
    );
    return send(res, 400, 'Validation failed', details);
  }

  if (err?.code === 11000) {
    return send(res, 409, 'A record with these details already exists');
  }

  if (err?.type === 'entity.parse.failed') {
    return send(res, 400, 'Malformed JSON body');
  }

  console.error(err);
  return send(res, 500, 'Something went wrong');
}

export function notFound(req, res) {
  send(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}
