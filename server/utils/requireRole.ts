import { H3Event } from 'h3';

export async function requireRole(event: H3Event, allowedRoles: string[]) {
  const { token } = event.context;
  if (!token) {
    throw createError({
      statusCode: 403,
      message: 'Unauthenticated',
    });
  }

  const config = useRuntimeConfig();
  
  try {
    const userProfile = await $fetch<any>(`${config.public.apiBase}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!userProfile || !userProfile.roles) {
      throw createError({
        statusCode: 403,
        message: 'No roles found for user.',
      });
    }

    const userRoleNames = userProfile.roles.map((r: any) => r.name);
    
    // Check if any of the user's role names are in the allowedRoles array
    const hasRole = userRoleNames.some((role: string) => allowedRoles.includes(role));

    if (!hasRole) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden. User does not have the required role.',
      });
    }
  } catch (error) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden. Unable to verify user role.',
    });
  }
}
