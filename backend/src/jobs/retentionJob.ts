import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { refreshSessionRepository } from '../repositories/refreshSessionRepository';

/**
 * Periodically purge location history older than each user's configured retention days,
 * and clean up expired refresh sessions & password reset tokens.
 */
export async function runRetentionCleanup(): Promise<void> {
  try {
    logger.info('Starting scheduled retention cleanup job...');

    // 1. Clean expired refresh sessions
    const cleanedSessions = await refreshSessionRepository.deleteExpiredSessions();
    if (cleanedSessions > 0) {
      logger.info({ cleanedSessions }, 'Purged expired refresh sessions');
    }

    // 2. Clean expired or used password reset tokens older than 24 hours
    const deletedTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { isUsed: true },
          { expiresAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    });
    if (deletedTokens.count > 0) {
      logger.info({ count: deletedTokens.count }, 'Purged expired password reset tokens');
    }

    // 3. Clean location history according to user settings
    // Retrieve distinct retention periods configured by active users
    const userSettings = await prisma.userSettings.findMany({
      select: { userId: true, locationRetentionDays: true },
    });

    let totalHistoryPurged = 0;
    for (const setting of userSettings) {
      const days = setting.locationRetentionDays || 7;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await prisma.locationHistory.deleteMany({
        where: {
          userId: setting.userId,
          gpsTimestamp: { lt: cutoffDate },
        },
      });

      totalHistoryPurged += result.count;
    }

    logger.info(
      { totalHistoryPurged },
      'Retention cleanup job completed successfully'
    );
  } catch (error) {
    logger.error({ err: error }, 'Error executing retention cleanup job');
  }
}

/**
 * Start periodic retention job timer (runs once every 24 hours, plus immediate initial run)
 */
export function startRetentionJobScheduler(intervalMs = 24 * 60 * 60 * 1000) {
  // Initial run after 1 minute of startup
  setTimeout(() => {
    runRetentionCleanup().catch((err) =>
      logger.error({ err }, 'Failed initial retention cleanup run')
    );
  }, 60 * 1000);

  // Recurring schedule
  return setInterval(() => {
    runRetentionCleanup().catch((err) =>
      logger.error({ err }, 'Failed recurring retention cleanup run')
    );
  }, intervalMs);
}

