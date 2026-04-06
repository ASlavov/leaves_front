<template>
  <div ref="dropdownRef" class="relative">
    <label
      v-if="label"
      :for="selectId"
      class="block text-[14px] font-bold mb-[8px] text-black dark:text-gray-100"
      v-html="label"
    ></label>
    <div class="cursor-pointer" @click="toggleDropdown">
      <div
        class="h-[40px] py-[8px] px-[16px] flex items-center justify-between w-full border border-[#DFEAF2] rounded-[8px] bg-white text-[14px] transition-all hover:border-gray-400 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-400"
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
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
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
          v-model="searchQuery"
          type="text"
          :placeholder="$t('common.search')"
          class="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white text-sm"
        />
      </div>
      <ul
        class="max-h-60 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
      >
        <li
          v-for="option in filteredOptions"
          :key="option.id"
          class="cursor-pointer px-4 dark:text-white py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors border-b last:border-0 dark:border-neutral-800/50"
          @click="selectOption(option)"
        >
          {{ option.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';

interface Option {
  id: string | number;
  name: string;
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  modelValue: {
    type: [String, Number] as PropType<string | number>,
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

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');

const selectedOption = computed(() => {
  return props.options.find((option) => String(option.id) === String(props.modelValue));
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) => option.name.toLowerCase().includes(query));
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option: Option) => {
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
