import { userRepository } from '../repositories/userRepository';
import { auditRepository } from '../repositories/auditRepository';
import { prisma } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/security';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors';
import {
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateSettingsInput,
} from '../validators/userValidators';

export class UserService {
  async getProfile(userId: string) {
    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      throw new NotFoundError('User profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, input: UpdateProfileInput, ipAddress?: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await userRepository.update(userId, {
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      avatarUrl: input.avatarUrl,
    });

    await auditRepository.record({
      userId,
      action: 'PROFILE_UPDATED',
      resourceType: 'User',
      resourceId: userId,
      ipAddress,
    });

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      phoneNumber: updated.phoneNumber,
      avatarUrl: updated.avatarUrl,
    };
  }

  async changePassword(userId: string, input: ChangePasswordInput, ipAddress?: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await verifyPassword(user.passwordHash, input.currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    if (input.currentPassword === input.newPassword) {
      throw new BadRequestError('New password must be different from current password');
    }

    const newPasswordHash = await hashPassword(input.newPassword);
    await userRepository.updatePassword(userId, newPasswordHash);

    // Invalidate other active sessions
    await prisma.refreshSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    await auditRepository.record({
      userId,
      action: 'PASSWORD_CHANGED',
      resourceType: 'User',
      resourceId: userId,
      ipAddress,
    });
  }

  async updateSettings(userId: string, input: UpdateSettingsInput) {
    return prisma.userSettings.update({
      where: { userId },
      data: {
        theme: input.theme,
        language: input.language,
        notificationSounds: input.notificationSounds,
        vibrationEnabled: input.vibrationEnabled,
        locationRetentionDays: input.locationRetentionDays,
        staleThresholdMinutes: input.staleThresholdMinutes,
      },
    });
  }

  async listDevices(userId: string) {
    return userRepository.listDevices(userId);
  }

  async removeDevice(userId: string, deviceId: string) {
    return userRepository.removeDevice(userId, deviceId);
  }

  async deleteAccount(userId: string, ipAddress?: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Cascade deletion handles relations
    await userRepository.deleteUser(userId);

    await auditRepository.record({
      userId: null,
      action: 'ACCOUNT_DELETED',
      resourceType: 'User',
      resourceId: userId,
      ipAddress,
    });
  }
}

export const userService = new UserService();

