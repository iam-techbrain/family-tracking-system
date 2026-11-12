import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../src/validators/authValidators';

describe('Authentication Validation Schemas', () => {
  it('accepts valid registration payload', () => {
    const validData = {
      email: 'parent@example.com',
      password: 'StrongPassword123!',
      fullName: 'John Doe',
      phoneNumber: '+15551234567',
      platform: 'ANDROID',
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects registration with weak passwords (no uppercase, no digits, or too short)', () => {
    const tooShort = registerSchema.safeParse({
      email: 'parent@example.com',
      password: 'short',
      fullName: 'John Doe',
    });
    expect(tooShort.success).toBe(false);

    const noDigits = registerSchema.safeParse({
      email: 'parent@example.com',
      password: 'NoDigitsPassword!',
      fullName: 'John Doe',
    });
    expect(noDigits.success).toBe(false);

    const noUppercase = registerSchema.safeParse({
      email: 'parent@example.com',
      password: 'nouppercasepassword123!',
      fullName: 'John Doe',
    });
    expect(noUppercase.success).toBe(false);
  });

  it('validates email format strictly and normalizes to lowercase', () => {
    const result = registerSchema.safeParse({
      email: 'UPPERCASE@Example.COM',
      password: 'StrongPassword123!',
      fullName: 'Jane Doe',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('uppercase@example.com');
    }

    const invalidEmail = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'StrongPassword123!',
      fullName: 'Jane Doe',
    });
    expect(invalidEmail.success).toBe(false);
  });

  it('validates login and password reset inputs', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '123' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'invalid', password: '123' }).success).toBe(false);

    expect(forgotPasswordSchema.safeParse({ email: 'user@family.local' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'invalid' }).success).toBe(false);

    expect(
      resetPasswordSchema.safeParse({
        token: 'short',
        newPassword: 'ValidPassword123!',
      }).success
    ).toBe(false);
  });
});

