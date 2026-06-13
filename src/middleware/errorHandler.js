import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found.' } });
}

export function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_VALUE', message: 'This value is already registered.' },
    });
  }

  const status = error.statusCode ?? 500;
  if (status >= 500) console.error(error);

  res.status(status).json({
    success: false,
    error: {
      code: error.code ?? 'INTERNAL_SERVER_ERROR',
      message: error.isOperational ? error.message : 'An unexpected error occurred.',
      ...(env.NODE_ENV === 'development' && !error.isOperational ? { details: error.message } : {}),
    },
  });
}
