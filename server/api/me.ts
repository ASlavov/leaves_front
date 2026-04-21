import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const { requestingUserId, token } = event.context;

  if (!requestingUserId || !token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }

  return {
    userId: requestingUserId,
  };
});
