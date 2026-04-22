import { defineEventHandler, readBody, createError } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const body = await readBody(event);
  const { notificationId } = body;

  try {
    // Use the token to make a GET request to the external API
    const res = await fetch(
      `${config.public.apiBase}${config.public.notifications.markedUnread}/${notificationId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Get the Content-Type header
    const contentType = res.headers.get('content-type') || '';

    // Check if the response is JSON
    if (!contentType.includes('application/json')) {
      return {
        statusCode: 403,
        statusMessage: 'Session invalid or expired',
      };
    }

    // Parse the JSON response
    const result = await res.json();

    const normaliseNotification = (raw: Record<string, any>) => {
      const payload = raw.data && typeof raw.data === 'object' ? raw.data : raw;
      return {
        id: raw.id,
        user_id: raw.user_id ?? raw.notifiable_id,
        type: payload.type ?? 'unknown',
        title: payload.title ?? '',
        message: payload.message ?? payload.type ?? '',
        meta: payload.meta ?? {},
        is_read: typeof raw.is_read === 'boolean' ? raw.is_read : raw.is_read === 1,
        created_at: raw.created_at ?? '',
      };
    };

    if (Array.isArray(result)) {
      return result.map(normaliseNotification);
    } else {
      return {
        statusCode: 500,
        statusMessage: 'Something went wrong',
      };
    }
  } catch (error: any) {
    // Handle errors from the external API
    console.error('Error fetching notifications:', error);

    // If the error has a statusCode, use it; otherwise, default to 500
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Error fetching notifications',
    });
  }
});
