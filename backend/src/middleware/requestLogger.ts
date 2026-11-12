import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    // Do not log health check spam
    if (originalUrl === '/health' || originalUrl === '/api/v1/health') {
      return;
    }

    logger.info(
      {
        method,
        url: originalUrl,
        statusCode,
        durationMs: duration,
        ip,
        userAgent: req.get('user-agent'),
      },
      `${method} ${originalUrl} ${statusCode} - ${duration}ms`
    );
  });

  next();
}

