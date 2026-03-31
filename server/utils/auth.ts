import jwt from 'jsonwebtoken';
import { useRuntimeConfig } from '#imports';

// JWT payload interface to ensure type safety
interface JwtPayload {
  userId: string;
  token: string;
}

/**
 * Creates a signed JWT from a user ID and API token.
 * The JWT is self-contained and can be verified without a database lookup.
 * @param userId - The user's ID.
 * @param token - The authentication token from the Laravel backend.
 * @returns A signed JWT string.
 */
export function createJWT(userId: string, token: string): string {
  const config = useRuntimeConfig();
  const payload: JwtPayload = { userId, token };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
}

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 * @param token - The JWT string to verify.
 * @returns The decoded payload containing userId and the backend token.
 */
export function verifyJWT(token: string): JwtPayload {
  const config = useRuntimeConfig();
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
