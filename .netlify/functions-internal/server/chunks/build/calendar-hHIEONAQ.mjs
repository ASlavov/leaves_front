import {
  computed,
  resolveComponent,
  ref,
  shallowRef,
  unref,
  withCtx,
  createVNode,
  toDisplayString,
  mergeProps,
  useSSRContext,
} from 'vue';
import {
  ssrRenderComponent,
  ssrRenderAttrs,
  ssrRenderList,
  ssrRenderStyle,
  ssrInterpolate,
  ssrRenderClass,
} from 'vue/server-renderer';
import { ScheduleXCalendar } from '@schedule-x/vue';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { a as useCentralStore, b as useNuxtApp } from './server.mjs';
import { format } from 'date-fns';
import { C as CustomSelect } from './CustomSelect-ByDE1w8p.mjs';
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
import './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main$1 = {
  __name: 'Calendar',
  __ssrInlineRender: true,
  setup(__props) {
    const centralStore = useCentralStore();
    const leavesStore = centralStore.leavesStore;
    const departmentsStore = centralStore.departmentsStore;
    const userStore = centralStore.userStore;
    const permissionsStore = centralStore.permissionsStore;
    const selectedName = ref(null);
    const selectedDepartment = ref(null);
    const selectedLeaveType = ref(null);
    const displayedLeaveTypes = ref([]);
    const departments = computed(() => departmentsStore.departmentsData);
    const leaveTypeOptions = computed(() => leavesStore.leavesData.leavesTypes);
    computed(() => permissionsStore.can('profile_leave_balance', 'accept_leave'));
    const userLeaves = computed(() => leavesStore.leavesData.allUsers);
    const nameOptions = computed(() =>
      userStore.allUsers.map((user) => ({
        id: user.name,
        // Workaround to use the name as value. CustomSelect doesnt actually use "id" as id.
        name: user.name,
      })),
    );
    const calendarApp = shallowRef(null);
    createEventsServicePlugin();
    const colorList = [
      '#F44336',
      '#9C27B0',
      '#3F51B5',
      '#2196F3',
      '#009688',
      '#FFC107',
      '#FF5722',
      '#795548',
      '#607D8B',
      '#4CAF50',
    ];
    const getTypeColor = (vacationId, userId) => {
      if (!vacationId) return '#F00';
      const index = parseInt(vacationId) % colorList.length;
      const baseColor = colorList[index];
      const hsl = hexToHSL(baseColor);
      const userHash = parseInt(userId) || 0;
      const hueAdjustment = ((userHash * 7) % 10) - 5;
      const newHue = (hsl.h + hueAdjustment + 360) % 360;
      return HSLToHex(newHue, hsl.s, hsl.l);
    };
    function getEventClass(calendarEvent) {
      calendarEvent.extendedProps.leaveTypeId;
      const status = calendarEvent.extendedProps.status;
      const statusClasses = {
        pending: 'opacity-80',
        approved: 'opacity-100',
      };
      return [
        'text-xs rounded text-white w-full p-1 leave-entry',
        statusClasses[status] || '',
      ].join(' ');
    }
    function getEventStyle(calendarEvent) {
      const leaveTypeId = calendarEvent.extendedProps.leaveTypeId;
      return `background-color: ${getTypeColor(leaveTypeId)}`;
    }
    function setEventColor(calendarEvent) {
      const leaveTypeId = calendarEvent.extendedProps.leaveTypeId;
      const userId = calendarEvent.extendedProps.userId;
      const color = getTypeColor(leaveTypeId, userId);
      const root = (void 0).documentElement;
      root.style.setProperty('--custom-event-modal-color', color);
    }
    const leavesData = computed(() => {
      var _a;
      const returnArray = [];
      displayedLeaveTypes.value = [];
      const leaveTypeMap = /* @__PURE__ */ new Map();
      (_a = userLeaves.value) == null
        ? void 0
        : _a.forEach((userLeaves2) => {
            if (Array.isArray(userLeaves2.leaves)) {
              userLeaves2 == null
                ? void 0
                : userLeaves2.leaves.forEach((leave) => {
                    var _a2;
                    if (selectedName.value && !userLeaves2.name.includes(selectedName.value))
                      return;
                    if (
                      selectedDepartment.value &&
                      parseInt(userLeaves2.department_id) !== parseInt(selectedDepartment.value)
                    )
                      return;
                    if (
                      selectedLeaveType.value &&
                      parseInt(leave.leave_type_id) !== parseInt(selectedLeaveType.value)
                    )
                      return;
                    if (leave.status && leave.status !== 'approved' && leave.status !== 'pending')
                      return;
                    if (!leaveTypeMap.has(leave.leave_type_id)) {
                      leaveTypeMap.set(leave.leave_type_id, true);
                      displayedLeaveTypes.value.push({
                        id: leave.leave_type_id,
                        name:
                          (_a2 = leavesStore.leavesData.leavesTypes.filter(
                            (leaveType) => leaveType.id === leave.leave_type_id,
                          )[0]) == null
                            ? void 0
                            : _a2.name,
                      });
                    }
                    returnArray.push({
                      ...leave,
                      name: (userLeaves2 == null ? void 0 : userLeaves2.name) || '',
                      userId: userLeaves2 == null ? void 0 : userLeaves2.id,
                    });
                  });
            }
          });
      return returnArray;
    });
    computed(() => {
      var _a;
      let eventsArray =
        ((_a = leavesData.value) == null
          ? void 0
          : _a
              .map((leave) => {
                if (!leave) return null;
                const startDate = new Date(leave.start_date);
                const endDate = new Date(leave.end_date);
                if (isNaN(startDate) || isNaN(endDate)) {
                  console.error('Invalid date in leave:', leave);
                  return null;
                }
                return {
                  id: leave.id,
                  title: leave.name || 'Unnamed Leave',
                  start: format(startDate, 'yyyy-MM-dd'),
                  end: format(endDate, 'yyyy-MM-dd'),
                  description: leave.status,
                  extendedProps: {
                    leaveTypeId: leave.leave_type_id || 0,
                    status: leave.status || 'unknown',
                  },
                };
              })
              .filter(Boolean)) || [];
      return eventsArray;
    });
    computed(() => {
      const { $colorMode } = useNuxtApp();
      return ($colorMode == null ? void 0 : $colorMode.value) || 'light';
    });
    function hexToHSL(H) {
      let r = 0,
        g = 0,
        b = 0;
      if (H.length === 4) {
        r = '0x' + H[1] + H[1];
        g = '0x' + H[2] + H[2];
        b = '0x' + H[3] + H[3];
      } else if (H.length === 7) {
        r = '0x' + H[1] + H[2];
        g = '0x' + H[3] + H[4];
        b = '0x' + H[5] + H[6];
      }
      r /= 255;
      g /= 255;
      b /= 255;
      let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
      if (delta === 0) h = 0;
      else if (cmax === r) h = ((g - b) / delta) % 6;
      else if (cmax === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      l = (cmax + cmin) / 2;
      s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);
      return { h, s, l };
    }
    function HSLToHex(h, s, l) {
      s /= 100;
      l /= 100;
      let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;
      if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
      } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
      } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
      } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
      } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
      } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
      }
      r = Math.round((r + m) * 255).toString(16);
      g = Math.round((g + m) * 255).toString(16);
      b = Math.round((b + m) * 255).toString(16);
      if (r.length === 1) r = '0' + r;
      if (g.length === 1) g = '0' + g;
      if (b.length === 1) b = '0' + b;
      return '#' + r + g + b;
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(calendarApp)) {
        _push(
          `<div${ssrRenderAttrs(_attrs)}><div class="grid grid-cols-12 gap-4 mb-4 dark:text-white items-end"><div class="col-span-12 sm:col-span-3 dark:text-white">`,
        );
        _push(
          ssrRenderComponent(
            CustomSelect,
            {
              modelValue: selectedName.value,
              'onUpdate:modelValue': ($event) => (selectedName.value = $event),
              options: nameOptions.value,
              label: '\u038C\u03BD\u03BF\u03BC\u03B1',
              placeholder:
                '\u038C\u03BB\u03B1 \u03C4\u03B1 \u03BF\u03BD\u03CC\u03BC\u03B1\u03C4\u03B1',
              selectId: 'name-select',
            },
            null,
            _parent,
          ),
        );
        _push(`</div><div class="col-span-12 sm:col-span-3 dark:text-white">`);
        _push(
          ssrRenderComponent(
            CustomSelect,
            {
              modelValue: selectedDepartment.value,
              'onUpdate:modelValue': ($event) => (selectedDepartment.value = $event),
              options: departments.value,
              label: '\u0393\u03BA\u03C1\u03BF\u03C5\u03C0',
              placeholder: '\u038C\u03BB\u03B1 \u03C4\u03B1 \u0393\u03BA\u03C1\u03BF\u03C5\u03C0',
              selectId: 'department-select',
            },
            null,
            _parent,
          ),
        );
        _push(`</div><div class="col-span-12 sm:col-span-3 dark:text-white">`);
        _push(
          ssrRenderComponent(
            CustomSelect,
            {
              modelValue: selectedLeaveType.value,
              'onUpdate:modelValue': ($event) => (selectedLeaveType.value = $event),
              options: leaveTypeOptions.value,
              label: '\u03A4\u03CD\u03C0\u03BF\u03C2 \u0386\u03B4\u03B5\u03B9\u03B1\u03C2',
              placeholder: '\u038C\u03BB\u03BF\u03B9 \u03BF\u03B9 \u03C4\u03CD\u03C0\u03BF\u03B9',
              selectId: 'leave-type-select',
            },
            null,
            _parent,
          ),
        );
        _push(`</div>`);
        if (selectedDepartment.value || selectedLeaveType.value || selectedName.value) {
          _push(
            `<div class="col-span-12 sm:col-span-3 leading-[46px] justify-self-end"><button class="btn btn-secondary text-red-500"> \xD7 \u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C6\u03AF\u03BB\u03C4\u03C1\u03C9\u03BD </button></div>`,
          );
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex flex-wrap mb-4"><!--[-->`);
        ssrRenderList(displayedLeaveTypes.value, (type) => {
          _push(
            `<div class="flex items-center mr-4 mb-2 dark:text-white cursor-pointer opacity-90 hover:opacity-100"><span class="w-[15px] h-[15px] mr-2" style="${ssrRenderStyle('background-color:' + getTypeColor(type.id))}"></span><span class="text-[14px]">${ssrInterpolate(type.name)}</span></div>`,
          );
        });
        _push(`<!--]--></div>`);
        _push(
          ssrRenderComponent(
            unref(ScheduleXCalendar),
            { 'calendar-app': unref(calendarApp) },
            {
              monthGridEvent: withCtx(({ calendarEvent }, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(
                    `<div class="${ssrRenderClass(getEventClass(calendarEvent))}" style="${ssrRenderStyle(getEventStyle(calendarEvent))}"${_scopeId}>${ssrInterpolate(calendarEvent.title)}</div>`,
                  );
                } else {
                  return [
                    createVNode(
                      'div',
                      {
                        onClick: ($event) => setEventColor(calendarEvent),
                        class: getEventClass(calendarEvent),
                        style: getEventStyle(calendarEvent),
                      },
                      toDisplayString(calendarEvent.title),
                      15,
                      ['onClick'],
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
      } else {
        _push(
          `<div${ssrRenderAttrs(
            mergeProps(
              {
                role: 'status',
                class:
                  'max-w-full p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700 flex flex-col gap-4',
              },
              _attrs,
            ),
          )}><!--[-->`,
        );
        ssrRenderList(Array(5).fill(), (y) => {
          _push(
            `<div class="grid grid-cols-7 gap-4 divide-x divide-gray-200 dark:divide-gray-700"><!--[-->`,
          );
          ssrRenderList(Array(7).fill(), (x) => {
            _push(
              `<div class="items-center justify-between pt-4 pl-4 mt-4"><div><div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div><div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div></div><div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div></div>`,
            );
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--><span class="sr-only">Loading...</span></div>`);
      }
    };
  },
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/Calendar/Calendar.vue',
  );
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: 'calendar',
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
      const _component_Calendar = _sfc_main$1;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_Sidebar, null, null, _parent));
      _push(
        `<div class="w-full lg:ps-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh-64 duration-300"><div class="p-4 sm:p-6 space-y-4 sm:space-y-6">`,
      );
      _push(ssrRenderComponent(_component_Calendar, null, null, _parent));
      _push(`</div></div><!--]-->`);
    };
  },
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'pages/calendar.vue',
  );
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=calendar-hHIEONAQ.mjs.map
