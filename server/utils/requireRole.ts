import type { H3Event } from 'h3';

export async function requireRole(event: H3Event, allowedRoles: string[]) {
  const { token } = event.context;
  if (!token) {
    throw createError({ statusCode: 403, message: 'Unauthenticated' });
  }

  const config = useRuntimeConfig();

  const userProfile = await $fetch<any>(`${config.public.apiBase}${config.public.permissions.me}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userProfile?.roles?.length) {
    throw createError({ statusCode: 403, message: 'No roles found for user.' });
  }

  const userRoleNames: string[] = userProfile.roles.map((r: any) => r.name);
  const hasRole = userRoleNames.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    throw createError({
      statusCode: 403,
      message: `Forbidden. Required role: one of [${allowedRoles.join(', ')}].`,
    });
  }
}
