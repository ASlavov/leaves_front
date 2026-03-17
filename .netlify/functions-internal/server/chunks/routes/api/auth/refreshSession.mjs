import { d as defineEventHandler, i as getCookie, h as createError, v as verifyJWT } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const refreshSession = defineEventHandler(async (event) => {
  const authToken = getCookie(event, "auth_token");
  if (!authToken) {
    throw createError({
      statusCode: 401,
      message: "Authentication token not found."
    });
  }
  try {
    const payload = verifyJWT(authToken);
    return {
      authenticated: true,
      userId: payload.userId,
      message: "Session is valid."
    };
  } catch (error) {
    console.error("Error refreshing session:", error);
    throw createError({
      statusCode: 401,
      message: "Invalid or expired token."
    });
  }
});

export { refreshSession as default };
//# sourceMappingURL=refreshSession.mjs.map
