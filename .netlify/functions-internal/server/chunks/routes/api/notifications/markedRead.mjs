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

const markedRead = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { requestingUserId, token } = event.context;
  const body = await readBody(event);
  const { notificationId } = body;
  try {
    const res = await fetch(
      `${config.public.apiBase}${config.public.notifications.markedRead}/${notificationId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        statusCode: 403,
        statusMessage: 'Session invalid or expired',
      };
    }
    const data = await res.json();
    if (data) {
      return data;
    } else {
      return {
        statusCode: 500,
        statusMessage: 'Something went wrong',
      };
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Error fetching notifications',
    });
  }
});

export { markedRead as default };
//# sourceMappingURL=markedRead.mjs.map
