import { prisma } from '../config/database';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async createWithDefaults(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phoneNumber?: string | null;
  }): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
        },
      });

      // Default user preferences
      await tx.userSettings.create({
        data: {
          userId: user.id,
        },
      });

      // Explicit location sharing settings:
      // Note: adult members default to consenting or can adjust independently
      await tx.locationSharingSettings.create({
        data: {
          userId: user.id,
          shareCurrentLocation: true,
          shareLocationHistory: true,
          allowSafeZoneAlerts: true,
          receiveFamilyNotifications: true,
        },
      });

      return user;
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async updatePassword(id: string, newPasswordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });
  }

  async getProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        settings: true,
        locationSharingSettings: true,
        familyMemberships: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });
  }

  async registerOrUpdateDevice(params: {
    userId: string;
    deviceId: string;
    deviceName: string;
    platform: 'ANDROID' | 'WEB' | 'OTHER';
    fcmToken?: string;
  }) {
    return prisma.device.upsert({
      where: {
        userId_deviceId: {
          userId: params.userId,
          deviceId: params.deviceId,
        },
      },
      update: {
        deviceName: params.deviceName,
        platform: params.platform,
        fcmToken: params.fcmToken,
        lastSeenAt: new Date(),
        isActive: true,
      },
      create: {
        userId: params.userId,
        deviceId: params.deviceId,
        deviceName: params.deviceName,
        platform: params.platform,
        fcmToken: params.fcmToken,
      },
    });
  }

  async listDevices(userId: string) {
    return prisma.device.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async removeDevice(userId: string, deviceId: string) {
    return prisma.device.deleteMany({
      where: {
        userId,
        id: deviceId,
      },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const userRepository = new UserRepository();

