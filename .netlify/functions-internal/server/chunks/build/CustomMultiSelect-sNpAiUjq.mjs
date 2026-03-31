import { resolveDirective, mergeProps, useSSRContext } from 'vue';
import {
  ssrRenderAttrs,
  ssrGetDirectiveProps,
  ssrRenderList,
  ssrInterpolate,
  ssrRenderAttr,
} from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const vClickOutside = {
  beforeMount(el, binding) {
    el.__clickOutsideHandler__ = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    (void 0).addEventListener('click', el.__clickOutsideHandler__);
  },
  unmounted(el) {
    (void 0).removeEventListener('click', el.__clickOutsideHandler__);
    el.__clickOutsideHandler__ = null;
  },
};
const _sfc_main = {
  name: 'CustomMultiSelect',
  props: {
    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: 'Select option...',
    },
  },
  directives: {
    clickOutside: vClickOutside,
  },
  data() {
    return {
      inputValue: '',
      isOpen: false,
    };
  },
  computed: {
    selectedOptions: {
      get() {
        return this.options.filter((option) => this.modelValue.includes(option.id));
      },
      set(newVal) {
        const ids = newVal.map((option) => option.id);
        this.$emit('update:modelValue', ids);
      },
    },
    isAllSelected() {
      return this.options.length > 0 && this.selectedOptions.length === this.options.length;
    },
    hasOptions() {
      return this.options.length > 0;
    },
    filteredOptions() {
      const lowerInput = this.inputValue.toLowerCase();
      const selectedIds = this.selectedOptions.map((option) => option.id);
      if (!this.options || this.options.length === 0) {
        return [];
      }
      return this.options.filter(
        (option) =>
          !selectedIds.includes(option.id) && option.name.toLowerCase().includes(lowerInput),
      );
    },
  },
  methods: {
    focusInput() {
      this.$refs.toBeFocused.focus();
    },
    onInput() {
      this.isOpen = true;
    },
    handleClickOutside() {
      this.isOpen = false;
    },
    selectOption(option) {
      if (!this.isSelected(option)) {
        this.selectedOptions = [...this.selectedOptions, option];
      }
      this.inputValue = '';
    },
    removeOption(option) {
      this.selectedOptions = this.selectedOptions.filter((selected) => selected.id !== option.id);
    },
    isSelected(option) {
      return this.selectedOptions.some((selected) => selected.id === option.id);
    },
    selectAllOptions() {
      this.selectedOptions = this.options;
      this.inputValue = '';
    },
    deselectAllOptions() {
      this.selectedOptions = [];
      this.inputValue = '';
    },
  },
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _directive_click_outside = resolveDirective('click-outside');
  _push(
    `<div${ssrRenderAttrs(mergeProps({ class: 'relative' }, _attrs, ssrGetDirectiveProps(_ctx, _directive_click_outside, $options.handleClickOutside)))}><div class="custom-scrollbar relative overflow-y-auto max-h-40 ps-0.5 pe-9 min-h-[46px] flex items-center flex-wrap w-full border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 cursor-text"><!--[-->`,
  );
  ssrRenderList($options.selectedOptions, (option) => {
    var _a;
    _push(
      `<div class="flex flex-nowrap items-center relative z-10 bg-white border border-gray-200 rounded-full p-1 m-1 dark:bg-neutral-900 dark:border-neutral-700"><div class="size-6 me-1">${(_a = option.icon) != null ? _a : ''}</div><div class="whitespace-nowrap text-gray-800 dark:text-neutral-200">${ssrInterpolate(option.name)}</div><div class="inline-flex shrink-0 justify-center items-center size-5 ms-2 rounded-full text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm dark:bg-neutral-700/50 dark:hover:bg-neutral-700 dark:text-neutral-400 cursor-pointer"><svg class="shrink-0 stroke-red-500 size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="M6 6l12 12"></path></svg></div></div>`,
    );
  });
  _push(
    `<!--]--><input${ssrRenderAttr('value', $data.inputValue)} class="py-3 px-2 rounded-lg order-1 text-sm outline-none dark:bg-neutral-900 dark:placeholder-neutral-500 dark:text-neutral-400 flex-grow"${ssrRenderAttr('placeholder', $options.selectedOptions.length ? '' : $props.placeholder)}><div class="absolute top-1/2 end-3 -translate-y-1/2"><svg class="shrink-0 size-3.5 dark:fill-gray-500 fill-gray-700 text-gray-500 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg></div></div>`,
  );
  if ($data.isOpen) {
    _push(
      `<div class="absolute mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto dark:bg-neutral-900 dark:border-neutral-700 z-99 [&amp;::-webkit-scrollbar]:w-2 [&amp;::-webkit-scrollbar-track]:rounded-full [&amp;::-webkit-scrollbar-track]:bg-gray-100 [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&amp;::-webkit-scrollbar-track]:bg-neutral-700 dark:[&amp;::-webkit-scrollbar-thumb]:bg-neutral-500">`,
    );
    if ($options.hasOptions) {
      _push(`<div class="flex px-4 py-2 border-b border-gray-200 dark:border-neutral-700">`);
      if (!$options.isAllSelected) {
        _push(
          `<button class="w-full text-left font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-600"> \u0395\u03C0\u03B9\u03BB\u03BF\u03B3\u03AE \u038C\u03BB\u03C9\u03BD </button>`,
        );
      } else {
        _push(`<!---->`);
      }
      if ($options.selectedOptions.length > 0) {
        _push(
          `<button class="w-full text-right font-semibold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-600"> \u0394\u03B9\u03B1\u03B3\u03C1\u03B1\u03C6\u03AE \u038C\u03BB\u03C9\u03BD </button>`,
        );
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<!--[-->`);
    ssrRenderList($options.filteredOptions, (option) => {
      var _a;
      _push(
        `<div class="flex items-center py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800"><div class="size-8 me-2">${(_a = option.icon) != null ? _a : ''}</div><div><div class="text-sm font-semibold text-gray-800 dark:text-neutral-200">${ssrInterpolate(option.name)}</div><div class="text-xs text-gray-500 dark:text-neutral-500">${ssrInterpolate(option.description)}</div></div><div class="ms-auto">`,
      );
      if ($options.isSelected(option)) {
        _push(
          `<span><svg class="shrink-0 size-4 fill-blue-600 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 011.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 01-1.065.02L3.217 8.384a.757.757 0 010-1.06.733.733 0 011.047 0l3.052 3.093 5.4-6.425a.247.247 0 01.02-.022Z"></path></svg></span>`,
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
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(
    'components/misc/CustomMultiSelect.vue',
  );
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const CustomMultiSelect = /* @__PURE__ */ _export_sfc(_sfc_main, [['ssrRender', _sfc_ssrRender]]);

export { CustomMultiSelect as C };
//# sourceMappingURL=CustomMultiSelect-sNpAiUjq.mjs.map
