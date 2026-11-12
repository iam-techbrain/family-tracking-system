export type FamilyRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type DevicePlatform = 'ANDROID' | 'WEB' | 'OTHER';
export type SosStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}

export interface UserSettings {
  theme: string;
  language: string;
  notificationSounds: boolean;
  vibrationEnabled: boolean;
  locationRetentionDays: number;
  staleThresholdMinutes: number;
}

export interface LocationSharingSettings {
  shareCurrentLocation: boolean;
  shareLocationHistory: boolean;
  allowSafeZoneAlerts: boolean;
  receiveFamilyNotifications: boolean;
  pausedUntil?: string | null;
}

export interface Family {
  id: string;
  name: string;
  avatarUrl?: string | null;
  ownerId: string;
  role?: FamilyRole;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyRole;
  nickname?: string | null;
  joinedAt: string;
  user: User;
  currentLocation?: CurrentLocation | null;
  locationSharingSettings?: LocationSharingSettings | null;
}

export interface CurrentLocation {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  batteryPercentage?: number | null;
  isCharging?: boolean | null;
  isMoving?: boolean | null;
  isSharingEnabled: boolean;
  gpsTimestamp: string;
  serverReceivedAt: string;
}

export interface SosAlert {
  id: string;
  familyId: string;
  userId: string;
  user: User;
  status: SosStatus;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  batteryPercentage?: number | null;
  message?: string | null;
  triggeredAt: string;
  resolvedAt?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

