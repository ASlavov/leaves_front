import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
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
    const { userId, leaveTypeId, startDate, endDate, reason } = body;
    const response = await $fetch(`${config.public.apiBase}${config.public.leaves.newLeave}`, {
      method: 'POST',
      body: {
        id: userId,
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        requesting_user_id: requestingUserId,
      },
      headers: {
        Authorization: `Bearer ${token}`, // Use the token in the Authorization header
      },
    });
    return response;
  } catch (error: any) {
    throw proxyError(error);
  }
});
