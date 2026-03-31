import { _ as __nuxt_component_0 } from './nuxt-link-D1pWo-b1.mjs';
import { useSSRContext, mergeProps, withCtx, createTextVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'jsonwebtoken';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';
import 'deep-pick-omit';
import '@vue/shared';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(
    `<div${ssrRenderAttrs(mergeProps({ class: 'flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900' }, _attrs))}><div class="forgot-password w-full max-w-md p-4 bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70"><h2 class="text-2xl font-bold text-center text-gray-700 dark:text-gray-300 pb-10">\u039E\u03B5\u03C7\u03AC\u03C3\u03B1\u03C4\u03B5 \u03C4\u03BF\u03BD \u03BA\u03C9\u03B4\u03B9\u03BA\u03CC \u03C3\u03B1\u03C2;</h2><form class="space-y-6"><div><label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">\u0394\u03B9\u03B5\u03CD\u03B8\u03C5\u03BD\u03C3\u03B7 Email</label><input id="email" name="email" type="email" required class="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="\u0395\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03C4\u03BF email \u03C3\u03B1\u03C2" aria-describedby="email-error"><p id="email-error" class="text-sm text-red-600"></p></div><button type="submit" class="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none"> \u0391\u03A0\u039F\u03A3\u03A4\u039F\u039B\u0397 \u03A3\u03A5\u039D\u0394\u0395\u03A3\u039C\u039F\u03A5 </button></form><div class="mt-4 text-center">`,
  );
  _push(
    ssrRenderComponent(
      _component_NuxtLink,
      {
        to: '../auth/login',
        class: 'text-sm text-blue-700',
      },
      {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(
              `\u0395\u03C0\u03B9\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03C3\u03C4\u03B7\u03BD \u03B5\u03AF\u03C3\u03BF\u03B4\u03BF`,
            );
          } else {
            return [
              createTextVNode(
                '\u0395\u03C0\u03B9\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03C3\u03C4\u03B7\u03BD \u03B5\u03AF\u03C3\u03BF\u03B4\u03BF',
              ),
            ];
          }
        }),
        _: 1,
      },
      _parent,
    ),
  );
  _push(`</div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'pages/auth/forgot-password.vue',
  );
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const forgotPassword = /* @__PURE__ */ _export_sfc(_sfc_main, [['ssrRender', _sfc_ssrRender]]);

export { forgotPassword as default };
//# sourceMappingURL=forgot-password-ChO7P9kL.mjs.map
