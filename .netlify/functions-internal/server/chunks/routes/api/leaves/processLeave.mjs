import { d as defineEventHandler, e as useRuntimeConfig, r as readBody, h as createError } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const processLeave = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { requestingUserId, token } = event.context;
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not authenticated"
    });
  }
  try {
    const {
      userId,
      leaveId,
      status,
      reason
    } = body;
    console.log(
      "leave_id",
      leaveId,
      "user_editor",
      requestingUserId,
      "status",
      status,
      "reason",
      reason
    );
    const response = await $fetch(`${config.public.apiBase}${config.public.leaves.processLeave}`, {
      method: "PUT",
      body: {
        /*"requesting_user_id": requestingUserId,*/
        "leave_id": leaveId,
        "user_editor": requestingUserId,
        "status": status,
        "reason": reason
      },
      headers: {
        Authorization: `Bearer ${token}`
        // Use the token in the Authorization header
      }
    });
    if (response === "You cannot reject/accept your leaves") {
      throw createError({
        statusCode: 500,
        statusMessage: "You cannot reject/accept your leaves"
      });
    }
    return response;
  } catch (error) {
    console.error("Error posting leave:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error posting leaves"
    });
  }
});

export { processLeave as default };
//# sourceMappingURL=processLeave.mjs.map
