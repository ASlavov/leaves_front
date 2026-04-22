// plugins/echo.client.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // @ts-ignore
  window.Pusher = Pusher;

  const echo = new Echo({
    broadcaster: 'reverb',
    key: config.public.reverbAppKey,
    wsHost: config.public.reverbHost,
    wsPort: config.public.reverbPort,
    wssPort: config.public.reverbPort,
    forceTLS: config.public.reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/api/broadcasting/auth',
  });

  return {
    provide: {
      echo,
    },
  };
});
