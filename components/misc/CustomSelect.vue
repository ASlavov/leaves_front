<template>
  <div ref="dropdownRef" class="relative">
    <label :for="selectId" class="block text-sm font-bold mb-2 text-black dark:text-white">{{ label }}</label>
    <div @click="toggleDropdown" class="cursor-pointer">
      <div
          class="py-3 px-4 block w-full border border-gray-200 rounded-lg bg-white text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
      >
        <span v-if="selectedOption">{{ selectedOption.name }}</span>
        <span v-else class="text-gray-400 dark:text-neutral-500">{{ placeholder }}</span>
      </div>
    </div>
    <!-- Dropdown -->
    <div
        v-if="isOpen"
        class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-neutral-900 dark:border-neutral-700"
    >
      <ul class="max-h-60 overflow-auto">
        <li
            v-for="option in options"
            :key="option.id"
            @click="selectOption(option)"
            class="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          {{ option.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue';
import {onClickOutside} from '@vueuse/core';

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
  selectId: {
    type: String,
    default: 'custom-select',
  },
});

const emits = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const selectedOption = computed(() => {
  return props.options.find((option) => String(option.id) === String(props.modelValue));
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emits('update:modelValue', String(option.id));
  isOpen.value = false;
};

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
