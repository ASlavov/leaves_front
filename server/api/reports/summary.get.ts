import { defineEventHandler, getQuery, getHeader } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';
  const q = getQuery(event);
  const params = new URLSearchParams();
  if (q.year) params.set('year', String(q.year));
  if (Array.isArray(q.dept_ids)) q.dept_ids.forEach((d) => params.append('dept_ids[]', String(d)));
  if (Array.isArray(q.leave_type_ids))
    q.leave_type_ids.forEach((t) => params.append('leave_type_ids[]', String(t)));
  return await $fetch(
    `${config.public.apiBase}${config.public.reports.summary}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: cookieHeader,
        'X-CSRF-TOKEN': config.apiSecret,
      },
    },
  );
});
