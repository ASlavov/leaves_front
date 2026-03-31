import { defineNuxtPlugin } from '#app';
import Vue3Toastify, { toast as originalToast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify);

  // Create a wrapper around the original toast function
  const toast = new Proxy(originalToast, {
    get(target, prop) {
      // If the property is a function (e.g., 'error', 'success'), wrap it
      if (typeof target[prop] === 'function') {
        return (message, options = {}) => {
          // Get the current theme based on the 'dark' class
          const html = document.documentElement;
          const theme = html.classList.contains('dark') ? 'dark' : 'light';
          // Call the original method with the theme option
          return target[prop](message, { ...options, theme });
        };
      } else {
        // For other properties, return them as is
        return target[prop];
      }
    },
  });

  // Provide the wrapped toast function globally
  return {
    provide: { toast },
  };
});
