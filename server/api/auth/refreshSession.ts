import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.userId) {
    throw createError({ statusCode: 401, message: 'Authentication token not found.' });
  }

  return { authenticated: true, userId: session.userId, message: 'Session is valid.' };
});
