import { defineEventHandler, getRouterParam, setResponseHeader, getHeader } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const id = getRouterParam(event, 'id');
  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const response = await $fetch.raw(
      `${config.public.apiBase}${config.public.documents.base}/${id}/download`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
        responseType: 'arrayBuffer',
      },
    );

    const headers = new Headers(response.headers);
    if (headers.has('content-type')) {
      setResponseHeader(event, 'content-type', headers.get('content-type')!);
    }
    if (headers.has('content-disposition')) {
      setResponseHeader(event, 'content-disposition', headers.get('content-disposition')!);
    }

    return response._data;
  } catch (error: any) {
    console.error('Error downloading document:', error);
    throw createError({ statusCode: error?.status ?? 500, statusMessage: error?.data?.error ?? 'Error downloading document' });
  }
});
