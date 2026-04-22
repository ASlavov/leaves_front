import { defineEventHandler, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const q = getQuery(event);
  const params = new URLSearchParams();
  if (q.year) params.set('year', String(q.year));
  if (Array.isArray(q.dept_ids)) q.dept_ids.forEach((d) => params.append('dept_ids[]', String(d)));
  if (Array.isArray(q.leave_type_ids))
    q.leave_type_ids.forEach((t) => params.append('leave_type_ids[]', String(t)));
  return await $fetch(`${config.public.apiBase}/reports/summary?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-CSRF-TOKEN': config.apiSecret,
    },
  });
});
