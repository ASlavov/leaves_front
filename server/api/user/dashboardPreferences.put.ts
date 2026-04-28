import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = event.context.token;

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody(event);

  try {
    const payload = {
      section_order: body?.sectionOrder,
      hidden_sections: body?.hiddenSections,
      leave_type_order: body?.leaveTypeOrder,
      hidden_leave_types: body?.hiddenLeaveTypes,
    };

    const response: any = await $fetch(`${config.public.apiBase}${config.public.user.dashboardPreferences}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    });

    return {
      sectionOrder: response?.section_order || body?.sectionOrder,
      hiddenSections: response?.hidden_sections || body?.hiddenSections,
      leaveTypeOrder: response?.leave_type_order || body?.leaveTypeOrder,
      hiddenLeaveTypes: response?.hidden_leave_types || body?.hiddenLeaveTypes,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || 'Failed to update dashboard preferences',
    });
  }
});
