-- Family Circle Initial Database Migration (MySQL 8.0)
-- 23 Core Entities with Constraints, Foreign Keys and Indexes

-- 1. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `fullName` VARCHAR(120) NOT NULL,
  `phoneNumber` VARCHAR(32) NULL,
  `avatarUrl` VARCHAR(512) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `emailVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. user_settings
CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `theme` VARCHAR(20) NOT NULL DEFAULT 'system',
  `language` VARCHAR(10) NOT NULL DEFAULT 'en',
  `notificationSounds` BOOLEAN NOT NULL DEFAULT TRUE,
  `vibrationEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `locationRetentionDays` INT NOT NULL DEFAULT 7,
  `staleThresholdMinutes` INT NOT NULL DEFAULT 10,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_settings_userId_key` (`userId`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. families
CREATE TABLE IF NOT EXISTS `families` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `ownerId` VARCHAR(36) NOT NULL,
  `avatarUrl` VARCHAR(512) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_families_owner` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. family_members
CREATE TABLE IF NOT EXISTS `family_members` (
  `id` VARCHAR(36) NOT NULL,
  `familyId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
  `nickname` VARCHAR(80) NULL,
  `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `family_members_familyId_userId_key` (`familyId`, `userId`),
  KEY `idx_family_members_userId` (`userId`),
  KEY `idx_family_members_familyId` (`familyId`),
  CONSTRAINT `fk_family_members_family` FOREIGN KEY (`familyId`) REFERENCES `families` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_family_members_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. family_invitations
CREATE TABLE IF NOT EXISTS `family_invitations` (
  `id` VARCHAR(36) NOT NULL,
  `familyId` VARCHAR(36) NOT NULL,
  `invitedById` VARCHAR(36) NOT NULL,
  `inviteCode` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255) NULL,
  `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
  `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `family_invitations_inviteCode_key` (`inviteCode`),
  KEY `idx_family_invitations_familyId` (`familyId`),
  CONSTRAINT `fk_family_invitations_family` FOREIGN KEY (`familyId`) REFERENCES `families` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_family_invitations_invitedBy` FOREIGN KEY (`invitedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. devices
CREATE TABLE IF NOT EXISTS `devices` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `deviceId` VARCHAR(120) NOT NULL,
  `deviceName` VARCHAR(120) NOT NULL,
  `platform` ENUM('ANDROID', 'WEB', 'OTHER') NOT NULL DEFAULT 'ANDROID',
  `osVersion` VARCHAR(40) NULL,
  `appVersion` VARCHAR(40) NULL,
  `fcmToken` TEXT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `devices_userId_deviceId_key` (`userId`, `deviceId`),
  KEY `idx_devices_userId` (`userId`),
  CONSTRAINT `fk_devices_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. refresh_sessions
CREATE TABLE IF NOT EXISTS `refresh_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `deviceId` VARCHAR(120) NULL,
  `tokenHash` VARCHAR(255) NOT NULL,
  `ipAddress` VARCHAR(45) NULL,
  `userAgent` TEXT NULL,
  `isRevoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_sessions_tokenHash_key` (`tokenHash`),
  KEY `idx_refresh_sessions_userId` (`userId`),
  CONSTRAINT `fk_refresh_sessions_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `tokenHash` VARCHAR(255) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `isUsed` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_tokens_tokenHash_key` (`tokenHash`),
  KEY `idx_password_reset_tokens_userId` (`userId`),
  CONSTRAINT `fk_password_reset_tokens_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. location_sharing_settings
CREATE TABLE IF NOT EXISTS `location_sharing_settings` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `shareCurrentLocation` BOOLEAN NOT NULL DEFAULT TRUE,
  `shareLocationHistory` BOOLEAN NOT NULL DEFAULT TRUE,
  `allowSafeZoneAlerts` BOOLEAN NOT NULL DEFAULT TRUE,
  `receiveFamilyNotifications` BOOLEAN NOT NULL DEFAULT TRUE,
  `pausedUntil` DATETIME(3) NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `location_sharing_settings_userId_key` (`userId`),
  CONSTRAINT `fk_location_sharing_settings_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. current_locations
CREATE TABLE IF NOT EXISTS `current_locations` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `deviceId` VARCHAR(120) NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `accuracy` DECIMAL(8, 2) NULL,
  `speed` DECIMAL(8, 2) NULL,
  `heading` DECIMAL(6, 2) NULL,
  `batteryPercentage` INT NULL,
  `isCharging` BOOLEAN NULL,
  `isMoving` BOOLEAN NULL,
  `isSharingEnabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `gpsTimestamp` DATETIME(3) NOT NULL,
  `serverReceivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `current_locations_userId_key` (`userId`),
  KEY `idx_current_locations_userId` (`userId`),
  CONSTRAINT `fk_current_locations_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. location_history
CREATE TABLE IF NOT EXISTS `location_history` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `deviceId` VARCHAR(120) NULL,
  `eventId` VARCHAR(64) NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `accuracy` DECIMAL(8, 2) NULL,
  `speed` DECIMAL(8, 2) NULL,
  `heading` DECIMAL(6, 2) NULL,
  `batteryPercentage` INT NULL,
  `isCharging` BOOLEAN NULL,
  `isMoving` BOOLEAN NULL,
  `gpsTimestamp` DATETIME(3) NOT NULL,
  `serverReceivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `location_history_userId_eventId_key` (`userId`, `eventId`),
  KEY `idx_location_history_userId_gpsTimestamp` (`userId`, `gpsTimestamp`),
  KEY `idx_location_history_userId_serverReceivedAt` (`userId`, `serverReceivedAt`),
  CONSTRAINT `fk_location_history_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. safe_zones
CREATE TABLE IF NOT EXISTS `safe_zones` (
  `id` VARCHAR(36) NOT NULL,
  `familyId` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `radiusMeters` DECIMAL(8, 2) NOT NULL,
  `color` VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_safe_zones_familyId` (`familyId`),
  CONSTRAINT `fk_safe_zones_family` FOREIGN KEY (`familyId`) REFERENCES `families` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. safe_zone_members
CREATE TABLE IF NOT EXISTS `safe_zone_members` (
  `id` VARCHAR(36) NOT NULL,
  `safeZoneId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `notifyOnEntry` BOOLEAN NOT NULL DEFAULT TRUE,
  `notifyOnExit` BOOLEAN NOT NULL DEFAULT TRUE,
  `isInside` BOOLEAN NOT NULL DEFAULT FALSE,
  `lastStateChangeAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `safe_zone_members_safeZoneId_userId_key` (`safeZoneId`, `userId`),
  KEY `idx_safe_zone_members_userId` (`userId`),
  CONSTRAINT `fk_safe_zone_members_safeZone` FOREIGN KEY (`safeZoneId`) REFERENCES `safe_zones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_safe_zone_members_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. geofence_events
CREATE TABLE IF NOT EXISTS `geofence_events` (
  `id` VARCHAR(36) NOT NULL,
  `safeZoneId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `eventType` ENUM('ENTER', 'EXIT') NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `accuracy` DECIMAL(8, 2) NULL,
  `occurredAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_geofence_events_userId_occurredAt` (`userId`, `occurredAt`),
  KEY `idx_geofence_events_safeZoneId_occurredAt` (`safeZoneId`, `occurredAt`),
  CONSTRAINT `fk_geofence_events_safeZone` FOREIGN KEY (`safeZoneId`) REFERENCES `safe_zones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_geofence_events_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. sos_alerts
CREATE TABLE IF NOT EXISTS `sos_alerts` (
  `id` VARCHAR(36) NOT NULL,
  `familyId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `status` ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  `latitude` DECIMAL(10, 7) NULL,
  `longitude` DECIMAL(10, 7) NULL,
  `accuracy` DECIMAL(8, 2) NULL,
  `batteryPercentage` INT NULL,
  `message` VARCHAR(500) NULL,
  `eventId` VARCHAR(64) NULL,
  `triggeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `resolvedAt` DATETIME(3) NULL,
  `resolvedById` VARCHAR(36) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sos_alerts_eventId_key` (`eventId`),
  KEY `idx_sos_alerts_familyId_status` (`familyId`, `status`),
  KEY `idx_sos_alerts_userId` (`userId`),
  CONSTRAINT `fk_sos_alerts_family` FOREIGN KEY (`familyId`) REFERENCES `families` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sos_alerts_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. sos_recipients
CREATE TABLE IF NOT EXISTS `sos_recipients` (
  `id` VARCHAR(36) NOT NULL,
  `sosAlertId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `hasAcknowledged` BOOLEAN NOT NULL DEFAULT FALSE,
  `acknowledgedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sos_recipients_sosAlertId_userId_key` (`sosAlertId`, `userId`),
  KEY `idx_sos_recipients_userId` (`userId`),
  CONSTRAINT `fk_sos_recipients_sosAlert` FOREIGN KEY (`sosAlertId`) REFERENCES `sos_alerts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sos_recipients_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. conversations
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` VARCHAR(36) NOT NULL,
  `familyId` VARCHAR(36) NOT NULL,
  `isGroup` BOOLEAN NOT NULL DEFAULT TRUE,
  `title` VARCHAR(120) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_conversations_familyId` (`familyId`),
  CONSTRAINT `fk_conversations_family` FOREIGN KEY (`familyId`) REFERENCES `families` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. conversation_members
CREATE TABLE IF NOT EXISTS `conversation_members` (
  `id` VARCHAR(36) NOT NULL,
  `conversationId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `lastReadAt` DATETIME(3) NULL,
  `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversation_members_conversationId_userId_key` (`conversationId`, `userId`),
  KEY `idx_conversation_members_userId` (`userId`),
  CONSTRAINT `fk_conversation_members_conversation` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversation_members_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(36) NOT NULL,
  `conversationId` VARCHAR(36) NOT NULL,
  `senderId` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `clientMessageId` VARCHAR(64) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversationId_createdAt` (`conversationId`, `createdAt`),
  KEY `idx_messages_senderId` (`senderId`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. message_receipts
CREATE TABLE IF NOT EXISTS `message_receipts` (
  `id` VARCHAR(36) NOT NULL,
  `messageId` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `status` ENUM('DELIVERED', 'READ') NOT NULL DEFAULT 'DELIVERED',
  `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_receipts_messageId_userId_key` (`messageId`, `userId`),
  KEY `idx_message_receipts_userId` (`userId`),
  CONSTRAINT `fk_message_receipts_message` FOREIGN KEY (`messageId`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_receipts_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `category` ENUM('SOS', 'INVITATION', 'MESSAGE', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'SHARING_STOPPED', 'SYSTEM') NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `body` TEXT NOT NULL,
  `data` JSON NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT FALSE,
  `readAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_userId_isRead_createdAt` (`userId`, `isRead`, `createdAt`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. push_subscriptions
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `endpoint` VARCHAR(512) NOT NULL,
  `p256dh` TEXT NOT NULL,
  `auth` TEXT NOT NULL,
  `userAgent` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `push_subscriptions_endpoint_key` (`endpoint`),
  KEY `idx_push_subscriptions_userId` (`userId`),
  CONSTRAINT `fk_push_subscriptions_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. call_logs
CREATE TABLE IF NOT EXISTS `call_logs` (
  `id` VARCHAR(36) NOT NULL,
  `initiatorId` VARCHAR(36) NOT NULL,
  `recipientId` VARCHAR(36) NOT NULL,
  `targetPhoneNumber` VARCHAR(32) NOT NULL,
  `callType` ENUM('PHONE_DIALER', 'FUTURE_WEBRTC') NOT NULL DEFAULT 'PHONE_DIALER',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_call_logs_initiatorId` (`initiatorId`),
  KEY `idx_call_logs_recipientId` (`recipientId`),
  CONSTRAINT `fk_call_logs_initiator` FOREIGN KEY (`initiatorId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_call_logs_recipient` FOREIGN KEY (`recipientId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `resourceType` VARCHAR(50) NOT NULL,
  `resourceId` VARCHAR(64) NULL,
  `details` JSON NULL,
  `ipAddress` VARCHAR(45) NULL,
  `userAgent` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_userId_createdAt` (`userId`, `createdAt`),
  KEY `idx_audit_logs_action_createdAt` (`action`, `createdAt`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

