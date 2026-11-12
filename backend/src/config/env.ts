import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend directory or workspace root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  BIND_ADDRESS: z.string().default('0.0.0.0'),
  APP_NAME: z.string().default('Family Circle'),
  APP_URL: z.string().default('http://localhost:4000'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string().default('mysql://family_user:family_password@localhost:3306/family_circle'),

  JWT_ACCESS_SECRET: z.string().min(16).default('development_jwt_access_secret_key_minimum_32_chars!'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development_jwt_refresh_secret_key_minimum_32_chars!'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  PASSWORD_RESET_TOKEN_EXPIRATION: z.string().default('1h'),

  ARGON2_MEMORY_COST: z.coerce.number().default(65536),
  ARGON2_TIME_COST: z.coerce.number().default(3),
  ARGON2_PARALLELISM: z.coerce.number().default(1),

  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'),

  DEFAULT_LOCATION_RETENTION_DAYS: z.coerce.number().default(7),
  STALE_LOCATION_THRESHOLD_MINUTES: z.coerce.number().default(10),
  MIN_LOCATION_ACCURACY_METERS: z.coerce.number().default(100.0),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(15),

  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default('mailto:support@familycircle.local'),

  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsedEnv.data;

