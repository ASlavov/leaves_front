import { defineEventHandler, getQuery, getHeader } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';
  const q = getQuery(event);

  const params = new URLSearchParams();
  if (q.year) params.set('year', String(q.year));

  const userIds = Array.isArray(q.user_ids) ? q.user_ids : q.user_ids ? [q.user_ids] : [];
  userIds.forEach((u) => params.append('user_ids[]', String(u)));

  const typeIds = Array.isArray(q.leave_type_ids)
    ? q.leave_type_ids
    : q.leave_type_ids
      ? [q.leave_type_ids]
      : [];
  typeIds.forEach((t) => params.append('leave_type_ids[]', String(t)));

  try {
    return await $fetch(
      `${config.public.apiBase}${config.public.reports.leaveBalances}?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: cookieHeader,
          'X-CSRF-TOKEN': config.apiSecret,
        },
      },
    );
  } catch (error: any) {
    const status = error?.response?.status ?? error?.status ?? 500;
    throw createError({
      statusCode: status,
      statusMessage: error?.data?.message ?? error?.message ?? 'Failed to fetch leave balances',
    });
  }
});
