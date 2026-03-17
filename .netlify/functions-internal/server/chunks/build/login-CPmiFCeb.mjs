import { _ as __nuxt_component_0 } from './nuxt-link-D1pWo-b1.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderComponent } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { d as useAuthStore, e as useNotificationsStore, a as useCentralStore } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'deep-pick-omit';
import '@vue/shared';

const _sfc_main = {
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const email = ref("");
    const password = ref("");
    const rememberMe = ref(false);
    useRouter();
    const loading = ref(false);
    useAuthStore();
    useNotificationsStore();
    useCentralStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900" }, _attrs))}><div class="login w-full max-w-md p-4 bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70"><h2 class="text-2xl font-bold text-center text-gray-700 dark:text-gray-300 pb-10">\u03A3\u03CD\u03BD\u03B4\u03B5\u03C3\u03B7</h2><form class="space-y-6"><div><label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\u0394\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 Email</label><input${ssrRenderAttr("value", email.value)} id="email" name="email" type="email" required class="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Enter your email"></div><div><label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\u039A\u03C9\u03B4\u03B9\u03BA\u03CC\u03C2</label><div class="relative"><input${ssrRenderAttr("value", password.value)} name="password" type="password" id="password" class="py-3 px-4 block w-full border-gray-200 border pe-10 rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Enter your password" value><button type="button" class="group absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500"><svg class="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="group-[.open]:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path class="group-[.open]:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path class="group-[.open]:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line class="group-[.open]:hidden" x1="2" x2="22" y1="2" y2="22"></line><path class="hidden group-[.open]:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle class="hidden group-[.open]:block" cx="12" cy="12" r="3"></circle></svg></button></div></div><div class="flex items-center justify-between"><label class="flex items-center"><input${ssrIncludeBooleanAttr(Array.isArray(rememberMe.value) ? ssrLooseContain(rememberMe.value, null) : rememberMe.value) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"><span class="ml-2 text-sm text-gray-700 dark:text-gray-300">\u039D\u03B1 \u03BC\u03B5 \u03B8\u03C5\u03BC\u03AC\u03C3\u03B1\u03B9</span></label>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "../auth/forgot-password",
        class: "text-sm text-blue-700"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u039E\u03AD\u03C7\u03B1\u03C3\u03B1 \u03C4\u03BF\u03BD \u03BA\u03C9\u03B4\u03B9\u03BA\u03CC \u03BC\u03BF\u03C5`);
          } else {
            return [
              createTextVNode("\u039E\u03AD\u03C7\u03B1\u03C3\u03B1 \u03C4\u03BF\u03BD \u03BA\u03C9\u03B4\u03B9\u03BA\u03CC \u03BC\u03BF\u03C5")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (loading.value) {
        _push(`<div class="bg-red-600 w-full rounded-full h-2 animate-loading-bar"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit" class="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none"> \u03A3\u03A5\u039D\u0394\u0395\u03A3\u0397 </button></form></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-CPmiFCeb.mjs.map
