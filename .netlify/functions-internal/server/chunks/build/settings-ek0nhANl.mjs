import {
  computed,
  ref,
  watch,
  createVNode,
  resolveDynamicComponent,
  mergeProps,
  unref,
  withCtx,
  createBlock,
  createTextVNode,
  openBlock,
  useSSRContext,
} from 'vue';
import {
  ssrRenderComponent,
  ssrRenderList,
  ssrRenderClass,
  ssrRenderAttr,
  ssrInterpolate,
  ssrRenderVNode,
  ssrRenderAttrs,
  ssrRenderStyle,
  ssrIncludeBooleanAttr,
} from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { a as useCentralStore, c as usePermissionsStore, b as useNuxtApp } from './server.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-D1pWo-b1.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { C as CustomSelect } from './CustomSelect-ByDE1w8p.mjs';
import { C as CustomMultiSelect } from './CustomMultiSelect-sNpAiUjq.mjs';
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
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
import '@vueuse/core';

const _sfc_main$h = {
  __name: 'Search',
  __ssrInlineRender: true,
  setup(__props) {
    const searchQuery = ref('');
    const showModal = ref(false);
    const showDropdownVar = ref(false);
    const selectedUser = ref(null);
    const currentIndex = ref(0);
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const allUsers = computed(() => userStore.allUsers || []);
    const items = ref([]);
    watch(
      allUsers,
      (newVal) => {
        items.value = newVal;
      },
      { immediate: true },
    );
    const showDropdown = computed(() => showDropdownVar.value);
    const filteredResults = computed(() => {
      if (searchQuery.value === '') {
        return items.value;
      }
      return items.value.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.department.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      );
    });
    const groupedResults = computed(() => {
      return filteredResults.value.reduce((acc, item) => {
        var _a;
        const departmentName = ((_a = item.department) == null ? void 0 : _a.name) || 'Unknown';
        if (!acc[departmentName]) {
          acc[departmentName] = [];
        }
        acc[departmentName].push(item);
        return acc;
      }, {});
    });
    const hasMultipleUsers = computed(() => filteredResults.value.length > 1);
    const hasNext = computed(() => currentIndex.value < filteredResults.value.length - 1);
    const hasPrevious = computed(() => currentIndex.value > 0);
    const firstName = computed(() => {
      var _a, _b;
      return (
        ((_b = (_a = selectedUser.value) == null ? void 0 : _a.name) == null
          ? void 0
          : _b.split(' ')[0]) || ''
      );
    });
    const lastName = computed(() => {
      var _a, _b;
      return (
        ((_b = (_a = selectedUser.value) == null ? void 0 : _a.name) == null
          ? void 0
          : _b.split(' ').slice(1).join(' ')) || ''
      );
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      _push(
        `<div${ssrRenderAttrs(mergeProps({ class: 'relative w-full max-w-[600px] ms-auto' }, _attrs))}><div class="relative"><div class="relative"><div class="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5"><svg class="shrink-0 size-4 text-gray-400 dark:text-white/60" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></div><textarea class="resize-none py-3 ps-10 pe-4 block w-full border border-gray-100 rounded-lg text-sm focus:outline-gray-200 dark:bg-neutral-800 dark:text-gray-100" type="text" rows="1" placeholder="\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03C7\u03C1\u03AE\u03C3\u03C4\u03B7..." autocomplete="off">${ssrInterpolate(searchQuery.value)}</textarea></div><div class="absolute z-50 w-full bg-white border border-gray-200 mt-2" style="${ssrRenderStyle(showDropdown.value ? null : { display: 'none' })}"><div class="max-h-72 rounded-b-lg overflow-hidden overflow-y-auto"><!--[-->`,
      );
      ssrRenderList(groupedResults.value, (items2, category) => {
        _push(
          `<div><div class="px-4 py-2 bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200 font-semibold">${ssrInterpolate(category)}</div><!--[-->`,
        );
        ssrRenderList(items2, (item) => {
          _push(
            `<div class="flex items-center cursor-pointer py-2 px-4 w-full text-sm text-gray-800 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200"><div>${ssrInterpolate(item.name)}</div></div>`,
          );
        });
        _push(`<!--]--></div>`);
      });
      _push(`<!--]--></div></div></div>`);
      if (showModal.value) {
        _push(
          `<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div class="bg-white dark:bg-neutral-800 dark:text-white p-6 rounded-lg w-full max-w-md relative"><button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><svg class="hover:stroke-gray-500 dark:hover:stroke-gray-100 dark:stroke-gray-500" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="black"><path d="M1 16L16 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 16L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button><h2 class="text-lg font-bold mb-4">\u03A0\u03BB\u03B7\u03C1\u03BF\u03C6\u03BF\u03C1\u03AF\u03B5\u03C2 \u03C7\u03C1\u03AE\u03C3\u03C4\u03B7</h2><div class="pt-4 space-y-2"><div><span class="font-bold">\u038C\u03BD\u03BF\u03BC\u03B1: </span><span class="text-gray-500">${ssrInterpolate(firstName.value)}</span></div><div><span class="font-bold">\u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF: </span><span class="text-gray-500">${ssrInterpolate(lastName.value)}</span></div><div><span class="font-bold">\u03A4\u03AF\u03C4\u03BB\u03BF\u03C2: </span><span class="text-gray-500">${ssrInterpolate((_b = (_a = selectedUser.value) == null ? void 0 : _a.profile) == null ? void 0 : _b.job_title)}</span></div><div><span class="font-bold">Email: </span><span class="text-gray-500">${ssrInterpolate((_c = selectedUser.value) == null ? void 0 : _c.email)}</span></div><div><span class="font-bold">\u039A\u03B9\u03BD\u03B7\u03C4\u03CC: </span><span class="text-gray-500">${ssrInterpolate((_e = (_d = selectedUser.value) == null ? void 0 : _d.profile) == null ? void 0 : _e.phone)}</span></div><div><span class="font-bold">\u0395\u03C3\u03C9\u03C4. \u03A4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF: </span><span class="text-gray-500">${ssrInterpolate((_g = (_f = selectedUser.value) == null ? void 0 : _f.profile) == null ? void 0 : _g.internal_phone)}</span></div><div><span class="font-bold">\u0393\u03BA\u03C1\u03BF\u03C5\u03C0: </span><span class="text-gray-500">${ssrInterpolate((_i = (_h = selectedUser.value) == null ? void 0 : _h.department) == null ? void 0 : _i.name)}</span></div></div>`,
        );
        if (hasMultipleUsers.value) {
          _push(
            `<div class="mt-4 flex justify-between"><button class="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 dark:bg-neutral-600 dark:hover:bg-neutral-500"${ssrIncludeBooleanAttr(!hasPrevious.value) ? ' disabled' : ''}> \u2190 </button><button class="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 dark:bg-neutral-600 dark:hover:bg-neutral-500"${ssrIncludeBooleanAttr(!hasNext.value) ? ' disabled' : ''}> \u2192 </button></div>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  },
};
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/SidebarTopbar/Search.vue',
  );
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const _sfc_main$g = {
  __name: 'MyAccount',
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const user = computed(() => {
      var _a;
      const userInfo = userStore.userInfo;
      const nameSplit =
        ((_a = userInfo == null ? void 0 : userInfo.name) == null
          ? void 0
          : _a.trim().split(' ')) || [];
      const firstName =
        (nameSplit == null ? void 0 : nameSplit.slice(0, -1).join(' ')) || nameSplit[0];
      const lastName =
        nameSplit.length > 1
          ? (nameSplit == null ? void 0 : nameSplit.slice(-1).join(' ')) || ''
          : '';
      const firstNameInitial = (firstName == null ? void 0 : firstName.charAt(0)) || '';
      const lastNameInitial = (lastName == null ? void 0 : lastName.charAt(0)) || '';
      return {
        ...userInfo,
        firstName,
        lastName,
        firstNameInitial,
        lastNameInitial,
      };
    });
    const userEmail = computed(() => {
      var _a;
      return (_a = userStore.userInfo) == null ? void 0 : _a.email;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      _push(
        `<div${ssrRenderAttrs(mergeProps({ class: 'hs-dropdown [--placement:bottom-right] relative' }, _attrs))}><button id="hs-dropdown-account" type="button" class="border-0 size-[38px] justify-center bg-gray-300 items-center gap-x-2 text-sm font-semibold rounded-full border-transparent text-gray-800 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-white" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">`,
      );
      if (
        (_b = (_a = user.value) == null ? void 0 : _a.profile) == null
          ? void 0
          : _b.profile_image_base64
      ) {
        _push(
          `<img class="rounded-full size-[38px] object-cover"${ssrRenderAttr('src', (_d = (_c = user.value) == null ? void 0 : _c.profile) == null ? void 0 : _d.profile_image_base64)}>`,
        );
      } else {
        _push(
          `<span class="text-white font-bold">${ssrInterpolate(((_e = user.value) == null ? void 0 : _e.firstNameInitial) || '')}${ssrInterpolate(((_f = user.value) == null ? void 0 : _f.lastNameInitial) || '')}</span>`,
        );
      }
      _push(
        `</button><div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700 dark:divide-neutral-700 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full" role="menu" aria-orientation="vertical" aria-labelledby="hs-dropdown-account"><div class="py-3 px-5 bg-gray-100 rounded-t-lg dark:bg-neutral-700"><p class="text-sm text-gray-500 dark:text-neutral-500">Signed in as</p><p class="text-sm font-medium text-gray-800 dark:text-neutral-200">${ssrInterpolate(userEmail.value)}</p></div><div class="p-1.5 space-y-0.5"><a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300" href="settings#edit-profile"><svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg> \u0395\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u03C0\u03C1\u03BF\u03C6\u03AF\u03BB </a><a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300" href="settings#permissions"><svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg> \u0394\u03B9\u03BA\u03B1\u03B9\u03CE\u03BC\u03B1\u03C4\u03B1 </a><a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300" href="settings#security"><svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg> \u0391\u03C3\u03C6\u03AC\u03BB\u03B5\u03B9\u03B1 </a><button type="button" class="w-full justify-center rounded-full py-2 px-4 inline-flex items-center gap-x-2 text-sm font-medium border border-gray-800 text-gray-800 hover:border-gray-500 hover:text-gray-500 focus:outline-none focus:border-gray-500 focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none dark:border-white dark:text-white dark:hover:text-neutral-300 dark:hover:border-neutral-300"> Logout </button></div></div></div>`,
      );
    };
  },
};
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/SidebarTopbar/MyAccount.vue',
  );
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const _sfc_main$f = {
  name: 'SidebarMenu',
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(
    `<div${ssrRenderAttrs(mergeProps({ class: 'h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500' }, _attrs))}><nav class="hs-accordion-group p-3 w-full flex flex-col flex-wrap" data-hs-accordion-always-open><ul class="flex flex-col space-y-3"><li>`,
  );
  _push(
    ssrRenderComponent(
      _component_NuxtLink,
      {
        class:
          'flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white',
        to: '/home',
      },
      {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(
              `<svg class="" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${_scopeId}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"${_scopeId}></path><polyline points="9 22 9 12 15 12 15 22"${_scopeId}></polyline></svg> \u03A0\u03C1\u03BF\u03C6\u03AF\u03BB `,
            );
          } else {
            return [
              (openBlock(),
              createBlock(
                'svg',
                {
                  class: '',
                  xmlns: 'http://www.w3.org/2000/svg',
                  width: '20',
                  height: '20',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '2',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                },
                [
                  createVNode('path', { d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
                  createVNode('polyline', { points: '9 22 9 12 15 12 15 22' }),
                ],
              )),
              createTextVNode(' \u03A0\u03C1\u03BF\u03C6\u03AF\u03BB '),
            ];
          }
        }),
        _: 1,
      },
      _parent,
    ),
  );
  _push(`</li><li>`);
  _push(
    ssrRenderComponent(
      _component_NuxtLink,
      {
        class:
          'flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white',
        to: '/calendar',
      },
      {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(
              `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"${_scopeId}><path d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="#fff" stroke-width="2" stroke-linecap="round"${_scopeId}></path></svg> \u0397\u03BC\u03B5\u03C1\u03BF\u03BB\u03CC\u03B3\u03B9\u03BF `,
            );
          } else {
            return [
              (openBlock(),
              createBlock(
                'svg',
                {
                  xmlns: 'http://www.w3.org/2000/svg',
                  width: '20',
                  height: '20',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                },
                [
                  createVNode('path', {
                    d: 'M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z',
                    stroke: '#fff',
                    'stroke-width': '2',
                    'stroke-linecap': 'round',
                  }),
                ],
              )),
              createTextVNode(' \u0397\u03BC\u03B5\u03C1\u03BF\u03BB\u03CC\u03B3\u03B9\u03BF '),
            ];
          }
        }),
        _: 1,
      },
      _parent,
    ),
  );
  _push(`</li><li>`);
  _push(
    ssrRenderComponent(
      _component_NuxtLink,
      {
        class:
          'flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white',
        to: '/settings',
      },
      {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(
              `<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none"${_scopeId}><path stroke="#fff" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"${_scopeId}></path><path stroke="#fff" stroke-linejoin="round" stroke-width="2" d="M10.47 4.32c.602-1.306 2.458-1.306 3.06 0l.218.473a1.684 1.684 0 0 0 2.112.875l.49-.18c1.348-.498 2.66.814 2.162 2.163l-.18.489a1.684 1.684 0 0 0 .875 2.112l.474.218c1.305.602 1.305 2.458 0 3.06l-.474.218a1.684 1.684 0 0 0-.875 2.112l.18.49c.498 1.348-.814 2.66-2.163 2.162l-.489-.18a1.684 1.684 0 0 0-2.112.875l-.218.473c-.602 1.306-2.458 1.306-3.06 0l-.218-.473a1.684 1.684 0 0 0-2.112-.875l-.49.18c-1.348.498-2.66-.814-2.163-2.163l.181-.489a1.684 1.684 0 0 0-.875-2.112l-.474-.218c-1.305-.602-1.305-2.458 0-3.06l.474-.218a1.684 1.684 0 0 0 .875-2.112l-.18-.49c-.498-1.348.814-2.66 2.163-2.163l.489.181a1.684 1.684 0 0 0 2.112-.875l.218-.474Z"${_scopeId}></path></svg> \u03A1\u03C5\u03B8\u03BC\u03AF\u03C3\u03B5\u03B9\u03C2 `,
            );
          } else {
            return [
              (openBlock(),
              createBlock(
                'svg',
                {
                  xmlns: 'http://www.w3.org/2000/svg',
                  width: '20px',
                  height: '20px',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                },
                [
                  createVNode('path', {
                    stroke: '#fff',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    d: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
                  }),
                  createVNode('path', {
                    stroke: '#fff',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    d: 'M10.47 4.32c.602-1.306 2.458-1.306 3.06 0l.218.473a1.684 1.684 0 0 0 2.112.875l.49-.18c1.348-.498 2.66.814 2.162 2.163l-.18.489a1.684 1.684 0 0 0 .875 2.112l.474.218c1.305.602 1.305 2.458 0 3.06l-.474.218a1.684 1.684 0 0 0-.875 2.112l.18.49c.498 1.348-.814 2.66-2.163 2.162l-.489-.18a1.684 1.684 0 0 0-2.112.875l-.218.473c-.602 1.306-2.458 1.306-3.06 0l-.218-.473a1.684 1.684 0 0 0-2.112-.875l-.49.18c-1.348.498-2.66-.814-2.163-2.163l.181-.489a1.684 1.684 0 0 0-.875-2.112l-.474-.218c-1.305-.602-1.305-2.458 0-3.06l.474-.218a1.684 1.684 0 0 0 .875-2.112l-.18-.49c-.498-1.348.814-2.66 2.163-2.163l.489.181a1.684 1.684 0 0 0 2.112-.875l.218-.474Z',
                  }),
                ],
              )),
              createTextVNode(' \u03A1\u03C5\u03B8\u03BC\u03AF\u03C3\u03B5\u03B9\u03C2 '),
            ];
          }
        }),
        _: 1,
      },
      _parent,
    ),
  );
  _push(`</li></ul></nav></div>`);
}
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/SidebarTopbar/SidebarMenu.vue',
  );
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const SidebarMenu = /* @__PURE__ */ _export_sfc(_sfc_main$f, [['ssrRender', _sfc_ssrRender$1]]);
const __default__ = {
  name: 'UserNotification',
};
const _sfc_main$e = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    const theme = computed(() => {
      const { $colorMode } = useNuxtApp();
      return ($colorMode == null ? void 0 : $colorMode.value) || 'light';
    });
    useRouter();
    const { notificationsStore } = useCentralStore();
    const notifications = computed(() => notificationsStore.notificationsData);
    const showNotifications = ref(false);
    const dropdownContainer = ref(null);
    const activeTab = ref('unread');
    const handleClickOutside = (event) => {
      if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
        showNotifications.value = false;
      }
    };
    const filteredNotifications = computed(() => {
      if (notifications.value.message) {
        return [
          {
            id: 0,
            message: notifications.value.message,
            title: '',
          },
        ];
      }
      if (activeTab.value === 'unread') {
        return notifications.value.filter((notification) => notification.is_read === 0);
      } else {
        return notifications.value.filter((notification) => notification.is_read === 1);
      }
    });
    watch(showNotifications, (newVal) => {
      if (newVal) {
        (void 0).addEventListener('click', handleClickOutside);
      } else {
        (void 0).removeEventListener('click', handleClickOutside);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(
        `<div${ssrRenderAttrs(
          mergeProps(
            {
              class: 'relative',
              ref_key: 'dropdownContainer',
              ref: dropdownContainer,
            },
            _attrs,
          ),
        )}><button type="button" class="size-[38px] relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"><svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg><span class="sr-only">Notifications</span></button>`,
      );
      if (showNotifications.value) {
        _push(
          `<div class="fixed top-[60px] right-0 h-full w-80 bg-white border border-gray-200 shadow-lg dark:bg-neutral-800 dark:border-neutral-600 overflow-y-auto"><div class="${ssrRenderClass(`flex justify-around py-2 border-b dark:border-neutral-600 ${theme.value === 'light' ? 'text-black' : 'text-white'}`)}"><button class="${ssrRenderClass({ 'font-semibold': activeTab.value === 'unread' })}"> Unread </button><button class="${ssrRenderClass({ 'font-semibold': activeTab.value === 'read' })}"> Read </button></div><ul class="divide-y divide-gray-200 dark:divide-neutral-600"><!--[-->`,
        );
        ssrRenderList(filteredNotifications.value, (notification) => {
          _push(
            `<li class="p-4 text-sm text-gray-700 dark:text-gray-300 opacity-90 hover:opacity-100 cursor-pointer hover:shadow"><div class="notification-title font-semibold">${ssrInterpolate(notification.title)}</div><div class="notification-message mt-1">${ssrInterpolate(notification.message)}</div></li>`,
          );
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  },
});
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/SidebarTopbar/UserNotification.vue',
  );
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const _sfc_main$d = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(
    `<div${ssrRenderAttrs(mergeProps({ class: 'flex' }, _attrs))} data-v-b8e7af12><div class="relative inline-block w-12 h-6 cursor-pointer" data-v-b8e7af12><span class="${ssrRenderClass([_ctx.$colorMode.preference === 'dark' ? 'bg-gray-600' : 'bg-gray-100', 'absolute inset-0 rounded-full transition duration-300 ease-in-out'])}" data-v-b8e7af12>`,
  );
  if (_ctx.$colorMode.preference === 'dark') {
    _push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon px-1" data-v-b8e7af12><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" data-v-b8e7af12></path></svg>`,
    );
  } else {
    _push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun px-1 ml-[23px]" data-v-b8e7af12><circle cx="12" cy="12" r="5" data-v-b8e7af12></circle><line x1="12" y1="1" x2="12" y2="3" data-v-b8e7af12></line><line x1="12" y1="21" x2="12" y2="23" data-v-b8e7af12></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" data-v-b8e7af12></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" data-v-b8e7af12></line><line x1="1" y1="12" x2="3" y2="12" data-v-b8e7af12></line><line x1="21" y1="12" x2="23" y2="12" data-v-b8e7af12></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" data-v-b8e7af12></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" data-v-b8e7af12></line></svg>`,
    );
  }
  _push(
    `</span><span class="${ssrRenderClass([_ctx.$colorMode.preference === 'dark' ? 'translate-x-6 bg-gray-100' : 'translate-x-0 bg-gray-600', 'absolute left-0 top-0 w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow'])}" data-v-b8e7af12></span></div></div>`,
  );
}
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/SidebarTopbar/ColorModeSwitcher.vue',
  );
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const ColorModeSwitcher = /* @__PURE__ */ _export_sfc(_sfc_main$d, [
  ['ssrRender', _sfc_ssrRender],
  ['__scopeId', 'data-v-b8e7af12'],
]);
const _sfc_main$c = {
  __name: 'Sidebar',
  __ssrInlineRender: true,
  setup(__props) {
    const { notificationsStore } = useCentralStore();
    const theme = computed(() => {
      const { $colorMode } = useNuxtApp();
      return ($colorMode == null ? void 0 : $colorMode.value) || 'light';
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(
        `<!--[--><header class="duration-300 sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-[48] w-full bg-white border-b text-sm py-2.5 lg:ps-[260px] dark:bg-neutral-800 dark:border-neutral-700"><nav class="px-4 sm:px-6 flex basis-full items-center w-full mx-auto"><div class="w-full flex items-center justify-end ms-auto md:justify-between gap-x-1 md:gap-x-3">`,
      );
      _push(ssrRenderComponent(_sfc_main$h, null, null, _parent));
      _push(`<div class="flex flex-row items-center justify-end gap-1">`);
      _push(ssrRenderComponent(ColorModeSwitcher, null, null, _parent));
      _push(ssrRenderComponent(_sfc_main$e, null, null, _parent));
      _push(ssrRenderComponent(_sfc_main$g, null, null, _parent));
      _push(
        `</div></div></nav></header><div class="-mt-px"><div class="sticky top-0 inset-x-0 z-20 bg-white border-y px-4 sm:px-6 lg:px-8 lg:hidden dark:bg-neutral-800 dark:border-neutral-700"><div class="flex items-center py-2"><button type="button" class="size-8 flex justify-center items-center gap-x-2 border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg focus:outline-none focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500" aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-application-sidebar" aria-label="Toggle navigation" data-hs-overlay="#hs-application-sidebar"><span class="sr-only">Toggle Navigation</span><svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M15 3v18"></path><path d="m8 9 3 3-3 3"></path></svg></button><ol class="ms-3 flex items-center whitespace-nowrap"><li class="flex items-center text-sm text-gray-800 dark:text-neutral-400"> Menu <svg class="shrink-0 mx-3 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg></li></ol></div></div></div><div id="hs-application-sidebar" class="hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform w-[260px] h-full hidden fixed inset-y-0 start-0 z-[60] bg-white border-e border-gray-200 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 dark:bg-neutral-800 dark:border-neutral-700" role="dialog" tabindex="-1" aria-label="Sidebar"><div class="relative flex flex-col h-full max-h-full"><div class="px-6 pt-4"><a class="flex-none rounded-xl text-xl inline-block font-semibold focus:outline-none focus:opacity-80 mb-10" href="/home" aria-label="WHY"><img${ssrRenderAttr('src', `https://whyagency.gr/wp-content/uploads/2023/10/${unref(theme) === 'light' ? 'logo_dark' : 'logo'}.png`)} width="130"></a></div>`,
      );
      _push(ssrRenderComponent(SidebarMenu, null, null, _parent));
      _push(`</div></div><!--]-->`);
    };
  },
};
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/SidebarTopbar/Sidebar.vue',
  );
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const _sfc_main$b = {
  __name: 'EditUser',
  __ssrInlineRender: true,
  props: {
    userId: {
      type: [Number, String, null],
      required: false,
    },
  },
  setup(__props) {
    useRouter();
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const departmentsStore = centralStore.departmentsStore;
    const permissionsStore = centralStore.permissionsStore;
    const { $toast } = useNuxtApp();
    const loading = computed(() => userStore && userStore.loading);
    const props = __props;
    const canEdit = computed(() => {
      return permissionsStore.can('all_users', 'modify');
    });
    ref(null);
    const formFirstName = ref('');
    const formLastName = ref('');
    const formEmail = ref('');
    const formImage = ref('');
    const formTitle = ref('');
    const formPhone = ref('');
    const formRole = ref('');
    const formInternalPhone = ref('');
    const formTitleDescription = ref('');
    const formPhoto = ref('');
    const firstNameInitial = computed(() => formFirstName.value.charAt(0) || '');
    const lastNameInitial = computed(() => formLastName.value.charAt(0) || '');
    const userPhoto = computed(() => formPhoto.value);
    watch(
      () => props.userId,
      () => {
        if (centralStore.initialized) {
          fetchUserData();
        }
      },
    );
    async function fetchUserData() {
      try {
        if (props.userId) {
          const newUserInfo = await userStore.loadUserProfileById(props.userId);
          if (newUserInfo) {
            initializeFormFields(newUserInfo);
          }
        } else {
        }
      } catch (error) {
        $toast.error('Error fetching user data.', {
          position: 'bottom-right',
          autoClose: 5e3,
        });
      }
    }
    function initializeFormFields(userInfo) {
      var _a, _b, _c, _d, _e, _f;
      const userName = userInfo.name || '';
      const nameParts = userName.split(' ');
      formFirstName.value = nameParts[0] || '';
      formLastName.value = nameParts.slice(1).join(' ') || '';
      formEmail.value = userInfo.email || '';
      formImage.value = '';
      formTitle.value = ((_a = userInfo.profile) == null ? void 0 : _a.job_title) || '';
      formPhone.value = ((_b = userInfo.profile) == null ? void 0 : _b.phone) || '';
      formRole.value = (userInfo == null ? void 0 : userInfo.roles[0].id) || '4';
      formInternalPhone.value =
        ((_c = userInfo.profile) == null ? void 0 : _c.internal_phone) || '';
      formTitleDescription.value =
        ((_d = userInfo.profile) == null ? void 0 : _d.title_description) || '';
      formSelectedDepartmentId.value = String(
        ((_e = userInfo.department) == null ? void 0 : _e.id) || '',
      );
      formPhoto.value =
        ((_f = userInfo.profile) == null ? void 0 : _f.profile_image_base64) || null;
    }
    const formSelectedDepartmentId = ref(null);
    const departments = computed(() => departmentsStore.departmentsData);
    const roles = computed(() => {
      return [
        {
          name: 'admin',
          id: 1,
        },
        {
          name: 'hr-manager',
          id: 2,
        },
        {
          name: 'head',
          id: 3,
        },
        {
          name: 'user',
          id: 4,
        },
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(
        `<div${ssrRenderAttrs(mergeProps({ class: 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100' }, _attrs))} data-v-67eba859><div class="flex-1" data-v-67eba859>`,
      );
      if (loading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]" data-v-67eba859><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse" data-v-67eba859></div><div class="pt-4 space-y-2 col-span-10 animate-pulse" data-v-67eba859><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700" data-v-67eba859></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700" data-v-67eba859></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700" data-v-67eba859></p><p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-neutral-700" data-v-67eba859></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700" data-v-67eba859></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700" data-v-67eba859></p><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700" data-v-67eba859></p></div></div>`,
        );
      } else {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]" data-v-67eba859><div class="relative w-[132px] h-[132px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-2" data-v-67eba859>`,
        );
        if (userPhoto.value) {
          _push(
            `<img class="cursor-pointer inline-block w-[132px] h-[132px] rounded-full object-cover"${ssrRenderAttr('src', userPhoto.value)} alt="Avatar" data-v-67eba859>`,
          );
        } else {
          _push(
            `<span class="text-white font-bold" data-v-67eba859>${ssrInterpolate(firstNameInitial.value)}${ssrInterpolate(lastNameInitial.value)}</span>`,
          );
        }
        _push(
          `<button class="absolute bottom-1 right-1 transform bg-[#EA021A] rounded-full p-2" data-v-67eba859><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" data-v-67eba859><g clip-path="url(#clip0_811_2144)" data-v-67eba859><path d="M14.5872 4.16284L13.2366 5.51343C13.0989 5.65112 12.8763 5.65112 12.7386 5.51343L9.48661 2.26147C9.34892 2.12378 9.34892 1.90112 9.48661 1.76343L10.8372 0.412842C11.385 -0.13501 12.2757 -0.13501 12.8265 0.412842L14.5872 2.17358C15.138 2.72144 15.138 3.61206 14.5872 4.16284ZM8.32646 2.92358L0.633095 10.6169L0.0120011 14.1765C-0.0729598 14.657 0.345986 15.073 0.826454 14.991L4.38602 14.3669L12.0794 6.67358C12.2171 6.53589 12.2171 6.31323 12.0794 6.17554L8.82743 2.92358C8.68681 2.78589 8.46415 2.78589 8.32646 2.92358ZM3.63602 9.95776C3.47489 9.79663 3.47489 9.53882 3.63602 9.37769L8.14774 4.86597C8.30888 4.70483 8.56669 4.70483 8.72782 4.86597C8.88895 5.0271 8.88895 5.28491 8.72782 5.44605L4.2161 9.95776C4.05497 10.1189 3.79716 10.1189 3.63602 9.95776ZM2.57841 12.4216H3.98466V13.4851L2.09501 13.8162L1.18388 12.905L1.51493 11.0154H2.57841V12.4216Z" fill="white" data-v-67eba859></path></g><defs data-v-67eba859><clipPath id="clip0_811_2144" data-v-67eba859><rect width="15" height="15" fill="white" data-v-67eba859></rect></clipPath></defs></svg></button><input type="file" accept="image/jpeg,image/png" class="hidden" data-v-67eba859></div><div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px]" data-v-67eba859><div class="max-w-sm" data-v-67eba859><label class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-67eba859>\u038C\u03BD\u03BF\u03BC\u03B1</label><input${ssrRenderAttr('value', formFirstName.value)} type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="\u038C\u03BD\u03BF\u03BC\u03B1" data-v-67eba859></div><div class="max-w-sm" data-v-67eba859><label class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-67eba859>\u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF</label><input${ssrRenderAttr('value', formLastName.value)} type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="\u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF" data-v-67eba859></div><div class="max-w-sm" data-v-67eba859><label class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-67eba859>\u03A4\u03AF\u03C4\u03BB\u03BF\u03C2</label><input${ssrRenderAttr('value', formTitle.value)} type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="\u03A4\u03AF\u03C4\u03BB\u03BF\u03C2" data-v-67eba859></div><div class="max-w-sm" data-v-67eba859><label class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-67eba859>Email</label><input${ssrRenderAttr('value', formEmail.value)} type="email" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Email" data-v-67eba859></div><div class="max-w-sm" data-v-67eba859><label class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-67eba859>\u039A\u03B9\u03BD\u03B7\u03C4\u03CC</label><input${ssrRenderAttr('value', formPhone.value)} pattern="[0-9]{10}" type="tel" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="\u039A\u03B9\u03BD\u03B7\u03C4\u03CC" data-v-67eba859></div><div class="max-w-sm" data-v-67eba859><label class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-67eba859>\u0395\u03C3\u03C9\u03C4. \u03C4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF</label><input${ssrRenderAttr('value', formInternalPhone.value)} type="number" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="\u0395\u03C3\u03C9\u03C4. \u03C4\u03B7\u03BB\u03AD\u03C6\u03C9\u03BD\u03BF" data-v-67eba859></div><div class="max-w-sm" data-v-67eba859>`,
        );
        _push(
          ssrRenderComponent(
            CustomSelect,
            {
              modelValue: formSelectedDepartmentId.value,
              'onUpdate:modelValue': ($event) => (formSelectedDepartmentId.value = $event),
              options: departments.value,
              label: '\u0393\u03BA\u03C1\u03BF\u03C5\u03C0',
              placeholder:
                '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u0393\u03BA\u03C1\u03BF\u03C5\u03C0',
              selectId: 'department-select',
            },
            null,
            _parent,
          ),
        );
        _push(`</div>`);
        if (canEdit.value) {
          _push(`<div class="max-w-sm" data-v-67eba859>`);
          _push(
            ssrRenderComponent(
              CustomSelect,
              {
                modelValue: formRole.value,
                'onUpdate:modelValue': ($event) => (formRole.value = $event),
                options: roles.value,
                label: '\u03A1\u03CC\u03BB\u03BF\u03C2',
                placeholder:
                  '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03A1\u03CC\u03BB\u03BF \u03C7\u03C1\u03AE\u03C3\u03C4\u03B7',
                selectId: 'role-select',
              },
              null,
              _parent,
            ),
          );
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `<div class="info-actions pt-10 pb-5 flex gap-4 col-span-2" data-v-67eba859><button class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none" data-v-67eba859> \u0391\u03C0\u03BF\u03B8\u03AE\u03BA\u03B5\u03C5\u03C3\u03B7 \u0391\u03BB\u03BB\u03B1\u03B3\u03CE\u03BD </button></div></div></div>`,
        );
      }
      _push(`</div></div>`);
    };
  },
};
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/EditUser.vue',
  );
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const EditUser = /* @__PURE__ */ _export_sfc(_sfc_main$b, [['__scopeId', 'data-v-67eba859']]);
const _sfc_main$a = {
  __name: 'Security',
  __ssrInlineRender: true,
  setup(__props) {
    const { authStore, userStore } = useCentralStore();
    const currentPassword = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const loading = computed(() => userStore && userStore.loading);
    return (_ctx, _push, _parent, _attrs) => {
      _push(
        `<div${ssrRenderAttrs(mergeProps({ class: 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100' }, _attrs))} data-v-bc7273af><div class="flex-1" data-v-bc7273af>`,
      );
      if (loading.value) {
        _push(
          `<!--[--><div class="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse" data-v-bc7273af></div><div class="pt-4 space-y-2" data-v-bc7273af><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse" data-v-bc7273af></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse" data-v-bc7273af></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse" data-v-bc7273af></p><p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse" data-v-bc7273af></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse" data-v-bc7273af></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse" data-v-bc7273af></p><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse" data-v-bc7273af></p></div><!--]-->`,
        );
      } else {
        _push(
          `<!--[--><h3 class="border-l-4 dark:text-white border-red-500 pl-[20px] ml-[-25px] text-black font-bold text-[18px]" data-v-bc7273af>\u0391\u03BB\u03BB\u03B1\u03B3\u03AE \u03BA\u03C9\u03B4\u03B9\u03BA\u03BF\u03CD</h3><div class="grid grid-cols-12 pt-[30px] max-w-[847px]" data-v-bc7273af><div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px] max-w-[625px]" data-v-bc7273af><div class="max-w-[300px] col-span-2" data-v-bc7273af><label class="block font-bold text-black text-sm mb-2 dark:text-white" data-v-bc7273af>\u03A5\u03C0\u03AC\u03C1\u03C7\u03BF\u03BD \u03BA\u03C9\u03B4\u03B9\u03BA\u03CC\u03C2</label><div class="relative" data-v-bc7273af><input${ssrRenderAttr('value', currentPassword.value)} name="current-password" type="password" class="py-3 px-4 block w-full border-gray-200 border pe-10 rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="******" value data-v-bc7273af><button type="button" class="group absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500" data-v-bc7273af><svg class="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-bc7273af><path class="group-[.open]:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24" data-v-bc7273af></path><path class="group-[.open]:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" data-v-bc7273af></path><path class="group-[.open]:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" data-v-bc7273af></path><line class="group-[.open]:hidden" x1="2" x2="22" y1="2" y2="22" data-v-bc7273af></line><path class="hidden group-[.open]:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" data-v-bc7273af></path><circle class="hidden group-[.open]:block" cx="12" cy="12" r="3" data-v-bc7273af></circle></svg></button></div></div><div class="max-w-[300px]" data-v-bc7273af><label class="block font-bold text-black text-sm mb-2 dark:text-white" data-v-bc7273af>\u039D\u03AD\u03BF\u03C2 \u03BA\u03C9\u03B4\u03B9\u03BA\u03CC\u03C2</label><div class="relative" data-v-bc7273af><input${ssrRenderAttr('value', newPassword.value)} name="new-password" type="password" class="py-3 px-4 block w-full border-gray-200 border pe-10 rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="******" value data-v-bc7273af><button type="button" class="group absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500" data-v-bc7273af><svg class="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-bc7273af><path class="group-[.open]:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24" data-v-bc7273af></path><path class="group-[.open]:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" data-v-bc7273af></path><path class="group-[.open]:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" data-v-bc7273af></path><line class="group-[.open]:hidden" x1="2" x2="22" y1="2" y2="22" data-v-bc7273af></line><path class="hidden group-[.open]:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" data-v-bc7273af></path><circle class="hidden group-[.open]:block" cx="12" cy="12" r="3" data-v-bc7273af></circle></svg></button></div></div><div class="max-w-[300px]" data-v-bc7273af><label class="block font-bold text-black text-sm mb-2 dark:text-white" data-v-bc7273af>\u0395\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03AF\u03C9\u03C3\u03B7 \u03BD\u03AD\u03BF\u03C5 \u03BA\u03C9\u03B4\u03B9\u03BA\u03BF\u03CD</label><div class="relative" data-v-bc7273af><input${ssrRenderAttr('value', confirmPassword.value)} name="new-password-confirm" type="password" class="py-3 px-4 block w-full border-gray-200 border pe-10 rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="******" data-v-bc7273af><button type="button" class="group absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500" data-v-bc7273af><svg class="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-bc7273af><path class="group-[.open]:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24" data-v-bc7273af></path><path class="group-[.open]:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" data-v-bc7273af></path><path class="group-[.open]:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" data-v-bc7273af></path><line class="group-[.open]:hidden" x1="2" x2="22" y1="2" y2="22" data-v-bc7273af></line><path class="hidden group-[.open]:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" data-v-bc7273af></path><circle class="hidden group-[.open]:block" cx="12" cy="12" r="3" data-v-bc7273af></circle></svg></button></div></div></div></div><h3 class="border-l-4 dark:text-white border-red-500 pl-[20px] ml-[-25px] text-black font-bold text-[18px] mt-[40px]" data-v-bc7273af>2\u03BF \u0395\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF \u0391\u03C3\u03C6\u03AC\u03BB\u03B5\u03B9\u03B1\u03C2</h3><div class="" data-v-bc7273af><div class="max-w-[609px] mt-[20px] w-full text-black dark:text-gray-100 text-sm text-[14px] leading-[18px]" data-v-bc7273af>\u0391\u03C5\u03BE\u03AE\u03C3\u03C4\u03B5 \u03C4\u03B7\u03BD \u03B1\u03C3\u03C6\u03AC\u03BB\u03B5\u03B9\u03B1 \u03C4\u03BF\u03C5 \u03BB\u03BF\u03B3\u03B1\u03C1\u03B9\u03B1\u03C3\u03BC\u03BF\u03CD \u03C3\u03B1\u03C2.<br data-v-bc7273af>\u039C\u03B5 \u03C4\u03BF 2\u03BF \u03B5\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF \u03B1\u03C3\u03C6\u03AC\u03BB\u03B5\u03B9\u03B1\u03C2, \u03B3\u03B9\u03B1 \u03BD\u03B1 \u03C3\u03C5\u03BD\u03B4\u03B5\u03B8\u03B5\u03AF\u03C4\u03B5 \u03C3\u03C4\u03BF Control Panel \u03B8\u03B1 \u03C3\u03C5\u03BC\u03C0\u03BB\u03B7\u03C1\u03CE\u03BD\u03B5\u03C4\u03B5 \u03C4\u03BF password \u03C3\u03B1\u03C2 \u03BA\u03B1\u03B9 \u03AD\u03BD\u03B1\u03BD \u03BA\u03C9\u03B4\u03B9\u03BA\u03CC \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03AF\u03C9\u03C3\u03B7\u03C2 \u03B1\u03C0\u03CC \u03C4\u03B7\u03BD \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE \u03C4\u03BF\u03C5 \u03BA\u03B9\u03BD\u03B7\u03C4\u03BF\u03CD \u03C3\u03B1\u03C2 \u03C4\u03B7\u03BB\u03B5\u03C6\u03CE\u03BD\u03BF\u03C5.</div></div><div class="info-actions pt-10 pb-5 flex gap-4 col-span-2" data-v-bc7273af><button class="inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none" data-v-bc7273af> \u0391\u03C0\u03BF\u03B8\u03AE\u03BA\u03B5\u03C5\u03C3\u03B7 \u0391\u03BB\u03BB\u03B1\u03B3\u03CE\u03BD </button></div><!--]-->`,
        );
      }
      _push(`</div></div>`);
    };
  },
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/Security.vue',
  );
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const Security = /* @__PURE__ */ _export_sfc(_sfc_main$a, [['__scopeId', 'data-v-bc7273af']]);
const _sfc_main$9 = {
  __name: 'UsersList',
  __ssrInlineRender: true,
  setup(__props) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const permissionsStore = centralStore.permissionsStore;
    const showModal = ref(false);
    const modalType = ref('');
    const selectedUserId = ref(null);
    const theme = computed(() => {
      const { $colorMode } = useNuxtApp();
      return ($colorMode == null ? void 0 : $colorMode.value) || 'light';
    });
    ref(true);
    const loading = computed(() => centralStore.loading);
    const allUsers = ref([]);
    watch(
      () => userStore.allUsers,
      (users) => {
        allUsers.value = users.map((user) => {
          const nameSplit = user.name.trim().split(' ');
          const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
          const lastName = nameSplit.slice(-1).join(' ') || '';
          return {
            ...user,
            firstName,
            lastName,
          };
        });
      },
      { immediate: true },
    );
    const sortDirection = ref(true);
    const currentSortKey = ref('');
    const sortByFunctions = {
      firstName: (a, b) => a.firstName.localeCompare(b.firstName),
      lastName: (a, b) => a.lastName.localeCompare(b.lastName),
      job_title: (a, b) => {
        var _a, _b;
        return (((_a = a.profile) == null ? void 0 : _a.job_title) || '').localeCompare(
          ((_b = b.profile) == null ? void 0 : _b.job_title) || '',
        );
      },
      department: (a, b) => {
        var _a, _b;
        return (((_a = a.department) == null ? void 0 : _a.name) || '').localeCompare(
          ((_b = b.department) == null ? void 0 : _b.name) || '',
        );
      },
    };
    const filters = ref({
      firstName: '',
      lastName: '',
      department: '',
      job_title: '',
    });
    const filteredUsers = computed(() => {
      let users = allUsers.value.filter((user) => {
        var _a, _b;
        return (
          (filters.value.firstName !== ''
            ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase())
            : true) &&
          (filters.value.lastName !== ''
            ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase())
            : true) &&
          (filters.value.department !== ''
            ? (_a = user == null ? void 0 : user.department) == null
              ? void 0
              : _a.name.toLowerCase().includes(filters.value.department.toLowerCase())
            : true) &&
          (filters.value.job_title !== ''
            ? (_b = user == null ? void 0 : user.profile) == null
              ? void 0
              : _b.job_title.toLowerCase().includes(filters.value.job_title.toLowerCase())
            : true)
        );
      });
      if (currentSortKey.value && sortByFunctions[currentSortKey.value]) {
        users = users.slice().sort((a, b) => {
          const result = sortByFunctions[currentSortKey.value](a, b);
          return sortDirection.value ? result : -result;
        });
      }
      return users;
    });
    const modalComponent = computed(() => {
      return modalType.value === 'edit' ? EditUser : DeleteUser;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      if (loading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]" data-v-ffd41644><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse" data-v-ffd41644></div><div class="pt-4 space-y-2 col-span-10 animate-pulse" data-v-ffd41644><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-ffd41644></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-ffd41644></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-ffd41644></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-ffd41644></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-ffd41644></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-ffd41644></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-ffd41644></p></div></div>`,
        );
      } else {
        _push(`<div class="flex flex-col gap-[10px]" data-v-ffd41644>`);
        if (unref(permissionsStore).can('all_users', 'modify')) {
          _push(
            `<div class="info-actions pb-5 flex gap-4 col-span-2" data-v-ffd41644><button class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none" data-v-ffd41644> \u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u03BD\u03AD\u03BF\u03C5 \u03C7\u03C1\u03AE\u03C3\u03C4\u03B7 </button></div>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold" data-v-ffd41644><div class="sm:col-span-2 md:col-span-4 lg:col-span-1" data-v-ffd41644> \u03A6\u03AF\u03BB\u03C4\u03C1\u03B1: </div><div class="lg:col-span-2 text-black dark:text-white" data-v-ffd41644><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-ffd41644><input${ssrRenderAttr('value', filters.value.firstName)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.firstName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u038C\u03BD\u03BF\u03BC\u03B1" data-v-ffd41644>`,
        );
        if (filters.value.firstName) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-ffd41644> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-2 text-black dark:text-white" data-v-ffd41644><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-ffd41644><input${ssrRenderAttr('value', filters.value.lastName)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.lastName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF" data-v-ffd41644>`,
        );
        if (filters.value.lastName) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-ffd41644> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-2 text-black dark:text-white" data-v-ffd41644><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-ffd41644><input${ssrRenderAttr('value', filters.value.job_title)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.job_title ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u03A4\u03AF\u03C4\u03BB\u03BF\u03C2" data-v-ffd41644>`,
        );
        if (filters.value.job_title) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-ffd41644> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-2 text-black dark:text-white" data-v-ffd41644><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-ffd41644><input${ssrRenderAttr('value', filters.value.department)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.department ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u0393\u03BA\u03C1\u03BF\u03CD\u03C0" data-v-ffd41644>`,
        );
        if (filters.value.department) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-ffd41644> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-3 lg:justify-self-end items-center" data-v-ffd41644>`,
        );
        if (
          filters.value.firstName ||
          filters.value.lastName ||
          filters.value.job_title ||
          filters.value.department
        ) {
          _push(
            `<button class="text-red-500" data-v-ffd41644> \xD7 \u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C6\u03AF\u03BB\u03C4\u03C1\u03C9\u03BD </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold" data-v-ffd41644><div class="col-span-1" data-v-ffd41644> \u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC: </div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-ffd41644> \u038C\u03BD\u03BF\u03BC\u03B1 `,
        );
        if (currentSortKey.value === 'firstName') {
          _push(`<span class="ml-1" data-v-ffd41644>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ffd41644><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-ffd41644></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ffd41644><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-ffd41644></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-ffd41644> \u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF `,
        );
        if (currentSortKey.value === 'lastName') {
          _push(`<span class="ml-1" data-v-ffd41644>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ffd41644><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-ffd41644></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ffd41644><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-ffd41644></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-ffd41644> \u03A4\u03AF\u03C4\u03BB\u03BF\u03C2 `,
        );
        if (currentSortKey.value === 'job_title') {
          _push(`<span class="ml-1" data-v-ffd41644>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ffd41644><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-ffd41644></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ffd41644><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-ffd41644></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-ffd41644> \u0393\u03BA\u03C1\u03BF\u03CD\u03C0 `,
        );
        if (currentSortKey.value === 'department') {
          _push(`<span class="ml-1" data-v-ffd41644>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ffd41644><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-ffd41644></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-ffd41644><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-ffd41644></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="relative -m-4 p-4 mt-0" data-v-ffd41644><div class="overflow-auto max-h-[50vh] grid gap-[10px] pr-[15px] -mr-[5px] [&amp;::-webkit-scrollbar]:w-2 [&amp;::-webkit-scrollbar-track]:rounded-full [&amp;::-webkit-scrollbar-track]:bg-gray-100 [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&amp;::-webkit-scrollbar-track]:bg-neutral-700 dark:[&amp;::-webkit-scrollbar-thumb]:bg-neutral-500" data-v-ffd41644><!--[-->`,
        );
        ssrRenderList(filteredUsers.value, (user) => {
          var _a, _b, _c, _d, _e;
          _push(
            `<div class="grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center border border-[#DFEAF2] rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-600 text-[#808080]" data-v-ffd41644><div class="w-[50px] h-[50px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1" data-v-ffd41644>`,
          );
          if (
            (_a = user == null ? void 0 : user.profile) == null ? void 0 : _a.profile_image_base64
          ) {
            _push(
              `<img class="rounded-full object-cover size-[50px]"${ssrRenderAttr('src', (_b = user == null ? void 0 : user.profile) == null ? void 0 : _b.profile_image_base64)} data-v-ffd41644>`,
            );
          } else {
            _push(
              `<span class="text-white font-bold" data-v-ffd41644>${ssrInterpolate(user.firstName.charAt(0) || '')}${ssrInterpolate(((_c = user.lastName) == null ? void 0 : _c.charAt(0)) || '')}</span>`,
            );
          }
          _push(
            `</div><div class="col-span-2" data-v-ffd41644>${ssrInterpolate(user.firstName || '')}</div><div class="col-span-2" data-v-ffd41644>${ssrInterpolate(user.lastName || '')}</div><div class="col-span-2" data-v-ffd41644>${ssrInterpolate(((_d = user == null ? void 0 : user.profile) == null ? void 0 : _d.job_title) || '')}</div><div class="col-span-2" data-v-ffd41644>${ssrInterpolate(((_e = user == null ? void 0 : user.department) == null ? void 0 : _e.name) || '')}</div><div class="col-span-3 justify-self-end flex gap-[25px] items-center" data-v-ffd41644>`,
          );
          if (unref(permissionsStore).can('all_users', 'modify')) {
            _push(
              `<a class="cursor-pointer text-[#EA021A] font-bold underline" data-v-ffd41644>\u0395\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u03A0\u03C1\u03BF\u03C6\u03AF\u03BB</a>`,
            );
          } else {
            _push(`<!---->`);
          }
          if (unref(permissionsStore).can('all_users', 'modify')) {
            _push(
              `<svg class="cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none" data-v-ffd41644><path d="M13.4104 14.3631L14.1604 14.3698L13.4104 14.3631ZM1 3.58333C0.585786 3.58333 0.25 3.91912 0.25 4.33333C0.25 4.74755 0.585786 5.08333 1 5.08333V3.58333ZM14.3333 5.08333C14.7475 5.08333 15.0833 4.74755 15.0833 4.33333C15.0833 3.91912 14.7475 3.58333 14.3333 3.58333V5.08333ZM6.75 7.66667C6.75 7.25245 6.41421 6.91667 6 6.91667C5.58579 6.91667 5.25 7.25245 5.25 7.66667H6.75ZM5.25 14.3333C5.25 14.7475 5.58579 15.0833 6 15.0833C6.41421 15.0833 6.75 14.7475 6.75 14.3333H5.25ZM10.0833 7.66667C10.0833 7.25245 9.74755 6.91667 9.33333 6.91667C8.91912 6.91667 8.58333 7.25245 8.58333 7.66667H10.0833ZM8.58333 14.3333C8.58333 14.7475 8.91912 15.0833 9.33333 15.0833C9.74755 15.0833 10.0833 14.7475 10.0833 14.3333H8.58333ZM12.75 4.32664L12.6605 14.3564L14.1604 14.3698L14.25 4.34003L12.75 4.32664ZM10.0772 16.9167H5.16667V18.4167H10.0772V16.9167ZM1.08333 4.33333V14.3333H2.58333V4.33333H1.08333ZM1 5.08333H1.83333V3.58333H1V5.08333ZM1.83333 5.08333H4.33333V3.58333H1.83333V5.08333ZM4.33333 5.08333H11V3.58333H4.33333V5.08333ZM11 5.08333H13.5V3.58333H11V5.08333ZM13.5 5.08333H14.3333V3.58333H13.5V5.08333ZM5.08333 3.96296C5.08333 2.82138 6.15445 1.75 7.66667 1.75V0.25C5.49699 0.25 3.58333 1.83175 3.58333 3.96296H5.08333ZM7.66667 1.75C9.17889 1.75 10.25 2.82138 10.25 3.96296H11.75C11.75 1.83174 9.83634 0.25 7.66667 0.25V1.75ZM3.58333 3.96296V4.33333H5.08333V3.96296H3.58333ZM10.25 3.96296V4.33333H11.75V3.96296H10.25ZM5.16667 16.9167C3.73993 16.9167 2.58333 15.7601 2.58333 14.3333H1.08333C1.08333 16.5885 2.9115 18.4167 5.16667 18.4167V16.9167ZM12.6605 14.3564C12.6478 15.7741 11.495 16.9167 10.0772 16.9167V18.4167C12.3182 18.4167 14.1404 16.6106 14.1604 14.3698L12.6605 14.3564ZM5.25 7.66667V14.3333H6.75V7.66667H5.25ZM8.58333 7.66667V14.3333H10.0833V7.66667H8.58333Z"${ssrRenderAttr('fill', theme.value === 'light' ? 'black' : 'white')} data-v-ffd41644></path></svg>`,
            );
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      }
      if (showModal.value) {
        _push(
          `<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" data-v-ffd41644><div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-[900px] relative" data-v-ffd41644><button class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" data-v-ffd41644><svg class="hover:stroke-gray-500 dark:hover:stroke-gray-100 dark:stroke-gray-500" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="black" data-v-ffd41644><path d="M1 16L16 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-ffd41644></path><path d="M16 16L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-ffd41644></path></svg></button>`,
        );
        ssrRenderVNode(
          _push,
          createVNode(
            resolveDynamicComponent(modalComponent.value),
            { userId: selectedUserId.value },
            null,
          ),
          _parent,
        );
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  },
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/UsersList.vue',
  );
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const UsersList = /* @__PURE__ */ _export_sfc(_sfc_main$9, [['__scopeId', 'data-v-ffd41644']]);
const _sfc_main$8 = {
  __name: 'EditGroup',
  __ssrInlineRender: true,
  props: {
    groupId: {
      type: [Number, String],
      required: false,
    },
  },
  setup(__props) {
    useRouter();
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const departmentsStore = centralStore.departmentsStore;
    const loadingUsers = computed(() => userStore.loading);
    const loadingGroup = ref(false);
    const componentLoading = computed(() => loadingUsers.value || loadingGroup.value);
    const props = __props;
    const formGroupName = ref('');
    const formSelectedDepartmentHead = ref('');
    const formUsers = ref([]);
    const allUsers = computed(() =>
      userStore.allUsers.map((user) => {
        const nameSplit = user.name.trim().split(' ');
        const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
        const lastName = nameSplit.slice(-1).join(' ') || '';
        return {
          ...user,
          firstName,
          lastName,
          // Note: Icon logic should be in a dedicated component for best practice
        };
      }),
    );
    watch(
      () => props.groupId,
      async (newGroupId) => {
        if (newGroupId) {
          loadingGroup.value = true;
          try {
            const dptData = await departmentsStore.loadGroupById(newGroupId);
            if (dptData) {
              initializeFormFields(dptData);
            }
          } catch (error) {
            useNuxtApp().$toast.error('Error fetching department data.', {
              position: 'bottom-right',
              autoClose: 5e3,
            });
          } finally {
            loadingGroup.value = false;
          }
        }
      },
      { immediate: true },
    );
    function initializeFormFields(dptData) {
      formGroupName.value = dptData.name;
      formUsers.value = dptData.users.map((user) => user.id);
      formSelectedDepartmentHead.value = dptData.head || null;
    }
    const availableFormUsers = computed(() => {
      return allUsers.value.filter((user) => formUsers.value.includes(user.id));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(
        `<div${ssrRenderAttrs(mergeProps({ class: 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100' }, _attrs))} data-v-cc133653><div class="flex-1" data-v-cc133653>`,
      );
      if (componentLoading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]" data-v-cc133653><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse" data-v-cc133653></div><div class="pt-4 space-y-2 col-span-10 animate-pulse" data-v-cc133653><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700" data-v-cc133653></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700" data-v-cc133653></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700" data-v-cc133653></p><p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-neutral-700" data-v-cc133653></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700" data-v-cc133653></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700" data-v-cc133653></p><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700" data-v-cc133653></p></div></div>`,
        );
      } else {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]" data-v-cc133653><div class="grid grid-cols-2 col-span-12 lg:col-span-10 gap-y-[15px] gap-x-[25px]" data-v-cc133653><div class="w-full col-span-2 sm:col-span-1" data-v-cc133653><label class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-cc133653>\u038C\u03BD\u03BF\u03BC\u03B1 \u0393\u03BA\u03C1\u03BF\u03C5\u03C0</label><input${ssrRenderAttr('value', formGroupName.value)} type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="\u038C\u03BD\u03BF\u03BC\u03B1" data-v-cc133653></div><div class="w-full col-span-2 sm:col-span-1" data-v-cc133653>`,
        );
        _push(
          ssrRenderComponent(
            CustomSelect,
            {
              modelValue: formSelectedDepartmentHead.value,
              'onUpdate:modelValue': ($event) => (formSelectedDepartmentHead.value = $event),
              options: availableFormUsers.value,
              label:
                '\u03A5\u03C0\u03B5\u03CD\u03B8\u03C5\u03BD\u03BF\u03C2 \u0393\u03BA\u03C1\u03BF\u03C5\u03C0',
              placeholder:
                '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03A5\u03C0\u03B5\u03CD\u03B8\u03C5\u03BD\u03BF',
              selectId: 'department-head-select',
            },
            null,
            _parent,
          ),
        );
        _push(
          `</div><div class="col-span-2" data-v-cc133653><div class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-cc133653> \u03A7\u03C1\u03AE\u03C3\u03C4\u03B5\u03C2 </div>`,
        );
        _push(
          ssrRenderComponent(
            CustomMultiSelect,
            {
              modelValue: formUsers.value,
              'onUpdate:modelValue': ($event) => (formUsers.value = $event),
              options: allUsers.value,
              placeholder:
                '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03C7\u03C1\u03AE\u03C3\u03C4\u03B5\u03C2',
            },
            null,
            _parent,
          ),
        );
        _push(
          `</div><div class="info-actions pt-10 pb-5 flex gap-4 col-span-2" data-v-cc133653><button class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none" data-v-cc133653> \u0391\u03C0\u03BF\u03B8\u03AE\u03BA\u03B5\u03C5\u03C3\u03B7 \u0391\u03BB\u03BB\u03B1\u03B3\u03CE\u03BD </button></div></div></div>`,
        );
      }
      _push(`</div></div>`);
    };
  },
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/EditGroup.vue',
  );
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const EditGroup = /* @__PURE__ */ _export_sfc(_sfc_main$8, [['__scopeId', 'data-v-cc133653']]);
const _sfc_main$7 = {
  __name: 'GroupsList',
  __ssrInlineRender: true,
  setup(__props) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const departmentsStore = centralStore.departmentsStore;
    const permissionsStore = centralStore.permissionsStore;
    const showModal = ref(false);
    const modalType = ref('');
    const selectedGroupId = ref(null);
    const theme = computed(() => {
      const { $colorMode } = useNuxtApp();
      return ($colorMode == null ? void 0 : $colorMode.value) || 'light';
    });
    ref(true);
    const loading = computed(() => centralStore.loading);
    const allUsers = ref([]);
    watch(
      () => userStore.allUsers,
      (users) => {
        allUsers.value = users.map((user) => {
          const nameSplit = user.name.trim().split(' ');
          const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
          const lastName = nameSplit.slice(-1).join(' ') || '';
          return {
            ...user,
            firstName,
            lastName,
          };
        });
      },
      { immediate: true },
    );
    const sortDirection = ref(true);
    const currentSortKey = ref('firstName');
    const sortByFunctions = {
      firstName: (a, b) => a.firstName.localeCompare(b.firstName),
      lastName: (a, b) => a.lastName.localeCompare(b.lastName),
      job_title: (a, b) => {
        var _a, _b;
        return (((_a = a.profile) == null ? void 0 : _a.job_title) || '').localeCompare(
          ((_b = b.profile) == null ? void 0 : _b.job_title) || '',
        );
      },
      department: (a, b) => (a.name || '').localeCompare(b.name || ''),
    };
    const filters = ref({
      firstName: '',
      lastName: '',
      department: '',
      job_title: '',
    });
    const filteredUsers = computed(() => {
      let users = allUsers.value.filter((user) => {
        var _a, _b;
        return (
          (filters.value.firstName !== ''
            ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase())
            : true) &&
          (filters.value.lastName !== ''
            ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase())
            : true) &&
          (filters.value.department !== ''
            ? (_a = user == null ? void 0 : user.department) == null
              ? void 0
              : _a.name.toLowerCase().includes(filters.value.department.toLowerCase())
            : true) &&
          (filters.value.job_title !== ''
            ? (_b = user == null ? void 0 : user.profile) == null
              ? void 0
              : _b.job_title.toLowerCase().includes(filters.value.job_title.toLowerCase())
            : true)
        );
      });
      if (
        currentSortKey.value &&
        currentSortKey.value !== 'department' &&
        sortByFunctions[currentSortKey.value]
      ) {
        users = users.slice().sort((a, b) => {
          const result = sortByFunctions[currentSortKey.value](a, b);
          return sortDirection.value ? result : -result;
        });
      }
      return users;
    });
    const filteredGroups = computed(() => {
      let groups = departmentsStore.departmentsData.map((department) => {
        return {
          ...department,
          users: [
            ...filteredUsers.value.filter(
              (user) => (user == null ? void 0 : user.department.id) === department.id,
            ),
          ],
        };
      });
      if (
        currentSortKey.value &&
        currentSortKey.value === 'department' &&
        sortByFunctions[currentSortKey.value]
      ) {
        groups = groups.slice().sort((a, b) => {
          const result = sortByFunctions[currentSortKey.value](a, b);
          return sortDirection.value ? result : -result;
        });
      }
      return groups;
    });
    const modalComponent = computed(() => {
      return modalType.value === 'edit' ? EditGroup : DeleteGroup;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      if (loading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]" data-v-b786c1b8><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse" data-v-b786c1b8></div><div class="pt-4 space-y-2 col-span-10 animate-pulse" data-v-b786c1b8><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-b786c1b8></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-b786c1b8></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-b786c1b8></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-b786c1b8></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-b786c1b8></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-b786c1b8></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-b786c1b8></p></div></div>`,
        );
      } else {
        _push(`<div class="flex flex-col gap-[10px]" data-v-b786c1b8>`);
        if (unref(permissionsStore).can('group', 'modify')) {
          _push(
            `<div class="info-actions pb-5 flex gap-4 col-span-2" data-v-b786c1b8><button class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none" data-v-b786c1b8> \u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u03BD\u03AD\u03BF\u03C5 \u03B3\u03BA\u03C1\u03BF\u03C5\u03C0 </button></div>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold" data-v-b786c1b8><div class="sm:col-span-2 md:col-span-4 lg:col-span-1" data-v-b786c1b8> \u03A6\u03AF\u03BB\u03C4\u03C1\u03B1: </div><div class="lg:col-span-2 text-black dark:text-white" data-v-b786c1b8><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-b786c1b8><input${ssrRenderAttr('value', filters.value.firstName)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.firstName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u038C\u03BD\u03BF\u03BC\u03B1" data-v-b786c1b8>`,
        );
        if (filters.value.firstName) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-b786c1b8> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-2 text-black dark:text-white" data-v-b786c1b8><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-b786c1b8><input${ssrRenderAttr('value', filters.value.lastName)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.lastName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF" data-v-b786c1b8>`,
        );
        if (filters.value.lastName) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-b786c1b8> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-2 text-black dark:text-white" data-v-b786c1b8><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-b786c1b8><input${ssrRenderAttr('value', filters.value.job_title)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.job_title ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u03A4\u03AF\u03C4\u03BB\u03BF\u03C2" data-v-b786c1b8>`,
        );
        if (filters.value.job_title) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-b786c1b8> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-2 text-black dark:text-white" data-v-b786c1b8><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-b786c1b8><input${ssrRenderAttr('value', filters.value.department)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.department ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u0393\u03BA\u03C1\u03BF\u03CD\u03C0" data-v-b786c1b8>`,
        );
        if (filters.value.department) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-b786c1b8> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-3 lg:justify-self-end items-center" data-v-b786c1b8>`,
        );
        if (
          filters.value.firstName ||
          filters.value.lastName ||
          filters.value.job_title ||
          filters.value.department
        ) {
          _push(
            `<button class="text-red-500" data-v-b786c1b8> \xD7 \u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C6\u03AF\u03BB\u03C4\u03C1\u03C9\u03BD </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold" data-v-b786c1b8><div class="col-span-1" data-v-b786c1b8> \u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC: </div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-b786c1b8> \u038C\u03BD\u03BF\u03BC\u03B1 `,
        );
        if (currentSortKey.value === 'firstName') {
          _push(`<span class="ml-1" data-v-b786c1b8>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-b786c1b8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-b786c1b8></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-b786c1b8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-b786c1b8></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-b786c1b8> \u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF `,
        );
        if (currentSortKey.value === 'lastName') {
          _push(`<span class="ml-1" data-v-b786c1b8>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-b786c1b8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-b786c1b8></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-b786c1b8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-b786c1b8></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-b786c1b8> \u03A4\u03AF\u03C4\u03BB\u03BF\u03C2 `,
        );
        if (currentSortKey.value === 'job_title') {
          _push(`<span class="ml-1" data-v-b786c1b8>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-b786c1b8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-b786c1b8></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-b786c1b8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-b786c1b8></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-b786c1b8> \u0393\u03BA\u03C1\u03BF\u03CD\u03C0 `,
        );
        if (currentSortKey.value === 'department') {
          _push(`<span class="ml-1" data-v-b786c1b8>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-b786c1b8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-b786c1b8></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-b786c1b8><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-b786c1b8></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="-m-4 p-4 mt-0" data-v-b786c1b8><div class="overflow-y-auto max-h-[50vh] pr-[15px] flex flex-col gap-[50px] -mr-[5px] [&amp;::-webkit-scrollbar]:w-2 [&amp;::-webkit-scrollbar-track]:rounded-full [&amp;::-webkit-scrollbar-track]:bg-gray-100 [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&amp;::-webkit-scrollbar-track]:bg-neutral-700 dark:[&amp;::-webkit-scrollbar-thumb]:bg-neutral-500" data-v-b786c1b8><!--[-->`,
        );
        ssrRenderList(filteredGroups.value, (group) => {
          _push(
            `<div class="${ssrRenderClass(group.users.length === 0 ? 'hidden' : '')}" data-v-b786c1b8>`,
          );
          if (group.users.length) {
            _push(
              `<div class="grid grid-cols-2 gap-[10px]" data-v-b786c1b8><div class="h-7 translate-x-[-20px] justify-start items-center gap-5 flex" data-v-b786c1b8><div class="w-1 h-7 bg-[#ea021a] rounded-lg" data-v-b786c1b8></div><div class="text-black dark:text-white text-xl font-bold" data-v-b786c1b8>${ssrInterpolate(group.name)}</div></div><div class="justify-self-end flex gap-[25px] items-center" data-v-b786c1b8>`,
            );
            if (unref(permissionsStore).can('group', 'modify')) {
              _push(
                `<a class="cursor-pointer text-[#EA021A] font-bold underline" data-v-b786c1b8>\u0395\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u0393\u03BA\u03C1\u03BF\u03C5\u03C0</a>`,
              );
            } else {
              _push(`<!---->`);
            }
            if (unref(permissionsStore).can('group', 'modify')) {
              _push(
                `<svg class="cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none" data-v-b786c1b8><path d="M13.4104 14.3631L14.1604 14.3698L13.4104 14.3631ZM1 3.58333C0.585786 3.58333 0.25 3.91912 0.25 4.33333C0.25 4.74755 0.585786 5.08333 1 5.08333V3.58333ZM14.3333 5.08333C14.7475 5.08333 15.0833 4.74755 15.0833 4.33333C15.0833 3.91912 14.7475 3.58333 14.3333 3.58333V5.08333ZM6.75 7.66667C6.75 7.25245 6.41421 6.91667 6 6.91667C5.58579 6.91667 5.25 7.25245 5.25 7.66667H6.75ZM5.25 14.3333C5.25 14.7475 5.58579 15.0833 6 15.0833C6.41421 15.0833 6.75 14.7475 6.75 14.3333H5.25ZM10.0833 7.66667C10.0833 7.25245 9.74755 6.91667 9.33333 6.91667C8.91912 6.91667 8.58333 7.25245 8.58333 7.66667H10.0833ZM8.58333 14.3333C8.58333 14.7475 8.91912 15.0833 9.33333 15.0833C9.74755 15.0833 10.0833 14.7475 10.0833 14.3333H8.58333ZM12.75 4.32664L12.6605 14.3564L14.1604 14.3698L14.25 4.34003L12.75 4.32664ZM10.0772 16.9167H5.16667V18.4167H10.0772V16.9167ZM1.08333 4.33333V14.3333H2.58333V4.33333H1.08333ZM1 5.08333H1.83333V3.58333H1V5.08333ZM1.83333 5.08333H4.33333V3.58333H1.83333V5.08333ZM4.33333 5.08333H11V3.58333H4.33333V5.08333ZM11 5.08333H13.5V3.58333H11V5.08333ZM13.5 5.08333H14.3333V3.58333H13.5V5.08333ZM5.08333 3.96296C5.08333 2.82138 6.15445 1.75 7.66667 1.75V0.25C5.49699 0.25 3.58333 1.83175 3.58333 3.96296H5.08333ZM7.66667 1.75C9.17889 1.75 10.25 2.82138 10.25 3.96296H11.75C11.75 1.83174 9.83634 0.25 7.66667 0.25V1.75ZM3.58333 3.96296V4.33333H5.08333V3.96296H3.58333ZM10.25 3.96296V4.33333H11.75V3.96296H10.25ZM5.16667 16.9167C3.73993 16.9167 2.58333 15.7601 2.58333 14.3333H1.08333C1.08333 16.5885 2.9115 18.4167 5.16667 18.4167V16.9167ZM12.6605 14.3564C12.6478 15.7741 11.495 16.9167 10.0772 16.9167V18.4167C12.3182 18.4167 14.1404 16.6106 14.1604 14.3698L12.6605 14.3564ZM5.25 7.66667V14.3333H6.75V7.66667H5.25ZM8.58333 7.66667V14.3333H10.0833V7.66667H8.58333Z"${ssrRenderAttr('fill', theme.value === 'light' ? 'black' : 'white')} data-v-b786c1b8></path></svg>`,
              );
            } else {
              _push(`<!---->`);
            }
            _push(`</div><!--[-->`);
            ssrRenderList(group.users, (user) => {
              var _a, _b, _c, _d;
              _push(
                `<div class="col-span-2 grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center border border-[#DFEAF2] rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-600 text-[#808080]" data-v-b786c1b8><div class="w-[50px] h-[50px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1" data-v-b786c1b8>`,
              );
              if (
                (_a = user == null ? void 0 : user.profile) == null
                  ? void 0
                  : _a.profile_image_base64
              ) {
                _push(
                  `<img class="rounded-full object-cover size-[50px]"${ssrRenderAttr('src', (_b = user == null ? void 0 : user.profile) == null ? void 0 : _b.profile_image_base64)} data-v-b786c1b8>`,
                );
              } else {
                _push(
                  `<span class="text-white font-bold" data-v-b786c1b8>${ssrInterpolate(user.firstName.charAt(0) || '')}${ssrInterpolate(((_c = user.lastName) == null ? void 0 : _c.charAt(0)) || '')}</span>`,
                );
              }
              _push(
                `</div><div class="col-span-2" data-v-b786c1b8>${ssrInterpolate(user.firstName || '')}</div><div class="col-span-2" data-v-b786c1b8>${ssrInterpolate(user.lastName || '')}</div><div class="col-span-2" data-v-b786c1b8>${ssrInterpolate(((_d = user == null ? void 0 : user.profile) == null ? void 0 : _d.job_title) || '')}</div></div>`,
              );
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div></div>`);
      }
      if (showModal.value) {
        _push(
          `<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" data-v-b786c1b8><div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-[900px] relative" data-v-b786c1b8><button class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" data-v-b786c1b8><svg class="hover:stroke-gray-500 dark:hover:stroke-gray-100 dark:stroke-gray-500" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="black" data-v-b786c1b8><path d="M1 16L16 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-b786c1b8></path><path d="M16 16L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-b786c1b8></path></svg></button>`,
        );
        ssrRenderVNode(
          _push,
          createVNode(
            resolveDynamicComponent(modalComponent.value),
            { groupId: selectedGroupId.value },
            null,
          ),
          _parent,
        );
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  },
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/GroupsList.vue',
  );
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const GroupsList = /* @__PURE__ */ _export_sfc(_sfc_main$7, [['__scopeId', 'data-v-b786c1b8']]);
const _sfc_main$6 = {
  __name: 'EditLeaveType',
  __ssrInlineRender: true,
  props: {
    leaveTypeId: {
      type: [Number, String],
      required: false,
    },
  },
  setup(__props) {
    const centralStore = useCentralStore();
    const loading = computed(() => centralStore.loading);
    const leaveTypeName = ref('');
    const props = __props;
    watch(
      () => props.leaveTypeId,
      () => {
        var _a, _b, _c;
        if (centralStore.initialized && props.leaveTypeId) {
          leaveTypeName.value =
            ((_c =
              (_b = (_a = centralStore.leavesStore.leavesData) == null ? void 0 : _a.leavesTypes) ==
              null
                ? void 0
                : _b.filter(
                    (leaveType) =>
                      (leaveType == null ? void 0 : leaveType.id) ===
                      (props == null ? void 0 : props.leaveTypeId),
                  )[0]) == null
              ? void 0
              : _c.name) || '';
        }
      },
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(
        `<div${ssrRenderAttrs(mergeProps({ class: 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100' }, _attrs))}><div class="flex-1">`,
      );
      if (loading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]"><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div><div class="pt-4 space-y-2 col-span-10 animate-pulse"><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p></div></div>`,
        );
      } else {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]"><div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px]"><div class="w-full"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u038C\u03BD\u03BF\u03BC\u03B1 \u0393\u03BA\u03C1\u03BF\u03C5\u03C0</label><input${ssrRenderAttr('value', unref(leaveTypeName))} type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="\u038C\u03BD\u03BF\u03BC\u03B1 \u03C4\u03CD\u03C0\u03BF\u03C5 \u03AC\u03B4\u03B5\u03B9\u03B1\u03C2"></div></div></div>`,
        );
      }
      _push(`</div></div>`);
    };
  },
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/EditLeaveType.vue',
  );
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = {
  __name: 'LeavesTypesList',
  __ssrInlineRender: true,
  setup(__props) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const leavesStore = centralStore.leavesStore;
    centralStore.departmentsStore;
    const permissionsStore = centralStore.permissionsStore;
    const showModal = ref(false);
    const modalType = ref('');
    const selectedLeaveTypeId = ref(null);
    computed(() => {
      const { $colorMode } = useNuxtApp();
      return ($colorMode == null ? void 0 : $colorMode.value) || 'light';
    });
    ref(true);
    const loading = computed(() => centralStore.loading);
    const allLeaves = ref([]);
    const allUsers = ref([]);
    watch(
      () => leavesStore.leavesData.leavesTypes,
      (leaves) => {
        allLeaves.value = leaves;
      },
      { immediate: true },
    );
    watch(
      () => userStore.allUsers,
      (users) => {
        allUsers.value = users.map((user) => {
          const nameSplit = user.name.trim().split(' ');
          const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
          const lastName = nameSplit.slice(-1).join(' ') || '';
          return {
            ...user,
            firstName,
            lastName,
          };
        });
      },
      { immediate: true },
    );
    const sortDirection = ref(true);
    const currentSortKey = ref('');
    const sortByFunctions = {
      leaveTypeName: (a, b) => a.name.localeCompare(b.name),
      leaveTypeDays: (a, b) => parseInt(a.days) - parseInt(b.days),
      users: (a, b) => a.users.length - b.users.length,
      department: (a, b) => a.departments.length - b.departments.length,
    };
    const filters = ref({
      leaveTypeName: '',
      //leaveTypeDays: '',
      users: '',
      department: '',
    });
    const filteredLeavesTypes = computed(() => {
      let leaves = allLeaves.value.filter(
        (leave) =>
          (filters.value.leaveTypeName !== ''
            ? leave.name.toLowerCase().includes(filters.value.leaveTypeName.toLowerCase())
            : true) &&
          (filters.value.users !== ''
            ? leave.users.some((user) =>
                user.name.toLowerCase().includes(filters.value.users.toLowerCase()),
              )
            : true) &&
          (filters.value.department !== ''
            ? leave.departments.some((dpt) =>
                dpt.name.toLowerCase().includes(filters.value.department.toLowerCase()),
              )
            : true),
      );
      if (currentSortKey.value && sortByFunctions[currentSortKey.value]) {
        leaves = leaves.slice().sort((a, b) => {
          const result = sortByFunctions[currentSortKey.value](a, b);
          return sortDirection.value ? result : -result;
        });
      }
      return leaves;
    });
    const modalComponent = computed(() => {
      return modalType.value === 'edit' ? _sfc_main$6 : _sfc_main$6;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      if (loading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]"><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div><div class="pt-4 space-y-2 col-span-10 animate-pulse"><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p></div></div>`,
        );
      } else {
        _push(`<div class="flex flex-col gap-[10px]">`);
        if (unref(permissionsStore).can('leave_types', 'modify')) {
          _push(
            `<div class="info-actions pb-5 flex gap-4 col-span-2"><button class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"> \u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u03BD\u03AD\u03BF\u03C5 \u03C4\u03CD\u03C0\u03BF\u03C5 \u03B1\u03B4\u03B5\u03B9\u03CE\u03BD </button></div>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold hidden"><div class="sm:col-span-2 md:col-span-4 lg:col-span-1"> \u03A6\u03AF\u03BB\u03C4\u03C1\u03B1: </div><div class="lg:col-span-2 text-black dark:text-white"><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500"><input${ssrRenderAttr('value', filters.value.leaveTypeName)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.leaveTypeName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u03A4\u03CD\u03C0\u03BF\u03C2 \u03AC\u03B4\u03B5\u03B9\u03B1\u03C2">`,
        );
        if (filters.value.leaveTypeName) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="lg:col-span-3 lg:justify-self-end items-center">`);
        if (
          filters.value.leaveTypeName ||
          filters.value.leavesTypeDays ||
          filters.value.users ||
          filters.value.department
        ) {
          _push(
            `<button class="text-red-500"> \xD7 \u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C6\u03AF\u03BB\u03C4\u03C1\u03C9\u03BD </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold hidden"><div class="col-span-1"> \u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC: </div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"> \u03A4\u03CD\u03C0\u03BF\u03C2 \u03AC\u03B4\u03B5\u03B9\u03B1\u03C2 `,
        );
        if (currentSortKey.value === 'leaveTypeName') {
          _push(`<span class="ml-1">`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="relative -m-4 p-4 mt-0"><div class="overflow-auto max-h-[50vh] grid gap-[10px] pr-[15px] -mr-[5px] [&amp;::-webkit-scrollbar]:w-2 [&amp;::-webkit-scrollbar-track]:rounded-full [&amp;::-webkit-scrollbar-track]:bg-gray-100 [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&amp;::-webkit-scrollbar-track]:bg-neutral-700 dark:[&amp;::-webkit-scrollbar-thumb]:bg-neutral-500"><!--[-->`,
        );
        ssrRenderList(filteredLeavesTypes.value, (leaveType) => {
          _push(
            `<div class="grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center border border-[#DFEAF2] rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-600 text-[#808080]"><div class="col-span-8">${ssrInterpolate(leaveType.name || '')}</div><div class="col-span-4 justify-self-end flex gap-[25px] items-center">`,
          );
          if (unref(permissionsStore).can('leave_types', 'modify')) {
            _push(
              `<a class="cursor-pointer text-[#EA021A] font-bold underline">\u0395\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u03A0\u03C1\u03BF\u03C6\u03AF\u03BB</a>`,
            );
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      }
      if (showModal.value) {
        _push(
          `<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-[900px] relative"><button class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"><svg class="hover:stroke-gray-500 dark:hover:stroke-gray-100 dark:stroke-gray-500" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="black"><path d="M1 16L16 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 16L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>`,
        );
        ssrRenderVNode(
          _push,
          createVNode(
            resolveDynamicComponent(modalComponent.value),
            { leaveTypeId: selectedLeaveTypeId.value },
            null,
          ),
          _parent,
        );
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  },
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/LeavesTypesList.vue',
  );
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = {
  __name: 'Permissions',
  __ssrInlineRender: true,
  setup(__props) {
    const allRoles = ['admin', 'hr-manager', 'head', 'user'];
    const roleLabels = {
      admin: 'Admin',
      'hr-manager': 'HR',
      head: 'Department Head',
      user: 'User',
    };
    const permissionLabels = {
      profile_leave_balance: {
        label: '\u0386\u03B4\u03B5\u03B9\u03B5\u03C2',
        actions: {
          view: '\u03A0\u03C1\u03BF\u03B2\u03BF\u03BB\u03AE',
          request_leave:
            '\u0391\u03AF\u03C4\u03B7\u03C3\u03B7 \u0386\u03B4\u03B5\u03B9\u03B1\u03C2',
          cancel_leave:
            '\u0391\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7 \u0386\u03B4\u03B5\u03B9\u03B1\u03C2',
          accept_leave:
            '\u0391\u03C0\u03BF\u03B4\u03BF\u03C7\u03AE \u0386\u03B4\u03B5\u03B9\u03B1\u03C2',
          decline_leave:
            '\u0391\u03C0\u03CC\u03C1\u03C1\u03B9\u03C8\u03B7 \u0386\u03B4\u03B5\u03B9\u03B1\u03C2',
        },
      },
      profile_info: {
        label: '\u03A0\u03C1\u03BF\u03C6\u03AF\u03BB \u03A7\u03C1\u03AE\u03C3\u03C4\u03B7',
        actions: {
          view: '\u03A0\u03C1\u03BF\u03B2\u03BF\u03BB\u03AE',
          modify: '\u03A4\u03C1\u03BF\u03C0\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7',
          change_password:
            '\u0391\u03BB\u03BB\u03B1\u03B3\u03AE \u039A\u03C9\u03B4\u03B9\u03BA\u03BF\u03CD',
        },
      },
      all_users: {
        label: '\u038C\u03BB\u03BF\u03B9 \u03BF\u03B9 \u03A7\u03C1\u03AE\u03C3\u03C4\u03B5\u03C2',
        actions: {
          view: '\u03A0\u03C1\u03BF\u03B2\u03BF\u03BB\u03AE',
          modify: '\u03A4\u03C1\u03BF\u03C0\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7',
        },
      },
      entitlement: {
        label:
          '\u0394\u03B9\u03BA\u03B1\u03B9\u03BF\u03CD\u03BC\u03B5\u03BD\u03B5\u03C2 \u0397\u03BC\u03AD\u03C1\u03B5\u03C2 \u0386\u03B4\u03B5\u03B9\u03B1\u03C2',
        actions: {
          view: '\u03A0\u03C1\u03BF\u03B2\u03BF\u03BB\u03AE',
          modify: '\u03A4\u03C1\u03BF\u03C0\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7',
        },
      },
      group: {
        label: '\u03A4\u03BC\u03AE\u03BC\u03B1\u03C4\u03B1',
        actions: {
          view: '\u03A0\u03C1\u03BF\u03B2\u03BF\u03BB\u03AE',
          modify: '\u03A4\u03C1\u03BF\u03C0\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7',
        },
      },
      leave_types: {
        label: '\u03A4\u03CD\u03C0\u03BF\u03B9 \u0391\u03B4\u03B5\u03B9\u03CE\u03BD',
        actions: {
          view: '\u03A0\u03C1\u03BF\u03B2\u03BF\u03BB\u03AE',
          modify: '\u03A4\u03C1\u03BF\u03C0\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7',
        },
      },
      // Exclude 'permissions' category as per your request
    };
    const permissionsStore = usePermissionsStore();
    const groupedPermissions = computed(() => {
      var _a, _b;
      const groups = {};
      for (const [categoryKey, actions] of Object.entries(permissionsStore.permissions)) {
        if (categoryKey === 'permissions') continue;
        const categoryLabel =
          ((_a = permissionLabels[categoryKey]) == null ? void 0 : _a.label) || categoryKey;
        if (!groups[categoryKey]) {
          groups[categoryKey] = {
            categoryLabel,
            actions: [],
          };
        }
        for (const [actionKey, allowedRoles] of Object.entries(actions)) {
          const actionLabel =
            ((_b = permissionLabels[categoryKey]) == null ? void 0 : _b.actions[actionKey]) ||
            actionKey;
          const rolePermissions = allRoles.map((role) => {
            const roleLabel = roleLabels[role] || role;
            const roleHasPermission = allowedRoles.includes(role);
            return {
              role,
              roleLabel,
              roleHasPermission,
            };
          });
          groups[categoryKey].actions.push({
            actionKey,
            actionLabel,
            rolePermissions,
          });
        }
      }
      return Object.values(groups);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: 'p-4' }, _attrs))}><div><!--[-->`);
      ssrRenderList(groupedPermissions.value, (group, index) => {
        _push(
          `<div class="mb-6"><h3 class="border-l-4 dark:text-white border-red-500 pl-[20px] ml-[-25px] text-black font-bold text-[18px] mb-4">${ssrInterpolate(group.categoryLabel)}</h3><!--[-->`,
        );
        ssrRenderList(group.actions, (action) => {
          _push(
            `<div class="mb-4 ml-2"><h4 class="font-medium mb-2 dark:text-neutral-200 underline">${ssrInterpolate(action.actionLabel)}</h4><ul class="space-y-1 ml-2 flex gap-10"><!--[-->`,
          );
          ssrRenderList(action.rolePermissions, (rolePerm) => {
            _push(`<li class="flex items-center"><span class="mr-2">`);
            ssrRenderVNode(
              _push,
              createVNode(
                resolveDynamicComponent(
                  rolePerm.roleHasPermission ? unref(CheckIcon) : unref(XMarkIcon),
                ),
                {
                  class: [
                    'w-5 h-5',
                    rolePerm.roleHasPermission
                      ? 'text-green-500 dark:text-green-400'
                      : 'text-red-500 dark:text-red-400',
                  ],
                },
                null,
              ),
              _parent,
            );
            _push(
              `</span><span class="text-neutral-500 dark:text-neutral-300">${ssrInterpolate(rolePerm.roleLabel)}</span></li>`,
            );
          });
          _push(`<!--]--></ul></div>`);
        });
        _push(`<!--]--></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  },
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/Permissions.vue',
  );
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = {
  __name: 'EditEntitlement',
  __ssrInlineRender: true,
  props: {
    entitlementId: {
      type: [Number, String, null],
      required: false,
    },
  },
  setup(__props) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    centralStore.entitlementStore;
    const leavesStore = centralStore.leavesStore;
    const { $toast } = useNuxtApp();
    const formUserIds = ref([]);
    const formLeaveTypeId = ref(null);
    const formEntitledDays = ref(0);
    const formStartDate = ref('');
    const formEndDate = ref('');
    const loading = ref(false);
    const users = computed(() =>
      userStore.allUsers.map((user) => {
        var _a, _b;
        return {
          id: user.id,
          name: user.name,
          icon: ((_a = user.profile) == null ? void 0 : _a.profile_image_base64)
            ? `<img src="${user.profile.profile_image_base64}" class="rounded-full size-6 object-cover" />`
            : `<div class="bg-gray-300 rounded-full size-6 flex items-center justify-center text-white font-bold">${user.name.charAt(0)}</div>`,
          description: (_b = user.profile) == null ? void 0 : _b.job_title,
        };
      }),
    );
    const leaveTypes = computed(() =>
      leavesStore.leavesData.leavesTypes.map((type) => ({ id: type.id, name: type.name })),
    );
    ref(null);
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(
        `<div${ssrRenderAttrs(mergeProps({ class: 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100' }, _attrs))}><div class="flex-1">`,
      );
      if (loading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[10px] max-w-[947px]"><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div><div class="pt-4 space-y-2 col-span-10 animate-pulse"><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p></div></div>`,
        );
      } else {
        _push(
          `<div class="grid grid-cols-12 pt-[10px] max-w-[947px]"><div class="grid grid-cols-2 col-span-12 gap-y-[15px] gap-x-[25px]">`,
        );
        if (!__props.entitlementId) {
          _push(
            `<div class="max-w-[97%] col-span-2"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u0395\u03C1\u03B3\u03B1\u03B6\u03CC\u03BC\u03B5\u03BD\u03BF\u03B9</label>`,
          );
          _push(
            ssrRenderComponent(
              CustomMultiSelect,
              {
                modelValue: formUserIds.value,
                'onUpdate:modelValue': ($event) => (formUserIds.value = $event),
                options: users.value,
                placeholder:
                  '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03B5\u03C1\u03B3\u03B1\u03B6\u03CC\u03BC\u03B5\u03BD\u03BF/\u03BF\u03C5\u03C2',
              },
              null,
              _parent,
            ),
          );
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="max-w-sm">`);
        _push(
          ssrRenderComponent(
            CustomSelect,
            {
              modelValue: formLeaveTypeId.value,
              'onUpdate:modelValue': ($event) => (formLeaveTypeId.value = $event),
              options: leaveTypes.value,
              label: '\u0395\u03AF\u03B4\u03BF\u03C2 \u0386\u03B4\u03B5\u03B9\u03B1\u03C2',
              placeholder:
                '\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03B5\u03AF\u03B4\u03BF\u03C2 \u03AC\u03B4\u03B5\u03B9\u03B1\u03C2',
              selectId: 'leave-type-select',
            },
            null,
            _parent,
          ),
        );
        _push(
          `</div><div class="max-w-sm"><label class="block text-sm font-bold mb-2 text-black dark:text-white"> \u0394\u03B9\u03BA\u03B1\u03B9\u03BF\u03CD\u03BC\u03B5\u03BD\u03B5\u03C2 \u0397\u03BC\u03AD\u03C1\u03B5\u03C2 <span class="inline-block ml-1 align-middle cursor-pointer relative group"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg><div class="absolute z-10 top-0 left-1/2 -translate-y-full -translate-x-1/2 w-48 p-4 bg-black text-white text-xs rounded-lg shadow-lg opacity-0 border-[1px] border-gray-700 dark:border-gray-500 group-hover:opacity-100 transition-opacity pointer-events-none dark:bg-neutral-800"> \u0391\u03BD \u03BF \u03C7\u03C1\u03AE\u03C3\u03C4\u03B7\u03C2 \u03AD\u03C7\u03B5\u03B9 \u03AE\u03B4\u03B7 \u03BA\u03B1\u03C4\u03B1\u03C7\u03C9\u03C1\u03B7\u03BC\u03AD\u03BD\u03B5\u03C2 \u03B4\u03B9\u03BA\u03B1\u03B9\u03BF\u03CD\u03BC\u03B5\u03BD\u03B5\u03C2 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 \u03B3\u03B9\u03B1 \u03B1\u03C5\u03C4\u03CC \u03C4\u03BF \u03AD\u03C4\u03BF\u03C2, \u03BF\u03B9 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 \u03B1\u03C5\u03C4\u03AD\u03C2 \u03B8\u03B1 \u03B1\u03BD\u03C4\u03B9\u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03B1\u03B8\u03BF\u03CD\u03BD. </div></span></label><input${ssrRenderAttr('value', formEntitledDays.value)} type="number" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="\u0391\u03C1\u03B9\u03B8\u03BC\u03CC\u03C2 \u03B7\u03BC\u03B5\u03C1\u03CE\u03BD"></div><div class="max-w-sm"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u0397\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B1 \u03AD\u03BD\u03B1\u03C1\u03BE\u03B7\u03C2</label><input type="text"${ssrRenderAttr('value', formStartDate.value)} placeholder="\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03B7\u03BC/\u03BD\u03B9\u03B1" class="cursor-pointer py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"></div><div class="max-w-sm"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u0397\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B1 \u03BB\u03AE\u03BE\u03B7\u03C2</label><input type="text"${ssrRenderAttr('value', formEndDate.value)} placeholder="\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u03B7\u03BC/\u03BD\u03B9\u03B1" class="cursor-pointer py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"></div><div class="info-actions pt-10 pb-5 flex gap-4 col-span-2"><button class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">${ssrInterpolate(__props.entitlementId ? '\u0391\u03C0\u03BF\u03B8\u03AE\u03BA\u03B5\u03C5\u03C3\u03B7 \u0391\u03BB\u03BB\u03B1\u03B3\u03CE\u03BD' : '\u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u0386\u03B4\u03B5\u03B9\u03B1\u03C2')}</button></div></div></div>`,
        );
      }
      _push(`</div></div>`);
    };
  },
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/EditEntitlement.vue',
  );
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = {
  __name: 'DeleteEntitlement',
  __ssrInlineRender: true,
  props: {
    entitlementId: {
      type: [Number, String, null],
      required: false,
    },
  },
  emits: ['modal:close'],
  setup(__props, { emit: __emit }) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    centralStore.entitlementStore;
    const leavesStore = centralStore.leavesStore;
    const { $toast } = useNuxtApp();
    const formUserId = ref(null);
    const formLeaveTypeId = ref(null);
    const formEntitledDays = ref(0);
    const formStartDate = ref('');
    const formEndDate = ref('');
    const loading = ref(true);
    const userName = computed(() => {
      const user = userStore.allUsers.find((u) => u.id === formUserId.value);
      return user ? user.name : '\u0386\u03B3\u03BD\u03C9\u03C3\u03C4\u03BF\u03C2';
    });
    const leaveTypeName = computed(() => {
      const type = leavesStore.leavesData.leavesTypes.find((t) => t.id === formLeaveTypeId.value);
      return type ? type.name : '\u0386\u03B3\u03BD\u03C9\u03C3\u03C4\u03BF\u03C2';
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(
        `<div${ssrRenderAttrs(mergeProps({ class: 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100' }, _attrs))}><div class="flex-1">`,
      );
      if (loading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[10px] max-w-[947px]"><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div><div class="pt-4 space-y-2 col-span-10 animate-pulse"><p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p><p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p></div></div>`,
        );
      } else {
        _push(
          `<!--[--><div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert"><p class="font-bold">\u0395\u03AF\u03C3\u03C4\u03B5 \u03C3\u03AF\u03B3\u03BF\u03C5\u03C1\u03BF\u03B9 \u03CC\u03C4\u03B9 \u03B8\u03AD\u03BB\u03B5\u03C4\u03B5 \u03BD\u03B1 \u03B4\u03B9\u03B1\u03B3\u03C1\u03AC\u03C8\u03B5\u03C4\u03B5 \u03B1\u03C5\u03C4\u03AE\u03BD \u03C4\u03B7\u03BD \u03AC\u03B4\u03B5\u03B9\u03B1;</p><p class="text-sm">\u0391\u03C5\u03C4\u03AE \u03B7 \u03B5\u03BD\u03AD\u03C1\u03B3\u03B5\u03B9\u03B1 \u03B4\u03B5\u03BD \u03BC\u03C0\u03BF\u03C1\u03B5\u03AF \u03BD\u03B1 \u03B1\u03BD\u03B1\u03B9\u03C1\u03B5\u03B8\u03B5\u03AF.</p></div><div class="grid grid-cols-12 pt-[10px] max-w-[947px]"><div class="grid grid-cols-2 col-span-12 gap-y-[15px] gap-x-[25px]"><div class="max-w-sm"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u0395\u03C1\u03B3\u03B1\u03B6\u03CC\u03BC\u03B5\u03BD\u03BF\u03C2</label><p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">${ssrInterpolate(userName.value)}</p></div><div class="max-w-sm"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u0395\u03AF\u03B4\u03BF\u03C2 \u0386\u03B4\u03B5\u03B9\u03B1\u03C2</label><p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">${ssrInterpolate(leaveTypeName.value)}</p></div><div class="max-w-sm"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u0394\u03B9\u03BA\u03B1\u03B9\u03BF\u03CD\u03BC\u03B5\u03BD\u03B5\u03C2 \u0397\u03BC\u03AD\u03C1\u03B5\u03C2</label><p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">${ssrInterpolate(formEntitledDays.value)}</p></div><div class="max-w-sm"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u0397\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B1 \u03AD\u03BD\u03B1\u03C1\u03BE\u03B7\u03C2</label><p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">${ssrInterpolate(formStartDate.value)}</p></div><div class="max-w-sm"><label class="block text-sm font-bold mb-2 text-black dark:text-white">\u0397\u03BC\u03B5\u03C1\u03BF\u03BC\u03B7\u03BD\u03AF\u03B1 \u03BB\u03AE\u03BE\u03B7\u03C2</label><p class="py-3 px-4 block w-full rounded-lg text-sm bg-gray-100 dark:bg-neutral-700 dark:text-neutral-400">${ssrInterpolate(formEndDate.value)}</p></div><div class="info-actions pt-10 pb-5 flex gap-4 col-span-2"><button class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"> \u0394\u03B9\u03B1\u03B3\u03C1\u03B1\u03C6\u03AE \u0386\u03B4\u03B5\u03B9\u03B1\u03C2 </button></div></div></div><!--]-->`,
        );
      }
      _push(`</div></div>`);
    };
  },
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/DeleteEntitlement.vue',
  );
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: 'EntitlementDays',
  __ssrInlineRender: true,
  setup(__props) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const permissionsStore = centralStore.permissionsStore;
    const entitlementStore = centralStore.entitlementStore;
    const leavesStore = centralStore.leavesStore;
    const showModal = ref(false);
    const modalType = ref('');
    const selectedEntitlementId = ref(null);
    const allUsers = ref([]);
    ref({});
    const toggledUsers = ref({});
    watch(
      () => userStore.allUsers,
      (users) => {
        allUsers.value = users.map((user) => {
          const nameSplit = user.name.trim().split(' ');
          const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
          const lastName = nameSplit.slice(-1).join(' ') || '';
          return {
            ...user,
            firstName,
            lastName,
          };
        });
      },
      { immediate: true },
    );
    computed(() => {
      return leavesStore.leavesData.leavesTypes.reduce((map, type) => {
        map[type.id] = type.name;
        return map;
      }, {});
    });
    const loading = computed(() => centralStore.loading);
    const sortDirection = ref(true);
    const currentSortKey = ref('');
    const sortByFunctions = {
      firstName: (a, b) => a.firstName.localeCompare(b.firstName),
      lastName: (a, b) => a.lastName.localeCompare(b.lastName),
    };
    const filters = ref({
      firstName: '',
      lastName: '',
      year: /* @__PURE__ */ new Date().getFullYear(),
    });
    const filteredUsers = computed(() => {
      let users = allUsers.value.filter(
        (user) =>
          (filters.value.firstName !== ''
            ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase())
            : true) &&
          (filters.value.lastName !== ''
            ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase())
            : true),
      );
      if (currentSortKey.value && sortByFunctions[currentSortKey.value]) {
        users = users.slice().sort((a, b) => {
          const result = sortByFunctions[currentSortKey.value](a, b);
          return sortDirection.value ? result : -result;
        });
      }
      return users;
    });
    const getFilteredEntitlements = computed(() => (userId) => {
      const allEntitlements = entitlementStore.entitledDaysData.savedUsers[userId] || {};
      if (!filters.value.year) {
        return Object.values(allEntitlements).flatMap((yearEntitlements) => yearEntitlements);
      }
      return allEntitlements[filters.value.year] || [];
    });
    watch(toggledUsers.value, async (newToggledUsers) => {
      const usersToFetch = Object.keys(newToggledUsers);
      for (const userId of usersToFetch) {
        await entitlementStore.getEntitledDaysForUser(userId);
      }
    });
    watch(
      () => filters.value.year,
      (newYear, oldYear) => {
        const usersToReFetch = Object.keys(toggledUsers.value);
        for (const userId of usersToReFetch) {
          entitlementStore.getEntitledDaysForUser(userId);
        }
      },
    );
    const modalComponent = computed(() => {
      return modalType.value === 'edit' ? _sfc_main$3 : _sfc_main$2;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      if (loading.value) {
        _push(
          `<div class="grid grid-cols-12 pt-[30px] max-w-[947px]" data-v-5ee97158><div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse" data-v-5ee97158></div><div class="pt-4 space-y-2 col-span-10 animate-pulse" data-v-5ee97158><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-5ee97158></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-5ee97158></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-5ee97158></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-5ee97158></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-5ee97158></p><p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600" data-v-5ee97158></p><p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700" data-v-5ee97158></p></div></div>`,
        );
      } else {
        _push(`<div class="flex flex-col gap-[10px]" data-v-5ee97158>`);
        if (unref(permissionsStore).can('entitlement', 'modify')) {
          _push(
            `<div class="info-actions pb-5 flex gap-4 col-span-2" data-v-5ee97158><button class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none" data-v-5ee97158> \u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u03BD\u03AD\u03B1\u03C2 \u03AC\u03B4\u03B5\u03B9\u03B1\u03C2 </button></div>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold" data-v-5ee97158><div class="sm:col-span-2 md:col-span-4 lg:col-span-1" data-v-5ee97158> \u03A6\u03AF\u03BB\u03C4\u03C1\u03B1: </div><div class="lg:col-span-2 text-black dark:text-white" data-v-5ee97158><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-5ee97158><input${ssrRenderAttr('value', filters.value.firstName)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.firstName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u038C\u03BD\u03BF\u03BC\u03B1" data-v-5ee97158>`,
        );
        if (filters.value.firstName) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-5ee97158> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-2 text-black dark:text-white" data-v-5ee97158><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-5ee97158><input${ssrRenderAttr('value', filters.value.lastName)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.lastName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF" data-v-5ee97158>`,
        );
        if (filters.value.lastName) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-5ee97158> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-2 text-black dark:text-white" data-v-5ee97158><div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-5ee97158><input${ssrRenderAttr('value', filters.value.year)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.value.year ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="text" placeholder="\u0388\u03C4\u03BF\u03C2" data-v-5ee97158>`,
        );
        if (filters.value.year) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-5ee97158> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="lg:col-span-3 lg:justify-self-end items-center" data-v-5ee97158>`,
        );
        if (
          filters.value.firstName ||
          filters.value.lastName ||
          filters.value.leave_type ||
          filters.value.year
        ) {
          _push(
            `<button class="text-red-500" data-v-5ee97158> \xD7 \u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C6\u03AF\u03BB\u03C4\u03C1\u03C9\u03BD </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold" data-v-5ee97158><div class="col-span-1" data-v-5ee97158> \u03A4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC: </div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-5ee97158> \u038C\u03BD\u03BF\u03BC\u03B1 `,
        );
        if (currentSortKey.value === 'firstName') {
          _push(`<span class="ml-1" data-v-5ee97158>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-5ee97158><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-5ee97158></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-5ee97158><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-5ee97158></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div><div class="cursor-pointer col-span-2 text-black dark:text-white flex items-center" data-v-5ee97158> \u0395\u03C0\u03CE\u03BD\u03C5\u03BC\u03BF `,
        );
        if (currentSortKey.value === 'lastName') {
          _push(`<span class="ml-1" data-v-5ee97158>`);
          if (sortDirection.value) {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-5ee97158><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" data-v-5ee97158></path></svg>`,
            );
          } else {
            _push(
              `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-5ee97158><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-5ee97158></path></svg>`,
            );
          }
          _push(`</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(
          `</div></div><div class="relative -m-4 p-4 mt-0" data-v-5ee97158><div class="overflow-auto max-h-[50vh] grid gap-[10px] pr-[15px] -mr-[5px] [&amp;::-webkit-scrollbar]:w-2 [&amp;::-webkit-scrollbar-track]:rounded-full [&amp;::-webkit-scrollbar-track]:bg-gray-100 [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&amp;::-webkit-scrollbar-track]:bg-neutral-700 dark:[&amp;::-webkit-scrollbar-thumb]:bg-neutral-500" data-v-5ee97158><!--[-->`,
        );
        ssrRenderList(filteredUsers.value, (user) => {
          var _a, _b, _c;
          _push(
            `<div class="${ssrRenderClass(`flex flex-col border border-[#DFEAF2] rounded-lg ${!toggledUsers.value[user.id] ? 'hover:bg-neutral-100 dark:hover:bg-neutral-600 pl-[20px] pr-[30px] py-[10px]' : ''} text-[#808080]`)}" data-v-5ee97158><div class="${ssrRenderClass(`grid gap-[10px] grid-cols-2  lg:grid-cols-12 items-center cursor-pointer ${toggledUsers.value[user.id] ? 'rounded-t-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 pb-4 pl-[20px] pr-[30px] pt-[10px]' : ''}`)}" data-v-5ee97158><div class="w-[50px] h-[50px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1" data-v-5ee97158>`,
          );
          if (
            (_a = user == null ? void 0 : user.profile) == null ? void 0 : _a.profile_image_base64
          ) {
            _push(
              `<img class="rounded-full object-cover size-[50px]"${ssrRenderAttr('src', (_b = user == null ? void 0 : user.profile) == null ? void 0 : _b.profile_image_base64)} data-v-5ee97158>`,
            );
          } else {
            _push(
              `<span class="text-white font-bold" data-v-5ee97158>${ssrInterpolate(user.firstName.charAt(0) || '')}${ssrInterpolate(((_c = user.lastName) == null ? void 0 : _c.charAt(0)) || '')}</span>`,
            );
          }
          _push(
            `</div><div class="col-span-2" data-v-5ee97158>${ssrInterpolate(user.firstName || '')}</div><div class="col-span-2" data-v-5ee97158>${ssrInterpolate(user.lastName || '')}</div><div class="col-span-2" data-v-5ee97158></div></div>`,
          );
          if (toggledUsers.value[user.id]) {
            _push(
              `<div class="toggledOpen pt-4 border-t border-gray-200 dark:border-neutral-700 pl-[20px] pr-[30px] pb-[10px]" data-v-5ee97158><div class="grid grid-cols-6 font-bold text-sm text-black dark:text-white pb-2" data-v-5ee97158><div data-v-5ee97158>\u0395\u03AF\u03B4\u03BF\u03C2</div><div data-v-5ee97158>\u0391\u03C0\u03CC</div><div data-v-5ee97158>\u0388\u03C9\u03C2</div><div data-v-5ee97158>\u0394\u03B9\u03BA\u03B1\u03B9\u03BF\u03CD\u03BC\u03B5\u03BD\u03B5\u03C2 \u0397\u03BC\u03AD\u03C1\u03B5\u03C2</div><div data-v-5ee97158>\u03A5\u03C0\u03CC\u03BB\u03BF\u03B9\u03C0\u03BF</div><div data-v-5ee97158></div></div><!--[-->`,
            );
            ssrRenderList(getFilteredEntitlements.value(user.id), (entitlement) => {
              _push(
                `<div class="grid grid-cols-6 items-center py-2 text-sm" data-v-5ee97158><div data-v-5ee97158>${ssrInterpolate(entitlement.leave_type_name)}</div><div data-v-5ee97158>${ssrInterpolate(entitlement.start_from)}</div><div data-v-5ee97158>${ssrInterpolate(entitlement.end_to)}</div><div data-v-5ee97158>${ssrInterpolate(entitlement.entitled_days)}</div><div data-v-5ee97158>${ssrInterpolate(entitlement.remaining_days)}</div><div class="justify-self-end flex gap-[25px] items-center" data-v-5ee97158>`,
              );
              if (unref(permissionsStore).can('entitlement', 'modify')) {
                _push(
                  `<a class="cursor-pointer text-[#EA021A] font-bold underline" data-v-5ee97158>\u0395\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u0397\u03BC\u03B5\u03C1\u03CE\u03BD</a>`,
                );
              } else {
                _push(`<!---->`);
              }
              if (unref(permissionsStore).can('entitlement', 'modify')) {
                _push(
                  `<svg class="cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none" data-v-5ee97158><path d="M13.4104 14.3631L14.1604 14.3698L13.4104 14.3631ZM1 3.58333C0.585786 3.58333 0.25 3.91912 0.25 4.33333C0.25 4.74755 0.585786 5.08333 1 5.08333V3.58333ZM14.3333 5.08333C14.7475 5.08333 15.0833 4.74755 15.0833 4.33333C15.0833 3.91912 14.7475 3.58333 14.3333 3.58333V5.08333ZM6.75 7.66667C6.75 7.25245 6.41421 6.91667 6 6.91667C5.58579 6.91667 5.25 7.25245 5.25 7.66667H6.75ZM5.25 14.3333C5.25 14.7475 5.58579 15.0833 6 15.0833C6.41421 15.0833 6.75 14.7475 6.75 14.3333H5.25ZM10.0833 7.66667C10.0833 7.25245 9.74755 6.91667 9.33333 6.91667C8.91912 6.91667 8.58333 7.25245 8.58333 7.66667H10.0833ZM8.58333 14.3333C8.58333 14.7475 8.91912 15.0833 9.33333 15.0833C9.74755 15.0833 10.0833 14.7475 10.0833 14.3333H8.58333ZM12.75 4.32664L12.6605 14.3564L14.1604 14.3698L14.25 4.34003L12.75 4.32664ZM10.0772 16.9167H5.16667V18.4167H10.0772V16.9167ZM1.08333 4.33333V14.3333H2.58333V4.33333H1.08333ZM1 5.08333H1.83333V3.58333H1V5.08333ZM1.83333 5.08333H4.33333V3.58333H1.83333V5.08333ZM4.33333 5.08333H11V3.58333H4.33333V5.08333ZM11 5.08333H13.5V3.58333H11V5.08333ZM13.5 5.08333H14.3333V3.58333H13.5V5.08333ZM5.08333 3.96296C5.08333 2.82138 6.15445 1.75 7.66667 1.75V0.25C5.49699 0.25 3.58333 1.83175 3.58333 3.96296H5.08333ZM7.66667 1.75C9.17889 1.75 10.25 2.82138 10.25 3.96296H11.75C11.75 1.83174 9.83634 0.25 7.66667 0.25V1.75ZM3.58333 3.96296V4.33333H5.08333V3.96296H3.58333ZM10.25 3.96296V4.33333H11.75V3.96296H10.25ZM5.16667 16.9167C3.73993 16.9167 2.58333 15.7601 2.58333 14.3333H1.08333C1.08333 16.5885 2.9115 18.4167 5.16667 18.4167V16.9167ZM12.6605 14.3564C12.6478 15.7741 11.495 16.9167 10.0772 16.9167V18.4167C12.3182 18.4167 14.1404 16.6106 14.1604 14.3698L12.6605 14.3564ZM5.25 7.66667V14.3333H6.75V7.66667H5.25ZM8.58333 7.66667V14.3333H10.0833V7.66667H8.58333Z"${ssrRenderAttr('fill', _ctx.theme === 'light' ? 'black' : 'white')} data-v-5ee97158></path></svg>`,
                );
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div></div>`);
      }
      if (showModal.value) {
        _push(
          `<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" data-v-5ee97158><div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-[900px] relative" data-v-5ee97158><button class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" data-v-5ee97158><svg class="hover:stroke-gray-500 dark:hover:stroke-gray-100 dark:stroke-gray-500" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="black" data-v-5ee97158><path d="M1 16L16 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-5ee97158></path><path d="M16 16L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-5ee97158></path></svg></button>`,
        );
        ssrRenderVNode(
          _push,
          createVNode(
            resolveDynamicComponent(modalComponent.value),
            { entitlementId: selectedEntitlementId.value },
            null,
          ),
          _parent,
        );
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  },
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Settings/EntitlementDays.vue',
  );
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const EntitlementDays = /* @__PURE__ */ _export_sfc(_sfc_main$1, [
  ['__scopeId', 'data-v-5ee97158'],
]);
const _sfc_main = {
  __name: 'settings',
  __ssrInlineRender: true,
  setup(__props) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const permissionsStore = centralStore.permissionsStore;
    const userId = computed(() => userStore.userId);
    const route = useRoute();
    const router = useRouter();
    const tabs = [
      {
        name: 'edit-profile',
        label:
          '\u0395\u03C0\u03B5\u03BE\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1 \u03A0\u03C1\u03BF\u03C6\u03AF\u03BB',
        component: EditUser,
        props: () => ({
          userId: userId.value,
        }),
        permission: null,
        // No permission required
      },
      {
        name: 'permissions',
        label: '\u0394\u03B9\u03BA\u03B1\u03B9\u03CE\u03BC\u03B1\u03C4\u03B1',
        component: _sfc_main$4,
        permission: { category: 'permissions', action: 'view' },
      },
      {
        name: 'security',
        label: '\u0391\u03C3\u03C6\u03AC\u03BB\u03B5\u03B9\u03B1',
        component: Security,
        permission: null,
      },
      {
        name: 'users',
        label: '\u03A7\u03C1\u03AE\u03C3\u03C4\u03B5\u03C2',
        component: UsersList,
        permission: null,
      },
      {
        name: 'groups',
        label: '\u0393\u03BA\u03C1\u03BF\u03C5\u03C0\u03C2',
        component: GroupsList,
        permission: null,
      },
      {
        name: 'leave-types',
        label: '\u03A4\u03CD\u03C0\u03BF\u03B9 \u0391\u03B4\u03B5\u03B9\u03CE\u03BD',
        component: _sfc_main$5,
        permission: { category: 'leave_types', action: 'view' },
      },
      {
        name: 'entitlement-days',
        label: '\u0397\u03BC\u03AD\u03C1\u03B5\u03C2 \u0391\u03B4\u03B5\u03B9\u03CE\u03BD',
        component: EntitlementDays,
        permission: { category: 'entitlement', action: 'view' },
      },
    ];
    const visibleTabs = computed(() => {
      return tabs.filter((tab) => {
        if (tab.permission) {
          return permissionsStore.can(tab.permission.category, tab.permission.action);
        }
        return true;
      });
    });
    const activeTab = ref('edit-profile');
    const activeTabObj = computed(() =>
      visibleTabs.value.find((tab) => tab.name === activeTab.value),
    );
    const changeTab = (tabName) => {
      activeTab.value = tabName;
    };
    const setActiveTabFromHash = () => {
      const hash = route.hash.replace('#', '');
      const tabExists = visibleTabs.value.find((tab) => tab.name === hash);
      if (tabExists) {
        changeTab(hash);
      } else {
        if (visibleTabs.value.length > 0) {
          changeTab(visibleTabs.value[0].name);
        } else {
          activeTab.value = null;
        }
      }
    };
    watch(
      () => route.hash,
      () => {
        setActiveTabFromHash();
      },
    );
    watch(
      () => visibleTabs.value,
      (newTabs) => {
        if (!newTabs.find((tab) => tab.name === activeTab.value)) {
          if (newTabs.length > 0) {
            changeTab(newTabs[0].name);
          } else {
            activeTab.value = null;
          }
        }
      },
    );
    function tabButtonClass(tabName) {
      const baseClasses =
        'py-4 px-1 inline-flex items-center gap-x-2 border-b-2 text-sm whitespace-nowrap focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
      const activeClasses = 'border-red-600 text-black font-bold dark:text-white';
      const inactiveClasses =
        'border-transparent text-gray-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-500';
      return [baseClasses, activeTab.value === tabName ? activeClasses : inactiveClasses].join(' ');
    }
    const updateHash = (tabName) => {
      router.replace({ hash: `#${tabName}` });
    };
    watch(
      () => activeTab.value,
      (newTab) => {
        if (newTab) {
          updateHash(newTab);
        }
      },
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$c, null, null, _parent));
      _push(
        `<div class="w-full lg:pl-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh-64 duration-300"><h3 class="px-4 pt-9 sm:px-6 font-semibold text-lg dark:text-gray-100">\u03A1\u03C5\u03B8\u03BC\u03AF\u03C3\u03B5\u03B9\u03C2</h3><div class="p-4 sm:p-6 space-y-4 sm:space-y-6"><div class="w-full bg-white rounded-lg shadow-md dark:bg-neutral-800 duration-300"><div class="border-b border-gray-200 px-4 dark:border-neutral-700 duration-300"><nav class="flex gap-x-16 overflow-x-auto custom-scrollbar" aria-label="Tabs" role="tablist" aria-orientation="horizontal"><!--[-->`,
      );
      ssrRenderList(visibleTabs.value, (tab) => {
        _push(
          `<button type="button" class="${ssrRenderClass(tabButtonClass(tab.name))}"${ssrRenderAttr('id', 'basic-tabs-item-' + tab.name)}${ssrRenderAttr('aria-selected', activeTab.value.value === tab.name)}${ssrRenderAttr('aria-controls', 'basic-tabs-' + tab.name)} role="tab">${ssrInterpolate(tab.label)}</button>`,
        );
      });
      _push(`<!--]--></nav></div><div class="mt-3 p-4">`);
      if (activeTabObj.value) {
        _push(
          `<div${ssrRenderAttr('id', 'basic-tabs-' + activeTabObj.value.name)} role="tabpanel"${ssrRenderAttr('aria-labelledby', 'basic-tabs-item-' + activeTabObj.value.name)} class="text-gray-500 dark:text-neutral-400">`,
        );
        ssrRenderVNode(
          _push,
          createVNode(
            resolveDynamicComponent(activeTabObj.value.component),
            activeTabObj.value.props ? activeTabObj.value.props() : {},
            null,
          ),
          _parent,
        );
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div><!--]-->`);
    };
  },
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'pages/settings.vue',
  );
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-ek0nhANl.mjs.map
