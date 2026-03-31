import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { token } = event.context;

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const { leaveTypeId, year, userIds, dryRun, force } = body;

    const response = await $fetch(
      `${config.public.apiBase}${config.public.entitlement.massDelete}`,
      {
        method: 'POST',
        body: {
          leave_type_id: leaveTypeId,
          year,
          user_ids: userIds?.length ? userIds : undefined,
          dry_run: dryRun ?? true,
          force: force ?? false,
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return response;
  } catch (error: any) {
    throw proxyError(error);
  }
});
