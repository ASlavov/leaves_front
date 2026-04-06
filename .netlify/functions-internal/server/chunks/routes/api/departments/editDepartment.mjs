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

const editDepartment = defineEventHandler(async (event) => {
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
    const { groupId, groupName, head, members } = body;
    const response = await $fetch(
      `${config.public.apiBase}${config.public.departments.editDepartment}`,
      {
        method: 'PUT',
        body: {
          name: groupName,
          department_id: groupId,
          head,
          users: members,
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
    console.error('Error posting department:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error posting department',
    });
  }
});

export { editDepartment as default };
//# sourceMappingURL=editDepartment.mjs.map
