<template>
  <div ref="dropdownRef" class="relative">
    <div
      class="custom-scrollbar relative overflow-y-auto max-h-40 ps-0.5 pe-9 min-h-[40px] flex items-center flex-wrap w-full border border-[#DFEAF2] rounded-[8px] text-start text-[14px] transition-all hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-400 cursor-text"
      @click="focusInput"
    >
      <template v-for="option in selectedOptions" :key="option.id">
        <div
          class="flex flex-nowrap items-center relative z-10 bg-white border border-gray-200 rounded-full p-1 m-1 dark:bg-neutral-900 dark:border-neutral-700 shadow-sm"
        >
          <SharedUserAvatar :user="option as User" :size="24" />
          <div class="whitespace-nowrap text-gray-800 dark:text-neutral-200 text-xs font-bold px-1">
            {{ option.name }}
          </div>
          <div
            class="inline-flex shrink-0 justify-center items-center size-5 ms-1 rounded-full text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm dark:bg-neutral-700/50 dark:hover:bg-neutral-700 dark:text-neutral-400 cursor-pointer transition-colors"
            @click.stop="removeOption(option)"
          >
            <svg
              class="shrink-0 stroke-red-500 size-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </div>
        </div>
      </template>
      <input
        ref="toBeFocused"
        v-model="inputValue"
        class="py-3 px-2 rounded-lg order-1 text-sm outline-none dark:bg-neutral-900 dark:placeholder-neutral-500 dark:text-neutral-400 flex-grow"
        :placeholder="selectedOptions.length ? '' : placeholder"
        @focus="isOpen = true"
        @input="onInput"
      />
      <div class="absolute top-1/2 end-3 -translate-y-1/2">
        <svg
          class="shrink-0 size-3.5 dark:fill-gray-500 fill-gray-700 text-gray-500 dark:text-neutral-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="m7 15 5 5 5-5"></path>
          <path d="m7 9 5-5 5 5"></path>
        </svg>
      </div>
    </div>
    <div
      v-if="isOpen"
      class="absolute mt-2 z-[110] w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-neutral-900 dark:border-neutral-700 overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
    >
      <div
        v-if="hasOptions"
        class="flex px-4 py-2 border-b border-gray-200 dark:border-neutral-700"
      >
        <button
          v-if="!isAllSelected"
          class="w-full text-left font-bold text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-600"
          @click="selectAllOptions"
        >
          {{ $t('common.selectAll') }}
        </button>
        <button
          v-if="selectedOptions.length > 0"
          class="w-full text-right font-bold text-[11px] text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-600"
          @click="deselectAllOptions"
        >
          {{ $t('common.deleteAll') }}
        </button>
      </div>

      <div
        v-for="option in filteredOptions"
        :key="option.id"
        class="flex items-center py-2.5 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-50 rounded-lg focus:outline-none focus:bg-gray-50 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800 transition-colors"
        @click="selectOption(option)"
      >
        <div v-if="option.icon" class="size-8 me-2" v-html="option.icon"></div>
        <div>
          <div class="text-sm font-semibold text-gray-800 dark:text-neutral-200">
            {{ option.name }}
          </div>
          <div v-if="option.description" class="text-xs text-gray-500 dark:text-neutral-500">
            {{ option.description }}
          </div>
        </div>
        <div class="ms-auto">
          <span v-if="isSelected(option)">
            <svg
              class="shrink-0 size-4 fill-blue-600 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
            >
              <path
                d="M12.736 3.97a.733.733 0 011.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 01-1.065.02L3.217 8.384a.757.757 0 010-1.06.733.733 0 011.047 0l3.052 3.093 5.4-6.425a.247.247 0 01.02-.022Z"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';
import SharedUserAvatar from '@/components/shared/UserAvatar.vue';
import type { User } from '~/types';

interface Option {
  id: string | number;
  name: string;
  email?: string;
  avatar?: string;
  icon?: string;
  description?: string;
}

const props = defineProps<{
  options: Option[];
  modelValue?: (string | number)[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void;
}>();

const inputValue = ref('');
const isOpen = ref(false);
const toBeFocused = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);

const selectedOptions = computed({
  get() {
    return props.options.filter((option) => props.modelValue?.includes(option.id));
  },
  set(newVal: Option[]) {
    const ids = newVal.map((option) => option.id);
    emit('update:modelValue', ids);
  },
});

const isAllSelected = computed(() => {
  return props.options.length > 0 && selectedOptions.value.length === props.options.length;
});

const hasOptions = computed(() => props.options.length > 0);

const filteredOptions = computed(() => {
  const lowerInput = inputValue.value.toLowerCase();
  const selectedIds = selectedOptions.value.map((option) => option.id);

  if (!props.options || props.options.length === 0) {
    return [];
  }

  return props.options.filter(
    (option) => !selectedIds.includes(option.id) && option.name.toLowerCase().includes(lowerInput),
  );
});

const focusInput = () => {
  toBeFocused.value?.focus();
};

const onInput = () => {
  isOpen.value = true;
};

const selectOption = (option: Option) => {
  if (!isSelected(option)) {
    selectedOptions.value = [...selectedOptions.value, option];
  }
  inputValue.value = '';
};

const removeOption = (option: Option) => {
  selectedOptions.value = selectedOptions.value.filter((selected) => selected.id !== option.id);
};

const isSelected = (option: Option) => {
  return selectedOptions.value.some((selected) => selected.id === option.id);
};

const selectAllOptions = () => {
  selectedOptions.value = [...props.options];
  inputValue.value = '';
};

const deselectAllOptions = () => {
  selectedOptions.value = [];
  inputValue.value = '';
};

onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});
</script>
