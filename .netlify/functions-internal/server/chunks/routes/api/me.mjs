import { d as defineEventHandler, k as setHeader, h as createError } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const me = defineEventHandler(async (event) => {
  setHeader(event, 'Access-Control-Allow-Origin', '*');
  const { requestingUserId, token } = event.context;
  if (!requestingUserId || !token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }
  return {
    userId: requestingUserId,
  };
});

export { me as default };
//# sourceMappingURL=me.mjs.map
