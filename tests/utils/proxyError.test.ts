import { describe, it, expect } from 'vitest';
import { proxyError } from '~/server/utils/proxyError';

/**
 * proxyError always throws — every test uses expect(...).toThrow.
 * We check the thrown H3Error's statusCode and data shape.
 */

function call(error: any) {
  try {
    proxyError(error);
  } catch (e: any) {
    return e;
  }
}

describe('proxyError', () => {
  describe('401 — auth errors', () => {
    it('throws 401 with Unauthorized message', () => {
      const err = call({ response: { status: 401 } });
      expect(err.statusCode).toBe(401);
      expect(err.statusMessage).toBe('Unauthorized');
    });
  });

  describe('4xx — user / business errors', () => {
    it('forwards 422 status with message from body.message', () => {
      const err = call({
        response: { status: 422 },
        data: { message: 'Validation failed' },
      });
      expect(err.statusCode).toBe(422);
      expect(err.data.type).toBe('user');
      expect(err.data.message).toBe('Validation failed');
    });

    it('extracts message from body.error string', () => {
      const err = call({
        response: { status: 400 },
        data: { error: 'You must exhaust your Paid Leave balance first' },
      });
      expect(err.data.type).toBe('user');
      expect(err.data.message).toBe('You must exhaust your Paid Leave balance first');
    });

    it('extracts first field error from body.errors object', () => {
      const err = call({
        response: { status: 422 },
        data: {
          errors: { email: ['The email has already been taken.', 'Another msg'] },
        },
      });
      expect(err.data.type).toBe('user');
      expect(err.data.message).toBe('The email has already been taken.');
    });

    it('sets message to null when body has no recognisable error field', () => {
      const err = call({ response: { status: 409 }, data: {} });
      expect(err.data.type).toBe('user');
      expect(err.data.message).toBeNull();
    });

    it('handles 403 as a client error (not auth-special-cased)', () => {
      const err = call({
        response: { status: 403 },
        data: { message: 'Forbidden resource' },
      });
      expect(err.statusCode).toBe(403);
      expect(err.data.type).toBe('user');
    });
  });

  describe('5xx — infrastructure errors', () => {
    it('returns generic 500 for 500 status', () => {
      const err = call({ response: { status: 500 }, data: { message: 'DB down' } });
      expect(err.statusCode).toBe(500);
      expect(err.data.type).toBe('app');
      expect(err.data.message).toBeNull();
    });

    it('returns 500 for network errors with no status', () => {
      const err = call({ message: 'ECONNREFUSED' });
      expect(err.statusCode).toBe(500);
    });

    it('does not leak internal server messages to the client', () => {
      const err = call({
        response: { status: 503 },
        data: { message: 'Internal secret info' },
      });
      expect(err.data.message).toBeNull();
    });
  });
});
