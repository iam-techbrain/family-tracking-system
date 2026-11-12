import { z } from 'zod';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255).toLowerCase().trim(),
  password: passwordValidation,
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(120).trim(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid E.164 phone number')
    .optional()
    .nullable(),
  deviceId: z.string().min(1).max(120).optional(),
  deviceName: z.string().max(120).optional(),
  platform: z.enum(['ANDROID', 'WEB', 'OTHER']).default('WEB'),
  fcmToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().max(120).optional(),
  deviceName: z.string().max(120).optional(),
  platform: z.enum(['ANDROID', 'WEB', 'OTHER']).default('WEB'),
  fcmToken: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required'),
  deviceId: z.string().max(120).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16, 'Reset token is required'),
  newPassword: passwordValidation,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

