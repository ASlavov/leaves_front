import {
  computed,
  resolveComponent,
  unref,
  ref,
  withCtx,
  createTextVNode,
  watch,
  useSSRContext,
} from 'vue';
import {
  ssrRenderComponent,
  ssrRenderAttrs,
  ssrRenderClass,
  ssrInterpolate,
  ssrRenderList,
  ssrRenderAttr,
  ssrRenderDynamicModel,
} from 'vue/server-renderer';
import { a as useCentralStore } from './server.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-D1pWo-b1.mjs';
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { C as CustomSelect } from './CustomSelect-ByDE1w8p.mjs';
import { C as CustomMultiSelect } from './CustomMultiSelect-sNpAiUjq.mjs';
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
import '@vueuse/core';

const _sfc_main$2 = {
  __name: 'FilterInput',
  __ssrInlineRender: true,
  props: {
    modelValue: [String, Number, Array],
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: '',
    },
    selectId: {
      type: String,
      default: 'custom-select',
    },
    extraParentClasses: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const modelValueInternal = ref(props.modelValue);
    watch(modelValueInternal, (newValue) => {
      emits('update:modelValue', newValue);
    });
    const isTextInput = computed(() => props.type === 'text' || props.type === 'number');
    const isDateInput = computed(() => props.type === 'date');
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-ace9a981>`);
      if (isTextInput.value) {
        _push(
          `<div class="${ssrRenderClass([props.extraParentClasses, 'max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg bg-white dark:bg-neutral-600 transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500'])}" data-v-ace9a981><input${ssrRenderDynamicModel(__props.type, modelValueInternal.value, null)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${modelValueInternal.value ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}"${ssrRenderAttr('type', __props.type)}${ssrRenderAttr('placeholder', __props.placeholder)} data-v-ace9a981>`,
        );
        if (modelValueInternal.value) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-ace9a981> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (isDateInput.value) {
        _push(
          `<div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500" data-v-ace9a981><input${ssrRenderAttr('value', modelValueInternal.value)} class="${ssrRenderClass(`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${modelValueInternal.value ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`)}" type="date"${ssrRenderAttr('placeholder', __props.placeholder)} data-v-ace9a981>`,
        );
        if (modelValueInternal.value) {
          _push(
            `<button class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700" data-v-ace9a981> \xD7 </button>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.type === 'CustomSelect') {
        _push(
          ssrRenderComponent(
            CustomSelect,
            {
              modelValue: modelValueInternal.value,
              'onUpdate:modelValue': ($event) => (modelValueInternal.value = $event),
              options: __props.options,
              label: __props.label,
              placeholder: __props.placeholder,
              selectId: __props.selectId,
            },
            null,
            _parent,
          ),
        );
      } else {
        _push(`<!---->`);
      }
      if (__props.type === 'CustomMultiSelect') {
        _push(
          ssrRenderComponent(
            CustomMultiSelect,
            {
              modelValue: modelValueInternal.value,
              'onUpdate:modelValue': ($event) => (modelValueInternal.value = $event),
              options: __props.options,
              placeholder: __props.placeholder,
            },
            null,
            _parent,
          ),
        );
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  },
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/misc/FilterInput.vue',
  );
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const FilterInput = /* @__PURE__ */ _export_sfc(_sfc_main$2, [['__scopeId', 'data-v-ace9a981']]);
const _sfc_main$1 = {
  __name: 'YearlyLeaves',
  __ssrInlineRender: true,
  props: {
    isSmallComponent: {
      type: Boolean,
      required: false,
      default: false,
    },
    leavesNumber: {
      type: Number,
      required: false,
      default: 9999999,
    },
  },
  setup(__props) {
    const centralStore = useCentralStore();
    const leavesStore = centralStore.leavesStore;
    const permissionsStore = centralStore.permissionsStore;
    const userStore = centralStore.userStore;
    const loading = ref(true);
    const currentYear = /* @__PURE__ */ new Date().getFullYear();
    const props = __props;
    const leaveComments = ref([]);
    const allLeaves = ref([]);
    const years = computed(() => {
      const returnYears = [];
      allLeaves.value.forEach((leave) => {
        const startDate = new Date(leave == null ? void 0 : leave.start_date).getFullYear();
        const endDate = new Date(leave == null ? void 0 : leave.end_date).getFullYear();
        if (startDate) {
          returnYears[startDate] = {
            id: `${startDate}`,
            name: `${startDate}`,
          };
        }
        if (endDate) {
          returnYears[endDate] = {
            id: `${endDate}`,
            name: `${endDate}`,
          };
        }
      });
      if (returnYears.length) {
        return [
          {
            id: `${currentYear}`,
            name: `${currentYear}`,
          },
        ];
      }
      return returnYears;
    });
    const filters = ref({
      requesterName: '',
      group: '',
      year: currentYear,
    });
    const filteredLeaves = computed(() => {
      const returnArray = allLeaves.value
        .filter((leave) => {
          const requesterNameMatch = filters.value.requesterName
            ? leave.user.name.toLowerCase().includes(filters.value.requesterName.toLowerCase())
            : true;
          const groupMatch = filters.value.group
            ? leave.user.department_id &&
              leave.user.department_id.toString().includes(filters.value.group)
            : true;
          const yearMatch = filters.value.year
            ? new Date(leave.start_date).getFullYear() === parseInt(filters.value.year)
            : true;
          const requesterMatchesUserNotAdmin =
            permissionsStore.isAdmin() || userStore.userId !== leave.user_id;
          return requesterNameMatch && groupMatch && yearMatch && requesterMatchesUserNotAdmin;
        })
        .sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') {
            return -1;
          }
          if (a.status !== 'pending' && b.status === 'pending') {
            return 1;
          }
          return new Date(b.start_date) - new Date(a.start_date);
        });
      if (props.isSmallComponent) {
        return returnArray.slice(0, props.leavesNumber);
      }
      return returnArray;
    });
    const formatDate = (dateStr) => {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('el-GR', options);
    };
    const getLeaveTypeName = (leaveTypeId) => {
      const leaveType = leavesStore.leavesData.leavesTypes.find((type) => type.id === leaveTypeId);
      return leaveType
        ? leaveType.name
        : '\u0386\u03B3\u03BD\u03C9\u03C3\u03C4\u03BF\u03C2 \u03A4\u03CD\u03C0\u03BF\u03C2';
    };
    const getLeaveStatusLabel = (status) => {
      const statusLabels = {
        pending: '\u03A3\u03B5 \u0395\u03BA\u03BA\u03C1\u03B5\u03BC\u03CC\u03C4\u03B7\u03C4\u03B1',
        approved: '\u0395\u03B3\u03BA\u03B5\u03BA\u03C1\u03B9\u03BC\u03AD\u03BD\u03B7',
        declined: '\u0391\u03C0\u03BF\u03C1\u03C1\u03AF\u03C6\u03B8\u03B7\u03BA\u03B5',
        cancelled: '\u0391\u03BA\u03C5\u03C1\u03CE\u03B8\u03B7\u03BA\u03B5',
        // Add other statuses if needed
      };
      return statusLabels[status] || status;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      if (loading.value) {
        _push(
          `<div${ssrRenderAttrs(_attrs)} data-v-de86da13><div class="grid gap-4 grid-cols-4 items-center border p-4 rounded-lg" data-v-de86da13><div class="flex flex-col gap-4" data-v-de86da13><div class="text-sm text-gray-500" data-v-de86da13><div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse" data-v-de86da13></div></div><div class="font-bold" data-v-de86da13><div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse" data-v-de86da13></div></div></div><div data-v-de86da13><div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse" data-v-de86da13></div></div><div data-v-de86da13><div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse" data-v-de86da13></div></div><div class="flex space-x-2" data-v-de86da13><div data-v-de86da13><div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse" data-v-de86da13></div></div></div></div></div>`,
        );
      } else {
        _push(
          `<div${ssrRenderAttrs(_attrs)} data-v-de86da13><div class="${ssrRenderClass([{ 'mt-[45px]': props.isSmallComponent }, 'grid grid-cols-2 text-black gap-y-2 dark:text-white'])}" data-v-de86da13><div class="flex flex-col col-span-2 gap-2 lg:gap-0 lg:grid grid-rows-2 grid-cols-1 lg:grid-rows-1 lg:grid-cols-2" data-v-de86da13>`,
        );
        if (unref(permissionsStore).can('profile_leave_balance', 'accept_leave')) {
          _push(
            `<div class="text-black dark:text-white font-bold flex items-center gap-2" data-v-de86da13> \u0391\u03B9\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1 \u03AC\u03B4\u03B5\u03B9\u03B1\u03C2 <span class="text-[#EA021A]" data-v-de86da13>(${ssrInterpolate(filteredLeaves.value.length)})</span></div>`,
          );
        } else {
          _push(
            `<div data-v-de86da13> \u0386\u03B4\u03B5\u03B9\u03B5\u03C2 \u03AD\u03C4\u03BF\u03C5\u03C2 </div>`,
          );
        }
        if (!props.isSmallComponent) {
          _push(
            `<div class="ml-4 grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4 w-full lg:max-w-3xl items-end lg:justify-self-end lg:self-end" data-v-de86da13>`,
          );
          _push(
            ssrRenderComponent(
              FilterInput,
              {
                modelValue: filters.value.requesterName,
                'onUpdate:modelValue': ($event) => (filters.value.requesterName = $event),
                type: 'text',
                placeholder: '\u038C\u03BD\u03BF\u03BC\u03B1',
                class: 'w-full',
              },
              null,
              _parent,
            ),
          );
          _push(
            ssrRenderComponent(
              FilterInput,
              {
                modelValue: filters.value.group,
                'onUpdate:modelValue': ($event) => (filters.value.group = $event),
                type: 'text',
                placeholder: '\u0393\u03BA\u03C1\u03BF\u03C5\u03C0',
              },
              null,
              _parent,
            ),
          );
          _push(
            ssrRenderComponent(
              FilterInput,
              {
                modelValue: filters.value.year,
                'onUpdate:modelValue': ($event) => (filters.value.year = $event),
                type: 'CustomSelect',
                options: years.value,
                placeholder: '\u0388\u03C4\u03BF\u03C2',
                class: '-ml-4 mr-4 lg:mr-0',
              },
              null,
              _parent,
            ),
          );
          _push(`</div>`);
        } else {
          _push(`<div class="lg:justify-self-end lg:self-end" data-v-de86da13>`);
          _push(
            ssrRenderComponent(
              _component_NuxtLink,
              {
                to: '/yearly-leaves',
                class: 'text-[#EA021A] dark:text-[#FF021A] underline block',
              },
              {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(
                      ` \u038C\u03BB\u03B1 \u03C4\u03B1 \u03B1\u03B9\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1 \u03AC\u03B4\u03B5\u03B9\u03B1\u03C2 `,
                    );
                  } else {
                    return [
                      createTextVNode(
                        ' \u038C\u03BB\u03B1 \u03C4\u03B1 \u03B1\u03B9\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1 \u03AC\u03B4\u03B5\u03B9\u03B1\u03C2 ',
                      ),
                    ];
                  }
                }),
                _: 1,
              },
              _parent,
            ),
          );
          _push(`</div>`);
        }
        _push(`</div><div class="col-span-2 grid grid-cols-1 gap-4" data-v-de86da13><!--[-->`);
        ssrRenderList(filteredLeaves.value, (leave) => {
          _push(
            `<div class="${ssrRenderClass([unref(permissionsStore).can('profile_leave_balance', 'accept_leave') ? 'lg:grid-cols-10' : 'lg:grid-cols-8', 'grid grid-rows-6 lg:grid-rows-none grid-cols-[50px,1fr] gap-y-1 gap-x-[20px] lg:gap-y-0 items-center justify-items-start w-full lg:justify-items-stretch border p-4 rounded-lg bg-white dark:bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700'])}" data-v-de86da13><div class="lg:col-span-2 lg:gap-x-2 lg:justify-self-start contents lg:grid grid-cols-4 grid-rows-2 justify-start items-center" data-v-de86da13><div class="row-span-6 lg:col-span-1 lg:row-span-2 self-start justify-self-end" data-v-de86da13><img src="https://placehold.co/50x50" alt="Icon" class="rounded-md" data-v-de86da13></div><div class="text-sm text-gray-500 lg:col-span-3 lg:row-span-1" data-v-de86da13>${ssrInterpolate(formatDate(leave.start_date))} - ${ssrInterpolate(formatDate(leave.end_date))}</div><div class="font-bold lg:col-span-3 lg:row-span-1" data-v-de86da13>${ssrInterpolate(getLeaveTypeName(leave.leave_type_id))}</div></div><div class="lg:col-span-2" data-v-de86da13>${ssrInterpolate(leave.user.name)}</div><div class="${ssrRenderClass([leave.class, 'lg:col-span-2'])}" data-v-de86da13>${ssrInterpolate(getLeaveStatusLabel(leave.status))}</div>`,
          );
          if (unref(permissionsStore).can('profile_leave_balance', 'accept_leave')) {
            _push(`<div class="lg:col-span-3 lg:mr-4" data-v-de86da13>`);
            if (leave.status === 'pending') {
              _push(
                `<input type="text" class="border-0 w-full border-b border-[#DFEAF2] bg-transparent focus:outline-0" placeholder="\u03A3\u03C5\u03BC\u03C0\u03BB\u03B7\u03C1\u03CE\u03C3\u03C4\u03B5 \u03B5\u03B1\u03BD \u03AD\u03C7\u03B5\u03C4\u03B5 \u03BA\u03AC\u03C0\u03BF\u03B9\u03BF \u03C3\u03C7\u03CC\u03BB\u03B9\u03BF"${ssrRenderAttr('value', leaveComments.value[leave.leaveId])} data-v-de86da13>`,
              );
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(permissionsStore).can('profile_leave_balance', 'accept_leave')) {
            _push(`<div class="flex lg:justify-self-end gap-4 lg:col-span-1" data-v-de86da13>`);
            if (leave.status === 'pending') {
              _push(
                `<button class="py-2 px-4 bg-[#16DBAA26] transition-all dark:bg-green-300 text-green-700 dark:text-green-800 dark:hover:text-green-500 rounded-md hover:bg-green-300 dark:hover:bg-green-100" data-v-de86da13>`,
              );
              _push(ssrRenderComponent(unref(CheckIcon), { class: 'h-5 w-5' }, null, _parent));
              _push(`</button>`);
            } else {
              _push(`<!---->`);
            }
            if (leave.status === 'pending') {
              _push(
                `<button class="py-2 px-4 rounded-md transition-all bg-[#FF455F26] hover:bg-red-300 text-[#FF455F] hover:text-red-700 dark:bg-[#FF455F8F] dark:hover:bg-red-200 dark:text-[#FF455F] dark:hover:text-red-700" data-v-de86da13>`,
              );
              _push(ssrRenderComponent(unref(XMarkIcon), { class: 'h-5 w-5' }, null, _parent));
              _push(`</button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(
              `<div class="justify-self-end" data-v-de86da13><button class="py-2 px-4 border-0 text-black hover:text-neutral-500 underline dark:text-white dark:hover:text-neutral-700" data-v-de86da13> \u0391\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7 </button></div>`,
            );
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div></div>`);
      }
    };
  },
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Leaves/YearlyLeaves.vue',
  );
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const YearlyLeaves = /* @__PURE__ */ _export_sfc(_sfc_main$1, [['__scopeId', 'data-v-de86da13']]);
const _sfc_main = {
  __name: 'home',
  __ssrInlineRender: true,
  setup(__props) {
    const centralStore = useCentralStore();
    const userStore = centralStore.userStore;
    const leavesStore = centralStore.leavesStore;
    centralStore.authStore;
    computed(() => userStore.userId);
    computed(() => leavesStore.leavesData);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Sidebar = resolveComponent('Sidebar');
      const _component_LeavesMetric = resolveComponent('LeavesMetric');
      const _component_Info = resolveComponent('Info');
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_Sidebar, null, null, _parent));
      _push(
        `<div class="w-full lg:ps-64 bg-red min-h-dvh-64 dark:bg-neutral-900"><div class="p-4 sm:p-6 space-y-4 sm:space-y-6">`,
      );
      _push(ssrRenderComponent(_component_LeavesMetric, null, null, _parent));
      _push(ssrRenderComponent(_component_Info, null, null, _parent));
      if (unref(centralStore).permissionsStore.can('profile_leave_balance', 'accept_leave')) {
        _push(
          ssrRenderComponent(
            YearlyLeaves,
            {
              isSmallComponent: true,
              leavesNumber: 3,
            },
            null,
            _parent,
          ),
        );
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><!--]-->`);
    };
  },
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add('pages/home.vue');
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=home-C9ukUyfY.mjs.map
