import { ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { onClickOutside } from '@vueuse/core';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = {
  __name: "CustomSelect",
  __ssrInlineRender: true,
  props: {
    options: {
      type: Array,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: "Select an option"
    },
    selectId: {
      type: String,
      default: "custom-select"
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const isOpen = ref(false);
    const dropdownRef = ref(null);
    const searchQuery = ref("");
    const selectedOption = computed(() => {
      return props.options.find((option) => String(option.id) === String(props.modelValue));
    });
    const filteredOptions = computed(() => {
      if (!searchQuery.value) {
        return props.options;
      }
      return props.options.filter(
        (option) => option.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });
    watch(isOpen, (newVal) => {
      if (!newVal) {
        searchQuery.value = "";
      }
    });
    onClickOutside(dropdownRef, () => {
      isOpen.value = false;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "dropdownRef",
        ref: dropdownRef,
        class: "relative"
      }, _attrs))} data-v-03af472b><label${ssrRenderAttr("for", __props.selectId)} class="block text-sm font-bold mb-2 text-black dark:text-white" data-v-03af472b>${ssrInterpolate(__props.label)}</label><div class="cursor-pointer" data-v-03af472b><div class="py-3 px-4 flex items-center justify-between w-full border border-gray-200 rounded-lg bg-white text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" data-v-03af472b><div data-v-03af472b>`);
      if (selectedOption.value) {
        _push(`<span data-v-03af472b>${ssrInterpolate(selectedOption.value.name)}</span>`);
      } else {
        _push(`<span class="text-gray-400 dark:text-neutral-500" data-v-03af472b>${ssrInterpolate(__props.placeholder)}</span>`);
      }
      _push(`</div><div data-v-03af472b><svg xmlns="http://www.w3.org/2000/svg" class="${ssrRenderClass([
        "w-5 h-5 text-gray-400 dark:text-neutral-500 transition-transform duration-200",
        isOpen.value ? "transform rotate-180" : ""
      ])}" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-03af472b><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-03af472b></path></svg></div></div></div>`);
      if (isOpen.value) {
        _push(`<div class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-neutral-900 dark:border-neutral-700" data-v-03af472b><div class="p-2" data-v-03af472b><input type="text"${ssrRenderAttr("value", searchQuery.value)} placeholder="Search..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300 dark:bg-neutral-800 dark:border-neutral-600 dark:text-white" data-v-03af472b></div><ul class="max-h-60 overflow-auto [&amp;::-webkit-scrollbar]:w-2 [&amp;::-webkit-scrollbar-track]:rounded-full [&amp;::-webkit-scrollbar-track]:bg-gray-100 [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&amp;::-webkit-scrollbar-track]:bg-neutral-700 dark:[&amp;::-webkit-scrollbar-thumb]:bg-neutral-500" data-v-03af472b><!--[-->`);
        ssrRenderList(filteredOptions.value, (option) => {
          _push(`<li class="cursor-pointer px-4 dark:text-white py-2 hover:bg-gray-100 dark:hover:bg-neutral-800" data-v-03af472b>${ssrInterpolate(option.name)}</li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/misc/CustomSelect.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const CustomSelect = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-03af472b"]]);

export { CustomSelect as C };
//# sourceMappingURL=CustomSelect-ByDE1w8p.mjs.map
