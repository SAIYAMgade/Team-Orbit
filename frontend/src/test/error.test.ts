/**
 * Unit Tests for API Error Normalization Utility
 */

import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../lib/error';

describe('getErrorMessage', () => {
  it('returns fallback message when error is null or undefined', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
  });

  it('handles plain string error', () => {
    expect(getErrorMessage('Invalid email address')).toBe('Invalid email address');
  });

  it('handles standard FastAPI string detail response', () => {
    const error = {
      response: {
        data: {
          detail: 'A user with this email already exists',
        },
      },
    };
    expect(getErrorMessage(error)).toBe('A user with this email already exists');
  });

  it('handles FastAPI/Pydantic validation error array (the root cause of React crash)', () => {
    const pydanticError = {
      response: {
        data: {
          detail: [
            {
              type: 'value_error',
              loc: ['body', 'password'],
              msg: 'Value error, Password must contain at least one uppercase letter',
              input: 'secret123',
              ctx: { error: {} },
              url: 'https://errors.pydantic.dev/2.5/v/value_error',
            },
            {
              type: 'value_error',
              loc: ['body', 'email'],
              msg: 'value is not a valid email address: An email address must have an @-sign.',
              input: 'bademail',
              ctx: { reason: 'An email address must have an @-sign.' },
            },
          ],
        },
      },
    };

    const result = getErrorMessage(pydanticError);
    expect(typeof result).toBe('string');
    expect(result).toContain('Password: Password must contain at least one uppercase letter');
    expect(result).toContain('Email: value is not a valid email address');
    // Ensure raw object / sensitive fields are NEVER exposed
    expect(result).not.toContain('secret123');
    expect(result).not.toContain('ctx');
    expect(result).not.toContain('[object Object]');
  });

  it('handles single Pydantic error object', () => {
    const error = {
      response: {
        data: {
          detail: {
            type: 'missing',
            loc: ['body', 'full_name'],
            msg: 'Field required',
          },
        },
      },
    };
    expect(getErrorMessage(error)).toBe('Full Name: Field required');
  });

  it('handles network failure', () => {
    const netErr = {
      code: 'ERR_NETWORK',
      message: 'Network Error',
    };
    expect(getErrorMessage(netErr)).toBe(
      'Unable to connect to the server. Please check your internet connection.'
    );
  });

  it('handles generic Error objects without exposing object toString', () => {
    const err = new Error('Database connection failed');
    expect(getErrorMessage(err)).toBe('Database connection failed');
  });
});
