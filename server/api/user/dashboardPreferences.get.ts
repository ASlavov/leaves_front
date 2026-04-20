import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = event.context.token;

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    const response: any = await $fetch(`${config.public.apiBase}/dashboard-preferences`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      sectionOrder: response?.section_order,
      hiddenSections: response?.hidden_sections,
      leaveTypeOrder: response?.leave_type_order,
      hiddenLeaveTypes: response?.hidden_leave_types,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || 'Failed to fetch dashboard preferences',
    });
  }
});
