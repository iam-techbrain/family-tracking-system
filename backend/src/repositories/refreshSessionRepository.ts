import { prisma } from '../config/database';
import { RefreshSession } from '@prisma/client';

export class RefreshSessionRepository {
  async createSession(data: {
    userId: string;
    tokenHash: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<RefreshSession> {
    return prisma.refreshSession.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        deviceId: data.deviceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshSession | null> {
    return prisma.refreshSession.findUnique({
      where: { tokenHash },
    });
  }

  async revokeSession(id: string): Promise<void> {
    await prisma.refreshSession.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.refreshSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async deleteExpiredSessions(): Promise<number> {
    const result = await prisma.refreshSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true },
        ],
      },
    });
    return result.count;
  }
}

export const refreshSessionRepository = new RefreshSessionRepository();

