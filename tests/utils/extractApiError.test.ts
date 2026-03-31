import { describe, it, expect } from 'vitest';
import { extractApiError } from '~/utils/extractApiError';

describe('extractApiError', () => {
  describe('auth errors', () => {
    it('returns auth type for status 401 on response', () => {
      expect(extractApiError({ response: { status: 401 } })).toEqual({
        type: 'auth',
        message: null,
      });
    });

    it('returns auth type for status 403 on response', () => {
      expect(extractApiError({ response: { status: 403 } })).toEqual({
        type: 'auth',
        message: null,
      });
    });

    it('returns auth type using statusCode fallback', () => {
      expect(extractApiError({ statusCode: 401 })).toEqual({
        type: 'auth',
        message: null,
      });
    });
  });

  describe('user errors', () => {
    it('returns user type when envelope.type is "user" in data.data', () => {
      const error = {
        data: { data: { type: 'user', message: 'Email already taken' } },
      };
      expect(extractApiError(error)).toEqual({
        type: 'user',
        message: 'Email already taken',
      });
    });

    it('returns user type when envelope is directly in data (non-H3)', () => {
      const error = {
        data: { type: 'user', message: 'Something went wrong' },
      };
      expect(extractApiError(error)).toEqual({
        type: 'user',
        message: 'Something went wrong',
      });
    });

    it('returns null message when user envelope has no message', () => {
      const error = { data: { data: { type: 'user' } } };
      expect(extractApiError(error)).toEqual({ type: 'user', message: null });
    });
  });

  describe('app errors', () => {
    it('returns app type for unknown error shape', () => {
      expect(extractApiError({ data: {} })).toEqual({
        type: 'app',
        message: null,
      });
    });

    it('returns app type for empty error', () => {
      expect(extractApiError({})).toEqual({ type: 'app', message: null });
    });

    it('returns app type for 500 status with no user envelope', () => {
      expect(extractApiError({ response: { status: 500 }, data: {} })).toEqual({
        type: 'app',
        message: null,
      });
    });

    it('returns app type when data.type is not "user"', () => {
      const error = { data: { data: { type: 'server', message: 'boom' } } };
      expect(extractApiError(error)).toEqual({ type: 'app', message: null });
    });
  });
});
