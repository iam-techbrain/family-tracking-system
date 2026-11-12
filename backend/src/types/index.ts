import { Request } from 'express';
import { FamilyRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role?: FamilyRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  deviceId?: string;
}

export interface JwtAccessTokenPayload {
  userId: string;
  email: string;
  fullName: string;
  type: 'access';
}

export interface JwtRefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

