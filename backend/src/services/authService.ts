import { userRepository } from '../repositories/userRepository';
import { refreshSessionRepository } from '../repositories/refreshSessionRepository';
import { auditRepository } from '../repositories/auditRepository';
import { prisma } from '../config/database';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateSecureToken,
} from '../utils/security';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors';
import { RegisterInput, LoginInput } from '../validators/authValidators';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export class AuthService {
  async register(
    input: RegisterInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.createWithDefaults({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
    });

    // Register initial device if provided
    if (input.deviceId) {
      await userRepository.registerOrUpdateDevice({
        userId: user.id,
        deviceId: input.deviceId,
        deviceName: input.deviceName || 'Primary Device',
        platform: input.platform || 'WEB',
        fcmToken: input.fcmToken,
      });
    }

    // Issue tokens and session
    const tokens = await this.issueTokens(user, input.deviceId, ipAddress, userAgent);

    await auditRepository.record({
      userId: user.id,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return tokens;
  }

  async login(
    input: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been suspended or deactivated');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Register/update device on login
    if (input.deviceId) {
      await userRepository.registerOrUpdateDevice({
        userId: user.id,
        deviceId: input.deviceId,
        deviceName: input.deviceName || 'Device',
        platform: input.platform || 'WEB',
        fcmToken: input.fcmToken,
      });
    }

    const tokens = await this.issueTokens(user, input.deviceId, ipAddress, userAgent);

    await auditRepository.record({
      userId: user.id,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return tokens;
  }

  async refreshTokens(
    refreshToken: string,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    // 1. Verify token signature and type
    const payload = verifyRefreshToken(refreshToken);

    // 2. Hash incoming token and look up in database
    const tokenHash = hashToken(refreshToken);
    const session = await refreshSessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError('Session not found or invalid');
    }

    // Reuse detection: If token was already revoked, revoke ALL user sessions as potential security breach
    if (session.isRevoked) {
      await refreshSessionRepository.revokeAllUserSessions(session.userId);
      throw new UnauthorizedError('Compromised refresh token detected. All sessions revoked.');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError('Session expired. Please log in again.');
    }

    // 3. Revoke current session (Rotation)
    await refreshSessionRepository.revokeSession(session.id);

    const user = await userRepository.findById(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    // 4. Issue newly rotated tokens
    return this.issueTokens(user, deviceId || session.deviceId || undefined, ipAddress, userAgent);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    const session = await refreshSessionRepository.findByTokenHash(tokenHash);
    if (session) {
      await refreshSessionRepository.revokeSession(session.id);
    }
  }

  async forgotPassword(email: string, ipAddress?: string, userAgent?: string): Promise<{ resetToken?: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return gracefully to prevent user enumeration attacks
      return {};
    }

    // Invalidate existing unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    const resetToken = generateSecureToken(32);
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await auditRepository.record({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    // In dev/self-hosted mode without paid SMTP, return token in response or log securely
    return { resetToken };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.isUsed) {
      throw new BadRequestError('Invalid or already used password reset token');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new BadRequestError('Password reset token has expired');
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
      // Invalidate all active sessions to force re-login with new password
      prisma.refreshSession.updateMany({
        where: { userId: resetRecord.userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);
  }

  private async issueTokens(
    user: { id: string; email: string; fullName: string },
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    const rawRefreshToken = generateSecureToken(40);
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await refreshSessionRepository.createSession({
      userId: user.id,
      tokenHash,
      deviceId,
      ipAddress,
      userAgent,
      expiresAt,
    });

    const signedRefreshToken = signRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    // Map raw secret for client rotation matching DB hash
    return {
      accessToken,
      refreshToken: signedRefreshToken,
      expiresIn: '15m',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}

export const authService = new AuthService();

