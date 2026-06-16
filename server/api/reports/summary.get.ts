import { defineEventHandler, getQuery, getHeader } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';
  const q = getQuery(event);
  const params = new URLSearchParams();

  if (q.year) params.set('year', String(q.year));

  // Normalise to array regardless of whether single or multiple values were sent
  const toArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map(String);
    if (v !== undefined && v !== null && v !== '') return [String(v)];
    return [];
  };

  toArray(q.dept_ids).forEach((d) => params.append('dept_ids[]', d));
  toArray(q.leave_type_ids).forEach((t) => params.append('leave_type_ids[]', t));
  toArray(q.user_ids).forEach((u) => params.append('user_ids[]', u));

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
