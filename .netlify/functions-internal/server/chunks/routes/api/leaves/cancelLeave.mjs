import {
  d as defineEventHandler,
  e as useRuntimeConfig,
  r as readBody,
  h as createError,
} from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const cancelLeave = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { requestingUserId, token } = event.context;
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }
  try {
    const { userId, leaveId, status, reason } = body;
    const response = await $fetch(`${config.public.apiBase}${config.public.leaves.cancelLeave}`, {
      method: 'PUT',
      body: {
        requesting_user_id: requestingUserId,
        leave_id: leaveId,
        user_editor: userId,
        status: status,
        reason: reason,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        // Use the token in the Authorization header
      },
    });
    return response;
  } catch (error) {
    console.error('Error posting leave:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error posting leaves',
    });
  }
});

export { cancelLeave as default };
//# sourceMappingURL=cancelLeave.mjs.map
