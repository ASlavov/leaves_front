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

const _delete = defineEventHandler(async (event) => {
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
    const { entitlementId } = body;
    console.log(body);
    const response = await $fetch(
      `${config.public.apiBase}${config.public.entitlement.delete}/${entitlementId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          // Use the token in the Authorization header
        },
      },
    );
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error posting leave:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error posting leaves',
    });
  }
});

export { _delete as default };
//# sourceMappingURL=delete.mjs.map
