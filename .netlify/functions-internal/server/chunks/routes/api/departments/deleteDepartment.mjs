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

const deleteDepartment = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { requestingUserId, token } = event.context;
  try {
    const { department_id } = body;
    const response = await $fetch(
      `${config.public.apiBase}${config.public.departments.deleteDepartment}/${department_id}`,
      {
        method: 'DELETE',
        body: {
          requesting_user_id: requestingUserId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          // Use the token in the Authorization header
        },
      },
    );
    return response;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting department',
    });
  }
});

export { deleteDepartment as default };
//# sourceMappingURL=deleteDepartment.mjs.map
