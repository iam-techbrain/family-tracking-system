import pino from 'pino';
import { env } from './env';

const sensitiveKeys = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'set-cookie',
  'latitude',
  'longitude',
  'coords',
];

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: sensitiveKeys.flatMap((key) => [
      key,
      `*.${key}`,
      `*.*.${key}`,
      `req.headers.${key}`,
      `req.body.${key}`,
    ]),
    censor: '[REDACTED]',
  },
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

