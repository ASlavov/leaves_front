import { d as defineEventHandler, e as useRuntimeConfig, r as readBody, h as createError } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const newLeave = defineEventHandler(async (event) => {
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
      leaveTypeId,
      startDate,
      endDate,
      reason
    } = body;
    console.log(body);
    const response = await $fetch(`${config.public.apiBase}${config.public.leaves.newLeave}`, {
      method: "POST",
      body: {
        "id": userId,
        "leave_type_id": leaveTypeId,
        "start_date": startDate,
        "end_date": endDate,
        "reason": reason,
        "requesting_user_id": requestingUserId
      },
      headers: {
        Authorization: `Bearer ${token}`
        // Use the token in the Authorization header
      }
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error posting leave:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error posting leaves"
    });
  }
});

export { newLeave as default };
//# sourceMappingURL=newLeave.mjs.map
