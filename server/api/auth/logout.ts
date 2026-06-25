import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler(async (event) => {
  await clearUserSession(event);
  deleteCookie(event, 'user_authed');
  return { authenticated: false, message: 'Logged out' };
});
