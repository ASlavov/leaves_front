<template>
  <div>
    <!-- Input based on the type -->
    <template v-if="isTextInput">
      <div
        :class="props.extraParentClasses"
        class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg bg-white dark:bg-neutral-600 transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500"
      >
        <input
          v-model="modelValueInternal"
          :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${modelValueInternal ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
          :type="type"
          :placeholder="placeholder"
        />
        <button
          v-if="modelValueInternal"
          class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
          @click="clearInput"
        >
          &times;
        </button>
      </div>
    </template>

    <!-- Input Date -->
    <template v-if="isDateInput">
      <div
        class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500"
      >
        <input
          v-model="modelValueInternal"
          :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${modelValueInternal ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
          type="date"
          :placeholder="placeholder"
        />
        <button
          v-if="modelValueInternal"
          class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
          @click="clearInput"
        >
          &times;
        </button>
      </div>
    </template>

    <!-- Custom Select -->
    <template v-if="type === 'CustomSelect'">
      <CustomSelect
        v-model="modelValueInternal"
        :options="options"
        :label="label"
        :placeholder="placeholder"
        :select-id="selectId"
      />
    </template>

    <!-- Custom MultiSelect -->
    <template v-if="type === 'CustomMultiSelect'">
      <CustomMultiSelect
        v-model="modelValueInternal"
        :options="options"
        :placeholder="placeholder"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import CustomSelect from './CustomSelect.vue';
import CustomMultiSelect from './CustomMultiSelect.vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: undefined,
  },
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
});

const emits = defineEmits(['update:modelValue']);

const modelValueInternal = ref(props.modelValue);

// Watch for changes in the internal modelValue and emit them back up
watch(modelValueInternal, (newValue) => {
  emits('update:modelValue', newValue);
});

// Whether to display a text input or not
const isTextInput = computed(() => props.type === 'text' || props.type === 'number');
const isDateInput = computed(() => props.type === 'date');

// Clear the input
const clearInput = () => {
  modelValueInternal.value = '';
};
</script>

<style scoped>
/* Add any scoped styling if needed */
</style>
