<template>
  <div ref="dropdownRef" class="relative">
    <label v-if="label" :for="selectId" class="block text-sm font-bold mb-2 text-black dark:text-white">{{ label }}</label>
    <div @click="toggleDropdown" class="cursor-pointer">
      <div
          class="py-3 px-4 flex items-center justify-between w-full border border-gray-200 rounded-lg bg-white text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-sm"
      >
        <div>
          <span v-if="selectedOption" class="font-medium">{{ selectedOption.name }}</span>
          <span v-else class="text-gray-400 dark:text-neutral-500">{{ placeholder }}</span>
        </div>
        <div>
          <!-- SVG Chevron Icon -->
          <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="[
              'w-5 h-5 text-gray-400 dark:text-neutral-500 transition-transform duration-200',
              isOpen ? 'transform rotate-180' : '',
            ]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
    <!-- Dropdown -->
    <div
        v-if="isOpen"
        class="absolute z-[120] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-2xl dark:bg-neutral-900 dark:border-neutral-700"
    >
      <!-- Search input -->
      <div class="p-2 border-b dark:border-neutral-700">
        <input
            type="text"
            v-model="searchQuery"
            :placeholder="$t('common.search')"
            class="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white text-sm"
        />
      </div>
      <ul
          class="max-h-60 overflow-auto
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-gray-100
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          dark:[&::-webkit-scrollbar-track]:bg-neutral-700
          dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
        "
      >
        <li
            v-for="option in filteredOptions"
            :key="option.id"
            @click="selectOption(option)"
            class="cursor-pointer px-4 dark:text-white py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors border-b last:border-0 dark:border-neutral-800/50"
        >
          {{ option.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';

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
const searchQuery = ref('');

const selectedOption = computed(() => {
  return props.options.find((option) => String(option.id) === String(props.modelValue));
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }
  return props.options.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emits('update:modelValue', String(option.id));
  isOpen.value = false;
};

watch(isOpen, (newVal) => {
  if (!newVal) {
    searchQuery.value = '';
  }
});

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
