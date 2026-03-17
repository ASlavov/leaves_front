import { d as defineEventHandler, e as useRuntimeConfig, h as createError } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const getLeavesStatuses = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { requestingUserId, token } = event.context;
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not authenticated"
    });
  }
  try {
    const response = await $fetch(`${config.public.apiBase}${config.public.leaves.getLeavesStatuses}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
        // Use the token in the Authorization header
      }
    });
    return response;
  } catch (error) {
    console.error("Error fetching leaves:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching leaves"
    });
  }
});

export { getLeavesStatuses as default };
//# sourceMappingURL=getLeavesStatuses.mjs.map
