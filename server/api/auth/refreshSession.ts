import { defineEventHandler, getCookie, createError } from 'h3';
import { verifyJWT } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  // Read the auth_token directly from the cookie
  const authToken = getCookie(event, 'auth_token');

  // If no token is present, throw an error
  if (!authToken) {
    throw createError({
      statusCode: 401,
      message: 'Authentication token not found.',
    });
  }

  try {
    // Verify the JWT to check if the session is still valid
    const payload = verifyJWT(authToken);

    // If verification is successful, the session is valid.
    // Return a confirmation and the user ID from the token's payload.
    return {
      authenticated: true,
      userId: payload.userId,
      message: 'Session is valid.',
    };
  } catch (error: any) {
    // If the token is invalid or expired, a verification error will be thrown.
    console.error('Error refreshing session:', error);
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token.',
    });
  }
});
