import { d as defineEventHandler, e as useRuntimeConfig, r as readBody, h as createError } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const update = defineEventHandler(async (event) => {
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
      entitlementId,
      userId,
      leaveTypeId,
      entitledDays,
      year,
      startDate,
      endDate
    } = body;
    const response = await $fetch(`${config.public.apiBase}${config.public.entitlement.update}/${entitlementId}`, {
      method: "PUT",
      body: {
        id: entitlementId,
        user_id: userId,
        leave_type_id: leaveTypeId,
        entitled_days: entitledDays,
        year,
        start_from: startDate,
        end_to: endDate
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

export { update as default };
//# sourceMappingURL=update.mjs.map
