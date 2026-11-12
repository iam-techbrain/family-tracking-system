export const swaggerDocument: Record<string, unknown> = {
  openapi: '3.0.3',
  info: {
    title: 'Family Circle API',
    version: '1.0.0',
    description:
      'Production-oriented REST API and WebSocket services for Family Circle self-hosted location tracking system.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 root',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BAD_REQUEST' },
              details: { type: 'object' },
            },
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'fullName'],
        properties: {
          email: { type: 'string', format: 'email', example: 'parent@example.com' },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePass123!',
            description: 'Must contain uppercase, lowercase, and digit',
          },
          fullName: { type: 'string', example: 'Alex Smith' },
          phoneNumber: { type: 'string', example: '+15551234567' },
          deviceId: { type: 'string', example: 'android-uuid-1234' },
          deviceName: { type: 'string', example: 'Pixel 8' },
          platform: { type: 'string', enum: ['ANDROID', 'WEB', 'OTHER'], default: 'WEB' },
          fcmToken: { type: 'string', example: 'dK_fcm_token_sample' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'parent@example.com' },
          password: { type: 'string', example: 'SecurePass123!' },
          deviceId: { type: 'string', example: 'android-uuid-1234' },
          deviceName: { type: 'string', example: 'Pixel 8' },
          platform: { type: 'string', enum: ['ANDROID', 'WEB', 'OTHER'], default: 'WEB' },
          fcmToken: { type: 'string' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
          deviceId: { type: 'string' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'parent@example.com' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string', example: 'a1b2c3d4e5f6...' },
          newPassword: { type: 'string', minLength: 8, example: 'NewSecurePass456!' },
        },
      },
      AuthResponseData: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
          expiresIn: { type: 'string', example: '15m' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string' },
              fullName: { type: 'string' },
            },
          },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          fullName: { type: 'string' },
          phoneNumber: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', nullable: true },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          settings: {
            type: 'object',
            properties: {
              theme: { type: 'string' },
              language: { type: 'string' },
              locationRetentionDays: { type: 'integer' },
              staleThresholdMinutes: { type: 'integer' },
            },
          },
          locationSharingSettings: {
            type: 'object',
            properties: {
              shareCurrentLocation: { type: 'boolean' },
              shareLocationHistory: { type: 'boolean' },
              allowSafeZoneAlerts: { type: 'boolean' },
              receiveFamilyNotifications: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'System health check',
        responses: {
          '200': {
            description: 'API operational status',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AuthResponseData' },
                  },
                },
              },
            },
          },
          '409': { description: 'Email already exists' },
          '422': { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Logged in successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AuthResponseData' },
                  },
                },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token and issue new access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tokens rotated successfully',
          },
          '401': { description: 'Invalid or revoked refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke active refresh session',
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Logged out successfully' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset link/token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Reset processed' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password using token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Password reset successfully' },
          '400': { description: 'Expired or invalid token' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user info from token',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User info retrieved' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get full profile, settings, and family memberships',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Full profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfile' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user profile details',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Profile updated' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user account and all personal data permanently',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Account deleted' },
        },
      },
    },
  },
};
