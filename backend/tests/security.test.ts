import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateSecureToken,
  generateInviteCode,
} from '../src/utils/security';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/utils/jwt';
import { UnauthorizedError } from '../src/utils/errors';

describe('Security & Cryptography Utilities', () => {
  it('hashes passwords using Argon2id and verifies correctly', async () => {
    const rawPassword = 'StrongPassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isMatch = await verifyPassword(hash, rawPassword);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword(hash, 'WrongPassword456!');
    expect(isWrongMatch).toBe(false);
  });

  it('hashes tokens deterministically with SHA-256', () => {
    const token = 'sample-secret-token-12345';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
  });

  it('generates secure random tokens and invite codes', () => {
    const token = generateSecureToken(32);
    expect(token).toHaveLength(64);

    const inviteCode = generateInviteCode(8);
    expect(inviteCode).toHaveLength(8);
    // invite code should be alphanumeric uppercase without confusing chars
    expect(inviteCode).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
  });

  it('signs and verifies JWT access tokens', () => {
    const payload = {
      userId: 'test-user-id-uuid-1',
      email: 'alex@familycircle.local',
      fullName: 'Alex Smith',
    };

    const token = signAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.type).toBe('access');
  });

  it('signs and verifies JWT refresh tokens', () => {
    const payload = {
      userId: 'test-user-id-uuid-2',
      sessionId: 'session-uuid-1234',
    };

    const token = signRefreshToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.sessionId).toBe(payload.sessionId);
    expect(decoded.type).toBe('refresh');
  });

  it('rejects invalid or tampered tokens with UnauthorizedError', () => {
    expect(() => verifyAccessToken('invalid.token.structure')).toThrow(UnauthorizedError);
  });
});

