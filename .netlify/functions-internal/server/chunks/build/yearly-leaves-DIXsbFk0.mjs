import { computed, resolveComponent, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { a as useCentralStore } from './server.mjs';
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
import 'vue-router';
import 'deep-pick-omit';
import '@vue/shared';

const _sfc_main = {
  __name: "yearly-leaves",
  __ssrInlineRender: true,
  setup(__props) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const leavesStore = centralStore.leavesStore;
    centralStore.authStore;
    computed(() => userStore.userId);
    computed(() => leavesStore.leavesData);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Sidebar = resolveComponent("Sidebar");
      const _component_YearlyLeaves = resolveComponent("YearlyLeaves", true);
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_Sidebar, null, null, _parent));
      _push(`<div class="w-full lg:ps-64 bg-red min-h-dvh-64 dark:bg-neutral-900"><div class="p-4 sm:p-6 space-y-4 sm:space-y-6">`);
      _push(ssrRenderComponent(_component_YearlyLeaves, null, null, _parent));
      _push(`</div></div><!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/yearly-leaves.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=yearly-leaves-DIXsbFk0.mjs.map
