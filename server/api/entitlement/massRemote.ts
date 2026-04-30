import { defineEventHandler, readBody, getHeader } from 'h3'; // Import cookie helper from h3
import { useRuntimeConfig } from '#imports'; // Runtime config to access the base API URLs
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody(event);

  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not authenticated',
    });
  }

  try {
    const { userIds, leaveTypeId, entitledDays, year, startDate, endDate } = body;
    console.log(body);
    const response = await $fetch(
      `${config.public.apiBase}${config.public.entitlement.massRemote}`,
      {
        method: 'POST',
        body: {
          userIds: userIds,
          leave_type_id: leaveTypeId,
          entitled_days: entitledDays,
          year,
          startDate,
          endDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: cookieHeader, // Use the token in the Authorization header
        },
      },
    );
    console.log(response);

    return response; // Return the response from the external API
  } catch (error: any) {
    throw proxyError(error);
  }
});
