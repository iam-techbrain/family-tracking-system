import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Handle custom operational errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path, method: req.method }, err.message);
    }
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation error', 422, 'VALIDATION_ERROR', formatted);
    return;
  }

  // Handle SyntaxError (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 'Invalid JSON body format', 400, 'INVALID_JSON');
    return;
  }

  // Unhandled internal errors
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled Exception');
  sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
    500,
    'INTERNAL_SERVER_ERROR'
  );
}

