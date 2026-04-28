import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';
import { requireRole } from '~/server/utils/requireRole';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody(event);

  const { token } = event.context;
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }

  await requireRole(event, ['admin']);

  try {
    const response = await $fetch(`${config.public.apiBase}${config.public.admin.leave}`, {
      method: 'POST',
      body: {
        user_id: body.userId,
        leave_type_id: body.leaveTypeId,
        start_date: body.startDate,
        end_date: body.endDate,
        reason: body.reason,
        administrative_reason: body.administrativeReason,
        status: body.status,
        skip_wallet_deduction: body.skipWalletDeduction,
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
